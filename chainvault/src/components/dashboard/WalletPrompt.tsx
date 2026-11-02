'use client'

import Link from 'next/link'
import { Wallet, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

export function WalletPrompt() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="cv-card p-8 text-center"
    >
      <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
        <Wallet size={24} className="text-blue-500" />
      </div>
      <h3 className="font-display font-semibold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>
        No Wallet Connected
      </h3>
      <p className="text-sm mb-6 max-w-xs mx-auto" style={{ color: 'var(--text-secondary)' }}>
        Connect your existing wallet to view balances, send, and receive cryptocurrency.
      </p>
      <Link href="/wallet" className="btn-primary inline-flex gap-2">
        Connect Wallet
        <ArrowRight size={15} />
      </Link>
    </motion.div>
  )
}
