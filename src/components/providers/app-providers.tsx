"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PrivyClientConfig, PrivyProvider } from '@privy-io/react-auth'
import { KYCProvider } from '@/contexts/kyc-context'
import { useState } from 'react'

const config = {
  appearance: {
    theme: 'dark',
    accentColor: '#3B82F6',
    showWalletLoginFirst: false,
    logo: undefined,
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
} as PrivyClientConfig;

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

  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  // Durante o build, pode não ter as variáveis de ambiente disponíveis
  // Nesse caso, retornamos apenas os children sem o PrivyProvider
  if (!privyAppId) {
    console.warn('NEXT_PUBLIC_PRIVY_APP_ID is not defined - running without PrivyProvider');
    return (
      <QueryClientProvider client={queryClient}>
        <KYCProvider>
          {children}
        </KYCProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <PrivyProvider
        appId={privyAppId}
        config={config}
      >
        <KYCProvider>
          {children}
        </KYCProvider>
      </PrivyProvider>
    </QueryClientProvider>
  )
}