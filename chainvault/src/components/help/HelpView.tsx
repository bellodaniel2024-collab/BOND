'use client'

import { motion } from 'framer-motion'
import { HelpCircle, ExternalLink, Mail, BookOpen, Shield } from 'lucide-react'
import { FAQ } from '@/components/landing/FAQ'

const QUICK_LINKS = [
  {
    icon: Shield,
    title: 'Security Guide',
    description: 'Learn how to keep your account and wallet secure.',
    href: '/security',
  },
  {
    icon: BookOpen,
    title: 'Testnet Guide',
    description: 'How to get testnet ETH and MATIC for testing.',
    href: 'https://sepoliafaucet.com',
    external: true,
  },
  {
    icon: ExternalLink,
    title: 'Sepolia Explorer',
    description: 'View testnet transactions on Etherscan.',
    href: 'https://sepolia.etherscan.io',
    external: true,
  },
]

export function HelpView() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl" style={{ color: 'var(--text-primary)' }}>
          Help & Support
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Find answers to common questions and resources.
        </p>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {QUICK_LINKS.map((link, i) => {
          const Icon = link.icon
          return (
            <motion.a
              key={link.title}
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noopener noreferrer' : undefined}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="cv-card p-5 flex flex-col gap-3 group"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Icon size={18} className="text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-0.5" style={{ color: 'var(--text-primary)' }}>
                  {link.title}
                  {link.external && <ExternalLink size={10} className="inline ml-1 opacity-50" />}
                </h3>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {link.description}
                </p>
              </div>
            </motion.a>
          )
        })}
      </div>

      {/* FAQ */}
      <div>
        <h2 className="font-display font-bold text-xl mb-4" style={{ color: 'var(--text-primary)' }}>
          Frequently Asked Questions
        </h2>
        <FAQ />
      </div>

      {/* Contact */}
      <div className="cv-card p-6 text-center">
        <Mail size={24} className="text-blue-500 mx-auto mb-3" />
        <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          Need More Help?
        </h3>
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
          BOND is in active development. For questions or issues, check back
          when the full support system is launched.
        </p>
        <span className="badge-info text-xs">Support system coming soon</span>
      </div>
    </div>
  )
}
