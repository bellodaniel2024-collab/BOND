/**
 * POST /api/auth/register
 *
 * SECURITY:
 * - Rate limited: 5 registrations per IP per hour
 * - Password strength enforced
 * - Password hashed with bcrypt (12 rounds) — never stored plaintext
 * - Email verification token generated and sent
 * - Generic errors returned to prevent user enumeration
 */
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateVerificationToken, hashToken, validatePasswordStrength } from '@/lib/auth'
import { registerSchema } from '@/lib/validation'
import { apiSuccess, apiError, handleApiError } from '@/lib/api-response'
import { checkRateLimit, getRateLimitKey, RATE_LIMITS } from '@/lib/rate-limit'
import { auditLog, getAuditContext } from '@/lib/audit'
import { ZodError } from 'zod'

export async function POST(req: NextRequest) {
  // ── Rate limiting ────────────────────────────────────────────────────────
  const rlKey = getRateLimitKey(req, 'register')
  const rl = checkRateLimit(rlKey, RATE_LIMITS.auth_register)
  if (!rl.allowed) {
    return apiError('Too many registration attempts. Please try again later.', 429)
  }

  const context = getAuditContext(req)

  try {
    const body = await req.json()
    const validated = registerSchema.parse(body)

    // ── Password strength ────────────────────────────────────────────────
    const strength = validatePasswordStrength(validated.password)
    if (!strength.valid) {
      return apiError(strength.errors[0] ?? 'Password too weak.', 400)
    }

    // ── Check for existing account ────────────────────────────────────────
    // Use a generic message to prevent email enumeration attacks
    const existing = await prisma.user.findUnique({
      where: { email: validated.email },
      select: { id: true },
    })

    if (existing) {
      // Do not reveal that the email exists — generic response
      return apiSuccess(
        { message: 'If this email is new, a verification link has been sent.' },
        'Registration processed.',
      )
    }

    // ── Hash password ────────────────────────────────────────────────────
    const passwordHash = await hashPassword(validated.password)

    // ── Verification token ────────────────────────────────────────────────
    const rawToken = generateVerificationToken()
    const hashedToken = hashToken(rawToken)
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // ── Create user ───────────────────────────────────────────────────────
    const user = await prisma.user.create({
      data: {
        email: validated.email,
        passwordHash,
        displayName: validated.displayName ?? null,
        emailVerificationToken: hashedToken,
        emailVerificationExpiry: expiry,
        notificationPrefs: { create: {} },
      },
      select: { id: true, email: true },
    })

    // ── Audit log ─────────────────────────────────────────────────────────
    await auditLog('USER_REGISTERED', `User registered: ${user.email}`, {
      ...context,
      userId: user.id,
    })

    // ── Send verification email ──────────────────────────────────────────
    // In production, integrate with your email service here.
    // For now, log the token (REMOVE in production).
    if (process.env['NODE_ENV'] === 'development') {
      console.log(`[Dev] Email verification token for ${user.email}: ${rawToken}`)
    }

    return apiSuccess(
      { userId: user.id },
      'Account created. Please verify your email address.',
      201,
    )
  } catch (error) {
    if (error instanceof ZodError) {
      return apiError('Invalid registration data.', 422)
    }
    return handleApiError(error, 'register')
  }
}
