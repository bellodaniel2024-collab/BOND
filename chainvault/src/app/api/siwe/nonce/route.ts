/**
 * POST /api/siwe/nonce
 *
 * Issues a single-use SIWE nonce for a given address.
 * Nonces expire after 10 minutes and cannot be reused.
 *
 * SECURITY:
 * - Rate limited
 * - Nonce stored in DB with expiry
 * - Replay attacks prevented: each nonce is single-use
 */
import { NextRequest } from 'next/server'
import { generateSiweNonce } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError, handleApiError } from '@/lib/api-response'
import { siweNonceRequestSchema } from '@/lib/validation'
import { checkRateLimit, getRateLimitKey, RATE_LIMITS } from '@/lib/rate-limit'
import { auditLog, getAuditContext } from '@/lib/audit'
import { ZodError } from 'zod'

export async function POST(req: NextRequest) {
  const rlKey = getRateLimitKey(req, 'siwe-nonce')
  const rl = checkRateLimit(rlKey, RATE_LIMITS.siwe_nonce)
  if (!rl.allowed) {
    return apiError('Too many nonce requests.', 429)
  }

  const context = getAuditContext(req)

  try {
    const body = await req.json()
    const validated = siweNonceRequestSchema.parse(body)

    const nonce = generateSiweNonce()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Store nonce for single-use verification
    await prisma.siweNonce.create({
      data: {
        nonce,
        address: validated.address,
        expiresAt,
        ipAddress: context.ipAddress ?? null,
      },
    })

    await auditLog('SIWE_NONCE_ISSUED', `SIWE nonce issued for ${validated.address}`, context)

    return apiSuccess({ nonce, expiresAt: expiresAt.toISOString() })
  } catch (error) {
    if (error instanceof ZodError) {
      return apiError('Invalid address.', 422)
    }
    return handleApiError(error, 'siwe-nonce')
  }
}
