import { ClientProviders } from './client-providers';

export function AppProviders({ children }: { children: React.ReactNode }) {
  // Passar variáveis de ambiente como props para evitar problemas de build time vs runtime
  const envVars = {
    privyAppId: process.env.NEXT_PUBLIC_PRIVY_APP_ID,
    notusApiUrl: process.env.NEXT_PUBLIC_NOTUS_API_URL,
    nodeEnv: process.env.NEXT_PUBLIC_NODE_ENV || process.env.NODE_ENV,
  };

  return <ClientProviders envVars={envVars}>{children}</ClientProviders>;
}