'use client'

import Link from 'next/link'
import { ShieldCheck, Sun, Moon } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTheme } from '@/components/providers/ThemeProvider'
import { AnimatePresence } from 'framer-motion'

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative">
      {/* Background */}
      <div className="absolute inset-0 dark:bg-grid-dark bg-grid-light opacity-40 pointer-events-none" aria-hidden />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% -10%, rgba(59, 130, 246, 0.12) 0%, transparent 60%)',
        }}
        aria-hidden
      />

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 rounded-lg btn-ghost"
        aria-label="Toggle theme"
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

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
            <ShieldCheck className="text-white" size={20} />
          </div>
          <span className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
            BOND
          </span>
        </Link>

        <div
          className="rounded-2xl border p-6 sm:p-8"
          style={{
            background: 'var(--bg-raised)',
            borderColor: 'var(--border-subtle)',
            boxShadow: 'var(--shadow-elevated)',
          }}
        >
          {/* Header */}
          <div className="mb-6">
            <h1 className="font-display font-bold text-2xl mb-1.5" style={{ color: 'var(--text-primary)' }}>
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {subtitle}
              </p>
            )}
          </div>

          {children}
        </div>
      </motion.div>

      {/* Back to home */}
      <Link
        href="/"
        className="relative z-10 mt-6 text-xs transition-colors hover:text-[var(--accent-primary)]"
        style={{ color: 'var(--text-muted)' }}
      >
        &larr; Back to home
      </Link>
    </div>
  )
}
