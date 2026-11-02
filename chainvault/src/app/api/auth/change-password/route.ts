/**
 * POST /api/auth/change-password
 * Changes the authenticated user's password.
 * Requires current password verification.
 */
import { NextRequest } from 'next/server'
import { getSession, requireAuth } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import {
  verifyPassword,
  hashPassword,
  validatePasswordStrength,
} from '@/lib/auth'
import { changePasswordSchema } from '@/lib/validation'
import { apiSuccess, apiError, handleApiError } from '@/lib/api-response'
import { auditLog, getAuditContext } from '@/lib/audit'
import { checkRateLimit, getRateLimitKey } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  // Rate limit: 5 attempts per 15 minutes
  const rlKey = getRateLimitKey(req, 'change-password')
  const rl = checkRateLimit(rlKey, { windowMs: 15 * 60 * 1000, max: 5 })
  if (!rl.allowed) {
    return apiError('Too many password change attempts.', 429)
  }

  const context = getAuditContext(req)

  try {
    const session = await getSession()
    const auth = requireAuth(session)

    const body = await req.json()
    const validated = changePasswordSchema.parse(body)

    // Verify current password
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { passwordHash: true },
    })

    if (!user) return apiError('User not found.', 404)

    const valid = await verifyPassword(validated.currentPassword, user.passwordHash)
    if (!valid) {
      return apiError('Current password is incorrect.', 400)
    }

    // Check new password strength
    const strength = validatePasswordStrength(validated.newPassword)
    if (!strength.valid) {
      return apiError(strength.errors[0] ?? 'Password too weak.', 400)
    }

    // Prevent reuse of current password
    const samePassword = await verifyPassword(validated.newPassword, user.passwordHash)
    if (samePassword) {
      return apiError('New password must be different from current password.', 400)
    }

    const newHash = await hashPassword(validated.newPassword)
    await prisma.user.update({
      where: { id: auth.userId },
      data: { passwordHash: newHash },
    })

    // Revoke all other sessions for security
    await prisma.session.updateMany({
      where: {
        userId: auth.userId,
        id: { not: auth.sessionId },
        isRevoked: false,
      },
      data: { isRevoked: true, revokedAt: new Date() },
    })

    await auditLog('PASSWORD_CHANGED', 'User changed password', {
      ...context,
      userId: auth.userId,
    })

    return apiSuccess({}, 'Password changed successfully. Other sessions have been logged out.')
  } catch (error) {
    return handleApiError(error, 'change-password')
  }
}
