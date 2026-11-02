'use client'

import { useAccount, useChainId } from 'wagmi'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, CheckCircle2, ArrowDownLeft, AlertTriangle } from 'lucide-react'
import QRCode from 'react-qr-code'
import { getNetworkByChainId } from '@/lib/networks'

export function ReceiveView() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const network = getNetworkByChainId(chainId)
  const [copied, setCopied] = useState(false)

  function copyAddress() {
    if (!address) return
    navigator.clipboard.writeText(address).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    })
  }

  if (!isConnected || !address) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-4">
          <ArrowDownLeft size={24} className="text-green-500" />
        </div>
        <h2 className="font-display font-bold text-xl mb-2" style={{ color: 'var(--text-primary)' }}>
          Connect Your Wallet
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          Connect your wallet to display your deposit address.
        </p>
        <a href="/wallet" className="btn-primary inline-flex">Connect Wallet</a>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl sm:text-3xl" style={{ color: 'var(--text-primary)' }}>
          Receive Cryptocurrency
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Share your address to receive crypto directly to your wallet.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="cv-card p-6 sm:p-8 space-y-6"
      >
        {/* QR Code */}
        <div className="flex justify-center">
          <div className="p-4 rounded-2xl bg-white shadow-sm border" style={{ borderColor: 'var(--border-subtle)' }}>
            <QRCode
              value={address}
              size={180}
              level="H"
              bgColor="#ffffff"
              fgColor="#0f172a"
            />
          </div>
        </div>

        {/* Network indicator */}
        {network && (
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
              {network.name}
            </span>
            {network.isTestnet && (
              <span className="badge-warning text-xs">Testnet</span>
            )}
          </div>
        )}

        {/* Address display */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2 text-center" style={{ color: 'var(--text-muted)' }}>
            Your Wallet Address
          </p>
          <div
            className="relative rounded-xl p-4 border text-center"
            style={{ background: 'var(--bg-muted)', borderColor: 'var(--border-subtle)' }}
          >
            <p className="font-mono-address text-sm break-all" style={{ color: 'var(--text-primary)' }}>
              {address}
            </p>
          </div>
        </div>

        {/* Copy button */}
        <motion.button
          onClick={copyAddress}
          className="btn-primary w-full py-3"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          {copied ? (
            <>
              <CheckCircle2 size={16} className="text-green-300" />
              Address Copied!
            </>
          ) : (
            <>
              <Copy size={15} />
              Copy Address
            </>
          )}
        </motion.button>

        {/* Supported assets on this network */}
        {network && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
              Supported on {network.name}
            </p>
            <div className="flex flex-wrap gap-2">
              {network.tokens.map((token) => (
                <span
                  key={token.symbol}
                  className="px-3 py-1 rounded-full border text-xs font-semibold"
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
        )}

        {/* Important notice */}
        <div
          className="flex items-start gap-3 p-4 rounded-xl border text-sm"
          style={{
            background: 'rgba(245, 158, 11, 0.06)',
            borderColor: 'rgba(245, 158, 11, 0.2)',
          }}
        >
          <AlertTriangle size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div style={{ color: 'var(--text-secondary)' }}>
            <p className="font-semibold text-amber-600 dark:text-amber-400 mb-1">
              Important
            </p>
            <ul className="text-xs space-y-1">
              <li>• Only send cryptocurrency supported on this network to this address.</li>
              <li>• Sending unsupported assets may result in permanent loss.</li>
              <li>• This is a testnet address — do not send real funds.</li>
              <li>• Cryptocurrency goes directly to your connected wallet, not to ChainVault.</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
