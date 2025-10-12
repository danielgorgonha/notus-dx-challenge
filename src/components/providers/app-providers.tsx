"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PrivyClientConfig, PrivyProvider } from '@privy-io/react-auth'
import { KYCProvider } from '@/contexts/kyc-context'
import { ToastProvider } from '@/contexts/toast-context'
import { ToastContainer } from '@/components/ui/toast-container'
import { useState, useEffect } from 'react'

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

  const [isClient, setIsClient] = useState(false);
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Durante o build/SSR, não renderizar o PrivyProvider
  if (!isClient) {
    return (
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <KYCProvider>
            {children}
            <ToastContainer />
          </KYCProvider>
        </ToastProvider>
      </QueryClientProvider>
    );
  }

  if (!privyAppId) {
    console.error('NEXT_PUBLIC_PRIVY_APP_ID is not defined');
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-white text-xl font-bold mb-2">Configuration Error</h1>
          <p className="text-slate-400">NEXT_PUBLIC_PRIVY_APP_ID is not configured</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <PrivyProvider
          appId={privyAppId}
          config={config}
        >
          <KYCProvider>
            {children}
            <ToastContainer />
          </KYCProvider>
        </PrivyProvider>
      </ToastProvider>
    </QueryClientProvider>
  )
}