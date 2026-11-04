'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ShieldCheck, Lock, Eye } from 'lucide-react'

// Animated grid of blockchain nodes
function BlockchainVisual() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Grid pattern */}
      <div className="absolute inset-0 dark:bg-grid-dark bg-grid-light opacity-60" />

      {/* Radial gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(59, 130, 246, 0.15) 0%, transparent 60%)',
        }}
      />

      {/* Animated orb */}
      <motion.div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Floating nodes */}
      {[
        { x: '15%', y: '25%', delay: 0 },
        { x: '80%', y: '20%', delay: 0.8 },
        { x: '10%', y: '65%', delay: 1.2 },
        { x: '85%', y: '60%', delay: 0.4 },
        { x: '50%', y: '75%', delay: 1.6 },
        { x: '35%', y: '15%', delay: 2.0 },
        { x: '65%', y: '80%', delay: 0.6 },
      ].map((node, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-blue-500"
          style={{ left: node.x, top: node.y, opacity: 0.4 }}
          animate={{
            opacity: [0.2, 0.6, 0.2],
            scale: [1, 1.4, 1],
          }}
          transition={{
            duration: 3,
            delay: node.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Connection lines (SVG) */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.06] dark:opacity-[0.08]"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <line x1="15%" y1="25%" x2="50%" y2="15%" stroke="url(#line-gradient)" strokeWidth="1" />
        <line x1="50%" y1="15%" x2="80%" y2="20%" stroke="url(#line-gradient)" strokeWidth="1" />
        <line x1="15%" y1="25%" x2="10%" y2="65%" stroke="url(#line-gradient)" strokeWidth="1" />
        <line x1="80%" y1="20%" x2="85%" y2="60%" stroke="url(#line-gradient)" strokeWidth="1" />
        <line x1="10%" y1="65%" x2="50%" y2="75%" stroke="url(#line-gradient)" strokeWidth="1" />
        <line x1="50%" y1="75%" x2="85%" y2="60%" stroke="url(#line-gradient)" strokeWidth="1" />
      </svg>
    </div>
  )
}

// Animated stat counter
function StatCounter({ value, label }: { value: string; label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center"
    >
      <div className="text-2xl sm:text-3xl font-display font-bold gradient-text">{value}</div>
      <div className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</div>
    </motion.div>
  )
}

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-16 px-4">
      <BlockchainVisual />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-medium mb-8"
          style={{
            background: 'rgba(59, 130, 246, 0.08)',
            borderColor: 'rgba(59, 130, 246, 0.25)',
            color: 'var(--accent-primary)',
          }}
        >
          <ShieldCheck size={13} />
          Non-Custodial &mdash; You Control Your Keys
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-tight tracking-tight mb-6"
          style={{ color: 'var(--text-primary)' }}
        >
          Cryptocurrency Transactions.{' '}
          <span className="gradient-text">Without Compromise.</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
        >
          Send and receive cryptocurrency directly from your own wallet.
          BOND never holds your funds — every transaction requires
          your explicit authorization.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12"
        >
          <Link href="/auth/register" className="btn-primary px-6 py-3 text-base w-full sm:w-auto">
            Get Started Free
            <ArrowRight size={16} />
          </Link>
          <Link href="/auth/login" className="btn-secondary px-6 py-3 text-base w-full sm:w-auto">
            Sign In
          </Link>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-6 text-sm"
          style={{ color: 'var(--text-muted)' }}
        >
          {[
            { icon: Lock, text: 'Private keys stay with you' },
            { icon: Eye, text: 'Open transaction verification' },
            { icon: ShieldCheck, text: 'Testnet — development phase' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-1.5">
              <Icon size={13} className="text-blue-500" />
              {text}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-5 h-8 rounded-full border-2 flex items-start justify-center pt-1.5" style={{ borderColor: 'var(--border-default)' }}>
          <motion.div
            className="w-1 h-1.5 rounded-full bg-blue-500"
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  )
}
