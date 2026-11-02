'use client'

import { useAuth } from '@/components/providers/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { ShieldCheck, Users, Activity, AlertTriangle, BarChart3, Settings, LogOut } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const ADMIN_NAV = [
  { href: '/admin', label: 'Overview', icon: BarChart3 },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/transactions', label: 'Transactions', icon: Activity },
  { href: '/admin/security', label: 'Security Events', icon: AlertTriangle },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading && (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN'))) {
      router.replace('/dashboard')
    }
  }, [user, isLoading, router])

  if (isLoading || !user) return null

  return (
    <div className="flex h-screen" style={{ background: 'var(--bg-base)' }}>
      {/* Admin sidebar */}
      <aside className="w-60 flex flex-col border-r flex-shrink-0" style={{ background: 'var(--bg-raised)', borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-2.5 px-5 py-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
            <ShieldCheck size={14} className="text-white" />
          </div>
          <div>
            <span className="font-bold text-sm block" style={{ color: 'var(--text-primary)' }}>ChainVault</span>
            <span className="text-xs badge-danger">Admin</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {ADMIN_NAV.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active ? 'bg-blue-600 text-white' : 'hover:bg-[var(--bg-muted)]'
                }`}
                style={active ? {} : { color: 'var(--text-secondary)' }}
              >
                <Icon size={15} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="px-3 pb-4 border-t pt-3" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="px-3 py-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            Signed in as <br />
            <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>{user.email}</span>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-500 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={13} />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  )
}
