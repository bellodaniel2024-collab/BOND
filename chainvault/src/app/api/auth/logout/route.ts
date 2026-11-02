/**
 * POST /api/auth/logout
 * Destroys the session and revokes the DB session record.
 */
import { NextRequest } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { apiSuccess, handleApiError } from '@/lib/api-response'
import { auditLog, getAuditContext } from '@/lib/audit'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    const context = getAuditContext(req, session.userId)

    // Revoke DB session
    if (session.sessionId) {
      await prisma.session
        .update({
          where: { id: session.sessionId },
          data: { isRevoked: true, revokedAt: new Date() },
        })
        .catch(() => {
          // Session may already be expired — non-fatal
        })
    }

    if (session.userId) {
      await auditLog('USER_LOGOUT', 'User logged out', context)
    }

    // Destroy the session cookie
    session.destroy()

    return apiSuccess({}, 'Logged out successfully.')
  } catch (error) {
    return handleApiError(error, 'logout')
  }
}
