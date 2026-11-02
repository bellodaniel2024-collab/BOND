'use client'

import { useChainId, useSwitchChain } from 'wagmi'
import { getEnabledNetworks, getNetworkByChainId } from '@/lib/networks'
import { Wifi, WifiOff, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export function NetworkStatusCard() {
  const chainId = useChainId()
  const { switchChain, isPending } = useSwitchChain()
  const [open, setOpen] = useState(false)

  const currentNetwork = chainId ? getNetworkByChainId(chainId) : null
  const enabledNetworks = getEnabledNetworks()

  return (
    <div className="cv-card p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
          Network
        </h3>
        {currentNetwork ? (
          <Wifi size={14} className="text-green-500" />
        ) : (
          <WifiOff size={14} className="text-orange-500" />
        )}
      </div>

      {currentNetwork ? (
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
              {currentNetwork.name}
            </span>
          </div>
          <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
            Chain ID: {currentNetwork.chainId}
            {currentNetwork.isTestnet && ' · Testnet'}
          </p>
        </div>
      ) : chainId ? (
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-orange-500" />
            <span className="font-semibold text-sm text-orange-500">
              Unsupported Network
            </span>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Please switch to a supported network below.
          </p>
        </div>
      ) : (
        <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>No wallet connected</p>
      )}

      {/* Switch network */}
      <div className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full btn-secondary text-xs py-2 justify-between"
          disabled={isPending}
        >
          Switch Network
          <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.97 }}
              className="absolute bottom-full left-0 right-0 mb-2 rounded-xl border z-50 overflow-hidden"
              style={{
                background: 'var(--bg-overlay)',
                borderColor: 'var(--border-subtle)',
                boxShadow: 'var(--shadow-elevated)',
              }}
            >
              {enabledNetworks.map((network) => (
                <button
                  key={network.chainId}
                  onClick={() => { switchChain({ chainId: network.chainId }); setOpen(false) }}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-xs hover:bg-[var(--bg-muted)] transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <span>{network.name}</span>
                  <div className="flex items-center gap-1.5">
                    {network.isTestnet && <span className="badge-warning">Testnet</span>}
                    {network.chainId === chainId && <div className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
