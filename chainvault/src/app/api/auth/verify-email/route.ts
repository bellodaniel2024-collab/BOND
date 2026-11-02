/**
 * GET /api/auth/verify-email?token=<token>
 * Verifies a user's email address using a single-use token.
 */
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashToken } from '@/lib/auth'
import { apiSuccess, apiError, handleApiError } from '@/lib/api-response'
import { auditLog } from '@/lib/audit'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    if (!token || token.length < 32) {
      return apiError('Invalid or missing verification token.', 400)
    }

    const hashedToken = hashToken(token)

    const user = await prisma.user.findUnique({
      where: { emailVerificationToken: hashedToken },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        emailVerificationExpiry: true,
        status: true,
      },
    })

    if (!user) {
      return apiError('Verification token is invalid or has already been used.', 400)
    }

    if (user.emailVerified) {
      return apiSuccess({}, 'Email address already verified.')
    }

    // Check token expiry
    if (user.emailVerificationExpiry && user.emailVerificationExpiry < new Date()) {
      return apiError('Verification token has expired. Please request a new one.', 400, 'TOKEN_EXPIRED')
    }

    // Mark email as verified and activate account
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiry: null,
        status: 'ACTIVE',
      },
    })

    await auditLog('EMAIL_VERIFIED', `Email verified for ${user.email}`, {
      userId: user.id,
    })

    return apiSuccess({}, 'Email address verified successfully.')
  } catch (error) {
    return handleApiError(error, 'verify-email')
  }
}
