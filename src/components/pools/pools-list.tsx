/**
 * Pools List Component (Client)
 * Lista de pools com cards interativos
 */

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Info, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Pool {
  id: string;
  protocol?: string;
  tokenPair?: string;
  token1?: { symbol: string; logo: string; color: string };
  token2?: { symbol: string; logo: string; color: string };
  rentabilidade?: string;
  tvl?: string;
  tarifa?: string;
  volume24h?: string;
  composition?: string;
  address?: string;
  chain?: any;
  provider?: any;
  stats?: any;
  tokens?: any[];
  fee?: number;
  metrics?: {
    apr: number;
    formatted: {
      apr: string;
      tvl: string;
      volume24h: string;
      composition: string;
    };
  };
}

interface PoolsListProps {
  pools: Pool[];
  sortBy: "rentabilidade" | "tvl" | "tarifa" | "volume";
  sortDirection: "asc" | "desc";
  onSortClick: () => void;
  walletAddress?: string;
}

export function PoolsList({
  pools,
  sortBy,
  sortDirection,
  onSortClick,
  walletAddress,
}: PoolsListProps) {
  const router = useRouter();
  const [showAprTooltip, setShowAprTooltip] = useState(false);

  const handlePoolClick = (pool: Pool) => {
    router.push(`/pools/${pool.id}`);
  };

  if (pools.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-400">Nenhum pool encontrado</p>
        <p className="text-slate-500 text-sm mt-1">Tente novamente mais tarde</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
        <div>
          <p className="text-white text-sm">Disponíveis - {pools.length}</p>
        </div>
        <Button
          onClick={onSortClick}
          variant="outline"
          className="border-yellow-500/30 text-yellow-400 hover:text-yellow-300 hover:border-yellow-400 text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-300 bg-yellow-500/10 hover:bg-yellow-500/20"
        >
          {sortBy === 'rentabilidade' ? 'Rent. estimada' : 
           sortBy === 'tvl' ? 'TVL' :
           sortBy === 'tarifa' ? 'Tarifa' : 'Volume (24h)'} {sortDirection === 'desc' ? '↓' : '↑'}
        </Button>
      </div>

      {/* Lista de Pools */}
      <div className="space-y-3">
        {pools.map((pool) => {
          if (!pool || typeof pool !== 'object') {
            return null;
          }

          const token1Symbol = pool.tokens?.[0]?.symbol?.toUpperCase() || pool.token1?.symbol || 'TOKEN1';
          const token2Symbol = pool.tokens?.[1]?.symbol?.toUpperCase() || pool.token2?.symbol || 'TOKEN2';
          const token1Logo = pool.tokens?.[0]?.logo || pool.token1?.logo || '';
          const token2Logo = pool.tokens?.[1]?.logo || pool.token2?.logo || '';
          const protocol = pool.provider?.name || pool.protocol || 'Uniswap V3';
          const apr = pool.metrics?.formatted?.apr || pool.rentabilidade || '0%';
          const tvl = pool.metrics?.formatted?.tvl || pool.tvl || '$0';
          const fee = pool.tarifa || `${pool.fee}%` || '0%';
          const volume24h = pool.metrics?.formatted?.volume24h || pool.volume24h || '$0';
          const composition = pool.metrics?.formatted?.composition || pool.composition || '50/50';

          // Verificar se os logos são URLs válidas
          const hasToken1Logo = token1Logo && (token1Logo.startsWith('http') || token1Logo.startsWith('data:') || token1Logo.startsWith('/'));
          const hasToken2Logo = token2Logo && (token2Logo.startsWith('http') || token2Logo.startsWith('data:') || token2Logo.startsWith('/'));

          return (
            <Card 
              key={pool.id}
              className="bg-slate-700/40 border border-slate-600/40 rounded-xl cursor-pointer hover:bg-slate-600/40 hover:border-slate-500/60 transition-all duration-300 shadow-md hover:shadow-lg"
              onClick={() => handlePoolClick(pool)}
            >
              <CardContent className="p-4">
                {/* Top Row: Protocol and Rent. estimada */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white text-sm font-medium">{protocol}</span>
                  <div className="flex items-center space-x-1">
                    <span className="text-white text-sm font-medium">Rent. estimada</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAprTooltip(!showAprTooltip);
                      }}
                      className="hover:bg-slate-600 rounded-full p-1 transition-colors"
                    >
                      <Info className="h-3 w-3 text-slate-400 hover:text-white" />
                    </button>
                  </div>
                </div>

                {/* Second Row: Token Pair and APR */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {/* Token Icons */}
                    <div className="relative flex items-center">
                      {/* Token 1 Icon */}
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center z-10 border-2 border-slate-800 overflow-hidden">
                        {hasToken1Logo ? (
                          <img 
                            src={token1Logo} 
                            alt={token1Symbol}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <span 
                          className="text-white text-xs font-semibold"
                          style={{ display: hasToken1Logo ? 'none' : 'flex' }}
                        >
                          {token1Symbol.slice(0, 2)}
                        </span>
                      </div>
                      
                      {/* Token 2 Icon */}
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center -ml-2 z-20 border-2 border-slate-800 overflow-hidden">
                        {hasToken2Logo ? (
                          <img 
                            src={token2Logo} 
                            alt={token2Symbol}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <span 
                          className="text-white text-xs font-semibold"
                          style={{ display: hasToken2Logo ? 'none' : 'flex' }}
                        >
                          {token2Symbol.slice(0, 2)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-white font-semibold text-sm">
                        {token1Symbol}/{token2Symbol}
                      </div>
                      <div className="text-slate-400 text-xs">{composition}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-yellow-400 font-bold text-lg">{apr}</div>
                    <div className="text-slate-400 text-xs">APR estimado</div>
                  </div>
                </div>

                {/* Third Row: TVL, Fee, Volume */}
                <div className="grid grid-cols-3 gap-4 pt-3 border-t border-slate-600/40">
                  <div>
                    <div className="text-slate-400 text-xs mb-1">TVL</div>
                    <div className="text-white text-sm font-medium">{tvl}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-xs mb-1">Tarifa</div>
                    <div className="text-white text-sm font-medium">{fee}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-xs mb-1">Volume (24h)</div>
                    <div className="text-white text-sm font-medium">{volume24h}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* APR Tooltip */}
      {showAprTooltip && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAprTooltip(false)}>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-white font-bold text-lg mb-2">O que é APR?</h3>
            <p className="text-slate-300 text-sm">
              APR (Annual Percentage Rate) é a taxa de retorno anual estimada baseada em dados históricos. 
              Valores passados não garantem resultados futuros.
            </p>
            <Button 
              onClick={() => setShowAprTooltip(false)}
              className="mt-4 w-full bg-yellow-500 hover:bg-yellow-600 text-slate-900"
            >
              Entendi
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

