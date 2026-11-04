'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const FAQS = [
  {
    q: 'Does BOND hold my cryptocurrency?',
    a: 'No. BOND is non-custodial. Your cryptocurrency stays in your own wallet at all times. We facilitate the transaction interface, but funds move directly between wallets on the blockchain — we never hold them.',
  },
  {
    q: 'Does BOND have access to my private key or seed phrase?',
    a: 'Never. BOND does not request, transmit, or store private keys or seed phrases. All transaction signing happens inside your external wallet (MetaMask, WalletConnect, etc.).',
  },
  {
    q: 'What wallets are supported?',
    a: 'BOND supports any EVM-compatible wallet, including MetaMask, WalletConnect-compatible wallets, and browser-injected wallets like Brave Wallet and Rabby.',
  },
  {
    q: 'Is this safe to use on mainnet right now?',
    a: 'BOND is currently in development and operates on testnets. Mainnet support is disabled until an independent professional security audit and compliance review are completed. Do not use this platform for real funds until production launch is announced.',
  },
  {
    q: 'How does BOND confirm a transaction?',
    a: 'Transaction status is verified directly from the blockchain using RPC providers. We do not declare a transaction confirmed until the blockchain receipt is verified and the required number of block confirmations have passed.',
  },
  {
    q: 'What happens if a transaction fails?',
    a: 'If a transaction fails or is reverted on-chain, BOND updates its status to Failed and provides the reason from the blockchain receipt. Since transactions are signed by your wallet and sent to the blockchain, gas fees for failed transactions may still be consumed by the network — this is a blockchain behaviour, not a BOND decision.',
  },
  {
    q: 'How is my account protected?',
    a: 'Passwords are hashed using bcrypt with a high cost factor. Sessions are managed with encrypted HttpOnly cookies. Optional two-factor authentication via an authenticator app is available. Login attempts are rate-limited to prevent brute-force attacks.',
  },
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="py-24 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-semibold uppercase tracking-widest mb-3"
            style={{ color: 'var(--accent-primary)' }}
          >
            Questions
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display font-bold text-3xl sm:text-4xl"
            style={{ color: 'var(--text-primary)' }}
          >
            Frequently Asked Questions
          </motion.h2>
        </div>

        <div className="space-y-2">
          {FAQS.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="cv-card overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 p-5 text-left"
              >
                <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                  {faq.q}
                </span>
                <ChevronDown
                  size={16}
                  className="flex-shrink-0 transition-transform"
                  style={{
                    color: 'var(--text-muted)',
                    transform: openIndex === i ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                />
              </button>
              <AnimatePresence initial={false}>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="overflow-hidden"
                  >
                    <p
                      className="px-5 pb-5 text-sm leading-relaxed border-t pt-4"
                      style={{
                        color: 'var(--text-secondary)',
                        borderColor: 'var(--border-subtle)',
                      }}
                    >
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
