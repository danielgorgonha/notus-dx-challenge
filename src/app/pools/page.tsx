/**
 * Pools Page - Server Component
 * Busca pools no servidor e renderiza componentes client-side para interatividade
 */

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { getWalletAddress } from "@/lib/actions/dashboard";
import { listPools } from "@/lib/actions/pools";
import { AppLayout } from "@/components/layout/app-layout";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { PoolsClient } from "@/components/pools/pools-client";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplets } from "lucide-react";

export default async function PoolsPage() {
  // Autenticação no servidor
  const user = await auth();
  
  if (!user || !user.wallet?.address) {
    redirect("/");
  }

  const externallyOwnedAccount = user.wallet.address;
  
  // Buscar wallet address primeiro
  const walletData = await getWalletAddress({ externallyOwnedAccount });
  const wallet = walletData.wallet;
  const accountAbstractionAddress = wallet?.accountAbstraction || user.accountAbstractionAddress;

  // Buscar pools no servidor
  const poolsData = await listPools();

  // Processar pools para o formato esperado pelo componente client
  const processedPools = (poolsData.pools || []).map((pool: any) => ({
    id: pool.id,
    protocol: pool.provider?.name || 'Uniswap V3',
    tokenPair: pool.tokenPair,
    token1: { 
      symbol: pool.tokens[0]?.symbol?.toUpperCase() || 'TOKEN1', 
      logo: pool.tokens[0]?.logo || '', 
      color: 'blue' 
    },
    token2: { 
      symbol: pool.tokens[1]?.symbol?.toUpperCase() || 'TOKEN2', 
      logo: pool.tokens[1]?.logo || '', 
      color: 'green' 
    },
    rentabilidade: pool.metrics?.formatted?.apr || '0%',
    tvl: pool.metrics?.formatted?.tvl || '$0',
    tarifa: pool.tarifa || `${pool.fee}%`,
    volume24h: pool.metrics?.formatted?.volume24h || '$0',
    composition: pool.metrics?.formatted?.composition || '50/50',
    address: pool.address,
    chain: pool.chain,
    provider: pool.provider,
    stats: pool.stats,
    tokens: pool.tokens,
    fee: pool.fee,
    metrics: pool.metrics,
  }));

  return (
    <ProtectedRoute>
      <AppLayout 
        title="Liquidity Pools"
        description="Adicione liquidez e ganhe rendimentos passivos"
      >
        <div className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500/80 to-purple-600/80 rounded-xl flex items-center justify-center">
                  <Droplets className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-white">Liquidity Pools</CardTitle>
                  <p className="text-slate-400 text-sm mt-1">
                    {processedPools.length} {processedPools.length === 1 ? 'pool disponível' : 'pools disponíveis'}
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>

          <PoolsClient
            initialPools={processedPools}
            walletAddress={accountAbstractionAddress || undefined}
          />
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}

