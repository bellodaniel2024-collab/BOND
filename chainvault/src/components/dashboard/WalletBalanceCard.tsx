'use client'

import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Wallet, Copy, ExternalLink, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { formatAddress, formatAmount } from '@/lib/utils'
import { getNetworkByChainId } from '@/lib/networks'

interface Props {
  address: string
  chainId: number
}

interface BalanceData {
  nativeBalance: { symbol: string; balance: string; name: string }
  tokenBalances: Array<{ symbol: string; name: string; balance: string; contractAddress: string | null }>
  network: { name: string; chainId: number }
}

export function WalletBalanceCard({ address, chainId }: Props) {
  const [copied, setCopied] = useState(false)
  const network = getNetworkByChainId(chainId)

  const { data, isLoading, refetch, isRefetching } = useQuery<{ data: BalanceData }>({
    queryKey: ['balance', address, chainId],
    queryFn: () =>
      fetch(`/api/wallet/balance?address=${address}&chainId=${chainId}`, {
        credentials: 'include',
      }).then((r) => r.json()),
    enabled: !!address && !!chainId && !!network,
    refetchInterval: 30_000,
  })

  const balanceData = data?.data

  function copyAddress() {
    navigator.clipboard.writeText(address).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div
      className="rounded-2xl border p-6 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #2563eb 100%)',
        borderColor: 'rgba(255,255,255,0.1)',
      }}
    >
      {/* Decorative orb */}
      <div
        className="absolute -right-8 -top-8 w-40 h-40 rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, #60a5fa 0%, transparent 70%)' }}
        aria-hidden
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <Wallet size={15} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-white/80">Connected Wallet</span>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Refresh balance"
          >
            <RefreshCw size={13} className={`text-white ${isRefetching ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Address */}
        <div className="flex items-center gap-2 mb-5">
          <span className="font-mono-address text-sm text-white/70">
            {formatAddress(address, 8, 6)}
          </span>
          <button
            onClick={copyAddress}
            className="p-1 rounded hover:bg-white/10 transition-colors"
            aria-label="Copy address"
          >
            <Copy size={12} className="text-white/60" />
          </button>
          {network && (
            <a
              href={`${network.blockExplorerUrl}/address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded hover:bg-white/10 transition-colors"
              aria-label="View on explorer"
            >
              <ExternalLink size={12} className="text-white/60" />
            </a>
          )}
          {copied && <span className="text-xs text-green-300">Copied!</span>}
        </div>

        {/* Balances */}
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-8 w-40 rounded-lg bg-white/10 animate-pulse" />
            <div className="h-5 w-28 rounded-lg bg-white/10 animate-pulse" />
          </div>
        ) : balanceData ? (
          <div>
            <div className="mb-1">
              <CountingBalance value={balanceData.nativeBalance.balance} />
              <span className="text-lg font-semibold text-white/70 ml-2">
                {balanceData.nativeBalance.symbol}
              </span>
            </div>
            <p className="text-sm text-white/50 mb-4">
              {network?.name ?? 'Unknown network'}
            </p>

            {/* Token balances */}
            {balanceData.tokenBalances.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {balanceData.tokenBalances.map((token) => (
                  <div
                    key={token.symbol}
                    className="px-3 py-1.5 rounded-full bg-white/10 text-sm text-white/80 font-medium"
                  >
                    {formatAmount(token.balance)} {token.symbol}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <p className="text-3xl font-bold text-white mb-1">—</p>
            {network ? (
              <p className="text-sm text-white/50">Unable to fetch balance</p>
            ) : (
              <p className="text-sm text-white/50">Unsupported network — switch to a supported network</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function CountingBalance({ value }: { value: string }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-3xl font-display font-bold text-white"
    >
      {formatAmount(value)}
    </motion.span>
  )
}
