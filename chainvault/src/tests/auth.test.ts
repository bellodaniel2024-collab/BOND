/**
 * ChainVault — Authentication Tests
 * Run with: npm run test
 */
import { describe, it, expect } from 'vitest'
import {
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
  generateSiweNonce,
  generateSecureToken,
  hashToken,
} from '@/lib/auth'

describe('Authentication Utilities', () => {
  describe('password hashing', () => {
    it('should hash a password', async () => {
      const hash = await hashPassword('TestPassword123!')
      expect(hash).toBeTruthy()
      expect(hash).not.toBe('TestPassword123!')
      expect(hash.startsWith('$2')).toBe(true) // bcrypt
    })

    it('should verify a correct password', async () => {
      const hash = await hashPassword('TestPassword123!')
      const valid = await verifyPassword('TestPassword123!', hash)
      expect(valid).toBe(true)
    })

    it('should reject an incorrect password', async () => {
      const hash = await hashPassword('TestPassword123!')
      const valid = await verifyPassword('WrongPassword!', hash)
      expect(valid).toBe(false)
    })

    it('should produce different hashes for the same password (bcrypt salts)', async () => {
      const hash1 = await hashPassword('TestPassword123!')
      const hash2 = await hashPassword('TestPassword123!')
      expect(hash1).not.toBe(hash2)
    })
  })

  describe('password strength validation', () => {
    it('should accept a strong password', () => {
      const result = validatePasswordStrength('Str0ng!Password#2026')
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject a short password', () => {
      const result = validatePasswordStrength('Sh0rt!')
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('12 characters'))).toBe(true)
    })

    it('should reject a password without uppercase', () => {
      const result = validatePasswordStrength('lowercase!password123')
      expect(result.valid).toBe(false)
    })

    it('should reject a password without numbers', () => {
      const result = validatePasswordStrength('NoNumbers!Password')
      expect(result.valid).toBe(false)
    })

    it('should reject a password without special characters', () => {
      const result = validatePasswordStrength('NoSpecial1Password')
      expect(result.valid).toBe(false)
    })
  })

  describe('SIWE nonce generation', () => {
    it('should generate a non-empty nonce', () => {
      const nonce = generateSiweNonce()
      expect(nonce).toBeTruthy()
      expect(nonce.length).toBeGreaterThanOrEqual(16)
    })

    it('should generate unique nonces', () => {
      const nonces = Array.from({ length: 100 }, () => generateSiweNonce())
      const unique = new Set(nonces)
      expect(unique.size).toBe(100)
    })
  })

  describe('secure token generation', () => {
    it('should generate a 64-char hex token by default', () => {
      const token = generateSecureToken()
      expect(token.length).toBe(64)
      expect(/^[0-9a-f]+$/.test(token)).toBe(true)
    })

    it('should hash tokens consistently', () => {
      const token = 'test-token'
      const hash1 = hashToken(token)
      const hash2 = hashToken(token)
      expect(hash1).toBe(hash2)
    })

    it('should not return the plaintext in the hash', () => {
      const token = generateSecureToken()
      const hash = hashToken(token)
      expect(hash).not.toBe(token)
    })
  })
})
