/**
 * POST /api/transactions/submit
 *
 * Records a transaction hash AFTER the user has signed and broadcast it
 * from their external wallet. Updates the transaction status and begins
 * on-chain verification.
 *
 * SECURITY:
 * - User must be authenticated
 * - Transaction must exist in DB with AWAITING_AUTHORIZATION or PREPARING status
 * - Transaction must belong to the authenticated user
 * - Hash format validated (not just trusted)
 * - Status updated to PENDING — confirmed only after blockchain verification
 * - Never trusts client-reported confirmation status
 */
import { NextRequest } from 'next/server'
import { z } from 'zod'
import { getSession, requireAuth } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError, handleApiError } from '@/lib/api-response'
import { verifyTransactionReceipt } from '@/lib/blockchain'
import { getNetworkByChainId } from '@/lib/networks'
import { auditLog, getAuditContext } from '@/lib/audit'

const submitSchema = z.object({
  transactionId: z.string().min(1).max(128),
  txHash: z
    .string()
    .regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid transaction hash format.')
    .toLowerCase(),
})

export async function POST(req: NextRequest) {
  const context = getAuditContext(req)

  try {
    const session = await getSession()
    const auth = requireAuth(session)

    const body = await req.json()
    const validated = submitSchema.parse(body)

    // ── Fetch transaction from DB ─────────────────────────────────────────
    const transaction = await prisma.transaction.findUnique({
      where: { id: validated.transactionId },
      select: {
        id: true,
        userId: true,
        status: true,
        chainId: true,
        txHash: true,
        fromAddress: true,
        toAddress: true,
        amount: true,
        tokenSymbol: true,
      },
    })

    if (!transaction) {
      return apiError('Transaction not found.', 404)
    }

    // ── Ownership check ───────────────────────────────────────────────────
    if (transaction.userId !== auth.userId) {
      return apiError('Access denied.', 403)
    }

    // ── Status check ──────────────────────────────────────────────────────
    if (!['PREPARING', 'AWAITING_AUTHORIZATION'].includes(transaction.status)) {
      return apiError(
        `Transaction cannot be submitted in status: ${transaction.status}`,
        400,
        'INVALID_STATUS',
      )
    }

    // ── Prevent duplicate hash submission ─────────────────────────────────
    if (transaction.txHash && transaction.txHash !== validated.txHash) {
      return apiError('A different hash is already recorded for this transaction.', 400)
    }

    // Check no other transaction has this hash
    const duplicate = await prisma.transaction.findFirst({
      where: {
        txHash: validated.txHash,
        id: { not: validated.transactionId },
      },
      select: { id: true },
    })
    if (duplicate) {
      return apiError('This transaction hash is already recorded.', 400, 'DUPLICATE_HASH')
    }

    // ── Update to PENDING ─────────────────────────────────────────────────
    await prisma.transaction.update({
      where: { id: validated.transactionId },
      data: {
        txHash: validated.txHash,
        status: 'PENDING',
        submittedAt: new Date(),
      },
    })

    // ── Begin async confirmation check ────────────────────────────────────
    // This initiates a background check — in production use a queue/cron job
    setImmediate(async () => {
      await pollTransactionConfirmation(validated.transactionId, validated.txHash, transaction.chainId)
    })

    await auditLog(
      'TRANSACTION_INITIATED',
      `Transaction submitted: ${validated.txHash}`,
      { ...context, userId: auth.userId },
      { transactionId: validated.transactionId, txHash: validated.txHash },
    )

    return apiSuccess({
      transactionId: validated.transactionId,
      txHash: validated.txHash,
      status: 'PENDING',
      message: 'Transaction broadcast. Awaiting confirmation.',
    })
  } catch (error) {
    return handleApiError(error, 'transactions/submit')
  }
}

/**
 * Polls for transaction confirmation on-chain.
 * In production, this should be a background job / webhook.
 * Retries up to 30 times with 15-second intervals (7.5 minutes total).
 */
async function pollTransactionConfirmation(
  transactionId: string,
  txHash: string,
  chainId: number,
  attempt = 0,
): Promise<void> {
  const MAX_ATTEMPTS = 30
  const POLL_INTERVAL_MS = 15_000

  if (attempt >= MAX_ATTEMPTS) {
    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: 'FAILED',
        failedAt: new Date(),
        errorMessage: 'Transaction confirmation timed out after 7.5 minutes.',
      },
    })
    return
  }

  try {
    const result = await verifyTransactionReceipt(chainId, txHash)

    if (!result) {
      // RPC error — retry
      setTimeout(
        () => pollTransactionConfirmation(transactionId, txHash, chainId, attempt + 1),
        POLL_INTERVAL_MS,
      )
      return
    }

    if (result.receipt === null) {
      // Not yet mined
      await prisma.transaction.update({
        where: { id: transactionId },
        data: { status: 'PENDING', confirmations: 0 },
      })
      setTimeout(
        () => pollTransactionConfirmation(transactionId, txHash, chainId, attempt + 1),
        POLL_INTERVAL_MS,
      )
      return
    }

    if (result.receipt.status === 'reverted') {
      await prisma.transaction.update({
        where: { id: transactionId },
        data: {
          status: 'FAILED',
          failedAt: new Date(),
          blockNumber: result.blockNumber,
          confirmations: result.confirmations,
          errorMessage: 'Transaction reverted on-chain.',
        },
      })
      return
    }

    // Still confirming
    const network = getNetworkByChainId(chainId)
    if (!result.confirmed) {
      await prisma.transaction.update({
        where: { id: transactionId },
        data: {
          status: 'CONFIRMING',
          confirmations: result.confirmations,
          blockNumber: result.blockNumber,
          blockHash: result.receipt.blockHash ?? null,
        },
      })
      setTimeout(
        () => pollTransactionConfirmation(transactionId, txHash, chainId, attempt + 1),
        POLL_INTERVAL_MS,
      )
      return
    }

    // ── Confirmed ─────────────────────────────────────────────────────────
    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: 'CONFIRMED',
        confirmedAt: new Date(),
        blockNumber: result.blockNumber,
        blockHash: result.receipt.blockHash ?? null,
        confirmations: result.confirmations,
        gasUsed: result.receipt.gasUsed?.toString() ?? null,
      },
    })
  } catch (err) {
    console.error(`[TX Poll] Error polling transaction ${txHash}:`, err)
    setTimeout(
      () => pollTransactionConfirmation(transactionId, txHash, chainId, attempt + 1),
      POLL_INTERVAL_MS,
    )
  }
}
