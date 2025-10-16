"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Info,
  Filter,
  DollarSign,
  Clock,
  Home,
  Wallet,
  Coins,
  LineChart
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSmartWallet } from "@/hooks/use-smart-wallet";
import { useToast } from "@/hooks/use-toast";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { liquidityActions } from "@/lib/actions/liquidity";
import { useQuery } from "@tanstack/react-query";
import { calculatePoolRentability } from "@/lib/utils/rentability-calculator";
import { getFilterConfig, filterActivePools, sortPoolsByActivity } from "@/lib/utils/pool-filters";

export default function PoolsPage() {
  const router = useRouter();
  const { wallet } = useSmartWallet();
  const toast = useToast();
  
  // Estados principais
  const [selectedPool, setSelectedPool] = useState<any>(null);
  const [sortBy, setSortBy] = useState<"rentabilidade" | "tvl" | "tarifa" | "volume">("rentabilidade");
  const [showSortModal, setShowSortModal] = useState(false);

  const walletAddress = wallet?.accountAbstraction;

  // Buscar pools de liquidez da API da Notus
  const { data: poolsData, isLoading: poolsLoading, error: poolsError } = useQuery({
    queryKey: ['liquidity-pools', sortBy],
    queryFn: async () => {
      try {
        console.log('🚀 Buscando pools da API da Notus');
        const filterConfig = getFilterConfig('high_activity');
        
        const response = await liquidityActions.listPools(filterConfig);
        const apiResponse = response as { pools: any[] };
        
        if (!apiResponse.pools || apiResponse.pools.length === 0) {
          console.log('⚠️ Nenhum pool encontrado');
          return [];
        }
        
        // Filtrar pools com atividade
        const activePools = filterActivePools(apiResponse.pools, {
          minTvl: 0.01,
          minFees: 0,
          minVolume: 0,
          popularTokens: true,
          recentActivity: true
        });
        
        console.log(`📊 Pools filtrados: ${activePools.length} de ${apiResponse.pools.length}`);
        
        // Fallback se não há pools ativos
        if (activePools.length === 0) {
          const fallbackPools = filterActivePools(apiResponse.pools, {
            minTvl: 0,
            minFees: 0,
            minVolume: 0,
            popularTokens: false,
            recentActivity: false
          });
          activePools.push(...fallbackPools);
        }
        
        // Ordenar por atividade
        const activitySortedPools = sortPoolsByActivity(activePools, 'activity');
        
        // Processar pools
        const processedPools = activitySortedPools.map((pool: any) => {
          // Extrair dados com verificações de tipo
          const tvl = typeof pool.totalValueLockedUSD === 'number' 
            ? pool.totalValueLockedUSD 
            : parseFloat(pool.totalValueLockedUSD) || 0;
          const volume24h = typeof pool.stats?.volumeInUSD === 'number' 
            ? pool.stats.volumeInUSD 
            : parseFloat(pool.stats?.volumeInUSD) || 0;
          const fee = typeof pool.fee === 'number' 
            ? pool.fee 
            : parseFloat(pool.fee) || 0;
          
          // Calcular rentabilidade
          const rentability = calculatePoolRentability(pool);
          const apr = rentability.apr.toFixed(2);
          
          // Formatar valores
          const formatValue = (value: any) => {
            const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;
            if (numValue >= 1000000) return `$${(numValue / 1000000).toFixed(1)}M`;
            if (numValue >= 1000) return `$${(numValue / 1000).toFixed(1)}K`;
            if (numValue >= 1) return `$${numValue.toFixed(2)}`;
            if (numValue >= 0.01) return `$${numValue.toFixed(4)}`;
            if (numValue >= 0.0001) return `$${numValue.toFixed(6)}`;
            if (numValue > 0) return `$${numValue.toFixed(8)}`;
            return `$0.00`;
          };
          
          // Processar tokens com verificações de segurança
          const token0 = pool.tokens?.[0];
          const token1 = pool.tokens?.[1];
          
          const safeToken0Symbol = typeof token0?.symbol === 'string' 
            ? token0.symbol.toUpperCase() 
            : 'TOKEN1';
          const safeToken1Symbol = typeof token1?.symbol === 'string' 
            ? token1.symbol.toUpperCase() 
            : 'TOKEN2';
          const safeToken0Logo = typeof token0?.logo === 'string' 
            ? token0.logo 
            : "💙";
          const safeToken1Logo = typeof token1?.logo === 'string' 
            ? token1.logo 
            : "💚";
          
          return {
            id: pool.id,
            protocol: typeof pool.provider === 'string' ? pool.provider : "Uniswap V3",
            tokenPair: `${safeToken0Symbol}/${safeToken1Symbol}`,
            token1: { 
              symbol: safeToken0Symbol, 
              logo: safeToken0Logo, 
              color: "blue" 
            },
            token2: { 
              symbol: safeToken1Symbol, 
              logo: safeToken1Logo, 
              color: "green" 
            },
            rentabilidade: `${apr}% a.a.`,
            tvl: formatValue(tvl),
            tarifa: `${fee}%`,
            volume24h: formatValue(volume24h),
            // Dados adicionais da API
            address: pool.address,
            chain: pool.chain,
            provider: pool.provider,
            stats: pool.stats,
            tokens: pool.tokens,
            fee: pool.fee
          };
        });
        
        // Aplicar ordenação baseada no sortBy
        const sortedPools = [...processedPools].sort((a, b) => {
          switch (sortBy) {
            case 'rentabilidade':
              const aprA = parseFloat(a.rentabilidade.replace(/[% a.a]/g, '')) || 0;
              const aprB = parseFloat(b.rentabilidade.replace(/[% a.a]/g, '')) || 0;
              return aprB - aprA;
              
            case 'tvl':
              const tvlA = parseFloat(a.tvl.replace(/[$,MK]/g, '')) || 0;
              const tvlB = parseFloat(b.tvl.replace(/[$,MK]/g, '')) || 0;
              const multiplierA = a.tvl.includes('M') ? 1000000 : a.tvl.includes('K') ? 1000 : 1;
              const multiplierB = b.tvl.includes('M') ? 1000000 : b.tvl.includes('K') ? 1000 : 1;
              return (tvlB * multiplierB) - (tvlA * multiplierA);
              
            case 'tarifa':
              const feeA = parseFloat(a.tarifa.replace(/[%]/g, '')) || 0;
              const feeB = parseFloat(b.tarifa.replace(/[%]/g, '')) || 0;
              return feeB - feeA;
              
            case 'volume':
              const volA = parseFloat(a.volume24h.replace(/[$,MK]/g, '')) || 0;
              const volB = parseFloat(b.volume24h.replace(/[$,MK]/g, '')) || 0;
              const volMultiplierA = a.volume24h.includes('M') ? 1000000 : a.volume24h.includes('K') ? 1000 : 1;
              const volMultiplierB = b.volume24h.includes('M') ? 1000000 : b.volume24h.includes('K') ? 1000 : 1;
              return (volB * volMultiplierB) - (volA * volMultiplierA);
              
            default:
              return 0;
          }
        });
        
        console.log('✅ Pools processados:', sortedPools.length);
        return sortedPools;
        
      } catch (error) {
        console.error('❌ Erro ao buscar pools:', error);
        throw error;
      }
    },
    staleTime: 30000, // 30 segundos
  });

  const handlePoolClick = (pool: any) => {
    setSelectedPool(pool);
    router.push(`/pools/${pool.id}`);
  };

  const renderPoolsList = () => (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Pools de Liquidez</h1>
          <p className="text-slate-300 text-sm">Disponíveis - {poolsData?.length || 0}</p>
        </div>
        <Button
          onClick={() => setShowSortModal(true)}
          variant="outline"
          className="border-slate-600 text-slate-300 hover:text-white hover:border-slate-500 text-sm font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl bg-slate-800/50 hover:bg-slate-700/80 backdrop-blur-sm"
        >
          <Filter className="h-4 w-4 mr-2" />
          {sortBy === 'rentabilidade' && 'Rentabilidade estimada ↓'}
          {sortBy === 'tvl' && 'TVL ↓'}
          {sortBy === 'tarifa' && 'Tarifa ↓'}
          {sortBy === 'volume' && 'Volume (24h) ↓'}
        </Button>
      </div>

      {/* Resumo dos Pools */}
      <Card className="bg-gradient-to-r from-slate-800/60 to-slate-700/60 border border-slate-600/60 rounded-2xl mb-6 shadow-xl">
        <CardContent className="p-6">
          <div className="grid grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-500/20 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-400" />
              </div>
              <p className="text-slate-400 text-sm font-medium mb-1">TVL Total</p>
              <p className="text-white font-bold text-xl">
                {poolsData && poolsData.length > 0 
                  ? `$${(poolsData.reduce((sum, pool) => {
                      if (!pool.tvl || typeof pool.tvl !== 'string') return sum;
                      const tvl = parseFloat(pool.tvl.replace(/[$,MK]/g, '')) || 0;
                      const multiplier = pool.tvl.includes('M') ? 1000000 : pool.tvl.includes('K') ? 1000 : 1;
                      return sum + (tvl * multiplier);
                    }, 0) / 1000000).toFixed(1)}M`
                  : '$0.0M'
                }
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-yellow-400" />
              </div>
              <p className="text-slate-400 text-sm font-medium mb-1">Tarifa Média</p>
              <p className="text-white font-bold text-xl">
                {poolsData && poolsData.length > 0 
                  ? `${(poolsData.reduce((sum, pool) => sum + (parseFloat(pool.tarifa || pool.fee || '0') || 0), 0) / poolsData.length).toFixed(2)}%`
                  : '0.00%'
                }
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-500/20 flex items-center justify-center">
                <LineChart className="h-6 w-6 text-green-400" />
              </div>
              <p className="text-slate-400 text-sm font-medium mb-1">Volume (24h)</p>
              <p className="text-white font-bold text-xl">
                {poolsData && poolsData.length > 0 
                  ? `$${(poolsData.reduce((sum, pool) => {
                      if (!pool.volume24h || typeof pool.volume24h !== 'string') return sum;
                      const volume = parseFloat(pool.volume24h.replace(/[$,MK]/g, '')) || 0;
                      const multiplier = pool.volume24h.includes('M') ? 1000000 : pool.volume24h.includes('K') ? 1000 : 1;
                      return sum + (volume * multiplier);
                    }, 0) / 1000).toFixed(1)}K`
                  : '$0.0K'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Pools */}
      <div className="space-y-6">
        {(() => {
          if (poolsLoading) {
            return (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
                <span className="ml-2 text-slate-300">Carregando pools...</span>
              </div>
            );
          }
          
          if (poolsError) {
            return (
              <div className="text-center py-8">
                <p className="text-red-400">Erro ao carregar pools da API</p>
                <p className="text-slate-400 text-sm mt-1">Verifique a conexão com a API da Notus</p>
                <p className="text-slate-500 text-xs mt-2">Erro: {poolsError.message}</p>
              </div>
            );
          }
          
          if (!poolsData || poolsData.length === 0) {
            return (
              <div className="text-center py-8">
                <p className="text-slate-400">Nenhum pool encontrado</p>
                <p className="text-slate-500 text-sm mt-1">Tente novamente mais tarde</p>
              </div>
            );
          }
          
          return poolsData?.map((pool: any) => {
            if (!pool || typeof pool !== 'object') {
              return null;
            }
            
            return (
            <Card 
              key={pool.id}
              className="bg-slate-800/60 border border-slate-700/60 rounded-2xl cursor-pointer hover:bg-slate-700/40 hover:border-slate-600/60 transition-all duration-300 shadow-lg hover:shadow-xl"
              onClick={() => handlePoolClick(pool)}
            >
              <CardContent className="p-6">
                {/* Header Section */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    {/* Token Icons */}
                    <div className="relative flex items-center">
                      <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center border-2 border-slate-700 shadow-md">
                        {pool.token1?.logo && typeof pool.token1.logo === 'string' && pool.token1.logo.startsWith('http') ? (
                          <img 
                            src={pool.token1.logo} 
                            alt={pool.token1?.symbol || 'Token1'} 
                            className="w-8 h-8 rounded-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                              if (nextElement) {
                                nextElement.style.display = 'block';
                              }
                            }}
                          />
                        ) : null}
                        <span className="text-xl" style={{ display: pool.token1?.logo && typeof pool.token1.logo === 'string' && pool.token1.logo.startsWith('http') ? 'none' : 'block' }}>
                          {String(pool.token1?.logo || '💙')}
                        </span>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center border-2 border-slate-700 shadow-md -ml-3">
                        {pool.token2?.logo && typeof pool.token2.logo === 'string' && pool.token2.logo.startsWith('http') ? (
                          <img 
                            src={pool.token2.logo} 
                            alt={pool.token2?.symbol || 'Token2'} 
                            className="w-8 h-8 rounded-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                              if (nextElement) {
                                nextElement.style.display = 'block';
                              }
                            }}
                          />
                        ) : null}
                        <span className="text-xl" style={{ display: pool.token2?.logo && typeof pool.token2.logo === 'string' && pool.token2.logo.startsWith('http') ? 'none' : 'block' }}>
                          {String(pool.token2?.logo || '💚')}
                        </span>
                      </div>
                    </div>
                    
                    {/* Token Pair Info */}
                    <div className="flex flex-col">
                      <h3 className="text-white font-bold text-lg leading-tight">{String(pool.tokenPair || 'N/A')}</h3>
                      <p className="text-slate-400 text-sm font-medium">{String(pool.protocol || 'N/A')}</p>
                    </div>
                  </div>
                  
                  {/* Rentability Section */}
                  <div className="text-right">
                    <div className="flex items-center justify-end space-x-2 mb-2">
                      <span className="text-slate-400 text-sm font-medium">Rent. estimada</span>
                      <Info className="h-4 w-4 text-slate-400" />
                    </div>
                    <p className="text-green-400 font-bold text-lg">{String(pool.rentabilidade || 'N/A')}</p>
                  </div>
                </div>

                {/* Metrics Section */}
                <div className="grid grid-cols-3 gap-6 pt-4 border-t border-slate-700/50">
                  <div className="text-center">
                    <p className="text-slate-400 text-sm font-medium mb-1">TVL</p>
                    <p className="text-white font-bold text-base">{String(pool.tvl || 'N/A')}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-slate-400 text-sm font-medium mb-1">Tarifa</p>
                    <p className="text-white font-bold text-base">{String(pool.tarifa || 'N/A')}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-slate-400 text-sm font-medium mb-1">Volume (24h)</p>
                    <p className="text-white font-bold text-base">{String(pool.volume24h || 'N/A')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            );
          });
        })()}
      </div>

      {/* FAQ Section */}
      <div className="mt-8">
        <h2 className="text-white text-2xl font-bold mb-6">FAQ</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-slate-800/60 border border-slate-700/60 rounded-2xl cursor-pointer hover:bg-slate-700/40 hover:border-slate-600/60 transition-all duration-300 shadow-lg hover:shadow-xl group">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors duration-300">
                <Coins className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">O que são pools de liquidez?</h3>
              <p className="text-slate-400 text-sm">Entenda como funcionam os pools de liquidez e seus benefícios</p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/60 border border-slate-700/60 rounded-2xl cursor-pointer hover:bg-slate-700/40 hover:border-slate-600/60 transition-all duration-300 shadow-lg hover:shadow-xl group">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center group-hover:bg-green-500/30 transition-colors duration-300">
                <Wallet className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Como funcionam as pools na Notus DX?</h3>
              <p className="text-slate-400 text-sm">Descubra as funcionalidades exclusivas da nossa plataforma</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/60 border border-slate-700/60 rounded-2xl cursor-pointer hover:bg-slate-700/40 hover:border-slate-600/60 transition-all duration-300 shadow-lg hover:shadow-xl group">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-500/20 flex items-center justify-center group-hover:bg-yellow-500/30 transition-colors duration-300">
                <TrendingUp className="h-8 w-8 text-yellow-400" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Como funcionam os rendimentos?</h3>
              <p className="text-slate-400 text-sm">Aprenda sobre os diferentes tipos de rendimento disponíveis</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderSortModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold text-lg">Classificação</h2>
          <Button
            onClick={() => setShowSortModal(false)}
            variant="ghost"
            className="text-slate-400"
          >
            ✕
          </Button>
        </div>
        
        <div className="space-y-3">
          {[
            { key: "rentabilidade", label: "Rentabilidade estimada", icon: "↓" },
            { key: "tvl", label: "TVL" },
            { key: "tarifa", label: "Tarifa" },
            { key: "volume", label: "Volume (24h)" }
          ].map((option) => (
            <div
              key={option.key}
              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                sortBy === option.key ? "bg-slate-700/50" : "hover:bg-slate-700/30"
              }`}
              onClick={() => {
                setSortBy(option.key as any);
                setShowSortModal(false);
              }}
            >
              <span className="text-white">{option.label}</span>
              {option.icon && <span className="text-slate-400">{option.icon}</span>}
            </div>
          ))}
        </div>

        <Button
          onClick={() => setShowSortModal(false)}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold py-3 rounded-xl mt-6"
        >
          Aplicar
        </Button>
      </div>
    </div>
  );

  return (
    <ProtectedRoute>
      <AppLayout 
        title="Pools de Liquidez"
        description="Adicione liquidez aos pools e ganhe recompensas"
      >
        <div className="w-full max-w-4xl mx-auto px-6">
          {renderPoolsList()}
        </div>
        
        {showSortModal && renderSortModal()}
      </AppLayout>
    </ProtectedRoute>
  );
}