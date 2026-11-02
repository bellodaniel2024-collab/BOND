/**
 * ChainVault — Next.js Middleware
 *
 * SECURITY:
 * - Protects all /dashboard, /send, /receive, /transactions, /wallet,
 *   /assets, /security, /settings, /help routes behind authentication.
 * - Redirects unauthenticated users to /auth/login.
 * - Redirects authenticated users away from /auth pages.
 * - Admin routes require ADMIN or SUPER_ADMIN role.
 * - Never exposes sensitive data in redirects.
 */
import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import type { SessionData } from '@/lib/session'

const SESSION_PASSWORD = process.env['IRON_SESSION_PASSWORD']!

const PROTECTED_PATTERNS = [
  '/dashboard',
  '/send',
  '/receive',
  '/transactions',
  '/wallet',
  '/assets',
  '/security',
  '/settings',
  '/help',
]

const ADMIN_PATTERNS = ['/admin']

const AUTH_PATTERNS = ['/auth/login', '/auth/register', '/auth/reset-password']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Skip static assets and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // static files
  ) {
    return NextResponse.next()
  }

  const isProtected = PROTECTED_PATTERNS.some((p) => pathname.startsWith(p))
  const isAdmin = ADMIN_PATTERNS.some((p) => pathname.startsWith(p))
  const isAuthPage = AUTH_PATTERNS.some((p) => pathname.startsWith(p))

  if (!isProtected && !isAdmin && !isAuthPage) {
    return NextResponse.next()
  }

  // Read session — we need to verify auth
  let session: { isAuthenticated?: boolean; role?: string } = {}
  try {
    const res = NextResponse.next()
    const ironSession = await getIronSession<SessionData>(req, res, {
      password: SESSION_PASSWORD,
      cookieName: 'bond_session',
      cookieOptions: {
        secure: process.env['NODE_ENV'] === 'production',
        httpOnly: true,
        sameSite: 'strict',
        path: '/',
      },
    })
    session = ironSession
  } catch {
    // Session read failure — treat as unauthenticated
  }

  const isAuthenticated = session.isAuthenticated === true

  // Redirect authenticated users away from auth pages
  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Redirect unauthenticated users to login
  if ((isProtected || isAdmin) && !isAuthenticated) {
    const loginUrl = new URL('/auth/login', req.url)
    // Don't add return URL for security (prevents open redirect)
    return NextResponse.redirect(loginUrl)
  }

  // Check admin role
  if (isAdmin && isAuthenticated) {
    const role = session.role
    if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/send/:path*',
    '/receive/:path*',
    '/transactions/:path*',
    '/wallet/:path*',
    '/assets/:path*',
    '/security/:path*',
    '/settings/:path*',
    '/help/:path*',
    '/admin/:path*',
    '/auth/:path*',
  ],
}
