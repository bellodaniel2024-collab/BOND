/**
 * GET /api/auth/me
 * Returns the authenticated user's public profile.
 * Requires valid session.
 */
import { NextRequest } from 'next/server'
import { getSession, requireAuth } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError, handleApiError } from '@/lib/api-response'

export async function GET(_req: NextRequest) {
  try {
    const session = await getSession()
    const auth = requireAuth(session)

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        role: true,
        status: true,
        displayName: true,
        avatarUrl: true,
        twoFactorEnabled: true,
        lastLoginAt: true,
        createdAt: true,
        wallets: {
          where: { isActive: true },
          select: {
            id: true,
            address: true,
            chainId: true,
            walletType: true,
            siweVerified: true,
            connectedAt: true,
          },
          orderBy: { connectedAt: 'desc' },
        },
      },
    })

    if (!user) {
      return apiError('User not found.', 404)
    }

    return apiSuccess({ user })
  } catch (error) {
    return handleApiError(error, 'me')
  }
}
