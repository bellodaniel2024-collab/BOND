/**
 * ChainVault — Authentication Utilities
 *
 * SECURITY:
 * - Passwords hashed with bcrypt (cost factor 12)
 * - JWT tokens signed with HS256
 * - Sessions stored server-side — token hash in DB, not plaintext
 * - No plaintext passwords or private keys ever stored
 */
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { randomBytes, createHash } from 'crypto'

// ─── Constants ───────────────────────────────────────────────────────────────

const BCRYPT_ROUNDS = 12
const JWT_SECRET = process.env['JWT_SECRET']!
const JWT_EXPIRES_IN = process.env['JWT_EXPIRES_IN'] ?? '15m'
const REFRESH_EXPIRES_IN = process.env['REFRESH_TOKEN_EXPIRES_IN'] ?? '7d'

if (!JWT_SECRET && process.env['NODE_ENV'] !== 'test') {
  throw new Error('[Security] JWT_SECRET environment variable is not set.')
}

// ─── Password Hashing ────────────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS)
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// ─── Secure Token Generation ─────────────────────────────────────────────────

export function generateSecureToken(bytes = 32): string {
  return randomBytes(bytes).toString('hex')
}

/**
 * Hash a token for storage. We store hashes, never plaintext tokens.
 * This way, even if the DB is compromised, tokens are not directly usable.
 */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

// ─── JWT ─────────────────────────────────────────────────────────────────────

export interface JwtPayload {
  sub: string      // User ID
  email: string
  role: string
  sessionId: string
}

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    issuer: 'bond',
    audience: 'bond-api',
  })
}

export function signRefreshToken(userId: string, sessionId: string): string {
  return jwt.sign(
    { sub: userId, sessionId, type: 'refresh' },
    JWT_SECRET,
    {
      expiresIn: REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
      issuer: 'bond',
      audience: 'bond-refresh',
    },
  )
}

export function verifyAccessToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, JWT_SECRET, {
    issuer: 'bond',
    audience: 'bond-api',
  }) as JwtPayload
  return decoded
}

export function verifyRefreshToken(token: string): { sub: string; sessionId: string } {
  const decoded = jwt.verify(token, JWT_SECRET, {
    issuer: 'bond',
    audience: 'bond-refresh',
  }) as { sub: string; sessionId: string }
  return decoded
}

// ─── SIWE Nonce ──────────────────────────────────────────────────────────────

/**
 * Generate a cryptographically random nonce for SIWE messages.
 * Each nonce is single-use — replay protection enforced at DB level.
 */
export function generateSiweNonce(): string {
  return randomBytes(16).toString('hex')
}

// ─── Email Verification & Password Reset ────────────────────────────────────

export function generateVerificationToken(): string {
  return generateSecureToken(32)
}

export function generatePasswordResetToken(): string {
  return generateSecureToken(32)
}

// ─── Password Validation ─────────────────────────────────────────────────────

export interface PasswordStrength {
  valid: boolean
  errors: string[]
}

export function validatePasswordStrength(password: string): PasswordStrength {
  const errors: string[] = []

  if (password.length < 12) {
    errors.push('Password must be at least 12 characters.')
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter.')
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter.')
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number.')
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character.')
  }
  // Rudimentary common-password check (production should use a full list)
  const commonPatterns = ['password', '123456', 'qwerty', 'bond', 'crypto']
  const lower = password.toLowerCase()
  if (commonPatterns.some((p) => lower.includes(p))) {
    errors.push('Password is too common or predictable.')
  }

  return { valid: errors.length === 0, errors }
}
