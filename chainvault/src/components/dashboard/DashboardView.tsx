'use client'

import { motion } from 'framer-motion'
import { useAuth } from '@/components/providers/AuthProvider'
import { useAccount, useChainId, useBalance } from 'wagmi'
import { WalletBalanceCard } from './WalletBalanceCard'
import { QuickActions } from './QuickActions'
import { RecentTransactions } from './RecentTransactions'
import { NetworkStatusCard } from './NetworkStatusCard'
import { WalletPrompt } from './WalletPrompt'
import { getNetworkByChainId } from '@/lib/networks'
import { formatAddress } from '@/lib/utils'
import { ShieldCheck, AlertTriangle } from 'lucide-react'

const CONTAINER_VARIANTS = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
}

export function DashboardView() {
  const { user } = useAuth()
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const network = chainId ? getNetworkByChainId(chainId) : null

  const displayName = user?.displayName ?? user?.email?.split('@')[0] ?? 'there'

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between flex-wrap gap-4"
      >
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl" style={{ color: 'var(--text-primary)' }}>
            Good day, {displayName}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Testnet banner */}
        {network?.isTestnet && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold"
            style={{
              background: 'rgba(245, 158, 11, 0.08)',
              borderColor: 'rgba(245, 158, 11, 0.25)',
              color: '#d97706',
            }}
          >
            <AlertTriangle size={12} />
            Testnet — No real funds
          </div>
        )}
      </motion.div>

      {/* Main grid */}
      <motion.div
        variants={CONTAINER_VARIANTS}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Balance + wallet */}
        <motion.div variants={ITEM_VARIANTS} className="lg:col-span-2 space-y-4">
          {isConnected && address ? (
            <WalletBalanceCard address={address} chainId={chainId} />
          ) : (
            <WalletPrompt />
          )}
          <QuickActions walletConnected={isConnected} />
        </motion.div>

        {/* Sidebar cards */}
        <motion.div variants={ITEM_VARIANTS} className="space-y-4">
          <NetworkStatusCard />
          {/* Security status */}
          <div className="cv-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck size={16} className="text-blue-500" />
              <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                Account Security
              </h3>
            </div>
            <div className="space-y-2">
              <SecurityRow label="Email Verified" ok={user?.twoFactorEnabled !== undefined} />
              <SecurityRow label="Two-Factor Auth" ok={user?.twoFactorEnabled ?? false} />
              <SecurityRow label="Wallet Verified" ok={(user?.wallets?.length ?? 0) > 0 && (user?.wallets?.[0]?.siweVerified ?? false)} />
            </div>
            {!user?.twoFactorEnabled && (
              <a
                href="/security"
                className="block mt-4 text-xs text-center btn-secondary py-2"
              >
                Enable Two-Factor Auth
              </a>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Recent transactions */}
      <motion.div
        variants={ITEM_VARIANTS}
        initial="hidden"
        animate="show"
      >
        <RecentTransactions />
      </motion.div>
    </div>
  )
}

function SecurityRow({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <span className={ok ? 'badge-success' : 'badge-warning'}>
        {ok ? 'Enabled' : 'Not set'}
      </span>
    </div>
  )
}
