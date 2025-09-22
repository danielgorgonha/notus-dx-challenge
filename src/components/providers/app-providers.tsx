'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PrivyProvider } from '@privy-io/react-auth'
import { AuthProvider } from '@/contexts/auth-context'
import { privyConfig } from '@/lib/api/privy'
import { useState } from 'react'

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            retry: 1,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <PrivyProvider
        appId={privyConfig.appId}
        config={privyConfig.config}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </PrivyProvider>
    </QueryClientProvider>
  )
}
