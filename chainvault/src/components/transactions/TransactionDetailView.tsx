'use client'

import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft, ExternalLink, CheckCircle2, XCircle, Loader2,
  ArrowUpRight, ArrowDownLeft, Clock
} from 'lucide-react'
import { formatAmount, formatDate, getTransactionStatusConfig } from '@/lib/utils'

interface Transaction {
  id: string
  type: 'SEND' | 'RECEIVE'
  status: string
  txHash: string | null
  fromAddress: string
  toAddress: string
  amount: string
  amountRaw: string
  tokenSymbol: string
  tokenAddress: string | null
  networkName: string
  chainId: number
  blockNumber: string | null
  blockHash: string | null
  gasFee: string | null
  gasUsed: string | null
  confirmations: number
  requiredConfirmations: number
  errorMessage: string | null
  createdAt: string
  submittedAt: string | null
  confirmedAt: string | null
  failedAt: string | null
}

export function TransactionDetailView({ id }: { id: string }) {
  const router = useRouter()

  const { data, isLoading } = useQuery<{
    data: { transaction: Transaction; explorerTxUrl: string | null }
  }>({
    queryKey: ['transaction', id],
    queryFn: () =>
      fetch(`/api/transactions/${id}`, { credentials: 'include' }).then((r) => r.json()),
    refetchInterval: (q) => {
      const status = q.state.data?.data?.transaction?.status
      return status && ['PENDING', 'CONFIRMING'].includes(status) ? 10_000 : false
    },
  })

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-20 flex justify-center">
        <Loader2 size={28} className="animate-spin text-blue-500" />
      </div>
    )
  }

  const tx = data?.data?.transaction
  const explorerUrl = data?.data?.explorerTxUrl

  if (!tx) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <p style={{ color: 'var(--text-muted)' }}>Transaction not found.</p>
        <button onClick={() => router.back()} className="btn-secondary mt-4 text-sm">
          Go Back
        </button>
      </div>
    )
  }

  const statusConfig = getTransactionStatusConfig(tx.status)
  const isSend = tx.type === 'SEND'

  const rows = [
    { label: 'Transaction ID', value: tx.id, mono: true },
    { label: 'Type', value: isSend ? 'Send' : 'Receive' },
    { label: 'Status', value: null, badge: statusConfig },
    { label: 'Asset', value: `${tx.tokenSymbol} on ${tx.networkName}` },
    { label: 'Amount', value: `${formatAmount(tx.amount)} ${tx.tokenSymbol}` },
    { label: 'From', value: tx.fromAddress, mono: true },
    { label: 'To', value: tx.toAddress, mono: true },
    ...(tx.gasFee ? [{ label: 'Gas Fee', value: `${tx.gasFee} (native)` }] : []),
    ...(tx.gasUsed ? [{ label: 'Gas Used', value: tx.gasUsed }] : []),
    ...(tx.txHash ? [{ label: 'Transaction Hash', value: tx.txHash, mono: true }] : []),
    ...(tx.blockNumber ? [{ label: 'Block Number', value: tx.blockNumber }] : []),
    { label: 'Confirmations', value: `${tx.confirmations} / ${tx.requiredConfirmations}` },
    { label: 'Created', value: formatDate(tx.createdAt) },
    ...(tx.submittedAt ? [{ label: 'Submitted', value: formatDate(tx.submittedAt) }] : []),
    ...(tx.confirmedAt ? [{ label: 'Confirmed', value: formatDate(tx.confirmedAt) }] : []),
    ...(tx.failedAt ? [{ label: 'Failed At', value: formatDate(tx.failedAt) }] : []),
    ...(tx.errorMessage ? [{ label: 'Error', value: tx.errorMessage }] : []),
  ]

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm mb-6 btn-ghost pl-0"
        style={{ color: 'var(--text-muted)' }}
      >
        <ArrowLeft size={15} />
        Back to Transactions
      </button>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="cv-card overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isSend ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
              {isSend
                ? <ArrowUpRight size={20} className="text-red-500" />
                : <ArrowDownLeft size={20} className="text-green-500" />
              }
            </div>
            <div>
              <h1 className="font-display font-bold text-xl" style={{ color: 'var(--text-primary)' }}>
                {isSend ? 'Sent' : 'Received'} {formatAmount(tx.amount)} {tx.tokenSymbol}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={statusConfig.badgeClass}>{statusConfig.label}</span>
                {['PENDING', 'CONFIRMING'].includes(tx.status) && (
                  <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <Loader2 size={11} className="animate-spin" />
                    Updating live…
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Status description */}
          <p className="text-sm mt-3" style={{ color: 'var(--text-secondary)' }}>
            {statusConfig.description}
          </p>

          {/* Confirmation progress */}
          {['PENDING', 'CONFIRMING'].includes(tx.status) && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
                <span>Confirmations</span>
                <span>{tx.confirmations} / {tx.requiredConfirmations}</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-subtle)' }}>
                <motion.div
                  className="h-full rounded-full bg-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (tx.confirmations / tx.requiredConfirmations) * 100)}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Details table */}
        <div className="p-6">
          <div className="space-y-3">
            {rows.map(({ label, value, mono, badge }) => (
              <div key={label} className="flex items-start gap-4 py-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <span className="text-sm flex-shrink-0 w-32" style={{ color: 'var(--text-muted)' }}>{label}</span>
                {badge ? (
                  <span className={badge.badgeClass}>{badge.label}</span>
                ) : (
                  <span
                    className={`text-sm font-medium flex-1 break-all ${mono ? 'font-mono-address text-xs' : ''}`}
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {value}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Explorer link */}
        {explorerUrl && (
          <div className="px-6 pb-6">
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary w-full justify-center text-sm py-2.5"
            >
              <ExternalLink size={15} />
              View on Block Explorer
            </a>
          </div>
        )}
      </motion.div>
    </div>
  )
}
