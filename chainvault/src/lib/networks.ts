/**
 * ChainVault — Supported Network Configuration
 *
 * SECURITY NOTES:
 * - Only explicitly listed networks are supported.
 * - Mainnet networks are disabled (isProduction: true, enabled: false)
 *   until full security review, legal compliance, and independent audit.
 * - RPC URLs with API keys must come from env vars — never hardcoded.
 * - Token contract addresses sourced from official project documentation.
 *   Do not invent addresses.
 */

export interface TokenConfig {
  symbol: string
  name: string
  contractAddress: string | null // null = native currency
  decimals: number
  logoUrl: string
  coingeckoId?: string
}

export interface NetworkConfig {
  chainId: number
  name: string
  shortName: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  rpcUrl: string       // Public or env-driven RPC
  blockExplorerUrl: string
  blockExplorerName: string
  requiredConfirmations: number
  isTestnet: boolean
  isProduction: boolean
  enabled: boolean     // Must be explicitly enabled — production defaults to false
  logoUrl: string
  tokens: TokenConfig[]
}

// ─── Testnet Networks (development / testing) ────────────────────────────────

const SEPOLIA: NetworkConfig = {
  chainId: 11155111,
  name: 'Ethereum Sepolia',
  shortName: 'sepolia',
  nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
  rpcUrl: process.env['NEXT_PUBLIC_SEPOLIA_RPC_URL'] ?? 'https://rpc.sepolia.org',
  blockExplorerUrl: 'https://sepolia.etherscan.io',
  blockExplorerName: 'Sepolia Etherscan',
  requiredConfirmations: 1,
  isTestnet: true,
  isProduction: false,
  enabled: true, // Testnet — enabled for development
  logoUrl: '/assets/networks/ethereum.svg',
  tokens: [
    {
      symbol: 'ETH',
      name: 'Sepolia Ether',
      contractAddress: null,
      decimals: 18,
      logoUrl: '/assets/tokens/eth.svg',
      coingeckoId: 'ethereum',
    },
    // USDC on Sepolia — official Circle testnet address
    {
      symbol: 'USDC',
      name: 'USD Coin',
      contractAddress: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
      decimals: 6,
      logoUrl: '/assets/tokens/usdc.svg',
      coingeckoId: 'usd-coin',
    },
  ],
}

const POLYGON_AMOY: NetworkConfig = {
  chainId: 80002,
  name: 'Polygon Amoy',
  shortName: 'amoy',
  nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
  rpcUrl: process.env['NEXT_PUBLIC_POLYGON_AMOY_RPC_URL'] ?? 'https://rpc-amoy.polygon.technology',
  blockExplorerUrl: 'https://amoy.polygonscan.com',
  blockExplorerName: 'Polygonscan Amoy',
  requiredConfirmations: 2,
  isTestnet: true,
  isProduction: false,
  enabled: true,
  logoUrl: '/assets/networks/polygon.svg',
  tokens: [
    {
      symbol: 'MATIC',
      name: 'MATIC',
      contractAddress: null,
      decimals: 18,
      logoUrl: '/assets/tokens/matic.svg',
      coingeckoId: 'matic-network',
    },
  ],
}

// ─── Production Networks (DISABLED — require full security review) ───────────
// Uncomment ONLY after:
//  1. Independent professional security audit completed
//  2. Legal / compliance review completed
//  3. Mainnet RPC credentials properly secured
//  4. Monitoring and incident response procedures established
//  5. Emergency pause / circuit-breaker mechanisms tested

const ETHEREUM_MAINNET: NetworkConfig = {
  chainId: 1,
  name: 'Ethereum Mainnet',
  shortName: 'eth',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrl: process.env['NEXT_PUBLIC_MAINNET_RPC_URL'] ?? '',
  blockExplorerUrl: 'https://etherscan.io',
  blockExplorerName: 'Etherscan',
  requiredConfirmations: 12,
  isTestnet: false,
  isProduction: true,
  enabled: false, // ← PRODUCTION DISABLED
  logoUrl: '/assets/networks/ethereum.svg',
  tokens: [
    {
      symbol: 'ETH',
      name: 'Ether',
      contractAddress: null,
      decimals: 18,
      logoUrl: '/assets/tokens/eth.svg',
      coingeckoId: 'ethereum',
    },
    // USDC Mainnet — official Circle address
    {
      symbol: 'USDC',
      name: 'USD Coin',
      contractAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      decimals: 6,
      logoUrl: '/assets/tokens/usdc.svg',
      coingeckoId: 'usd-coin',
    },
    // USDT Mainnet — official Tether address
    {
      symbol: 'USDT',
      name: 'Tether USD',
      contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      decimals: 6,
      logoUrl: '/assets/tokens/usdt.svg',
      coingeckoId: 'tether',
    },
  ],
}

const POLYGON_MAINNET: NetworkConfig = {
  chainId: 137,
  name: 'Polygon',
  shortName: 'matic',
  nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
  rpcUrl: process.env['NEXT_PUBLIC_POLYGON_RPC_URL'] ?? '',
  blockExplorerUrl: 'https://polygonscan.com',
  blockExplorerName: 'Polygonscan',
  requiredConfirmations: 100,
  isTestnet: false,
  isProduction: true,
  enabled: false, // ← PRODUCTION DISABLED
  logoUrl: '/assets/networks/polygon.svg',
  tokens: [
    {
      symbol: 'MATIC',
      name: 'MATIC',
      contractAddress: null,
      decimals: 18,
      logoUrl: '/assets/tokens/matic.svg',
      coingeckoId: 'matic-network',
    },
    // USDC on Polygon — official bridged address
    {
      symbol: 'USDC',
      name: 'USD Coin',
      contractAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      decimals: 6,
      logoUrl: '/assets/tokens/usdc.svg',
      coingeckoId: 'usd-coin',
    },
  ],
}

// ─── All Configured Networks ─────────────────────────────────────────────────

export const ALL_NETWORKS: NetworkConfig[] = [
  SEPOLIA,
  POLYGON_AMOY,
  ETHEREUM_MAINNET,
  POLYGON_MAINNET,
]

/**
 * Returns only enabled networks.
 * Production networks are excluded unless explicitly enabled via config.
 */
export function getEnabledNetworks(): NetworkConfig[] {
  return ALL_NETWORKS.filter((n) => n.enabled)
}

/**
 * Returns a network by chain ID. Returns undefined if not found or disabled.
 */
export function getNetworkByChainId(chainId: number): NetworkConfig | undefined {
  return ALL_NETWORKS.find((n) => n.chainId === chainId && n.enabled)
}

/**
 * Returns the chain IDs for wagmi configuration.
 * Only includes enabled networks.
 */
export function getEnabledChainIds(): number[] {
  return getEnabledNetworks().map((n) => n.chainId)
}

/**
 * Verifies that a token contract address is in our trusted configuration
 * for the given chain. Never trust user-supplied contract addresses.
 */
export function isTokenContractTrusted(chainId: number, contractAddress: string): boolean {
  const network = getNetworkByChainId(chainId)
  if (!network) return false

  return network.tokens.some(
    (t) =>
      t.contractAddress !== null &&
      t.contractAddress.toLowerCase() === contractAddress.toLowerCase(),
  )
}

/**
 * Returns a specific token config if it exists on the given network.
 */
export function getTokenConfig(chainId: number, symbol: string): TokenConfig | undefined {
  const network = getNetworkByChainId(chainId)
  if (!network) return undefined
  return network.tokens.find((t) => t.symbol.toUpperCase() === symbol.toUpperCase())
}
