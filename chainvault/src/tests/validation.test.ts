/**
 * ChainVault — Input Validation Tests
 */
import { describe, it, expect } from 'vitest'
import {
  evmAddressSchema,
  cryptoAmountSchema,
  registerSchema,
  loginSchema,
} from '@/lib/validation'
import { isTokenContractTrusted, getNetworkByChainId } from '@/lib/networks'

describe('Address Validation', () => {
  it('should accept a valid checksummed address', () => {
    const result = evmAddressSchema.safeParse('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045')
    expect(result.success).toBe(true)
  })

  it('should reject an invalid address', () => {
    const result = evmAddressSchema.safeParse('0xinvalid')
    expect(result.success).toBe(false)
  })

  it('should reject an address that is too short', () => {
    const result = evmAddressSchema.safeParse('0x123')
    expect(result.success).toBe(false)
  })

  it('should normalize to checksummed address', () => {
    const result = evmAddressSchema.safeParse('0xd8da6bf26964af9d7eed9e03e53415d37aa96045')
    expect(result.success).toBe(true)
    // Should be checksummed (mixed case)
    if (result.success) {
      expect(result.data).not.toBe('0xd8da6bf26964af9d7eed9e03e53415d37aa96045')
    }
  })
})

describe('Amount Validation', () => {
  it('should accept valid amounts', () => {
    expect(cryptoAmountSchema.safeParse('1.5').success).toBe(true)
    expect(cryptoAmountSchema.safeParse('0.001').success).toBe(true)
    expect(cryptoAmountSchema.safeParse('1000').success).toBe(true)
  })

  it('should reject zero or negative amounts', () => {
    expect(cryptoAmountSchema.safeParse('0').success).toBe(false)
    expect(cryptoAmountSchema.safeParse('-1').success).toBe(false)
  })

  it('should reject scientific notation', () => {
    expect(cryptoAmountSchema.safeParse('1e10').success).toBe(false)
  })
})

describe('Registration Schema', () => {
  it('should accept valid registration data', () => {
    const result = registerSchema.safeParse({
      email: 'user@example.com',
      password: 'ValidPassword123!',
    })
    expect(result.success).toBe(true)
  })

  it('should reject invalid email', () => {
    const result = registerSchema.safeParse({
      email: 'not-an-email',
      password: 'ValidPassword123!',
    })
    expect(result.success).toBe(false)
  })

  it('should lowercase email', () => {
    const result = registerSchema.safeParse({
      email: 'USER@EXAMPLE.COM',
      password: 'ValidPassword123!',
    })
    if (result.success) {
      expect(result.data.email).toBe('user@example.com')
    }
  })
})

describe('Network Configuration Security', () => {
  it('should return enabled testnets', () => {
    const network = getNetworkByChainId(11155111) // Sepolia
    expect(network).toBeDefined()
    expect(network?.isTestnet).toBe(true)
    expect(network?.enabled).toBe(true)
  })

  it('should not return disabled mainnet', () => {
    const mainnet = getNetworkByChainId(1) // Ethereum Mainnet — disabled
    expect(mainnet).toBeUndefined()
  })

  it('should not trust an arbitrary contract address', () => {
    // Made-up contract address
    const trusted = isTokenContractTrusted(11155111, '0x1234567890123456789012345678901234567890')
    expect(trusted).toBe(false)
  })

  it('should trust a configured contract address', () => {
    // Official USDC on Sepolia
    const trusted = isTokenContractTrusted(11155111, '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238')
    expect(trusted).toBe(true)
  })
})
