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

export default function PoolsPage() {
  const router = useRouter();
  const { wallet } = useSmartWallet();
  const toast = useToast();
  
  // Estados principais
  const [selectedPool, setSelectedPool] = useState<any>(null);
  const [sortBy, setSortBy] = useState<"rentabilidade" | "tvl" | "tarifa" | "volume">("rentabilidade");
  const [showSortModal, setShowSortModal] = useState(false);

  const walletAddress = wallet?.accountAbstraction;

  // Buscar pools de liquidez da API
  const { data: poolsData, isLoading: poolsLoading, error: poolsError } = useQuery({
    queryKey: ['liquidity-pools', sortBy],
    queryFn: async () => {
      try {
        console.log('🚀 Fazendo chamada para API da Notus...');
        const response = await liquidityActions.listPools({
          take: 20,
          offset: 0,
          chainIds: "137", // Polygon
          filterWhitelist: false,
          rangeInDays: 30
        });
        console.log('✅ Chamada para liquidityActions.listPools concluída!');
        console.log('🔍 Response type:', typeof response);
        console.log('🔍 Response value:', response);
        
        console.log('🔍 API Response completa:', response);
        console.log('🔍 Tipo da resposta:', typeof response);
        console.log('🔍 Chaves da resposta:', Object.keys(response || {}));
        console.log('📊 Número de pools encontrados:', (response as any)?.pools?.length || 0);
        
        // Log detalhado da estrutura da resposta
        if (response) {
          console.log('📋 Estrutura completa da resposta:', JSON.stringify(response, null, 2));
        }
        
        if ((response as any)?.pools && (response as any).pools.length > 0) {
          console.log('📋 Primeiro pool (exemplo):', (response as any).pools[0]);
          console.log('📋 Estrutura do primeiro pool:', JSON.stringify((response as any).pools[0], null, 2));
          
          // Log de cada campo importante
          const firstPool = (response as any).pools[0];
          console.log('🔍 Campos do primeiro pool:');
          console.log('  - id:', firstPool.id);
          console.log('  - address:', firstPool.address);
          console.log('  - chain:', firstPool.chain);
          console.log('  - fee:', firstPool.fee);
          console.log('  - provider:', firstPool.provider);
          console.log('  - totalValueLockedUSD:', firstPool.totalValueLockedUSD);
          console.log('  - tokens:', firstPool.tokens);
          console.log('  - stats:', firstPool.stats);
        }
        
        // Mapear dados reais da API para o formato da interface
        const apiResponse = response as { pools: any[] };
        console.log('🔍 Estrutura da resposta:', apiResponse);
        
        if (!apiResponse.pools || apiResponse.pools.length === 0) {
          console.log('⚠️ Nenhum pool encontrado na resposta da API');
          return [];
        }
        
        const processedPools = apiResponse.pools.map((pool: any, index: number) => {
          console.log(`📋 Processando pool ${index + 1}:`, {
            id: pool.id,
            address: pool.address,
            chain: pool.chain,
            fee: pool.fee,
            provider: pool.provider,
            totalValueLockedUSD: pool.totalValueLockedUSD,
            tokens: pool.tokens,
            stats: pool.stats
          });
          
          console.log(`🔍 Dados brutos do pool ${index + 1}:`, JSON.stringify(pool, null, 2));
          
          // Verificar estrutura dos tokens
          console.log(`🔍 Tokens do pool ${index + 1}:`, {
            tokens: pool.tokens,
            token0: pool.tokens?.[0],
            token1: pool.tokens?.[1],
            token0Type: typeof pool.tokens?.[0],
            token1Type: typeof pool.tokens?.[1]
          });
          
          // Log detalhado dos tokens
          if (pool.tokens && Array.isArray(pool.tokens)) {
            console.log(`📋 Estrutura completa dos tokens do pool ${index + 1}:`, JSON.stringify(pool.tokens, null, 2));
            
            pool.tokens.forEach((token: any, tokenIndex: number) => {
              console.log(`🪙 Token ${tokenIndex + 1} do pool ${index + 1}:`, {
                index: tokenIndex,
                token: token,
                type: typeof token,
                keys: token ? Object.keys(token) : 'null/undefined',
                symbol: token?.symbol,
                logo: token?.logo,
                name: token?.name,
                address: token?.address,
                decimals: token?.decimals,
                chainId: token?.chainId
              });
            });
          } else {
            console.log(`⚠️ Tokens não é um array válido no pool ${index + 1}:`, pool.tokens);
          }
          
          // Usar dados reais da API com verificações de tipo
          const tvl = typeof pool.totalValueLockedUSD === 'number' ? pool.totalValueLockedUSD : parseFloat(pool.totalValueLockedUSD) || 0;
          const volume24h = typeof pool.stats?.volumeInUSD === 'number' ? pool.stats.volumeInUSD : parseFloat(pool.stats?.volumeInUSD) || 0;
          const fee = typeof pool.fee === 'number' ? pool.fee : parseFloat(pool.fee) || 0;
          
          console.log(`💰 Valores extraídos do pool ${index + 1}:`, {
            tvl: tvl,
            volume24h: volume24h,
            fee: fee,
            tvlType: typeof tvl,
            volumeType: typeof volume24h,
            feeType: typeof fee
          });
          
          // Calcular APR baseado nos dados reais
          const dailyVolume = volume24h;
          const dailyFees = (dailyVolume * fee) / 100;
          const annualFees = dailyFees * 365;
          const apr = tvl > 0 ? ((annualFees / tvl) * 100).toFixed(2) : "0.00";
          
          console.log(`📊 Cálculos do pool ${index + 1}:`, {
            dailyVolume: dailyVolume,
            dailyFees: dailyFees,
            annualFees: annualFees,
            apr: apr
          });
          
          // Formatar valores com verificação de tipo
          const formatValue = (value: any) => {
            const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;
            if (numValue >= 1000000) return `$${(numValue / 1000000).toFixed(1)}M`;
            if (numValue >= 1000) return `$${(numValue / 1000).toFixed(1)}K`;
            return `$${numValue.toFixed(2)}`;
          };
          
          // Processar tokens com verificações de segurança
          const token0 = pool.tokens?.[0];
          const token1 = pool.tokens?.[1];
          
          console.log(`🔧 Processando tokens do pool ${index + 1}:`, {
            token0: token0,
            token1: token1,
            token0Symbol: token0?.symbol,
            token1Symbol: token1?.symbol,
            token0Logo: token0?.logo,
            token1Logo: token1?.logo
          });
          
          const safeToken0Symbol = typeof token0?.symbol === 'string' ? token0.symbol.toUpperCase() : 'TOKEN1';
          const safeToken1Symbol = typeof token1?.symbol === 'string' ? token1.symbol.toUpperCase() : 'TOKEN2';
          const safeToken0Logo = typeof token0?.logo === 'string' ? token0.logo : "💙";
          const safeToken1Logo = typeof token1?.logo === 'string' ? token1.logo : "💚";
          
          console.log(`✅ Tokens processados do pool ${index + 1}:`, {
            safeToken0Symbol,
            safeToken1Symbol,
            safeToken0Logo,
            safeToken1Logo
          });
          
          // Log detalhado das logos para debug
          console.log(`🖼️ Logos dos tokens do pool ${index + 1}:`, {
            token0Logo: token0?.logo,
            token0LogoType: typeof token0?.logo,
            token0LogoIsUrl: token0?.logo && typeof token0?.logo === 'string' && token0.logo.startsWith('http'),
            token1Logo: token1?.logo,
            token1LogoType: typeof token1?.logo,
            token1LogoIsUrl: token1?.logo && typeof token1?.logo === 'string' && token1.logo.startsWith('http')
          });
          
          const result = {
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
            fee: pool.fee,
            rawData: pool // Para debug
          };
          
          console.log(`✅ Pool ${index + 1} processado:`, result);
          
          // Log final para verificar se os dados estão corretos
          console.log(`🎯 Dados finais do pool ${index + 1} para renderização:`, {
            id: result.id,
            tokenPair: result.tokenPair,
            token1: result.token1,
            token2: result.token2,
            protocol: result.protocol,
            rentabilidade: result.rentabilidade,
            tvl: result.tvl,
            tarifa: result.tarifa,
            volume24h: result.volume24h
          });
          
          return result;
        });
        
        console.log('🎯 Pools processados:', processedPools);
        
        // Aplicar ordenação baseada no sortBy
        const sortedPools = [...processedPools].sort((a, b) => {
          console.log(`🔄 Ordenando por: ${sortBy}`);
          
          switch (sortBy) {
            case 'rentabilidade':
              // Extrair valor numérico da rentabilidade (remover % e a.a)
              const aprA = parseFloat(a.rentabilidade.replace(/[% a.a]/g, '')) || 0;
              const aprB = parseFloat(b.rentabilidade.replace(/[% a.a]/g, '')) || 0;
              console.log(`📊 APR A: ${aprA}, APR B: ${aprB}`);
              return aprB - aprA; // Maior para menor
              
            case 'tvl':
              // Extrair valor numérico do TVL
              const tvlA = parseFloat(a.tvl.replace(/[$,MK]/g, '')) || 0;
              const tvlB = parseFloat(b.tvl.replace(/[$,MK]/g, '')) || 0;
              const multiplierA = a.tvl.includes('M') ? 1000000 : a.tvl.includes('K') ? 1000 : 1;
              const multiplierB = b.tvl.includes('M') ? 1000000 : b.tvl.includes('K') ? 1000 : 1;
              const finalTvlA = tvlA * multiplierA;
              const finalTvlB = tvlB * multiplierB;
              console.log(`💰 TVL A: ${finalTvlA}, TVL B: ${finalTvlB}`);
              return finalTvlB - finalTvlA; // Maior para menor
              
            case 'tarifa':
              // Extrair valor numérico da tarifa
              const feeA = parseFloat(a.tarifa.replace(/[%]/g, '')) || 0;
              const feeB = parseFloat(b.tarifa.replace(/[%]/g, '')) || 0;
              console.log(`💸 Fee A: ${feeA}, Fee B: ${feeB}`);
              return feeB - feeA; // Maior para menor
              
            case 'volume':
              // Extrair valor numérico do volume
              const volA = parseFloat(a.volume24h.replace(/[$,MK]/g, '')) || 0;
              const volB = parseFloat(b.volume24h.replace(/[$,MK]/g, '')) || 0;
              const volMultiplierA = a.volume24h.includes('M') ? 1000000 : a.volume24h.includes('K') ? 1000 : 1;
              const volMultiplierB = b.volume24h.includes('M') ? 1000000 : b.volume24h.includes('K') ? 1000 : 1;
              const finalVolA = volA * volMultiplierA;
              const finalVolB = volB * volMultiplierB;
              console.log(`📈 Volume A: ${finalVolA}, Volume B: ${finalVolB}`);
              return finalVolB - finalVolA; // Maior para menor
              
            default:
              return 0;
          }
        });
        
        console.log('✅ Pools ordenados:', sortedPools);
        return sortedPools;
        
      } catch (error) {
        console.error('❌ Erro ao buscar pools:', error);
        console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
        throw error; // Re-throw para mostrar erro real
      }
    },
    staleTime: 30000, // 30 segundos
  });

  // Logs para debug do estado da query
  console.log('🔍 Estado da Query:', {
    isLoading: poolsLoading,
    hasData: !!poolsData,
    dataLength: poolsData?.length || 0,
    hasError: !!poolsError,
    errorMessage: poolsError?.message
  });
  
  // Log detalhado dos dados quando disponíveis
  if (poolsData && poolsData.length > 0) {
    console.log('📊 Dados dos pools carregados:', {
      totalPools: poolsData.length,
      firstPool: poolsData[0],
      allPools: poolsData.map((pool, index) => ({
        index,
        id: pool.id,
        tokenPair: pool.tokenPair,
        token1: pool.token1,
        token2: pool.token2,
        protocol: pool.protocol
      }))
    });
    
    // Log simples para verificar se os dados estão sendo renderizados
    console.log('🎯 Primeiro pool para debug:', {
      id: poolsData[0]?.id,
      tokenPair: poolsData[0]?.tokenPair,
      token1: poolsData[0]?.token1,
      token2: poolsData[0]?.token2,
      protocol: poolsData[0]?.protocol,
      rentabilidade: poolsData[0]?.rentabilidade,
      tvl: poolsData[0]?.tvl,
      tarifa: poolsData[0]?.tarifa,
      volume24h: poolsData[0]?.volume24h
    });
  }

  const handlePoolClick = (pool: any) => {
    setSelectedPool(pool);
    // Navegar para a próxima tela (detalhes do pool)
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

      {/* Resumo dos Pools - Card único com métricas */}
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
                  ? `${(poolsData.reduce((sum, pool) => sum + (parseFloat(pool.tarifa) || 0), 0) / poolsData.length).toFixed(2)}%`
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
  console.log('🎨 Renderizando lista de pools:', {
    isLoading: poolsLoading,
    hasData: !!poolsData,
    dataLength: poolsData?.length || 0,
    hasError: !!poolsError
  });
  
  // Log simples para verificar se os dados estão sendo renderizados
  if (poolsData && poolsData.length > 0) {
    console.log('✅ Dados disponíveis para renderização:', poolsData.length, 'pools');
    console.log('🔍 Primeiro pool:', poolsData[0]);
  }
          
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
                <p className="text-slate-500 text-sm mt-1">Verifique os logs do console</p>
              </div>
            );
          }
          
          return poolsData?.map((pool: any) => {
            // Verificar se os dados do pool são válidos
            if (!pool || typeof pool !== 'object') {
              console.warn('Pool inválido encontrado:', pool);
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
                        {pool.token1.logo && typeof pool.token1.logo === 'string' && pool.token1.logo.startsWith('http') ? (
                          <img 
                            src={pool.token1.logo} 
                            alt={pool.token1.symbol || 'Token1'} 
                            className="w-8 h-8 rounded-full object-cover"
                      onError={(e) => {
                        console.log('❌ Erro ao carregar logo do token1:', pool.token1.logo);
                        e.currentTarget.style.display = 'none';
                        const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                        if (nextElement) {
                          nextElement.style.display = 'block';
                        }
                      }}
                          />
                        ) : null}
                        <span className="text-xl" style={{ display: pool.token1.logo && typeof pool.token1.logo === 'string' && pool.token1.logo.startsWith('http') ? 'none' : 'block' }}>
                          {String(pool.token1.logo || '💙')}
                        </span>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center border-2 border-slate-700 shadow-md -ml-3">
                        {pool.token2.logo && typeof pool.token2.logo === 'string' && pool.token2.logo.startsWith('http') ? (
                          <img 
                            src={pool.token2.logo} 
                            alt={pool.token2.symbol || 'Token2'} 
                            className="w-8 h-8 rounded-full object-cover"
                      onError={(e) => {
                        console.log('❌ Erro ao carregar logo do token2:', pool.token2.logo);
                        e.currentTarget.style.display = 'none';
                        const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                        if (nextElement) {
                          nextElement.style.display = 'block';
                        }
                      }}
                          />
                        ) : null}
                        <span className="text-xl" style={{ display: pool.token2.logo && typeof pool.token2.logo === 'string' && pool.token2.logo.startsWith('http') ? 'none' : 'block' }}>
                          {String(pool.token2.logo || '💚')}
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
