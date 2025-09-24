"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PrivyProvider } from '@privy-io/react-auth'
import { AuthProvider } from '@/contexts/auth-context'
import { KYCProvider } from '@/contexts/kyc-context'
import { useState, useEffect } from 'react'

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

  const [isMounted, setIsMounted] = useState(false);

  // Verificar se estamos no ambiente correto e se o App ID está disponível
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Se não estamos montados no cliente ou não temos o App ID, renderizar sem Privy
  if (!isMounted || !privyAppId) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <KYCProvider>
            {children}
          </KYCProvider>
        </AuthProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <PrivyProvider
        appId={privyAppId}
        config={{
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
