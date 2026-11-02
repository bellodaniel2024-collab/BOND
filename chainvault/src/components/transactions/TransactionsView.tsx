'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowDownLeft, ExternalLink, ChevronLeft, ChevronRight, Filter } from 'lucide-react'
import {
  formatAmount,
  formatDate,
  formatTxHash,
  getTransactionStatusConfig,
} from '@/lib/utils'
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
  gasFee: string | null
  confirmations: number
  requiredConfirmations: number
  createdAt: string
  confirmedAt: string | null
}

const STATUS_OPTIONS = [
  'ALL', 'PREPARING', 'AWAITING_AUTHORIZATION', 'PENDING',
  'CONFIRMING', 'CONFIRMED', 'FAILED', 'CANCELLED',
]

export function TransactionsView() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('ALL')

  const queryUrl = `/api/transactions?page=${page}&limit=20${statusFilter !== 'ALL' ? `&status=${statusFilter}` : ''}`

  const { data, isLoading } = useQuery<{
    data: {
      transactions: Transaction[]
      pagination: { total: number; totalPages: number; hasMore: boolean }
    }
  }>({
    queryKey: ['transactions', page, statusFilter],
    queryFn: () => fetch(queryUrl, { credentials: 'include' }).then((r) => r.json()),
    refetchInterval: 15_000,
  })

  const transactions = data?.data?.transactions ?? []
  const pagination = data?.data?.pagination

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl" style={{ color: 'var(--text-primary)' }}>
            Transaction History
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {pagination?.total ?? 0} total transactions
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter size={14} style={{ color: 'var(--text-muted)' }} />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
            className="cv-input py-1.5 text-xs w-44"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="cv-card overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="skeleton w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-1/3 rounded" />
                  <div className="skeleton h-3 w-1/4 rounded" />
                </div>
                <div className="skeleton h-4 w-20 rounded" />
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No transactions found.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div
              className="hidden sm:grid grid-cols-12 gap-4 px-5 py-3 text-xs font-semibold uppercase tracking-widest border-b"
              style={{ color: 'var(--text-muted)', borderColor: 'var(--border-subtle)' }}
            >
              <div className="col-span-1">Type</div>
              <div className="col-span-3">Details</div>
              <div className="col-span-3">Hash</div>
              <div className="col-span-2">Amount</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1">Date</div>
            </div>

            {/* Rows */}
            <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
              {transactions.map((tx, i) => {
                const statusConfig = getTransactionStatusConfig(tx.status)
                const network = getNetworkByChainId(tx.chainId)
                const isSend = tx.type === 'SEND'

                return (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <Link
                      href={`/transactions/${tx.id}`}
                      className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-[var(--bg-muted)] transition-colors"
                    >
                      {/* Icon */}
                      <div className="col-span-1">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isSend ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                          {isSend
                            ? <ArrowUpRight size={15} className="text-red-500" />
                            : <ArrowDownLeft size={15} className="text-green-500" />
                          }
                        </div>
                      </div>

                      {/* Details */}
                      <div className="col-span-11 sm:col-span-3 min-w-0">
                        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {isSend ? 'Sent' : 'Received'}
                        </p>
                        <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                          {tx.networkName}
                        </p>
                      </div>

                      {/* Hash */}
                      <div className="hidden sm:flex col-span-3 items-center gap-1">
                        {tx.txHash ? (
                          <>
                            <span className="font-mono-address text-xs" style={{ color: 'var(--text-secondary)' }}>
                              {formatTxHash(tx.txHash, 6)}
                            </span>
                            {network && (
                              <a
                                href={`${network.blockExplorerUrl}/tx/${tx.txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="p-0.5 hover:text-blue-500 transition-colors"
                                style={{ color: 'var(--text-muted)' }}
                              >
                                <ExternalLink size={11} />
                              </a>
                            )}
                          </>
                        ) : (
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </div>

                      {/* Amount */}
                      <div className="hidden sm:block col-span-2">
                        <span
                          className={`text-sm font-semibold ${isSend ? 'text-red-500' : 'text-green-500'}`}
                        >
                          {isSend ? '-' : '+'}{formatAmount(tx.amount)} {tx.tokenSymbol}
                        </span>
                      </div>

                      {/* Status */}
                      <div className="hidden sm:block col-span-2">
                        <span className={statusConfig.badgeClass}>{statusConfig.label}</span>
                        {['CONFIRMING', 'PENDING'].includes(tx.status) && (
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                            {tx.confirmations}/{tx.requiredConfirmations} confirmations
                          </p>
                        )}
                      </div>

                      {/* Date */}
                      <div className="hidden sm:block col-span-1">
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {formatDate(tx.createdAt, { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-secondary py-1.5 px-3 text-sm"
          >
            <ChevronLeft size={15} />
            Prev
          </button>
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Page {page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!pagination.hasMore}
            className="btn-secondary py-1.5 px-3 text-sm"
          >
            Next
            <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  )
}
