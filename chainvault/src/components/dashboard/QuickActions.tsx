'use client'

import Link from 'next/link'
import { ArrowUpRight, ArrowDownLeft, History, Coins } from 'lucide-react'
import { motion } from 'framer-motion'

interface Props {
  walletConnected: boolean
}

const ACTIONS = [
  { href: '/send', icon: ArrowUpRight, label: 'Send', color: 'text-blue-500', bg: 'bg-blue-500/10', requiresWallet: true },
  { href: '/receive', icon: ArrowDownLeft, label: 'Receive', color: 'text-green-500', bg: 'bg-green-500/10', requiresWallet: true },
  { href: '/transactions', icon: History, label: 'History', color: 'text-purple-500', bg: 'bg-purple-500/10', requiresWallet: false },
  { href: '/assets', icon: Coins, label: 'Assets', color: 'text-amber-500', bg: 'bg-amber-500/10', requiresWallet: false },
]

export function QuickActions({ walletConnected }: Props) {
  return (
    <div className="cv-card p-5">
      <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>Quick Actions</h3>
      <div className="grid grid-cols-4 gap-2">
        {ACTIONS.map((action, i) => {
          const Icon = action.icon
          const disabled = action.requiresWallet && !walletConnected
          return (
            <motion.div key={action.label} whileHover={disabled ? {} : { scale: 1.03 }} whileTap={disabled ? {} : { scale: 0.97 }}>
              <Link
                href={disabled ? '/wallet' : action.href}
                className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all"
                style={{ opacity: disabled ? 0.5 : 1 }}
                title={disabled ? 'Connect your wallet first' : action.label}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${action.bg}`}>
                  <Icon size={18} className={action.color} />
                </div>
                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {action.label}
                </span>
              </Link>
            </motion.div>
          )
        })}
      </div>
      {!walletConnected && (
        <p className="text-xs text-center mt-3" style={{ color: 'var(--text-muted)' }}>
          <Link href="/wallet" className="hover:underline" style={{ color: 'var(--accent-primary)' }}>
            Connect a wallet
          </Link>{' '}
          to send and receive crypto
        </p>
      )}
    </div>
  )
}
