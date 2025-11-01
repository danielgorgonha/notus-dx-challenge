/**
 * Pool Detail Page - Server Component
 * Tela de detalhes de uma pool de liquidez
 */

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { getWalletAddress, getHistory } from "@/lib/actions/dashboard";
import { GetPoolUseCase } from "@/server/use-cases/pool";
import { createPoolService } from "@/server/services";
import { AppLayout } from "@/components/layout/app-layout";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { PoolDetailClient } from "@/components/pools/pool-detail-client";

interface PoolDetailPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

export default async function PoolDetailPage({ params }: PoolDetailPageProps) {
  // Autenticação no servidor
  const user = await auth();
  
  if (!user || !user.wallet?.address) {
    redirect("/");
  }

  const { id: poolId } = await params;
  const externallyOwnedAccount = user.wallet.address;
  
  // Buscar wallet address primeiro para obter accountAbstraction
  const walletData = await getWalletAddress({ externallyOwnedAccount });
  const wallet = walletData.wallet;
  const accountAbstractionAddress = wallet?.accountAbstraction || user.accountAbstractionAddress;

  // Buscar dados no servidor
  const [poolData, userHistory] = await Promise.all([
    (async () => {
      try {
        const poolService = createPoolService();
        const getPoolUseCase = new GetPoolUseCase(poolService);
        const pool = await getPoolUseCase.execute({ poolId, rangeInDays: 30 });
        return (pool as any).pool || pool;
      } catch (error) {
        console.error('❌ Erro ao buscar pool:', error);
        return null;
      }
    })(),
    getHistory(accountAbstractionAddress || '', { take: 100 }).catch(() => ({ transactions: [] })),
  ]);

  if (!poolData) {
    redirect("/pools");
  }

  // Buscar posição do usuário nessa pool (transações de liquidez)
  // Encontrar a transação mais recente de criação de liquidez nesta pool
  const userLiquidityTx = (userHistory?.transactions || [])
    .filter((tx: any) => {
      const txPoolId = 
        tx.metadata?.poolId || 
        tx.metadata?.pool_id || 
        tx.metadata?.poolAddress ||
        (tx.metadata?.chainId && tx.metadata?.poolAddress 
          ? `${tx.metadata.chainId}-${tx.metadata.poolAddress}` 
          : null);
      return txPoolId === poolId && (
        tx.type?.toLowerCase() === 'liquidity' || 
        tx.type?.toLowerCase() === 'invest' ||
        tx.metadata?.type === 'liquidity'
      );
    })
    .sort((a: any, b: any) => {
      // Ordenar por data (mais recente primeiro)
      const dateA = new Date(a.timestamp || a.createdAt || 0).getTime();
      const dateB = new Date(b.timestamp || b.createdAt || 0).getTime();
      return dateB - dateA;
    })[0]; // Pegar a mais recente

  // Processar dados da posição do usuário
  const userPosition = userLiquidityTx ? {
    ...userLiquidityTx,
    // Extrair valores dos tokens se disponíveis
    token0Amount: userLiquidityTx.metadata?.operation?.token0Amount || 
                  userLiquidityTx.metadata?.token0Amount || 
                  userLiquidityTx.amounts?.[0] || '0',
    token1Amount: userLiquidityTx.metadata?.operation?.token1Amount || 
                  userLiquidityTx.metadata?.token1Amount || 
                  userLiquidityTx.amounts?.[1] || '0',
    totalValue: userLiquidityTx.balanceUSD || 
                userLiquidityTx.amountUSD || 
                userLiquidityTx.valueUSD || '0',
  } : null;

  return (
    <ProtectedRoute>
      <AppLayout 
        title={`${poolData.tokens?.[0]?.symbol || ''}/${poolData.tokens?.[1]?.symbol || ''} - Pool`}
        description={`Detalhes da pool de liquidez`}
        showHeader={false}
      >
        <PoolDetailClient
          pool={poolData}
          userPosition={userPosition}
          walletAddress={accountAbstractionAddress || ''}
          poolId={poolId}
        />
      </AppLayout>
    </ProtectedRoute>
  );
}

