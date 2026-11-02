'use client'

import { useState } from 'react'
import { useAccount, useChainId, useSendTransaction, useWriteContract } from 'wagmi'
import { parseEther, parseUnits, isAddress, getAddress } from 'viem'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUpRight, AlertTriangle, CheckCircle2, Loader2, AlertCircle, Shield } from 'lucide-react'
import { getNetworkByChainId, getTokenConfig } from '@/lib/networks'
import { formatAmount } from '@/lib/utils'

type Step = 'form' | 'review' | 'authorizing' | 'submitted' | 'error'

interface ReviewData {
  transactionId: string
  currency: string
  amount: string
  recipient: string
  network: string
  estimatedFee: string
  total: string
  warning?: string
}

// Minimal ERC-20 transfer ABI
const ERC20_TRANSFER_ABI = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const

export function SendView() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const network = getNetworkByChainId(chainId)

  const { sendTransaction } = useSendTransaction()
  const { writeContract } = useWriteContract()

  const [step, setStep] = useState<Step>('form')
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [tokenSymbol, setTokenSymbol] = useState(network?.tokens[0]?.symbol ?? 'ETH')
  const [isPreparing, setIsPreparing] = useState(false)
  const [reviewData, setReviewData] = useState<ReviewData | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isConnected || !address) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
          <ArrowUpRight size={24} className="text-blue-500" />
        </div>
        <h2 className="font-display font-bold text-xl mb-2" style={{ color: 'var(--text-primary)' }}>
          Wallet Required
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          Connect your wallet to send cryptocurrency.
        </p>
        <a href="/wallet" className="btn-primary inline-flex">Connect Wallet</a>
      </div>
    )
  }

  if (!network) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <AlertTriangle size={32} className="text-orange-500 mx-auto mb-4" />
        <h2 className="font-display font-bold text-xl mb-2" style={{ color: 'var(--text-primary)' }}>
          Unsupported Network
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Please switch to a supported testnet network in your wallet.
        </p>
      </div>
    )
  }

  // ── Step 1: Form ────────────────────────────────────────────────────────
  async function handlePrepare(e: React.FormEvent) {
    e.preventDefault()
    setErrorMessage(null)

    if (!isAddress(recipient)) {
      setErrorMessage('Invalid recipient address.')
      return
    }
    if (parseFloat(amount) <= 0 || isNaN(parseFloat(amount))) {
      setErrorMessage('Invalid amount.')
      return
    }

    setIsPreparing(true)
    try {
      const res = await fetch('/api/transactions/prepare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          fromAddress: address,
          toAddress: getAddress(recipient),
          amount,
          tokenSymbol,
          chainId,
        }),
      })
      const data = await res.json()
      if (!data.success) {
        setErrorMessage(data.error ?? 'Failed to prepare transaction.')
        return
      }
      setReviewData(data.data.review)
      setStep('review')
    } catch {
      setErrorMessage('Network error. Please try again.')
    } finally {
      setIsPreparing(false)
    }
  }

  // ── Step 2: Authorize ───────────────────────────────────────────────────
  async function handleAuthorize() {
    if (!reviewData) return
    setStep('authorizing')
    setErrorMessage(null)

    const tokenConfig = getTokenConfig(chainId, tokenSymbol)
    if (!tokenConfig) {
      setErrorMessage('Token configuration not found.')
      setStep('error')
      return
    }

    try {
      const amountRaw = tokenConfig.decimals === 18
        ? parseEther(amount)
        : parseUnits(amount, tokenConfig.decimals)

      let hash: string | undefined

      if (tokenConfig.contractAddress === null) {
        // Native ETH/MATIC transfer
        hash = await new Promise<string>((resolve, reject) => {
          sendTransaction(
            {
              to: getAddress(recipient) as `0x${string}`,
              value: amountRaw,
            },
            {
              onSuccess: (h) => resolve(h),
              onError: (err) => reject(err),
            },
          )
        })
      } else {
        // ERC-20 transfer — exact amount, no unlimited approval
        hash = await new Promise<string>((resolve, reject) => {
          writeContract(
            {
              address: getAddress(tokenConfig.contractAddress!) as `0x${string}`,
              abi: ERC20_TRANSFER_ABI,
              functionName: 'transfer',
              args: [getAddress(recipient) as `0x${string}`, amountRaw],
            },
            {
              onSuccess: (h) => resolve(h),
              onError: (err) => reject(err),
            },
          )
        })
      }

      if (!hash) throw new Error('No transaction hash returned from wallet.')

      // Record the hash server-side
      setIsSubmitting(true)
      const submitRes = await fetch('/api/transactions/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          transactionId: reviewData.transactionId,
          txHash: hash,
        }),
      })

      if (!submitRes.ok) {
        // Transaction was sent but recording failed — provide hash for manual lookup
        console.error('[SendView] Failed to record transaction hash')
      }

      setTxHash(hash)
      setStep('submitted')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)

      // User cancelled
      if (msg.includes('User rejected') || msg.includes('user rejected') || msg.includes('4001')) {
        setErrorMessage('Transaction cancelled by user.')
        setStep('review')
        return
      }

      setErrorMessage(`Transaction failed: ${msg}`)
      setStep('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl sm:text-3xl" style={{ color: 'var(--text-primary)' }}>
          Send Cryptocurrency
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Transactions require your explicit wallet authorization.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {/* ── Form ── */}
        {step === 'form' && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <form onSubmit={handlePrepare} className="cv-card p-6 space-y-5">
              {/* Token selector */}
              <div>
                <label className="cv-label">Asset</label>
                <select
                  value={tokenSymbol}
                  onChange={(e) => setTokenSymbol(e.target.value)}
                  className="cv-input"
                >
                  {network.tokens.map((t) => (
                    <option key={t.symbol} value={t.symbol}>
                      {t.symbol} — {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Recipient */}
              <div>
                <label htmlFor="recipient" className="cv-label">Recipient Address</label>
                <input
                  id="recipient"
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value.trim())}
                  placeholder="0x..."
                  className="cv-input font-mono-address"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  maxLength={42}
                  required
                />
                {recipient && !isAddress(recipient) && (
                  <p className="text-xs mt-1 text-red-500">Invalid EVM address</p>
                )}
                {recipient && isAddress(recipient) && (
                  <p className="text-xs mt-1 text-green-500">Valid address</p>
                )}
              </div>

              {/* Amount */}
              <div>
                <label htmlFor="amount" className="cv-label">Amount</label>
                <div className="relative">
                  <input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.0"
                    className="cv-input pr-16"
                    min="0"
                    step="any"
                    required
                  />
                  <span
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {tokenSymbol}
                  </span>
                </div>
              </div>

              {/* Error */}
              {errorMessage && (
                <div className="flex items-start gap-2 p-3 rounded-xl border text-sm"
                  style={{ background: 'rgba(239,68,68,0.07)', borderColor: 'rgba(239,68,68,0.25)', color: '#ef4444' }}>
                  <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                className="btn-primary w-full py-3"
                disabled={isPreparing || !recipient || !amount}
              >
                {isPreparing ? (
                  <><Loader2 size={15} className="animate-spin" /> Preparing…</>
                ) : (
                  'Review Transaction'
                )}
              </button>
            </form>
          </motion.div>
        )}

        {/* ── Review ── */}
        {step === 'review' && reviewData && (
          <motion.div
            key="review"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="cv-card p-6 space-y-5">
              <div className="flex items-center gap-2 mb-1">
                <Shield size={16} className="text-blue-500" />
                <h2 className="font-display font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Review Transaction
                </h2>
              </div>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Verify all details carefully. Transactions cannot be reversed.
              </p>

              <div className="space-y-3">
                {[
                  { label: 'Asset', value: reviewData.currency },
                  { label: 'Amount', value: `${reviewData.amount} ${reviewData.currency}` },
                  { label: 'Recipient', value: reviewData.recipient, mono: true },
                  { label: 'Network', value: reviewData.network },
                  { label: 'Estimated Fee', value: reviewData.estimatedFee !== 'Unknown' ? `${reviewData.estimatedFee} ${network.nativeCurrency.symbol}` : 'Loading…' },
                ].map(({ label, value, mono }) => (
                  <div key={label} className="flex items-start justify-between gap-4 py-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{label}</span>
                    <span
                      className={`text-sm font-semibold text-right break-all ${mono ? 'font-mono-address' : ''}`}
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              {reviewData.warning && (
                <div className="flex items-start gap-2 p-3 rounded-xl border text-xs"
                  style={{ background: 'rgba(245,158,11,0.07)', borderColor: 'rgba(245,158,11,0.25)', color: '#d97706' }}>
                  <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
                  {reviewData.warning}
                </div>
              )}

              {errorMessage && (
                <div className="flex items-start gap-2 p-3 rounded-xl border text-sm"
                  style={{ background: 'rgba(239,68,68,0.07)', borderColor: 'rgba(239,68,68,0.25)', color: '#ef4444' }}>
                  <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                  {errorMessage}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => { setStep('form'); setErrorMessage(null) }}
                  className="btn-secondary flex-1 py-2.5"
                >
                  Back
                </button>
                <button
                  onClick={handleAuthorize}
                  className="btn-primary flex-1 py-2.5"
                  disabled={isSubmitting}
                >
                  Authorize in Wallet
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Authorizing ── */}
        {step === 'authorizing' && (
          <motion.div
            key="authorizing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="cv-card p-10 text-center"
          >
            <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-5">
              <Loader2 size={28} className="text-blue-500 animate-spin" />
            </div>
            <h3 className="font-display font-semibold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>
              Awaiting Wallet Authorization
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Your wallet is asking for your authorization. Check your wallet extension or app and confirm the transaction.
            </p>
          </motion.div>
        )}

        {/* ── Submitted ── */}
        {step === 'submitted' && txHash && (
          <motion.div
            key="submitted"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="cv-card p-8 text-center"
          >
            <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 size={28} className="text-green-500" />
            </div>
            <h3 className="font-display font-semibold text-xl mb-2" style={{ color: 'var(--text-primary)' }}>
              Transaction Submitted
            </h3>
            <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
              Your transaction has been broadcast to the network. It will be confirmed once the blockchain processes it.
            </p>
            <div className="p-3 rounded-xl border mb-5 text-left"
              style={{ background: 'var(--bg-muted)', borderColor: 'var(--border-subtle)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Transaction Hash</p>
              <p className="font-mono-address text-sm break-all" style={{ color: 'var(--text-primary)' }}>
                {txHash}
              </p>
              {network && (
                <a
                  href={`${network.blockExplorerUrl}/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs mt-2 inline-flex items-center gap-1 hover:underline"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  View on {network.blockExplorerName} ↗
                </a>
              )}
            </div>
            <div className="flex gap-3">
              <a href="/transactions" className="btn-secondary flex-1 text-sm py-2.5">
                View History
              </a>
              <button
                onClick={() => {
                  setStep('form')
                  setRecipient('')
                  setAmount('')
                  setTxHash(null)
                  setReviewData(null)
                }}
                className="btn-primary flex-1 text-sm py-2.5"
              >
                New Transaction
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Error ── */}
        {step === 'error' && (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="cv-card p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={28} className="text-red-500" />
            </div>
            <h3 className="font-display font-semibold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>
              Transaction Failed
            </h3>
            {errorMessage && <p className="text-sm text-red-500 mb-5">{errorMessage}</p>}
            <button
              onClick={() => { setStep('form'); setErrorMessage(null) }}
              className="btn-primary w-full py-2.5"
            >
              Try Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
