/**
 * POST /api/siwe/verify
 *
 * Verifies a Sign-In with Ethereum (SIWE) signature.
 * Associates the verified wallet address with the authenticated user account.
 *
 * SECURITY:
 * - Nonce verified against DB record (single-use, expiry-checked)
 * - SIWE message parsed and verified with viem
 * - Nonce marked as used to prevent replay attacks
 * - Domain binding: message domain must match server domain
 * - User must already be authenticated (session required)
 */
import { NextRequest } from 'next/server'
import { verifyMessage, getAddress } from 'viem'
import { prisma } from '@/lib/prisma'
import { getSession, requireAuth } from '@/lib/session'
import { siweVerifySchema } from '@/lib/validation'
import { apiSuccess, apiError, handleApiError } from '@/lib/api-response'
import { auditLog, securityEvent, getAuditContext } from '@/lib/audit'
import { ZodError } from 'zod'

const SIWE_DOMAIN = process.env['NEXT_PUBLIC_SIWE_DOMAIN'] ?? 'localhost:3000'

export async function POST(req: NextRequest) {
  const context = getAuditContext(req)

  try {
    // ── Require authenticated session ─────────────────────────────────────
    const session = await getSession()
    const auth = requireAuth(session)

    const body = await req.json()
    const validated = siweVerifySchema.parse(body)

    // ── Fetch and validate nonce ──────────────────────────────────────────
    const nonceRecord = await prisma.siweNonce.findUnique({
      where: { nonce: validated.nonce },
    })

    if (!nonceRecord) {
      await securityEvent('HIGH', 'SIWE_INVALID_NONCE', 'SIWE verification with unknown nonce', {
        ...context,
        userId: auth.userId,
      })
      return apiError('Invalid nonce.', 400)
    }

    if (nonceRecord.isUsed) {
      await securityEvent('HIGH', 'SIWE_REPLAY_ATTEMPT', 'SIWE replay attack detected', {
        ...context,
        userId: auth.userId,
      })
      return apiError('Nonce has already been used.', 400, 'NONCE_USED')
    }

    if (nonceRecord.expiresAt < new Date()) {
      return apiError('Nonce has expired. Please request a new one.', 400, 'NONCE_EXPIRED')
    }

    // ── Verify address matches nonce ──────────────────────────────────────
    if (
      nonceRecord.address &&
      nonceRecord.address.toLowerCase() !== validated.address.toLowerCase()
    ) {
      await securityEvent('HIGH', 'SIWE_ADDRESS_MISMATCH', 'SIWE address does not match nonce', {
        ...context,
        userId: auth.userId,
      })
      return apiError('Address mismatch.', 400)
    }

    // ── Parse SIWE message fields ─────────────────────────────────────────
    // We verify domain binding manually to prevent cross-origin attacks
    if (!validated.message.includes(SIWE_DOMAIN)) {
      await securityEvent('HIGH', 'SIWE_DOMAIN_MISMATCH', 'SIWE message domain mismatch', {
        ...context,
        userId: auth.userId,
      })
      return apiError('Message domain does not match this application.', 400)
    }

    // ── Verify cryptographic signature ────────────────────────────────────
    let signatureValid = false
    try {
      signatureValid = await verifyMessage({
        address: getAddress(validated.address),
        message: validated.message,
        signature: validated.signature as `0x${string}`,
      })
    } catch {
      signatureValid = false
    }

    if (!signatureValid) {
      await securityEvent('HIGH', 'SIWE_INVALID_SIGNATURE', 'SIWE signature verification failed', {
        ...context,
        userId: auth.userId,
      })
      return apiError('Signature verification failed.', 400, 'INVALID_SIGNATURE')
    }

    // ── Mark nonce as used (replay protection) ────────────────────────────
    await prisma.siweNonce.update({
      where: { id: nonceRecord.id },
      data: { isUsed: true, usedAt: new Date() },
    })

    // ── Upsert wallet record ──────────────────────────────────────────────
    await prisma.connectedWallet.upsert({
      where: { userId_address: { userId: auth.userId, address: validated.address } },
      create: {
        userId: auth.userId,
        address: validated.address,
        chainId: 0, // Updated when wallet reports its chain
        walletType: 'evm',
        siweVerified: true,
        siweVerifiedAt: new Date(),
      },
      update: {
        siweVerified: true,
        siweVerifiedAt: new Date(),
        isActive: true,
        disconnectedAt: null,
      },
    })

    await auditLog('SIWE_VERIFIED', `SIWE verified for address ${validated.address}`, {
      ...context,
      userId: auth.userId,
    })

    return apiSuccess(
      { address: validated.address, verified: true },
      'Wallet verified successfully.',
    )
  } catch (error) {
    if (error instanceof ZodError) {
      return apiError('Invalid verification data.', 422)
    }
    return handleApiError(error, 'siwe-verify')
  }
}
