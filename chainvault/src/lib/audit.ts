/**
 * BOND — Audit Logging
 *
 * All security-significant actions are recorded in the audit log.
 * Logs are append-only — never deleted or modified.
 * Sensitive data (passwords, private keys) must NEVER appear in logs.
 */
import { prisma } from './prisma'
import type { AuditAction, SecurityEventSeverity } from '@prisma/client'

export interface AuditContext {
  userId?: string
  ipAddress?: string
  userAgent?: string
  requestId?: string
}

export async function auditLog(
  action: AuditAction,
  description: string,
  context: AuditContext,
  metadata?: Record<string, unknown>,
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        description,
        // Sanitize metadata — never log sensitive values
        metadata: metadata ? sanitizeMetadata(metadata) : undefined,
        userId: context.userId ?? null,
        ipAddress: context.ipAddress ?? null,
        userAgent: context.userAgent ?? null,
        requestId: context.requestId ?? null,
      },
    })
  } catch (err) {
    // Audit log failure should not break the main operation,
    // but must be reported to monitoring.
    console.error('[Audit] Failed to write audit log:', err)
  }
}

export async function securityEvent(
  severity: SecurityEventSeverity,
  eventType: string,
  description: string,
  context: AuditContext,
  metadata?: Record<string, unknown>,
): Promise<void> {
  try {
    await prisma.securityEvent.create({
      data: {
        severity,
        eventType,
        description,
        metadata: metadata ? sanitizeMetadata(metadata) : undefined,
        userId: context.userId ?? null,
        ipAddress: context.ipAddress ?? null,
        userAgent: context.userAgent ?? null,
      },
    })
  } catch (err) {
    console.error('[Security] Failed to record security event:', err)
  }
}

/**
 * Strip any potentially sensitive keys from metadata before logging.
 * Extend this list as the codebase grows.
 */
function sanitizeMetadata(
  metadata: Record<string, unknown>,
): Record<string, unknown> {
  const SENSITIVE_KEYS = [
    'password',
    'passwordHash',
    'secret',
    'token',
    'privateKey',
    'seedPhrase',
    'mnemonic',
    'signature',
    'authorization',
    'cookie',
    'apiKey',
  ]

  const sanitized: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(metadata)) {
    if (SENSITIVE_KEYS.some((s) => key.toLowerCase().includes(s))) {
      sanitized[key] = '[REDACTED]'
    } else {
      sanitized[key] = value
    }
  }
  return sanitized
}

/**
 * Extract audit context from a Next.js request.
 */
export function getAuditContext(
  req: Request,
  userId?: string,
): AuditContext {
  const forwarded = req.headers.get('x-forwarded-for')
  const ipAddress = forwarded?.split(',')[0]?.trim() ?? req.headers.get('x-real-ip') ?? undefined
  const userAgent = req.headers.get('user-agent') ?? undefined

  return { userId, ipAddress, userAgent }
}
