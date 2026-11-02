/**
 * POST /api/transactions/prepare
 *
 * Prepares a transaction for user review BEFORE they sign it.
 * Returns estimated fees and validated parameters.
 *
 * SECURITY:
 * - Requires authentication
 * - Validates all inputs server-side
 * - Verifies token contract against trusted configuration
 * - Estimates gas fee from blockchain (not from client)
 * - Creates a pending transaction record for audit trail
 * - Does NOT submit or sign the transaction
 */
import { NextRequest } from 'next/server'
import { getSession, requireAuth } from '@/lib/session'
import { sendTransactionSchema } from '@/lib/validation'
import { apiSuccess, apiError, handleApiError, ValidationError } from '@/lib/api-response'
import { getNetworkByChainId, isTokenContractTrusted, getTokenConfig } from '@/lib/networks'
import { getNativeBalance, getErc20Balance, estimateNativeTransferGas, parseAmount, formatAmount } from '@/lib/blockchain'
import { prisma } from '@/lib/prisma'
import { auditLog, getAuditContext } from '@/lib/audit'
import { checkRateLimit, getRateLimitKey, RATE_LIMITS } from '@/lib/rate-limit'
import { ZodError } from 'zod'

export async function POST(req: NextRequest) {
  const rlKey = getRateLimitKey(req, 'tx-prepare')
  const rl = checkRateLimit(rlKey, RATE_LIMITS.transaction_submit)
  if (!rl.allowed) {
    return apiError('Too many transaction requests. Please slow down.', 429)
  }

  const context = getAuditContext(req)

  try {
    const session = await getSession()
    const auth = requireAuth(session)

    const body = await req.json()
    const validated = sendTransactionSchema.parse(body)

    // ── Verify network is supported and enabled ────────────────────────────
    const network = getNetworkByChainId(validated.chainId)
    if (!network) {
      return apiError('Unsupported or disabled network.', 400, 'UNSUPPORTED_NETWORK')
    }

    // ── Prevent sending to self ───────────────────────────────────────────
    if (validated.fromAddress.toLowerCase() === validated.toAddress.toLowerCase()) {
      return apiError('Cannot send to the same address.', 400)
    }

    // ── Get token config ──────────────────────────────────────────────────
    const tokenConfig = getTokenConfig(validated.chainId, validated.tokenSymbol)
    if (!tokenConfig) {
      return apiError('Unsupported token on this network.', 400, 'UNSUPPORTED_TOKEN')
    }

    // ── Verify token contract if provided ────────────────────────────────
    if (validated.tokenContractAddress) {
      const trusted = isTokenContractTrusted(validated.chainId, validated.tokenContractAddress)
      if (!trusted) {
        return apiError(
          'Token contract address is not in trusted configuration.',
          400,
          'UNTRUSTED_CONTRACT',
        )
      }
    }

    // ── Parse amount ──────────────────────────────────────────────────────
    let amountRaw: bigint
    try {
      amountRaw = parseAmount(validated.amount, tokenConfig.decimals)
    } catch {
      return apiError('Invalid amount.', 400)
    }

    if (amountRaw <= BigInt(0)) {
      return apiError('Amount must be greater than zero.', 400)
    }

    // ── Check balance ─────────────────────────────────────────────────────
    const isNative = tokenConfig.contractAddress === null

    if (isNative) {
      const balance = await getNativeBalance(validated.chainId, validated.fromAddress)
      if (balance === null) {
        return apiError('Unable to fetch balance. Please check your network connection.', 503)
      }
      if (balance.balanceRaw < amountRaw) {
        return apiError(
          `Insufficient ${tokenConfig.symbol} balance. Available: ${balance.balance}`,
          400,
          'INSUFFICIENT_BALANCE',
        )
      }
    } else {
      const contractAddress = tokenConfig.contractAddress!
      const balance = await getErc20Balance(
        validated.chainId,
        contractAddress,
        validated.fromAddress,
        tokenConfig.decimals,
      )
      if (balance === null) {
        return apiError('Unable to fetch token balance.', 503)
      }
      if (balance.balanceRaw < amountRaw) {
        return apiError(
          `Insufficient ${tokenConfig.symbol} balance. Available: ${balance.balance}`,
          400,
          'INSUFFICIENT_BALANCE',
        )
      }
    }

    // ── Estimate gas fees ─────────────────────────────────────────────────
    let gasFee = 'Unknown'
    let gasFeeRaw = '0'
    if (isNative) {
      const gasEstimate = await estimateNativeTransferGas(
        validated.chainId,
        validated.fromAddress,
        validated.toAddress,
        amountRaw,
      )
      if (gasEstimate) {
        gasFee = gasEstimate.gasFee
        gasFeeRaw = (gasEstimate.gasEstimate * gasEstimate.gasPrice).toString()
      }
    }

    // ── Create transaction record (PREPARING status) ──────────────────────
    const transaction = await prisma.transaction.create({
      data: {
        userId: auth.userId,
        type: 'SEND',
        status: 'PREPARING',
        fromAddress: validated.fromAddress,
        toAddress: validated.toAddress,
        chainId: validated.chainId,
        networkName: network.name,
        tokenSymbol: tokenConfig.symbol,
        tokenAddress: tokenConfig.contractAddress ?? null,
        tokenDecimals: tokenConfig.decimals,
        amount: validated.amount,
        amountRaw: amountRaw.toString(),
        gasFee,
        gasFeeRaw,
      },
      select: {
        id: true,
        fromAddress: true,
        toAddress: true,
        amount: true,
        amountRaw: true,
        tokenSymbol: true,
        networkName: true,
        chainId: true,
        gasFee: true,
        status: true,
        createdAt: true,
      },
    })

    await auditLog('TRANSACTION_INITIATED', `Transaction prepared: ${validated.amount} ${validated.tokenSymbol}`, {
      ...context,
      userId: auth.userId,
    }, {
      transactionId: transaction.id,
      fromAddress: validated.fromAddress,
      toAddress: validated.toAddress,
      chainId: validated.chainId,
    })

    return apiSuccess({
      transaction,
      review: {
        currency: tokenConfig.symbol,
        amount: validated.amount,
        recipient: validated.toAddress,
        network: network.name,
        estimatedFee: gasFee,
        total: isNative
          ? formatAmount(amountRaw, tokenConfig.decimals)
          : validated.amount,
        transactionId: transaction.id,
        warning: network.isTestnet
          ? 'This is a testnet transaction. No real value is involved.'
          : undefined,
      },
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return apiError('Invalid transaction parameters.', 422)
    }
    return handleApiError(error, 'transactions/prepare')
  }
}
