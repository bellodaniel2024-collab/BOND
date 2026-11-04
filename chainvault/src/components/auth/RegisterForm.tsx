'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { AuthLayout } from './AuthLayout'
import { motion, AnimatePresence } from 'framer-motion'

interface FormState {
  email: string
  password: string
  displayName: string
  confirmPassword: string
}

function PasswordStrengthBar({ password }: { password: string }) {
  const checks = [
    { label: '12+ characters', ok: password.length >= 12 },
    { label: 'Uppercase', ok: /[A-Z]/.test(password) },
    { label: 'Lowercase', ok: /[a-z]/.test(password) },
    { label: 'Number', ok: /[0-9]/.test(password) },
    { label: 'Special character', ok: /[^A-Za-z0-9]/.test(password) },
  ]
  const score = checks.filter((c) => c.ok).length

  if (!password) return null

  const color =
    score < 2
      ? '#ef4444'
      : score < 4
      ? '#f59e0b'
      : '#22c55e'

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex-1 h-1 rounded-full transition-all duration-300"
            style={{
              background: i <= score ? color : 'var(--border-subtle)',
            }}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-0.5">
        {checks.map((check) => (
          <span
            key={check.label}
            className="text-xs flex items-center gap-1"
            style={{ color: check.ok ? '#22c55e' : 'var(--text-muted)' }}
          >
            <CheckCircle2 size={10} />
            {check.label}
          </span>
        ))}
      </div>
    </div>
  )
}

export function RegisterForm() {
  const router = useRouter()
  const [form, setForm] = useState<FormState>({
    email: '',
    password: '',
    displayName: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          displayName: form.displayName || undefined,
        }),
      })

      const data = await res.json()

      if (!data.success) {
        setError(data.error ?? 'Registration failed.')
        return
      }

      setSuccess(true)
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <AuthLayout title="Check Your Email" subtitle="We've sent you a verification link.">
        <div className="text-center py-4">
          <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={28} className="text-green-500" />
          </div>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            A verification link has been sent to{' '}
            <strong style={{ color: 'var(--text-primary)' }}>{form.email}</strong>.
            Please check your inbox and verify your email before signing in.
          </p>
          <Link href="/auth/login" className="btn-primary w-full justify-center">
            Go to Sign In
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join BOND — your keys, your crypto."
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Display name */}
        <div>
          <label htmlFor="displayName" className="cv-label">
            Display name <span style={{ color: 'var(--text-muted)' }}>(optional)</span>
          </label>
          <input
            id="displayName"
            name="displayName"
            type="text"
            autoComplete="name"
            value={form.displayName}
            onChange={handleChange}
            placeholder="Your name"
            className="cv-input"
            maxLength={50}
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="cv-label">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className="cv-input"
            maxLength={254}
          />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="cv-label">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={form.password}
              onChange={handleChange}
              placeholder="Create a strong password"
              className="cv-input pr-10"
              maxLength={128}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded"
              style={{ color: 'var(--text-muted)' }}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          <PasswordStrengthBar password={form.password} />
        </div>

        {/* Confirm password */}
        <div>
          <label htmlFor="confirmPassword" className="cv-label">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Repeat your password"
            className="cv-input"
            maxLength={128}
          />
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-start gap-2 p-3 rounded-xl border text-sm"
              style={{
                background: 'rgba(239, 68, 68, 0.07)',
                borderColor: 'rgba(239, 68, 68, 0.25)',
                color: '#ef4444',
              }}
            >
              <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit */}
        <button
          type="submit"
          className="btn-primary w-full py-3 mt-1"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Creating account…
            </>
          ) : (
            'Create Account'
          )}
        </button>

        {/* Sign in link */}
        <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link
            href="/auth/login"
            className="font-semibold hover:underline"
            style={{ color: 'var(--accent-primary)' }}
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
