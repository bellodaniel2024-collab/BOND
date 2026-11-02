/**
 * GET /api/networks
 * Returns enabled network configurations (no sensitive RPC credentials).
 */
import { NextRequest } from 'next/server'
import { apiSuccess } from '@/lib/api-response'
import { getEnabledNetworks } from '@/lib/networks'

export async function GET(_req: NextRequest) {
  const networks = getEnabledNetworks().map((n) => ({
    chainId: n.chainId,
    name: n.name,
    shortName: n.shortName,
    isTestnet: n.isTestnet,
    nativeCurrency: n.nativeCurrency,
    blockExplorerUrl: n.blockExplorerUrl,
    blockExplorerName: n.blockExplorerName,
    requiredConfirmations: n.requiredConfirmations,
    logoUrl: n.logoUrl,
    // Tokens — contract addresses are public info
    tokens: n.tokens.map((t) => ({
      symbol: t.symbol,
      name: t.name,
      contractAddress: t.contractAddress,
      decimals: t.decimals,
      logoUrl: t.logoUrl,
      isNative: t.contractAddress === null,
    })),
    // RPC URL intentionally omitted — never expose to client
  }))

  return apiSuccess({ networks })
}
