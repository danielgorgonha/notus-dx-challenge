/**
 * Dashboard Page - Server Component
 * Busca dados no servidor e renderiza componentes client-side para interatividade
 */

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { getWalletAddress, getPortfolio, getHistory, listSupportedTokens } from "@/lib/actions/dashboard";
import { listPools } from "@/lib/actions/pools";
import { AppLayout } from "@/components/layout/app-layout";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { PortfolioSection } from "@/components/dashboard/portfolio-section";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { DashboardClientWrapper } from "@/components/dashboard/dashboard-client-wrapper";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // Autenticação no servidor
  // Em produção, o cookie pode não estar disponível imediatamente
  // Por isso, sempre renderizar o ProtectedRoute que faz a verificação no client
  let user = null;
  try {
    user = await auth();
  } catch (error) {
    // Continuar mesmo com erro - ProtectedRoute vai verificar no client
  }
  
  // Se tiver user no servidor, buscar dados; caso contrário, ProtectedRoute fará redirect
  let portfolio = null;
  let history = null;
  let tokens = null;
  let poolsData = { pools: [], total: 0 };
  let totalBalance = 0;
  let transactionCount = 0;
  let tokenCount = 0;
  let accountAbstractionAddress = '';
  
  if (user?.wallet?.address) {
    try {
      const externallyOwnedAccount = user.wallet.address;
      
      // Buscar wallet address primeiro para obter accountAbstraction
      const walletData = await getWalletAddress({ externallyOwnedAccount });
      const wallet = walletData.wallet;
      accountAbstractionAddress = wallet?.accountAbstraction || user.accountAbstractionAddress || '';

      // Buscar dados no servidor usando accountAbstractionAddress
      const [portfolioData, historyData, tokensData, poolsDataResult] = await Promise.all([
        getPortfolio(accountAbstractionAddress || '').catch(() => null),
        getHistory(accountAbstractionAddress || '', { take: 10 }).catch(() => null),
        listSupportedTokens({ page: 1, perPage: 50 }).catch(() => null),
        listPools().catch(() => ({ pools: [], total: 0 })),
      ]);

      portfolio = portfolioData;
      history = historyData;
      tokens = tokensData;
      poolsData = poolsDataResult || { pools: [], total: 0 };

      // Calcular estatísticas
      totalBalance = portfolio?.tokens?.reduce((sum: number, token: any) => {
        return sum + parseFloat(token.balanceUsd || '0');
      }, 0) || 0;

      transactionCount = history?.transactions?.length || 0;
      tokenCount = portfolio?.tokens?.length || 0;
    } catch (error) {
      // Continuar mesmo com erro - dados serão buscados no client se necessário
    }
  }

  return (
    <ProtectedRoute>
      <AppLayout 
        title="Dashboard"
        description="Testing Notus API - Authentication, Transfers, Swaps, and Liquidity Pools"
        showHeader={false}
      >
        <div className="space-y-0 sm:space-y-4 lg:space-y-8">
          {/* Header Desktop - oculto no mobile */}
          {/* DashboardHeader será renderizado pelo DashboardClientWrapper quando tiver dados */}
          
          {/* Sempre renderizar DashboardClientWrapper - ele vai buscar dados no cliente se necessário */}
          <DashboardClientWrapper
            initialTotalBalance={totalBalance}
            initialPortfolio={portfolio}
            initialHistory={history}
            initialTransactionCount={transactionCount}
            initialTokenCount={tokenCount}
            accountAbstractionAddress={accountAbstractionAddress}
            initialPools={poolsData?.pools || []}
            initialTokens={tokens?.tokens || []}
          />
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}

