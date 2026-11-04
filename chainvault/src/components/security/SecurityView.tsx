'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/components/providers/AuthProvider'
import {
  ShieldCheck, Key, Smartphone, AlertTriangle,
  CheckCircle2, Loader2, Eye, EyeOff
} from 'lucide-react'

export function SecurityView() {
  const { user, refetch } = useAuth()
  const [changingPassword, setChangingPassword] = useState(false)
  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPwd !== confirmPwd) {
      setMessage({ type: 'error', text: 'New passwords do not match.' })
      return
    }
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd }),
      })
      const data = await res.json()
      if (data.success) {
        setMessage({ type: 'success', text: 'Password changed successfully.' })
        setCurrentPwd('')
        setNewPwd('')
        setConfirmPwd('')
        setChangingPassword(false)
      } else {
        setMessage({ type: 'error', text: data.error ?? 'Failed to change password.' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl" style={{ color: 'var(--text-primary)' }}>
          Security Settings
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Manage your account security and authentication settings.
        </p>
      </div>

      {/* Security overview */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="cv-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck size={16} className="text-blue-500" />
          <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Security Overview</h2>
        </div>
        <div className="space-y-3">
          {[
            {
              label: 'Email Verified',
              ok: true,
              action: null,
            },
            {
              label: 'Password Protection',
              ok: true,
              action: { label: 'Change Password', fn: () => setChangingPassword(true) },
            },
            {
              label: 'Two-Factor Authentication',
              ok: user?.twoFactorEnabled ?? false,
              action: {
                label: user?.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA',
                fn: () => {},
              },
            },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-center gap-2">
                {item.ok
                  ? <CheckCircle2 size={14} className="text-green-500" />
                  : <AlertTriangle size={14} className="text-amber-500" />
                }
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {item.label}
                </span>
              </div>
              {item.action && (
                <button
                  onClick={item.action.fn}
                  className="text-xs btn-ghost py-1 px-2"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  {item.action.label}
                </button>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Change password */}
      {changingPassword && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="cv-card p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Key size={16} className="text-blue-500" />
            <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Change Password</h2>
          </div>

          {message && (
            <div
              className={`flex items-start gap-2 p-3 rounded-xl border text-sm mb-4 ${
                message.type === 'success'
                  ? 'bg-green-500/08 border-green-500/20 text-green-500'
                  : 'bg-red-500/08 border-red-500/20 text-red-500'
              }`}
              style={{
                background: message.type === 'success' ? 'rgba(34,197,94,0.07)' : 'rgba(239,68,68,0.07)',
                borderColor: message.type === 'success' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
                color: message.type === 'success' ? '#22c55e' : '#ef4444',
              }}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="cv-label">Current Password</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={currentPwd}
                  onChange={(e) => setCurrentPwd(e.target.value)}
                  className="cv-input pr-10"
                  required
                  maxLength={128}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <div>
              <label className="cv-label">New Password</label>
              <input
                type={showPwd ? 'text' : 'password'}
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                className="cv-input"
                required
                minLength={12}
                maxLength={128}
              />
            </div>
            <div>
              <label className="cv-label">Confirm New Password</label>
              <input
                type={showPwd ? 'text' : 'password'}
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                className="cv-input"
                required
                maxLength={128}
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setChangingPassword(false); setMessage(null) }}
                className="btn-secondary flex-1 py-2.5"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary flex-1 py-2.5"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : 'Change Password'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* 2FA info */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="cv-card p-6"
      >
        <div className="flex items-center gap-2 mb-3">
          <Smartphone size={16} className="text-blue-500" />
          <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            Two-Factor Authentication
          </h2>
          {user?.twoFactorEnabled
            ? <span className="badge-success">Enabled</span>
            : <span className="badge-warning">Disabled</span>
          }
        </div>
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
          Two-factor authentication adds an extra layer of security. Use an authenticator app
          (like Google Authenticator or Authy) to generate time-based codes.
        </p>
        {!user?.twoFactorEnabled && (
          <button className="btn-primary text-sm py-2.5 w-full" disabled>
            Enable Two-Factor Auth
            <span className="text-xs opacity-70 ml-1">(Coming soon)</span>
          </button>
        )}
      </motion.div>

      {/* Private key notice */}
      <div
        className="flex items-start gap-3 p-5 rounded-xl border"
        style={{
          background: 'rgba(59, 130, 246, 0.05)',
          borderColor: 'rgba(59, 130, 246, 0.15)',
        }}
      >
        <ShieldCheck size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
            Your Private Keys are Always Safe
          </p>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            BOND never asks for, stores, or has access to your private key or seed phrase.
            All transaction signing happens exclusively inside your external wallet.
            If anyone — including a message claiming to be BOND — asks for your private
            key or seed phrase, it is a scam. Never share them.
          </p>
        </div>
      </div>
    </div>
  )
}
