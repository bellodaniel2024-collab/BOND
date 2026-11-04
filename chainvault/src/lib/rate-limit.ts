/**
 * BOND — Rate Limiting
 *
 * In-memory rate limiter for development.
 * In production, replace with Redis-backed rate-limiter-flexible.
 *
 * Rate limits applied to:
 * - Login attempts (brute-force protection)
 * - Password reset requests
 * - API endpoints
 * - Transaction submissions
 */
import { NextRequest } from 'next/server'

interface RateLimitEntry {
  count: number
  resetAt: number
}

// In-memory store — replace with Redis in production
const store = new Map<string, RateLimitEntry>()

export interface RateLimitConfig {
  windowMs: number  // Window in milliseconds
  max: number       // Max requests per window
}

// Predefined limits for different route categories
export const RATE_LIMITS = {
  auth_login: { windowMs: 15 * 60 * 1000, max: 10 },        // 10 attempts / 15 min
  auth_register: { windowMs: 60 * 60 * 1000, max: 5 },      // 5 registrations / hr
  auth_password_reset: { windowMs: 60 * 60 * 1000, max: 5 }, // 5 resets / hr
  siwe_nonce: { windowMs: 60 * 1000, max: 20 },              // 20 nonces / min
  api_general: { windowMs: 60 * 1000, max: 100 },            // 100 req / min
  transaction_submit: { windowMs: 60 * 1000, max: 10 },      // 10 tx submissions / min
} as const

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
  retryAfterMs: number
}

/**
 * Check and increment rate limit counter for a given key.
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig,
): RateLimitResult {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || entry.resetAt <= now) {
    // Start a new window
    const resetAt = now + config.windowMs
    store.set(key, { count: 1, resetAt })
    return {
      allowed: true,
      remaining: config.max - 1,
      resetAt,
      retryAfterMs: 0,
    }
  }

  if (entry.count >= config.max) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
      retryAfterMs: entry.resetAt - now,
    }
  }

  entry.count++
  return {
    allowed: true,
    remaining: config.max - entry.count,
    resetAt: entry.resetAt,
    retryAfterMs: 0,
  }
}

/**
 * Extract a rate-limit key from a request.
 * Uses IP address + optional identifier.
 */
export function getRateLimitKey(
  req: NextRequest,
  prefix: string,
  identifier?: string,
): string {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'

  return identifier ? `${prefix}:${ip}:${identifier}` : `${prefix}:${ip}`
}

/**
 * Clean up expired entries periodically (call from a cron in production).
 */
export function cleanExpiredEntries(): void {
  const now = Date.now()
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt <= now) {
      store.delete(key)
    }
  }
}
