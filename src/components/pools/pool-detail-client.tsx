/**
 * Pool Detail Client Component
 * Gerencia estado e interatividade da tela de detalhes da pool
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PoolDetailHeader } from "./pool-detail-header";
import { PoolMetrics } from "./pool-metrics";
import { EstimatedProfitability } from "./estimated-profitability";
import { PoolYields } from "./pool-yields";
import { MyInvestment } from "./my-investment";
import { PoolInformation } from "./pool-information";
import { PoolActionButtons } from "./pool-action-buttons";

interface PoolDetailClientProps {
  pool: any;
  userPosition: any;
  walletAddress: string;
  poolId: string;
}

export function PoolDetailClient({
  pool,
  userPosition,
  walletAddress,
  poolId,
}: PoolDetailClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'investment' | 'info'>(
    userPosition ? 'investment' : 'info'
  );

  const token0 = pool?.tokens?.[0];
  const token1 = pool?.tokens?.[1];
  const hasUserPosition = !!userPosition;

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      {/* Header com logos sobrepostos e preço */}
      <PoolDetailHeader
        pool={pool}
        token0={token0}
        token1={token1}
        onBack={() => router.back()}
      />

      {/* Métricas: Tarifa, TVL, Tarifas 24h */}
      <PoolMetrics pool={pool} />

      {/* Rentabilidade estimada */}
      <EstimatedProfitability 
        pool={pool} 
        hasUserPosition={hasUserPosition}
      />

      {/* Tabs: Meu investimento / Informações */}
      <div className="px-4 lg:px-6">
        <div className="flex gap-2 border-b border-slate-700/50 mb-4">
          {hasUserPosition && (
            <button
              onClick={() => setActiveTab('investment')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'investment'
                  ? 'text-yellow-400 border-b-2 border-yellow-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Meu investimento
            </button>
          )}
          <button
            onClick={() => setActiveTab('info')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'info'
                ? 'text-yellow-400 border-b-2 border-yellow-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Informações
          </button>
        </div>
      </div>

      {/* Conteúdo das tabs */}
      {activeTab === 'investment' && hasUserPosition ? (
        <>
          {/* Rendimentos */}
          <PoolYields 
            pool={pool}
            token0={token0}
            token1={token1}
            walletAddress={walletAddress}
            poolId={poolId}
          />

          {/* Meu investimento */}
          <MyInvestment
            pool={pool}
            token0={token0}
            token1={token1}
            userPosition={userPosition}
          />
        </>
      ) : (
        <PoolInformation pool={pool} token0={token0} token1={token1} />
      )}

      {/* Botões de ação */}
      <PoolActionButtons
        poolId={poolId}
        hasUserPosition={hasUserPosition}
        onAddLiquidity={() => router.push(`/pools/${poolId}/add-liquidity`)}
        onRemoveLiquidity={() => router.push(`/pools/${poolId}/remove-liquidity`)}
      />
    </div>
  );
}

