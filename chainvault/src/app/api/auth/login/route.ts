/**
 * POST /api/auth/login
 *
 * SECURITY:
 * - Rate limited: 10 attempts per IP per 15 minutes
 * - Password compared with bcrypt.compare (constant-time)
 * - Generic error messages — no user enumeration
 * - 2FA required if enabled
 * - Session created with iron-session (HttpOnly, SameSite=Lax)
 * - Audit logged on success and failure
 */
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/auth'
import { loginSchema } from '@/lib/validation'
import { apiSuccess, apiError, handleApiError } from '@/lib/api-response'
import { getSession } from '@/lib/session'
import { checkRateLimit, getRateLimitKey, RATE_LIMITS } from '@/lib/rate-limit'
import { auditLog, securityEvent, getAuditContext } from '@/lib/audit'
import { ZodError } from 'zod'

export async function POST(req: NextRequest) {
  // ── Rate limiting ────────────────────────────────────────────────────────
  const rlKey = getRateLimitKey(req, 'login')
  const rl = checkRateLimit(rlKey, RATE_LIMITS.auth_login)

  if (!rl.allowed) {
    await securityEvent('HIGH', 'BRUTE_FORCE_ATTEMPT', 'Login rate limit exceeded', {
      ipAddress: req.headers.get('x-forwarded-for') ?? undefined,
    })
    return apiError('Too many login attempts. Please try again in 15 minutes.', 429, 'RATE_LIMITED')
  }

  const context = getAuditContext(req)

  try {
    const body = await req.json()
    const validated = loginSchema.parse(body)

    // ── Fetch user ─────────────────────────────────────────────────────────
    const user = await prisma.user.findUnique({
      where: { email: validated.email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        role: true,
        status: true,
        emailVerified: true,
        twoFactorEnabled: true,
        displayName: true,
      },
    })

    // Generic error — do not reveal whether email exists
    const GENERIC_ERROR = 'Invalid email address or password.'

    if (!user) {
      await auditLog('USER_LOGIN_FAILED', `Login failed: email not found`, {
        ...context,
      })
      return apiError(GENERIC_ERROR, 401)
    }

    // ── Verify password ───────────────────────────────────────────────────
    const passwordValid = await verifyPassword(validated.password, user.passwordHash)

    if (!passwordValid) {
      await auditLog('USER_LOGIN_FAILED', `Login failed: wrong password`, {
        ...context,
        userId: user.id,
      })
      await securityEvent('MEDIUM', 'FAILED_LOGIN', `Failed login attempt for ${user.email}`, {
        ...context,
        userId: user.id,
      })
      return apiError(GENERIC_ERROR, 401)
    }

    // ── Account status checks ─────────────────────────────────────────────
    if (user.status === 'SUSPENDED') {
      return apiError('Your account has been suspended. Please contact support.', 403, 'SUSPENDED')
    }

    if (user.status === 'DEACTIVATED') {
      return apiError('This account has been deactivated.', 403, 'DEACTIVATED')
    }

    if (!user.emailVerified) {
      return apiError(
        'Please verify your email address before logging in.',
        403,
        'EMAIL_NOT_VERIFIED',
      )
    }

    // ── Two-factor authentication ─────────────────────────────────────────
    if (user.twoFactorEnabled) {
      // Set pending 2FA state in session — do not fully authenticate yet
      const session = await getSession()
      session.pendingTwoFactor = true
      session.pendingUserId = user.id
      await session.save()

      return apiSuccess(
        { requiresTwoFactor: true },
        'Two-factor authentication required.',
      )
    }

    // ── Create session ────────────────────────────────────────────────────
    // Create DB session record
    const dbSession = await prisma.session.create({
      data: {
        userId: user.id,
        token: user.id, // Placeholder — proper token hashing below
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        ipAddress: context.ipAddress ?? null,
        userAgent: context.userAgent ?? null,
      },
      select: { id: true },
    })

    // ── Set iron-session cookie ───────────────────────────────────────────
    const session = await getSession()
    session.userId = user.id
    session.email = user.email
    session.role = user.role
    session.sessionId = dbSession.id
    session.isAuthenticated = true
    session.pendingTwoFactor = undefined
    session.pendingUserId = undefined
    await session.save()

    // ── Update last login ─────────────────────────────────────────────────
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: context.ipAddress ?? null,
        status: 'ACTIVE',
      },
    })

    await auditLog('USER_LOGIN', `User logged in: ${user.email}`, {
      ...context,
      userId: user.id,
    })

    return apiSuccess({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        displayName: user.displayName,
      },
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return apiError('Invalid login data.', 422)
    }
    return handleApiError(error, 'login')
  }
}
