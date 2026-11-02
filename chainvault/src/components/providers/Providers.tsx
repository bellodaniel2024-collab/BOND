'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { ThemeProvider } from './ThemeProvider'
import { AuthProvider } from './AuthProvider'
import { wagmiConfig } from '@/lib/wagmi-config'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  // QueryClient created as state to avoid sharing between server renders
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,        // 30 seconds
            gcTime: 5 * 60_000,       // 5 minutes
            retry: 2,
            refetchOnWindowFocus: false,
          },
        },
      }),
  )

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
