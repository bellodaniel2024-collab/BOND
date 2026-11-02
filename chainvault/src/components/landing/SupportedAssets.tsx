'use client'

import { motion } from 'framer-motion'
import { getEnabledNetworks } from '@/lib/networks'

export function SupportedAssets() {
  const networks = getEnabledNetworks()

  return (
    <section id="assets" className="py-24 px-4">
      <div
        className="max-w-6xl mx-auto rounded-2xl border p-8 sm:p-12"
        style={{ background: 'var(--bg-raised)', borderColor: 'var(--border-subtle)' }}
      >
        <div className="text-center mb-12">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-semibold uppercase tracking-widest mb-3"
            style={{ color: 'var(--accent-primary)' }}
          >
            Supported Networks
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display font-bold text-3xl sm:text-4xl mb-4"
            style={{ color: 'var(--text-primary)' }}
          >
            Currently in Testnet Phase
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="text-base max-w-xl mx-auto"
            style={{ color: 'var(--text-secondary)' }}
          >
            ChainVault is currently operating on test networks. Production mainnet support
            will be enabled after a full independent security review and compliance process.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {networks.map((network, i) => (
            <motion.div
              key={network.chainId}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-xl border p-5 flex items-start gap-4"
              style={{
                background: 'var(--bg-muted)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-bold text-blue-500">
                  {network.nativeCurrency.symbol.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                    {network.name}
                  </h3>
                  {network.isTestnet && (
                    <span className="badge-warning text-xs">Testnet</span>
                  )}
                </div>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Chain ID: {network.chainId}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {network.tokens.map((token) => (
                    <span
                      key={token.symbol}
                      className="text-xs px-2 py-0.5 rounded-full border font-medium"
                      style={{
                        background: 'var(--bg-raised)',
                        borderColor: 'var(--border-subtle)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {token.symbol}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center text-xs mt-8"
          style={{ color: 'var(--text-muted)' }}
        >
          Production networks (Ethereum Mainnet, Polygon) will be enabled after independent security audit and compliance review.
        </motion.p>
      </div>
    </section>
  )
}
