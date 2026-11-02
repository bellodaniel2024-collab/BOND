/**
 * GET /api/admin/stats
 * Returns platform statistics for admin dashboard.
 * Requires ADMIN or SUPER_ADMIN role.
 */
import { NextRequest } from 'next/server'
import { getSession, requireAdminAuth } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { apiSuccess, handleApiError } from '@/lib/api-response'
import { auditLog, getAuditContext } from '@/lib/audit'

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    const auth = requireAdminAuth(session)

    const [
      totalUsers,
      totalTransactions,
      pendingTransactions,
      confirmedTransactions,
      failedTransactions,
      unresolvedSecurityEvents,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.transaction.count(),
      prisma.transaction.count({ where: { status: { in: ['PENDING', 'CONFIRMING'] } } }),
      prisma.transaction.count({ where: { status: 'CONFIRMED' } }),
      prisma.transaction.count({ where: { status: 'FAILED' } }),
      prisma.securityEvent.count({ where: { resolved: false } }),
    ])

    await auditLog('ADMIN_USER_VIEWED', 'Admin viewed platform stats', {
      ...getAuditContext(req, auth.userId),
    })

    return apiSuccess({
      totalUsers,
      totalTransactions,
      pendingTransactions,
      confirmedTransactions,
      failedTransactions,
      unresolvedSecurityEvents,
    })
  } catch (error) {
    return handleApiError(error, 'admin/stats')
  }
}
