/**
 * GET /api/transactions
 * Returns paginated transaction history for the authenticated user.
 */
import { NextRequest } from 'next/server'
import { getSession, requireAuth } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError, handleApiError } from '@/lib/api-response'

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    const auth = requireAuth(session)

    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)))
    const status = searchParams.get('status')
    const skip = (page - 1) * limit

    const where = {
      userId: auth.userId,
      ...(status ? { status: status as never } : {}),
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          type: true,
          status: true,
          txHash: true,
          fromAddress: true,
          toAddress: true,
          amount: true,
          tokenSymbol: true,
          networkName: true,
          chainId: true,
          gasFee: true,
          confirmations: true,
          requiredConfirmations: true,
          createdAt: true,
          confirmedAt: true,
          failedAt: true,
        },
      }),
      prisma.transaction.count({ where }),
    ])

    return apiSuccess({
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + limit < total,
      },
    })
  } catch (error) {
    return handleApiError(error, 'transactions/list')
  }
}
