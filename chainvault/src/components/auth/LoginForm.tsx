'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, AlertCircle, ShieldCheck } from 'lucide-react'
import { AuthLayout } from './AuthLayout'
import { motion, AnimatePresence } from 'framer-motion'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const body = requiresTwoFactor
        ? { email, password, twoFactorToken: twoFactorCode }
        : { email, password }

      // Race the fetch against a timeout so the user is never stuck
      const res = await Promise.race([
        fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(body),
        }),
        new Promise<Response>((_, reject) =>
          setTimeout(() => reject(new Error('Request timed out')), 15000),
        ),
      ])

      const data = await res.json()

      if (!data.success) {
        if (data.code === 'RATE_LIMITED') {
          setError('Too many login attempts. Please wait 15 minutes before trying again.')
        } else if (data.code === 'EMAIL_NOT_VERIFIED') {
          setError('Please verify your email address. Check your inbox for the verification link.')
        } else if (data.code === 'SUSPENDED') {
          setError('Your account has been suspended. Please contact support.')
        } else {
          setError(data.error ?? 'Login failed. Please check your credentials.')
        }
        return
      }

      if (data.data?.requiresTwoFactor) {
        setRequiresTwoFactor(true)
        setIsLoading(false)
        return
      }

      // Login succeeded — do a HARD redirect (full page load) so the
      // browser sends the fresh session cookie with the dashboard request.
      // Using window.location.href instead of router.push avoids a race
      // condition where the client-side navigation might not include the
      // Set-Cookie from the login response.
      window.location.href = '/dashboard'
      // Don't setIsLoading(false) here — let the spinner show during navigation
    } catch {
      setError('Unable to reach the server. Please check your connection and try again.')
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout
      title={requiresTwoFactor ? 'Two-Factor Authentication' : 'Welcome Back'}
      subtitle={
        requiresTwoFactor
          ? 'Enter the 6-digit code from your authenticator app.'
          : 'Sign in to your BOND account.'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {!requiresTwoFactor ? (
          <>
            <div>
              <label htmlFor="email" className="cv-label">Email address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null) }}
                placeholder="you@example.com"
                className="cv-input"
                maxLength={254}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="cv-label mb-0">Password</label>
                <Link
                  href="/auth/reset-password"
                  className="text-xs hover:underline"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(null) }}
                  placeholder="Your password"
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
            </div>
          </>
        ) : (
          <div>
            <div className="flex items-center gap-3 p-4 rounded-xl border mb-4" style={{
              background: 'rgba(59, 130, 246, 0.06)',
              borderColor: 'rgba(59, 130, 246, 0.2)',
            }}>
              <ShieldCheck size={18} className="text-blue-500 flex-shrink-0" />
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Open your authenticator app and enter the current 6-digit code.
              </p>
            </div>
            <label htmlFor="twoFactorCode" className="cv-label">Authentication Code</label>
            <input
              id="twoFactorCode"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              value={twoFactorCode}
              onChange={(e) => { setTwoFactorCode(e.target.value.replace(/\D/g, '')); setError(null) }}
              placeholder="000000"
              className="cv-input text-center text-xl tracking-widest font-mono"
              autoFocus
            />
          </div>
        )}

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

        <button
          type="submit"
          className="btn-primary w-full py-3 mt-1"
          disabled={isLoading || (requiresTwoFactor && twoFactorCode.length !== 6)}
        >
          {isLoading ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Signing in…
            </>
          ) : requiresTwoFactor ? (
            'Verify'
          ) : (
            'Sign In'
          )}
        </button>

        {!requiresTwoFactor && (
          <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            Don&apos;t have an account?{' '}
            <Link
              href="/auth/register"
              className="font-semibold hover:underline"
              style={{ color: 'var(--accent-primary)' }}
            >
              Create one
            </Link>
          </p>
        )}

        {requiresTwoFactor && (
          <button
            type="button"
            onClick={() => { setRequiresTwoFactor(false); setTwoFactorCode(''); setError(null) }}
            className="w-full text-center text-sm btn-ghost"
          >
            &larr; Back to login
          </button>
        )}
      </form>
    </AuthLayout>
  )
}
