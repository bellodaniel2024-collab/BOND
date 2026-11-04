'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'

export interface AuthUser {
  id: string
  email: string
  role: string
  displayName: string | null
  twoFactorEnabled: boolean
  wallets: Array<{
    id: string
    address: string
    chainId: number
    walletType: string
    siweVerified: boolean
  }>
}

interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  refetch: () => Promise<AuthUser | null>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

// Fetch with timeout — prevents infinite loading when the server is
// unresponsive (e.g. cold start, DB connection issue, missing env vars).
function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 10000): Promise<Response> {
  return Promise.race([
    fetch(url, options),
    new Promise<Response>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Request to ${url} timed out after ${timeoutMs}ms`)),
        timeoutMs,
      ),
    ),
  ])
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchUser = useCallback(async (): Promise<AuthUser | null> => {
    try {
      const res = await fetchWithTimeout('/api/auth/me', { credentials: 'include' }, 10000)
      if (res.ok) {
        const data = await res.json()
        const fetchedUser = data.data?.user ?? null
        setUser(fetchedUser)
        return fetchedUser
      } else {
        setUser(null)
        return null
      }
    } catch {
      // Network error, timeout, or JSON parse error — treat as logged out
      setUser(null)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    } catch {
      // Even if logout API fails, clear user state on the client
    } finally {
      setUser(null)
    }
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: user !== null,
        refetch: fetchUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
