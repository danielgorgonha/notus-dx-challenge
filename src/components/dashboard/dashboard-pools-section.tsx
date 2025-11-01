/**
 * Dashboard Pools Section (Mobile)
 * Lista pools de liquidez com APR e TVL
 */

"use client";

import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";

interface PoolItemProps {
  pool: {
    id: string;
    tokenPair: string;
    tokens: Array<{ symbol: string; logo?: string }>;
    provider?: { name: string };
    apr?: number;
    tvl?: number;
  };
}

function PoolItem({ pool }: PoolItemProps) {
  const router = useRouter();
  const token1 = pool.tokens?.[0];
  const token2 = pool.tokens?.[1];
  
  const token1Logo = token1?.logo;
  const token2Logo = token2?.logo;
  
  const hasToken1Logo = token1Logo && (token1Logo.startsWith('http') || token1Logo.startsWith('data:') || token1Logo.startsWith('/'));
  const hasToken2Logo = token2Logo && (token2Logo.startsWith('http') || token2Logo.startsWith('data:') || token2Logo.startsWith('/'));

  const formatTVL = (tvl: number) => {
    if (tvl >= 1000000) {
      return `$${(tvl / 1000000).toFixed(1)}M`;
    }
    if (tvl >= 1000) {
      return `$${(tvl / 1000).toFixed(1)}K`;
    }
    return `$${tvl.toFixed(2)}`;
  };

  return (
    <button
      onClick={() => router.push(`/pools/${pool.id}`)}
      className="w-full bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/50 rounded-xl p-4 flex items-center justify-between hover:border-slate-600/70 transition-colors text-left"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Ícones dos tokens sobrepostos */}
        <div className="relative flex items-center flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center z-10 border-2 border-slate-800 overflow-hidden">
            {hasToken1Logo ? (
              <img 
                src={token1Logo} 
                alt={token1?.symbol || ''}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            <span 
              className="text-white text-xs font-bold"
              style={{ display: hasToken1Logo ? 'none' : 'flex' }}
            >
              {token1?.symbol?.slice(0, 2) || 'T1'}
            </span>
          </div>
          
          {token2 && (
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center -ml-2 z-20 border-2 border-slate-800 overflow-hidden">
              {hasToken2Logo ? (
                <img 
                  src={token2Logo} 
                  alt={token2.symbol || ''}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              ) : null}
              <span 
                className="text-white text-xs font-bold"
                style={{ display: hasToken2Logo ? 'none' : 'flex' }}
              >
                {token2.symbol?.slice(0, 2) || 'T2'}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-white font-bold text-sm truncate">{pool.tokenPair}</div>
          <div className="text-slate-400 text-xs font-medium">
            {pool.provider?.name || 'Unknown'}
          </div>
        </div>
      </div>

      <div className="text-right flex-shrink-0 ml-4">
        <div className="text-green-400 font-bold text-sm">
          {pool.apr !== undefined ? `${pool.apr.toFixed(2)}% a.a.` : 'N/A'}
        </div>
        <div className="text-slate-400 text-xs font-medium">
          {pool.tvl && pool.tvl > 0 ? formatTVL(pool.tvl) : 'N/A'} TVL
        </div>
      </div>
    </button>
  );
}

interface DashboardPoolsSectionProps {
  pools?: Array<{
    id: string;
    tokenPair: string;
    tokens: Array<{ symbol: string; logo?: string }>;
    provider?: { name: string };
    apr?: number;
    tvl?: number;
    totalValueLockedUSD?: number | string;
    metrics?: { apr?: number };
  }>;
}

export function DashboardPoolsSection({ pools = [] }: DashboardPoolsSectionProps) {
  const router = useRouter();

  // Processar pools para exibir
  const processedPools = pools.slice(0, 3).map((pool: any) => {
    // Extrair APR de diferentes formatos possíveis
    let apr: number | undefined;
    if (pool.metrics?.apr) {
      apr = typeof pool.metrics.apr === 'string' 
        ? parseFloat(pool.metrics.apr.replace('%', '').replace('a.a.', '').trim())
        : pool.metrics.apr;
    } else if (pool.apr) {
      apr = typeof pool.apr === 'string'
        ? parseFloat(pool.apr.replace('%', '').replace('a.a.', '').trim())
        : pool.apr;
    } else if (pool.metrics?.formatted?.apr) {
      const aprStr = pool.metrics.formatted.apr;
      apr = parseFloat(aprStr.replace('%', '').replace('a.a.', '').trim());
    }

    // Extrair TVL de diferentes formatos possíveis
    let tvl: number = 0;
    if (pool.totalValueLockedUSD) {
      tvl = typeof pool.totalValueLockedUSD === 'string' 
        ? parseFloat(pool.totalValueLockedUSD.replace(/[$,]/g, ''))
        : pool.totalValueLockedUSD;
    } else if (pool.tvl) {
      tvl = typeof pool.tvl === 'string'
        ? parseFloat(pool.tvl.replace(/[$,]/g, ''))
        : pool.tvl;
    } else if (pool.metrics?.tvl) {
      tvl = typeof pool.metrics.tvl === 'string'
        ? parseFloat(pool.metrics.tvl.replace(/[$,]/g, ''))
        : pool.metrics.tvl;
    }

    return {
      id: pool.id,
      tokenPair: pool.tokenPair || `${pool.tokens?.[0]?.symbol || 'T1'}/${pool.tokens?.[1]?.symbol || 'T2'}`,
      tokens: pool.tokens || [],
      provider: pool.provider,
      apr,
      tvl
    };
  });

  return (
    <div className="lg:hidden px-5 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-bold text-lg">Pools de liquidez</h2>
        <button
          onClick={() => router.push('/pools')}
          className="text-yellow-400 hover:text-yellow-300 text-sm font-semibold flex items-center gap-1"
        >
          Ver todas
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-3">
        {processedPools.length > 0 ? (
          processedPools.map((pool) => (
            <PoolItem key={pool.id} pool={pool} />
          ))
        ) : (
          <div className="text-slate-400 text-sm text-center py-8">
            Nenhum pool disponível
          </div>
        )}
      </div>
    </div>
  );
}

