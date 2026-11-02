'use client'

import { motion } from 'framer-motion'
import {
  Lock,
  ShieldCheck,
  Eye,
  KeyRound,
  Server,
  Database,
  Layers,
  AlertTriangle,
} from 'lucide-react'

const SECURITY_PILLARS = [
  {
    icon: KeyRound,
    title: 'Private Key Protection',
    description:
      'ChainVault never requests, stores, or transmits private keys or seed phrases. All signing happens exclusively inside your external wallet.',
  },
  {
    icon: Eye,
    title: 'Transaction Transparency',
    description:
      'Every transaction detail — recipient, amount, fee, network — is displayed for your review before your wallet is ever asked to sign.',
  },
  {
    icon: Lock,
    title: 'Exact-Amount Approvals',
    description:
      'Token approvals use the exact amount requested, never unlimited approvals. You authorize only what you intend to send.',
  },
  {
    icon: ShieldCheck,
    title: 'On-Chain Verification',
    description:
      'Transaction status is verified directly on the blockchain. We never declare a transaction confirmed based on the client response alone.',
  },
  {
    icon: Server,
    title: 'Secure Authentication',
    description:
      'Passwords hashed with bcrypt. Sessions managed with encrypted HttpOnly cookies. Optional authenticator-based two-factor authentication.',
  },
  {
    icon: Database,
    title: 'Defence-in-Depth',
    description:
      'Rate limiting, CSRF protection, Content Security Policy, input validation, SQL injection prevention, and audit logging applied throughout.',
  },
]

export function SecuritySection() {
  return (
    <section id="security" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-semibold uppercase tracking-widest mb-3"
            style={{ color: 'var(--accent-primary)' }}
          >
            Security Architecture
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl mb-4"
            style={{ color: 'var(--text-primary)' }}
          >
            Security is Not a Feature.
            <br className="hidden sm:block" />
            <span className="gradient-text">It&apos;s the Foundation.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="text-lg max-w-xl mx-auto"
            style={{ color: 'var(--text-secondary)' }}
          >
            Every layer of the platform is designed with security as the primary constraint.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SECURITY_PILLARS.map((pillar, i) => {
            const Icon = pillar.icon
            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="cv-card p-6"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                  <Icon size={20} className="text-blue-500" />
                </div>
                <h3 className="font-display font-semibold text-base mb-2" style={{ color: 'var(--text-primary)' }}>
                  {pillar.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {pillar.description}
                </p>
              </motion.div>
            )
          })}
        </div>

        {/* Honest disclaimer */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-10 flex gap-3 p-5 rounded-xl border"
          style={{
            background: 'rgba(245, 158, 11, 0.06)',
            borderColor: 'rgba(245, 158, 11, 0.2)',
          }}
        >
          <AlertTriangle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-1">
              Independent security review required before production use
            </p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              ChainVault is in active development. While security principles are applied throughout,
              no platform should handle real customer funds without a qualified independent security
              audit and appropriate legal and compliance review. Do not use this platform on mainnet
              until that process is complete.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
