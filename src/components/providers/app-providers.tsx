import { ClientProviders } from './client-providers';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <ClientProviders>{children}</ClientProviders>;
}