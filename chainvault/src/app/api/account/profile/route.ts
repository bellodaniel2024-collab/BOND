/**
 * PATCH /api/account/profile
 * Update authenticated user's profile (display name).
 */
import { NextRequest } from 'next/server'
import { getSession, requireAuth } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { updateProfileSchema } from '@/lib/validation'
import { apiSuccess, apiError, handleApiError } from '@/lib/api-response'

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession()
    const auth = requireAuth(session)
    const body = await req.json()
    const validated = updateProfileSchema.parse(body)

    const user = await prisma.user.update({
      where: { id: auth.userId },
      data: { displayName: validated.displayName ?? null },
      select: { id: true, displayName: true },
    })

    return apiSuccess({ user })
  } catch (error) {
    return handleApiError(error, 'account/profile')
  }
}
