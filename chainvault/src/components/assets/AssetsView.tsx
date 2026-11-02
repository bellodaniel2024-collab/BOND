'use client'

import { motion } from 'framer-motion'
import { getEnabledNetworks } from '@/lib/networks'
import { ExternalLink } from 'lucide-react'

export function AssetsView() {
  const networks = getEnabledNetworks()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl" style={{ color: 'var(--text-primary)' }}>
          Supported Assets
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Token contract addresses sourced from official project documentation.
        </p>
      </div>

      {networks.map((network, ni) => (
        <motion.div
          key={network.chainId}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: ni * 0.08 }}
          className="cv-card overflow-hidden"
        >
          {/* Network header */}
          <div
            className="flex items-center justify-between px-5 py-4 border-b"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                <span className="text-sm font-bold text-blue-500">
                  {network.nativeCurrency.symbol.charAt(0)}
                </span>
              </div>
              <div>
                <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                  {network.name}
                </h2>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Chain ID: {network.chainId}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {network.isTestnet && <span className="badge-warning">Testnet</span>}
              <a
                href={network.blockExplorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 rounded hover:bg-[var(--bg-muted)] transition-colors"
                aria-label={`Open ${network.blockExplorerName}`}
              >
                <ExternalLink size={13} style={{ color: 'var(--text-muted)' }} />
              </a>
            </div>
          </div>

          {/* Token list */}
          <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
            {network.tokens.map((token) => (
              <div key={token.symbol} className="flex items-center gap-4 px-5 py-3.5">
                <div className="w-9 h-9 rounded-full bg-[var(--bg-muted)] flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
                    {token.symbol.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                      {token.symbol}
                    </span>
                    {token.contractAddress === null && (
                      <span className="badge-info">Native</span>
                    )}
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{token.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Decimals: {token.decimals}</p>
                  {token.contractAddress && (
                    <a
                      href={`${network.blockExplorerUrl}/address/${token.contractAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono-address text-xs hover:underline flex items-center gap-1 mt-0.5 justify-end"
                      style={{ color: 'var(--accent-primary)' }}
                    >
                      {token.contractAddress.slice(0, 8)}…{token.contractAddress.slice(-6)}
                      <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      ))}

      <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
        Production assets (Ethereum Mainnet, Polygon Mainnet) are disabled until
        security audit and compliance review are complete.
      </p>
    </div>
  )
}
