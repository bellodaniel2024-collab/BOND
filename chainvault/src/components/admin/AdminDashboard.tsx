'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Users, Activity, AlertTriangle, CheckCircle2, Clock, XCircle, ShieldOff } from 'lucide-react'

export function AdminDashboard() {
  const { data } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () =>
      fetch('/api/admin/stats', { credentials: 'include' }).then((r) => r.json()),
    refetchInterval: 30_000,
  })

  const stats = data?.data ?? {}

  const STAT_CARDS = [
    { label: 'Total Users', value: stats.totalUsers ?? '—', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Total Transactions', value: stats.totalTransactions ?? '—', icon: Activity, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Pending Transactions', value: stats.pendingTransactions ?? '—', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Confirmed Transactions', value: stats.confirmedTransactions ?? '—', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Failed Transactions', value: stats.failedTransactions ?? '—', icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
    { label: 'Security Events', value: stats.unresolvedSecurityEvents ?? '—', icon: ShieldOff, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>
          Admin Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Platform overview — read-only monitoring. Administrators cannot access user funds.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {STAT_CARDS.map((card, i) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="cv-card p-5"
            >
              <div className={`w-9 h-9 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
                <Icon size={18} className={card.color} />
              </div>
              <div className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                {card.value}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{card.label}</div>
            </motion.div>
          )
        })}
      </div>

      {/* Critical notice */}
      <div className="flex items-start gap-3 p-5 rounded-xl border"
        style={{ background: 'rgba(239,68,68,0.05)', borderColor: 'rgba(239,68,68,0.15)' }}>
        <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-sm text-red-500 mb-1">
            Administrator Access Limitations
          </p>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            This dashboard is for monitoring only. Administrators cannot access user private keys,
            withdraw user funds, or perform transactions on behalf of users. Any admin action that
            could affect user funds is prohibited by design.
          </p>
        </div>
      </div>
    </div>
  )
}
