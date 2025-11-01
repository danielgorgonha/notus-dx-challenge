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
    console.error('❌ Dashboard: Error in auth():', error);
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
      console.error('❌ Dashboard: Error fetching data:', error);
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
        {user?.wallet?.address ? (
          <div className="space-y-0 sm:space-y-4 lg:space-y-8">
            {/* Header Desktop - oculto no mobile */}
            <div className="hidden lg:block">
              <DashboardHeader 
                userEmail={typeof user.email === 'string' ? user.email : user.email?.address}
              />
            </div>

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
        ) : (
          // Se não tiver dados do servidor, mostrar loading
          // ProtectedRoute já vai fazer redirect se necessário
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-emerald-500 rounded-xl mx-auto mb-4 flex items-center justify-center animate-pulse">
                <svg className="h-8 w-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <p className="text-white text-lg">Carregando...</p>
            </div>
          </div>
        )}
      </AppLayout>
    </ProtectedRoute>
  );
}

