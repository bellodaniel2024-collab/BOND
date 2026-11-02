'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/components/providers/AuthProvider'
import { useTheme } from '@/components/providers/ThemeProvider'
import { Settings, User, Sun, Moon, Loader2, CheckCircle2 } from 'lucide-react'

export function SettingsView() {
  const { user, refetch } = useAuth()
  const { theme, setTheme } = useTheme()
  const [displayName, setDisplayName] = useState(user?.displayName ?? '')
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    try {
      const res = await fetch('/api/account/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ displayName }),
      })
      if (res.ok) {
        await refetch()
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl" style={{ color: 'var(--text-primary)' }}>
          Account Settings
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Manage your profile and preferences.
        </p>
      </div>

      {/* Profile */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="cv-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <User size={16} className="text-blue-500" />
          <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Profile</h2>
        </div>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="cv-label">Email Address</label>
            <input
              type="email"
              value={user?.email ?? ''}
              className="cv-input opacity-60"
              disabled
              readOnly
            />
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Email address cannot be changed.
            </p>
          </div>
          <div>
            <label htmlFor="displayName" className="cv-label">Display Name</label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
              className="cv-input"
              maxLength={50}
            />
          </div>
          <button
            type="submit"
            className="btn-primary text-sm py-2.5"
            disabled={isSaving}
          >
            {isSaving ? (
              <><Loader2 size={13} className="animate-spin" /> Saving…</>
            ) : saved ? (
              <><CheckCircle2 size={13} className="text-green-300" /> Saved!</>
            ) : (
              'Save Changes'
            )}
          </button>
        </form>
      </motion.div>

      {/* Theme */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="cv-card p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Settings size={16} className="text-blue-500" />
          <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Appearance</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {([
            { value: 'dark', icon: Moon, label: 'Dark Mode' },
            { value: 'light', icon: Sun, label: 'Light Mode' },
          ] as const).map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                theme === value ? 'border-blue-500 bg-blue-500/08' : ''
              }`}
              style={{
                background: theme === value ? 'rgba(59,130,246,0.07)' : 'var(--bg-muted)',
                borderColor: theme === value ? '#3b82f6' : 'var(--border-subtle)',
              }}
            >
              <Icon size={16} className={theme === value ? 'text-blue-500' : ''} style={{ color: theme !== value ? 'var(--text-muted)' : undefined }} />
              <span className="text-sm font-medium" style={{ color: theme === value ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Account info */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="cv-card p-6"
      >
        <h2 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Account Information</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-muted)' }}>User ID</span>
            <span className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>{user?.id}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-muted)' }}>Role</span>
            <span className="badge-info">{user?.role}</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
