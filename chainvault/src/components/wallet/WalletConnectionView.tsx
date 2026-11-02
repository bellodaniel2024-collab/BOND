'use client'

import { useConnect, useAccount, useDisconnect, useChainId } from 'wagmi'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import {
  Wallet, CheckCircle2, Copy, ExternalLink, Loader2,
  ShieldCheck, AlertTriangle, LogOut
} from 'lucide-react'
import { formatAddress } from '@/lib/utils'
import { getNetworkByChainId, getEnabledNetworks } from '@/lib/networks'

export function WalletConnectionView() {
  const { connectors, connect, isPending, error } = useConnect()
  const { address, isConnected, connector } = useAccount()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const [copied, setCopied] = useState(false)

  const network = chainId ? getNetworkByChainId(chainId) : null
  const enabledNetworks = getEnabledNetworks()

  function copyAddress() {
    if (!address) return
    navigator.clipboard.writeText(address).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl sm:text-3xl" style={{ color: 'var(--text-primary)' }}>
          Wallet Connection
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Connect your external wallet. ChainVault never requests private keys or seed phrases.
        </p>
      </div>

      <div className="space-y-4">
        {/* Security notice */}
        <div
          className="flex items-start gap-3 p-4 rounded-xl border"
          style={{
            background: 'rgba(59, 130, 246, 0.05)',
            borderColor: 'rgba(59, 130, 246, 0.15)',
          }}
        >
          <ShieldCheck size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            ChainVault will never ask for your private key or seed phrase.
            Only your public wallet address is used by this platform.
          </p>
        </div>

        {/* Connected state */}
        <AnimatePresence mode="wait">
          {isConnected && address ? (
            <motion.div
              key="connected"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="cv-card p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Wallet Connected
                </span>
                {connector && (
                  <span className="badge-info text-xs capitalize">{connector.name}</span>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>
                    Address
                  </p>
                  <div
                    className="flex items-center gap-2 p-3 rounded-xl border"
                    style={{ background: 'var(--bg-muted)', borderColor: 'var(--border-subtle)' }}
                  >
                    <span className="font-mono-address text-sm flex-1 break-all" style={{ color: 'var(--text-primary)' }}>
                      {address}
                    </span>
                    <button
                      onClick={copyAddress}
                      className="p-1 rounded hover:bg-[var(--border-subtle)] transition-colors flex-shrink-0"
                      aria-label="Copy address"
                    >
                      <Copy size={13} style={{ color: 'var(--text-muted)' }} />
                    </button>
                    {network && (
                      <a
                        href={`${network.blockExplorerUrl}/address/${address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 rounded hover:bg-[var(--border-subtle)] transition-colors flex-shrink-0"
                        aria-label="View on explorer"
                      >
                        <ExternalLink size={13} style={{ color: 'var(--text-muted)' }} />
                      </a>
                    )}
                    {copied && <span className="text-xs text-green-500 flex-shrink-0">Copied!</span>}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>
                    Network
                  </p>
                  {network ? (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {network.name}
                      </span>
                      {network.isTestnet && <span className="badge-warning">Testnet</span>}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={14} className="text-orange-500" />
                      <span className="text-sm text-orange-500">
                        Unsupported network (Chain ID: {chainId})
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-5 border-t flex gap-3" style={{ borderColor: 'var(--border-subtle)' }}>
                <a href="/dashboard" className="btn-primary flex-1 text-sm py-2.5 justify-center">
                  Go to Dashboard
                </a>
                <button
                  onClick={() => disconnect()}
                  className="btn-secondary flex-shrink-0 text-sm py-2.5 text-red-500 border-red-500/20"
                >
                  <LogOut size={14} />
                  Disconnect
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="disconnected"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="cv-card p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Wallet size={20} className="text-blue-500" />
                </div>
                <div>
                  <h2 className="font-display font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
                    Connect Your Wallet
                  </h2>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Choose your wallet provider below
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {connectors.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => connect({ connector: c })}
                    disabled={isPending}
                    className="w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all"
                    style={{
                      background: 'var(--bg-muted)',
                      borderColor: 'var(--border-subtle)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                      <Wallet size={16} className="text-blue-500" />
                    </div>
                    <span className="text-sm font-semibold flex-1 text-left">{c.name}</span>
                    {isPending && <Loader2 size={14} className="animate-spin" style={{ color: 'var(--text-muted)' }} />}
                  </button>
                ))}
              </div>

              {!process.env['NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID'] && (
                <p className="text-xs mt-3 p-3 rounded-lg border" style={{
                  color: 'var(--text-muted)',
                  borderColor: 'var(--border-subtle)',
                  background: 'var(--bg-muted)',
                }}>
                  WalletConnect is not configured. Set{' '}
                  <code className="font-mono">NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID</code> in your
                  environment to enable it.
                </p>
              )}

              {error && (
                <div className="mt-3 flex items-start gap-2 p-3 rounded-xl border text-sm"
                  style={{ background: 'rgba(239,68,68,0.07)', borderColor: 'rgba(239,68,68,0.2)', color: '#ef4444' }}>
                  <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                  {error.message}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Supported networks info */}
        <div className="cv-card p-5">
          <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>
            Supported Networks
          </h3>
          <div className="space-y-2">
            {enabledNetworks.map((n) => (
              <div key={n.chainId} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span style={{ color: 'var(--text-secondary)' }}>{n.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                    Chain {n.chainId}
                  </span>
                  {n.isTestnet && <span className="badge-warning">Testnet</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
