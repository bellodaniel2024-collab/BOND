/**
 * GET /api/wallet/balance?address=<address>&chainId=<chainId>
 * Returns wallet balances for enabled networks/tokens.
 * Requires authentication.
 */
import { NextRequest } from 'next/server'
import { getSession, requireAuth } from '@/lib/session'
import { isAddress, getAddress } from 'viem'
import { apiSuccess, apiError, handleApiError } from '@/lib/api-response'
import { getNativeBalance, getErc20Balance } from '@/lib/blockchain'
import { getNetworkByChainId } from '@/lib/networks'

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    const auth = requireAuth(session)

    const { searchParams } = new URL(req.url)
    const address = searchParams.get('address')
    const chainIdStr = searchParams.get('chainId')

    if (!address || !isAddress(address)) {
      return apiError('Valid wallet address required.', 400)
    }

    const chainId = chainIdStr ? parseInt(chainIdStr, 10) : null
    const normalizedAddress = getAddress(address)

    const network = chainId ? getNetworkByChainId(chainId) : null
    if (chainId && !network) {
      return apiError('Unsupported or disabled network.', 400)
    }

    if (!network) {
      return apiError('Chain ID required.', 400)
    }

    // Fetch native balance
    const nativeBalance = await getNativeBalance(chainId!, normalizedAddress)

    // Fetch ERC-20 token balances
    const tokenBalances: Array<{
      symbol: string
      name: string
      balance: string
      contractAddress: string | null
      decimals: number
    }> = []

    for (const token of network.tokens) {
      if (token.contractAddress === null) continue // native already fetched

      const bal = await getErc20Balance(
        chainId!,
        token.contractAddress,
        normalizedAddress,
        token.decimals,
      )

      tokenBalances.push({
        symbol: token.symbol,
        name: token.name,
        balance: bal?.balance ?? '0',
        contractAddress: token.contractAddress,
        decimals: token.decimals,
      })
    }

    return apiSuccess({
      address: normalizedAddress,
      network: {
        chainId: network.chainId,
        name: network.name,
        nativeCurrency: network.nativeCurrency,
      },
      nativeBalance: {
        symbol: network.nativeCurrency.symbol,
        name: network.nativeCurrency.name,
        balance: nativeBalance?.balance ?? '0',
        decimals: network.nativeCurrency.decimals,
      },
      tokenBalances,
    })
  } catch (error) {
    return handleApiError(error, 'wallet/balance')
  }
}
