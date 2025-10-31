/**
 * Dashboard Page - Server Component
 * Busca dados no servidor e renderiza componentes client-side para interatividade
 */

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { getWalletAddress, getPortfolio, getHistory, listSupportedTokens } from "@/lib/actions/dashboard";
import { AppLayout } from "@/components/layout/app-layout";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { PortfolioSection } from "@/components/dashboard/portfolio-section";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { DashboardClientWrapper } from "@/components/dashboard/dashboard-client-wrapper";

export default async function DashboardPage() {
  // Autenticação no servidor
  const user = await auth();
  
  if (!user || !user.wallet?.address) {
    redirect("/");
  }

  const externallyOwnedAccount = user.wallet.address;
  
  // Buscar wallet address primeiro para obter accountAbstraction
  const walletData = await getWalletAddress({ externallyOwnedAccount });
  const wallet = walletData.wallet;
  const accountAbstractionAddress = wallet?.accountAbstraction || user.accountAbstractionAddress;

  // Buscar dados no servidor usando accountAbstractionAddress
  const [portfolio, history, tokens] = await Promise.all([
    getPortfolio(accountAbstractionAddress || ''),
    getHistory(accountAbstractionAddress || '', { take: 10 }),
    listSupportedTokens({ page: 1, perPage: 50 }),
  ]);

  // Calcular estatísticas
  const totalBalance = portfolio?.tokens?.reduce((sum: number, token: any) => {
    return sum + parseFloat(token.balanceUsd || '0');
  }, 0) || 0;

  const transactionCount = history?.transactions?.length || 0;
  const tokenCount = portfolio?.tokens?.length || 0;

  // Funções de formatação (serão passadas para componentes client)
  // Essas serão usadas no DashboardClientWrapper

  return (
    <ProtectedRoute>
      <AppLayout 
        title="Dashboard"
        description="Testing Notus API - Authentication, Transfers, Swaps, and Liquidity Pools"
      >
        <div className="space-y-8">
          <DashboardHeader 
            userEmail={typeof user.email === 'string' ? user.email : user.email?.address}
          />

          <DashboardClientWrapper
            initialTotalBalance={totalBalance}
            initialPortfolio={portfolio}
            initialHistory={history}
            initialTransactionCount={transactionCount}
            initialTokenCount={tokenCount}
            accountAbstractionAddress={accountAbstractionAddress || ''}
          />
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}

