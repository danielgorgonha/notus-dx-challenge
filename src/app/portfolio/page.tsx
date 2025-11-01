/**
 * Portfolio Page - Server Component
 * Tela de Portfolio com tabs Carteira e Atividades
 */

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { getWalletAddress, getPortfolio, getHistory } from "@/lib/actions/dashboard";
import { getUserPools } from "@/lib/actions/user-pools";
import { AppLayout } from "@/components/layout/app-layout";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { PortfolioClient } from "@/components/portfolio/portfolio-client";

export const dynamic = 'force-dynamic';

export default async function PortfolioPage() {
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

  // Buscar dados no servidor
  const [portfolio, history, poolsData] = await Promise.all([
    getPortfolio(accountAbstractionAddress || '').catch((error) => {
      console.error('❌ Erro ao buscar portfolio:', error);
      return { tokens: [], totalValueUSD: '0' };
    }),
    getHistory(accountAbstractionAddress || '', { take: 100 }).catch((error) => {
      console.error('❌ Erro ao buscar histórico:', error);
      return { transactions: [], total: 0 };
    }),
    getUserPools(accountAbstractionAddress || '').catch((error) => {
      console.error('❌ Erro ao buscar pools do usuário:', error);
      return { pools: [], total: 0 };
    }),
  ]);
    totalValueUSD: portfolio?.totalValueUSD,
    historyCount: history?.transactions?.length || 0,
    poolsCount: poolsData?.pools?.length || 0,
  });

  // Calcular totais (usar balanceUSD da API Notus)
  const totalBalance = portfolio?.tokens?.reduce((sum: number, token: any) => {
    return sum + parseFloat(token.balanceUSD || token.balanceUsd || '0');
  }, 0) || 0;

  return (
    <ProtectedRoute>
      <AppLayout 
        title="Portfólio"
        description="Visualize seu patrimônio e histórico de transações"
        showHeader={false}
      >
        <PortfolioClient
          initialPortfolio={portfolio}
          initialHistory={history}
          initialPools={poolsData?.pools || []}
          accountAbstractionAddress={accountAbstractionAddress || ''}
          totalBalance={totalBalance}
        />
      </AppLayout>
    </ProtectedRoute>
  );
}

