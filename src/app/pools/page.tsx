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

  // Buscar pools específicas da API interna
  const { data: poolsData, isLoading: poolsLoading, error: poolsError } = useQuery({
    queryKey: ['specific-pools', sortBy],
    queryFn: async () => {
      try {
        console.log('🚀 Buscando pools específicas da API interna...');
        
        const response = await fetch('/api/liquidity/pools');
        if (!response.ok) {
          throw new Error(`Erro na API: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Dados recebidos:', data);
        
        if (!data.pools || data.pools.length === 0) {
          console.log('⚠️ Nenhuma pool encontrada');
          return [];
        }
        
        // Processar pools com métricas calculadas
        const processedPools = data.pools.map((pool: any) => {
          const metrics = pool.metrics;
          
          return {
            id: pool.id,
            protocol: pool.provider?.name || "Uniswap V3",
            tokenPair: pool.tokenPair,
            token1: { 
              symbol: pool.tokens[0]?.symbol?.toUpperCase() || 'TOKEN1', 
              logo: pool.tokens[0]?.logo || "💙", 
              color: "blue" 
            },
            token2: { 
              symbol: pool.tokens[1]?.symbol?.toUpperCase() || 'TOKEN2', 
              logo: pool.tokens[1]?.logo || "💚", 
              color: "green" 
            },
            rentabilidade: metrics.formatted.apr,
            tvl: metrics.formatted.tvl,
            tarifa: `${pool.fee}%`,
            volume24h: metrics.formatted.volume24h,
            composition: metrics.formatted.composition,
            // Dados adicionais
            address: pool.address,
            chain: pool.chain,
            provider: pool.provider,
            stats: pool.stats,
            tokens: pool.tokens,
            fee: pool.fee,
            metrics: metrics
          };
        });
        
        // Aplicar ordenação baseada no sortBy
        const sortedPools = [...processedPools].sort((a, b) => {
          switch (sortBy) {
            case 'rentabilidade':
              return b.metrics.apr - a.metrics.apr;
              
            case 'tvl':
              return b.metrics.tvl - a.metrics.tvl;
              
            case 'tarifa':
              return b.fee - a.fee;
              
            case 'volume':
              return b.metrics.volume24h - a.metrics.volume24h;
              
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Pools de Liquidez</h1>
          <p className="text-white text-sm">Disponíveis - {poolsData?.length || 0}</p>
        </div>
        <Button
          onClick={() => setShowSortModal(true)}
          variant="outline"
          className="border-yellow-500/30 text-yellow-400 hover:text-yellow-300 hover:border-yellow-400 text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-300 bg-yellow-500/10 hover:bg-yellow-500/20"
        >
          Rent. estimada ↓
        </Button>
      </div>

      {/* Lista de Pools */}
      <div className="space-y-3">
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
              className="bg-slate-700/40 border border-slate-600/40 rounded-xl cursor-pointer hover:bg-slate-600/40 hover:border-slate-500/60 transition-all duration-300 shadow-md hover:shadow-lg"
              onClick={() => handlePoolClick(pool)}
            >
              <CardContent className="p-4">
                {/* Top Row: Protocol and Rent. estimada */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white text-sm font-medium">{String(pool.protocol || 'Uniswap V3')}</span>
                  <div className="flex items-center space-x-1">
                    <span className="text-white text-sm font-medium">Rent. estimada</span>
                    <Info className="h-3 w-3 text-slate-400" />
                  </div>
                </div>

                {/* Second Row: Token Pair and APR */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {/* Token Icons */}
                    <div className="relative flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-slate-600">
                        {pool.token1?.logo && typeof pool.token1.logo === 'string' && pool.token1.logo.startsWith('http') ? (
                          <img 
                            src={pool.token1.logo} 
                            alt={pool.token1?.symbol || 'Token1'} 
                            className="w-5 h-5 rounded-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                              if (nextElement) {
                                nextElement.style.display = 'block';
                              }
                            }}
                          />
                        ) : null}
                        <span className="text-sm" style={{ display: pool.token1?.logo && typeof pool.token1.logo === 'string' && pool.token1.logo.startsWith('http') ? 'none' : 'block' }}>
                          {String(pool.token1?.logo || '💙')}
                        </span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center border border-slate-600 -ml-2">
                        {pool.token2?.logo && typeof pool.token2.logo === 'string' && pool.token2.logo.startsWith('http') ? (
                          <img 
                            src={pool.token2.logo} 
                            alt={pool.token2?.symbol || 'Token2'} 
                            className="w-5 h-5 rounded-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                              if (nextElement) {
                                nextElement.style.display = 'block';
                              }
                            }}
                          />
                        ) : null}
                        <span className="text-sm" style={{ display: pool.token2?.logo && typeof pool.token2.logo === 'string' && pool.token2.logo.startsWith('http') ? 'none' : 'block' }}>
                          {String(pool.token2?.logo || '💚')}
                        </span>
                      </div>
                    </div>
                    
                    {/* Token Pair Name */}
                    <h3 className="text-white font-bold text-base">{String(pool.tokenPair || 'N/A')}</h3>
                  </div>
                  
                  {/* APR */}
                  <p className="text-green-400 font-bold text-base">{String(pool.rentabilidade || 'N/A')}</p>
                </div>

                {/* Third Row: Labels */}
                <div className="grid grid-cols-3 gap-4 mb-2">
                  <div className="text-center">
                    <p className="text-white text-sm font-medium">TVL</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white text-sm font-medium">Tarifa</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white text-sm font-medium">Volume (24h)</p>
                  </div>
                </div>

                {/* Fourth Row: Values */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-white font-bold text-base">{String(pool.tvl || 'N/A')}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white font-bold text-base">{String(pool.tarifa || 'N/A')}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white font-bold text-base">{String(pool.volume24h || 'N/A')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            );
          });
        })()}
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