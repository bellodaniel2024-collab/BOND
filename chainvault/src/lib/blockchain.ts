/**
 * ChainVault — Blockchain Interaction Utilities
 *
 * Server-side viem utilities for:
 * - Transaction receipt verification
 * - Balance queries
 * - Gas estimation
 * - Address validation
 *
 * SECURITY:
 * - RPC URLs with API keys are server-side only (never in NEXT_PUBLIC_ vars unless public)
 * - All transaction data verified against on-chain receipts — never trust client claims
 * - Token contract addresses validated against trusted config only
 */
import {
  createPublicClient,
  http,
  isAddress,
  getAddress,
  formatEther,
  formatUnits,
  parseEther,
  parseUnits,
  type PublicClient,
  type TransactionReceipt,
  type Address,
} from 'viem'
import { sepolia, polygonAmoy, mainnet, polygon } from 'viem/chains'
import { getNetworkByChainId } from './networks'

// ERC-20 ABI — minimal interface for balanceOf and transfer
const ERC20_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'decimals',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
  {
    name: 'symbol',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
  },
] as const

// Chain ID to viem chain mapping
const CHAIN_MAP = {
  [sepolia.id]: sepolia,
  [polygonAmoy.id]: polygonAmoy,
  [mainnet.id]: mainnet,
  [polygon.id]: polygon,
} as const

// ─── Public Client Factory ────────────────────────────────────────────────────

const clientCache = new Map<number, PublicClient>()

export function getPublicClient(chainId: number): PublicClient | null {
  if (clientCache.has(chainId)) {
    return clientCache.get(chainId)!
  }

  const networkConfig = getNetworkByChainId(chainId)
  if (!networkConfig) return null

  const chain = CHAIN_MAP[chainId as keyof typeof CHAIN_MAP]
  if (!chain) return null

  // Server-side RPC URL (API key kept secret)
  const rpcUrl = networkConfig.rpcUrl || undefined

  const client = createPublicClient({
    chain,
    transport: http(rpcUrl),
  })

  clientCache.set(chainId, client as PublicClient)
  return client as PublicClient
}

// ─── Address Validation ───────────────────────────────────────────────────────

export function validateEvmAddress(address: string): boolean {
  return isAddress(address)
}

export function normalizeAddress(address: string): Address {
  if (!isAddress(address)) throw new Error(`Invalid EVM address: ${address}`)
  return getAddress(address)
}

// ─── Balance Queries ──────────────────────────────────────────────────────────

export async function getNativeBalance(
  chainId: number,
  address: string,
): Promise<{ balance: string; balanceRaw: bigint } | null> {
  const client = getPublicClient(chainId)
  if (!client) return null

  try {
    const balanceRaw = await client.getBalance({
      address: normalizeAddress(address),
    })
    return {
      balance: formatEther(balanceRaw),
      balanceRaw,
    }
  } catch (err) {
    console.error(`[Blockchain] getNativeBalance failed for chain ${chainId}:`, err)
    return null
  }
}

export async function getErc20Balance(
  chainId: number,
  tokenAddress: string,
  walletAddress: string,
  decimals: number,
): Promise<{ balance: string; balanceRaw: bigint } | null> {
  const client = getPublicClient(chainId)
  if (!client) return null

  try {
    const balanceRaw = await client.readContract({
      address: normalizeAddress(tokenAddress) as Address,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [normalizeAddress(walletAddress) as Address],
    })

    return {
      balance: formatUnits(balanceRaw as bigint, decimals),
      balanceRaw: balanceRaw as bigint,
    }
  } catch (err) {
    console.error(`[Blockchain] getErc20Balance failed:`, err)
    return null
  }
}

// ─── Gas Estimation ───────────────────────────────────────────────────────────

export async function estimateNativeTransferGas(
  chainId: number,
  from: string,
  to: string,
  value: bigint,
): Promise<{ gasFee: string; gasEstimate: bigint; gasPrice: bigint } | null> {
  const client = getPublicClient(chainId)
  if (!client) return null

  try {
    const [gasEstimate, gasPrice] = await Promise.all([
      client.estimateGas({
        account: normalizeAddress(from) as Address,
        to: normalizeAddress(to) as Address,
        value,
      }),
      client.getGasPrice(),
    ])

    const gasFeeRaw = gasEstimate * gasPrice
    return {
      gasFee: formatEther(gasFeeRaw),
      gasEstimate,
      gasPrice,
    }
  } catch (err) {
    console.error(`[Blockchain] estimateNativeTransferGas failed:`, err)
    return null
  }
}

// ─── Transaction Receipt Verification ────────────────────────────────────────

/**
 * Fetch and verify a transaction receipt on-chain.
 * Never trust client-provided transaction status — always verify here.
 */
export async function verifyTransactionReceipt(
  chainId: number,
  txHash: string,
): Promise<{
  confirmed: boolean
  receipt: TransactionReceipt | null
  blockNumber: bigint | null
  confirmations: number
} | null> {
  const client = getPublicClient(chainId)
  if (!client) return null

  const networkConfig = getNetworkByChainId(chainId)
  if (!networkConfig) return null

  try {
    const receipt = await client.getTransactionReceipt({
      hash: txHash as `0x${string}`,
    })

    if (!receipt) {
      return { confirmed: false, receipt: null, blockNumber: null, confirmations: 0 }
    }

    // Get current block number to count confirmations
    const currentBlock = await client.getBlockNumber()
    const confirmations =
      receipt.blockNumber !== null
        ? Number(currentBlock - receipt.blockNumber) + 1
        : 0

    const confirmed =
      receipt.status === 'success' &&
      confirmations >= networkConfig.requiredConfirmations

    return {
      confirmed,
      receipt,
      blockNumber: receipt.blockNumber,
      confirmations,
    }
  } catch (err) {
    console.error(`[Blockchain] verifyTransactionReceipt failed for ${txHash}:`, err)
    return null
  }
}

// ─── Parse Amount Safely ─────────────────────────────────────────────────────

export function parseAmount(amount: string, decimals: number): bigint {
  try {
    return decimals === 18
      ? parseEther(amount)
      : parseUnits(amount, decimals)
  } catch {
    throw new Error(`Invalid amount: ${amount}`)
  }
}

export function formatAmount(raw: bigint, decimals: number): string {
  return decimals === 18 ? formatEther(raw) : formatUnits(raw, decimals)
}
