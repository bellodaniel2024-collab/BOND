/**
 * ChainVault — Input Validation Schemas
 *
 * All API inputs validated with Zod before processing.
 * Validation happens server-side — never trust client data.
 */
import { z } from 'zod'
import { isAddress, getAddress } from 'viem'
import { getEnabledChainIds } from './networks'

// ─── Address Validation ───────────────────────────────────────────────────────

export const evmAddressSchema = z
  .string()
  .min(42, 'Invalid address')
  .max(42, 'Invalid address')
  .refine((val) => isAddress(val), { message: 'Invalid EVM wallet address.' })
  .transform((val) => getAddress(val)) // Normalize to checksum address

// ─── Amount Validation ────────────────────────────────────────────────────────

export const cryptoAmountSchema = z
  .string()
  .min(1, 'Amount required')
  .refine(
    (val) => {
      const num = parseFloat(val)
      return !isNaN(num) && num > 0
    },
    { message: 'Amount must be a positive number.' },
  )
  .refine(
    (val) => {
      // Prevent scientific notation and excessively long amounts
      return /^\d+(\.\d+)?$/.test(val) && val.length <= 30
    },
    { message: 'Invalid amount format.' },
  )

// ─── Auth Schemas ─────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  email: z
    .string()
    .email('Invalid email address.')
    .max(254, 'Email address too long.')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(12, 'Password must be at least 12 characters.')
    .max(128, 'Password too long.'),
  displayName: z
    .string()
    .min(2, 'Display name must be at least 2 characters.')
    .max(50, 'Display name too long.')
    .regex(/^[a-zA-Z0-9\s._-]+$/, 'Display name contains invalid characters.')
    .optional(),
})

export const loginSchema = z.object({
  email: z
    .string()
    .email('Invalid email address.')
    .max(254)
    .toLowerCase()
    .trim(),
  password: z.string().min(1, 'Password required.').max(128),
})

export const passwordResetRequestSchema = z.object({
  email: z.string().email('Invalid email address.').max(254).toLowerCase().trim(),
})

export const passwordResetSchema = z.object({
  token: z.string().min(1, 'Reset token required.').max(128),
  password: z
    .string()
    .min(12, 'Password must be at least 12 characters.')
    .max(128),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: z
    .string()
    .min(12, 'Password must be at least 12 characters.')
    .max(128),
})

export const twoFactorVerifySchema = z.object({
  token: z
    .string()
    .length(6, 'Two-factor code must be 6 digits.')
    .regex(/^\d{6}$/, 'Two-factor code must be numeric.'),
})

// ─── SIWE Schemas ─────────────────────────────────────────────────────────────

export const siweNonceRequestSchema = z.object({
  address: evmAddressSchema,
})

export const siweVerifySchema = z.object({
  message: z.string().min(1).max(2048),
  signature: z.string().min(1).max(512),
  address: evmAddressSchema,
  nonce: z.string().min(1).max(64),
})

// ─── Transaction Schemas ──────────────────────────────────────────────────────

export const sendTransactionSchema = z.object({
  fromAddress: evmAddressSchema,
  toAddress: evmAddressSchema,
  amount: cryptoAmountSchema,
  tokenSymbol: z.string().min(1).max(20).toUpperCase(),
  chainId: z.number().int().refine(
    (id) => getEnabledChainIds().includes(id),
    { message: 'Unsupported or disabled network.' },
  ),
  // Optional token contract — server validates against trusted config
  tokenContractAddress: evmAddressSchema.optional(),
})

export const recordTransactionSchema = z.object({
  txHash: z
    .string()
    .regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid transaction hash.')
    .toLowerCase(),
  fromAddress: evmAddressSchema,
  toAddress: evmAddressSchema,
  amount: z.string(),
  amountRaw: z.string(),
  chainId: z.number().int(),
  networkName: z.string().min(1).max(50),
  tokenSymbol: z.string().min(1).max(20),
  tokenAddress: z.string().nullable().optional(),
  tokenDecimals: z.number().int().min(0).max(18),
  gasFee: z.string().optional(),
  gasFeeRaw: z.string().optional(),
  nonce: z.number().int().optional(),
})

// ─── Account Settings Schemas ─────────────────────────────────────────────────

export const updateProfileSchema = z.object({
  displayName: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-zA-Z0-9\s._-]+$/, 'Display name contains invalid characters.')
    .optional(),
})

// ─── Helper ───────────────────────────────────────────────────────────────────

export type ApiValidationError = {
  field: string
  message: string
}

export function formatZodErrors(error: z.ZodError): ApiValidationError[] {
  return error.errors.map((e) => ({
    field: e.path.join('.'),
    message: e.message,
  }))
}
