/**
 * BOND — Server-side Session Management
 *
 * Uses iron-session for encrypted, HttpOnly, SameSite=Strict cookies.
 * Session data is minimal — user ID, role, session ID only.
 * No wallet private keys or sensitive data stored in session.
 */
import { getIronSession, IronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// Lazy-read env vars so missing values produce a clear runtime error
// instead of crashing the entire server at module load time.
function getSessionPassword(): string {
  const pw = process.env['IRON_SESSION_PASSWORD']
  if (!pw && process.env['NODE_ENV'] !== 'test') {
    throw new Error('Server configuration error: IRON_SESSION_PASSWORD is not set.')
  }
  if (pw && pw.length < 32) {
    throw new Error('Server configuration error: IRON_SESSION_PASSWORD must be at least 32 characters.')
  }
  return pw || 'test-session-password-at-least-32-characters!!'
}

export interface SessionData {
  userId?: string
  email?: string
  role?: string
  sessionId?: string
  isAuthenticated?: boolean
  // Two-factor state (cleared after full auth)
  pendingTwoFactor?: boolean
  pendingUserId?: string
}

export const SESSION_OPTIONS = {
  get password() {
    return getSessionPassword()
  },
  cookieName: 'bond_session',
  cookieOptions: {
    // In production, cookies require HTTPS. If deploying without HTTPS
    // (e.g. behind a proxy that terminates TLS), set ENFORCE_HTTPS=true.
    secure: process.env['NODE_ENV'] === 'production',
    httpOnly: true,
    sameSite: 'lax' as const, // 'lax' allows the cookie to be sent on top-level navigations
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
}

/**
 * Get the session in a Server Component or Route Handler.
 */
export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies()
  return getIronSession<SessionData>(cookieStore, SESSION_OPTIONS)
}

/**
 * Get the session from a request/response pair (middleware or API routes).
 */
export async function getSessionFromRequest(
  req: NextRequest,
  res: NextResponse,
): Promise<IronSession<SessionData>> {
  return getIronSession<SessionData>(req, res, SESSION_OPTIONS)
}

/**
 * Assert the session is authenticated.
 * Returns session data or throws an error suitable for API responses.
 */
export function requireAuth(session: IronSession<SessionData>): {
  userId: string
  email: string
  role: string
  sessionId: string
} {
  if (!session.isAuthenticated || !session.userId) {
    throw new AuthenticationError('Authentication required.')
  }
  return {
    userId: session.userId,
    email: session.email ?? '',
    role: session.role ?? 'USER',
    sessionId: session.sessionId ?? '',
  }
}

export function requireAdminAuth(session: IronSession<SessionData>): {
  userId: string
  email: string
  role: string
  sessionId: string
} {
  const auth = requireAuth(session)
  if (auth.role !== 'ADMIN' && auth.role !== 'SUPER_ADMIN') {
    throw new AuthorizationError('Administrator access required.')
  }
  return auth
}

// ─── Custom Errors ────────────────────────────────────────────────────────────

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthorizationError'
  }
}
