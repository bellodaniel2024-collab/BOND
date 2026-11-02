'use client'

import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'

const FOOTER_LINKS = {
  Platform: [
    { href: '/', label: 'Home' },
    { href: '/auth/register', label: 'Get Started' },
    { href: '/assets', label: 'Supported Assets' },
    { href: '#security', label: 'Security' },
  ],
  Legal: [
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
  ],
  Support: [
    { href: '/help', label: 'Help & Support' },
    { href: '#faq', label: 'FAQ' },
  ],
}

export function LandingFooter() {
  return (
    <footer
      className="border-t"
      style={{
        background: 'var(--bg-raised)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <ShieldCheck className="text-white" size={16} />
              </div>
              <span className="font-display font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                ChainVault
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Non-custodial cryptocurrency transactions. You control your keys.
            </p>
          </div>

          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
                {category}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm transition-colors hover:text-[var(--accent-primary)]"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            &copy; {new Date().getFullYear()} ChainVault. Development preview — not for production use.
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Non-custodial &middot; Testnet only &middot; No real funds
          </p>
        </div>
      </div>
    </footer>
  )
}
