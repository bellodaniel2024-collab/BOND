'use client'

import { motion } from 'framer-motion'
import { Wallet, FileCheck, PenLine, CheckCircle2 } from 'lucide-react'

const STEPS = [
  {
    number: '01',
    icon: Wallet,
    title: 'Connect Your Wallet',
    description:
      'Connect your existing MetaMask, WalletConnect, or compatible wallet. ChainVault works with wallets you already own.',
  },
  {
    number: '02',
    icon: FileCheck,
    title: 'Review Transaction Details',
    description:
      'Before anything is sent, you see the recipient address, amount, network, and estimated fee. Nothing is hidden.',
  },
  {
    number: '03',
    icon: PenLine,
    title: 'Authorize in Your Wallet',
    description:
      'Your wallet — not ChainVault — prompts you to sign the transaction. Your private key never leaves your device.',
  },
  {
    number: '04',
    icon: CheckCircle2,
    title: 'Confirm On-Chain',
    description:
      'The transaction is broadcast directly to the blockchain. ChainVault monitors and reports the confirmed status.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-semibold uppercase tracking-widest mb-3"
            style={{ color: 'var(--accent-primary)' }}
          >
            How It Works
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl mb-4"
            style={{ color: 'var(--text-primary)' }}
          >
            Simple. Transparent. Secure.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="text-lg max-w-xl mx-auto"
            style={{ color: 'var(--text-secondary)' }}
          >
            Every step is designed so you remain in control. ChainVault facilitates — you authorize.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step, i) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="cv-card p-6 relative group"
              >
                {/* Step number */}
                <div
                  className="text-5xl font-display font-bold mb-4 select-none"
                  style={{ color: 'var(--border-default)', lineHeight: 1 }}
                >
                  {step.number}
                </div>

                {/* Icon */}
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                  <Icon size={20} className="text-blue-500" />
                </div>

                {/* Content */}
                <h3 className="font-display font-semibold text-base mb-2" style={{ color: 'var(--text-primary)' }}>
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {step.description}
                </p>

                {/* Connector */}
                {i < STEPS.length - 1 && (
                  <div
                    className="hidden lg:block absolute top-10 -right-3 w-6 h-0.5 z-10"
                    style={{ background: 'var(--border-subtle)' }}
                  />
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
