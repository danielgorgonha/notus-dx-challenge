"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PrivyProvider } from '@privy-io/react-auth'
import { AuthProvider } from '@/contexts/auth-context'
import { KYCProvider } from '@/contexts/kyc-context'
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
        appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
        config={{
          appearance: {
            theme: 'dark',
            accentColor: '#3B82F6',
            showWalletLoginFirst: false,
          },
          embeddedWallets: {
            ethereum: {
              createOnLogin: 'users-without-wallets',
            },
          },
          mfa: {
            noPromptOnMfaRequired: false,
          },
          loginMethods: ['email', 'wallet'],
          legal: {
            termsAndConditionsUrl: 'https://notus.team/terms',
            privacyPolicyUrl: 'https://notus.team/privacy',
          },
        }}
      >
        <AuthProvider>
          <KYCProvider>
            {children}
          </KYCProvider>
        </AuthProvider>
      </PrivyProvider>
    </QueryClientProvider>
  )
}
