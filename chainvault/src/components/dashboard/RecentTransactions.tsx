'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { ArrowUpRight, ArrowDownLeft, Loader2, ExternalLink } from 'lucide-react'
import { formatAmount, formatRelativeTime, getTransactionStatusConfig, formatTxHash } from '@/lib/utils'
import { getNetworkByChainId } from '@/lib/networks'

interface Transaction {
  id: string
  type: 'SEND' | 'RECEIVE'
  status: string
  txHash: string | null
  fromAddress: string
  toAddress: string
  amount: string
  tokenSymbol: string
  networkName: string
  chainId: number
  createdAt: string
}

export function RecentTransactions() {
  const { data, isLoading } = useQuery<{ data: { transactions: Transaction[] } }>({
    queryKey: ['transactions', 'recent'],
    queryFn: () =>
      fetch('/api/transactions?limit=5', { credentials: 'include' }).then((r) => r.json()),
    refetchInterval: 20_000,
  })

  const transactions = data?.data?.transactions ?? []

  return (
    <div className="cv-card">
      <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Recent Transactions</h3>
        <Link href="/transactions" className="text-xs font-medium hover:underline" style={{ color: 'var(--accent-primary)' }}>
          View all
        </Link>
      </div>

      {isLoading ? (
        <div className="p-5 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="skeleton w-9 h-9 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <div className="skeleton h-3.5 w-24 rounded" />
                <div className="skeleton h-3 w-16 rounded" />
              </div>
              <div className="skeleton h-3.5 w-16 rounded" />
            </div>
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No transactions yet.</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Your transaction history will appear here.
          </p>
        </div>
      ) : (
        <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
          {transactions.map((tx) => {
            const statusConfig = getTransactionStatusConfig(tx.status)
            const network = getNetworkByChainId(tx.chainId)
            const isSend = tx.type === 'SEND'

            return (
              <Link
                key={tx.id}
                href={`/transactions/${tx.id}`}
                className="flex items-center gap-3 px-5 py-4 hover:bg-[var(--bg-muted)] transition-colors"
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isSend ? 'bg-red-500/10' : 'bg-green-500/10'
                  }`}
                >
                  {isSend ? (
                    <ArrowUpRight size={15} className="text-red-500" />
                  ) : (
                    <ArrowDownLeft size={15} className="text-green-500" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {isSend ? 'Sent' : 'Received'} {tx.tokenSymbol}
                    </span>
                    <span className={statusConfig.badgeClass}>{statusConfig.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {tx.txHash && (
                      <span className="font-mono-address text-xs" style={{ color: 'var(--text-muted)' }}>
                        {formatTxHash(tx.txHash, 6)}
                      </span>
                    )}
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {formatRelativeTime(new Date(tx.createdAt))}
                    </span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <p
                    className={`text-sm font-semibold ${isSend ? 'text-red-500' : 'text-green-500'}`}
                  >
                    {isSend ? '-' : '+'}{formatAmount(tx.amount)} {tx.tokenSymbol}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {tx.networkName}
                  </p>
                </div>

                {network && tx.txHash && (
                  <a
                    href={`${network.blockExplorerUrl}/tx/${tx.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-1 rounded hover:bg-[var(--bg-muted)]"
                    aria-label="View on block explorer"
                  >
                    <ExternalLink size={13} style={{ color: 'var(--text-muted)' }} />
                  </a>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
