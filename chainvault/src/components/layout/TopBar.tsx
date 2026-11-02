'use client'

import { Menu, Sun, Moon, Bell, Copy, ExternalLink, ChevronDown, Wifi, WifiOff } from 'lucide-react'
import { useTheme } from '@/components/providers/ThemeProvider'
import { useAccount, useDisconnect, useChainId } from 'wagmi'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import { formatAddress } from '@/lib/utils'
import { getNetworkByChainId } from '@/lib/networks'
import clsx from 'clsx'

interface TopBarProps {
  onMenuClick?: () => void
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const { theme, toggleTheme } = useTheme()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const [walletMenuOpen, setWalletMenuOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const network = chainId ? getNetworkByChainId(chainId) : null

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setWalletMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function copyAddress() {
    if (!address) return
    navigator.clipboard.writeText(address).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <header
      className="flex items-center justify-between h-14 px-4 sm:px-6 border-b flex-shrink-0 z-30"
      style={{
        background: 'var(--bg-raised)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      {/* Left side */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg btn-ghost"
          aria-label="Open navigation"
        >
          <Menu size={18} />
        </button>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Network indicator */}
        {isConnected && (
          <div
            className={clsx(
              'hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border',
              network
                ? 'text-green-600 dark:text-green-400 border-green-200 dark:border-green-500/20 bg-green-50 dark:bg-green-500/10'
                : 'text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-500/20 bg-orange-50 dark:bg-orange-500/10',
            )}
          >
            {network ? <Wifi size={12} /> : <WifiOff size={12} />}
            {network?.shortName ?? 'Unsupported'}
          </div>
        )}

        {/* Wallet */}
        {isConnected && address ? (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setWalletMenuOpen((v) => !v)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-medium transition-all duration-150"
              style={{
                background: 'var(--bg-muted)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
            >
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex-shrink-0" />
              <span className="font-mono-address hidden sm:inline">
                {formatAddress(address)}
              </span>
              <ChevronDown size={13} className={clsx('transition-transform', walletMenuOpen && 'rotate-180')} />
            </button>

            <AnimatePresence>
              {walletMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-72 rounded-2xl shadow-xl border z-50 overflow-hidden"
                  style={{
                    background: 'var(--bg-overlay)',
                    borderColor: 'var(--border-subtle)',
                    boxShadow: 'var(--shadow-elevated)',
                  }}
                >
                  <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                      Connected Wallet
                    </p>
                    <p className="font-mono-address font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {formatAddress(address, 8, 6)}
                    </p>
                    {network && (
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {network.name}
                      </p>
                    )}
                  </div>
                  <div className="p-2">
                    <button
                      onClick={copyAddress}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-[var(--bg-muted)]"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <Copy size={14} />
                      {copied ? 'Copied!' : 'Copy address'}
                    </button>
                    {network?.blockExplorerUrl && (
                      <a
                        href={`${network.blockExplorerUrl}/address/${address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-[var(--bg-muted)]"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        <ExternalLink size={14} />
                        View on Explorer
                      </a>
                    )}
                    <div className="my-1 border-t" style={{ borderColor: 'var(--border-subtle)' }} />
                    <button
                      onClick={() => { disconnect(); setWalletMenuOpen(false) }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-red-500 hover:bg-red-500/10"
                    >
                      Disconnect wallet
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <a href="/wallet" className="btn-primary text-xs py-1.5 px-3">
            Connect Wallet
          </a>
        )}

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg btn-ghost"
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={theme}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </motion.div>
          </AnimatePresence>
        </button>
      </div>
    </header>
  )
}
