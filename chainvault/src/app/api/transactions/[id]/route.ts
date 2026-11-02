/**
 * GET /api/transactions/[id]
 * Returns a single transaction's details.
 * User must own the transaction.
 */
import { NextRequest } from 'next/server'
import { getSession, requireAuth } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError, handleApiError } from '@/lib/api-response'
import { getNetworkByChainId } from '@/lib/networks'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession()
    const auth = requireAuth(session)
    const { id } = await params

    const transaction = await prisma.transaction.findUnique({
      where: { id },
      select: {
        id: true,
        type: true,
        status: true,
        txHash: true,
        fromAddress: true,
        toAddress: true,
        amount: true,
        amountRaw: true,
        tokenSymbol: true,
        tokenAddress: true,
        tokenDecimals: true,
        networkName: true,
        chainId: true,
        blockNumber: true,
        blockHash: true,
        gasFee: true,
        gasFeeRaw: true,
        gasUsed: true,
        gasPrice: true,
        confirmations: true,
        requiredConfirmations: true,
        errorMessage: true,
        cancelReason: true,
        createdAt: true,
        submittedAt: true,
        confirmedAt: true,
        failedAt: true,
        userId: true,
      },
    })

    if (!transaction) {
      return apiError('Transaction not found.', 404)
    }

    // Ownership check — users can only see their own transactions
    if (transaction.userId !== auth.userId) {
      return apiError('Transaction not found.', 404) // Generic 404 to prevent enumeration
    }

    // Build block explorer URL
    const network = getNetworkByChainId(transaction.chainId)
    const explorerTxUrl =
      transaction.txHash && network
        ? `${network.blockExplorerUrl}/tx/${transaction.txHash}`
        : null
    const explorerBlockUrl =
      transaction.blockNumber && network
        ? `${network.blockExplorerUrl}/block/${transaction.blockNumber}`
        : null

    return apiSuccess({
      transaction: {
        ...transaction,
        blockNumber: transaction.blockNumber?.toString() ?? null,
      },
      explorerTxUrl,
      explorerBlockUrl,
    })
  } catch (error) {
    return handleApiError(error, 'transactions/detail')
  }
}
