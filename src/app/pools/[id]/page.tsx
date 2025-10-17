'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { notusAPI } from '@/lib/api/client';
import { liquidityActions } from '@/lib/actions/liquidity';
import { Card, CardContent } from '@/components/ui/card';
import { calculatePoolRentability } from '@/lib/utils/rentability-calculator';
import { usePoolHistoricalData } from '@/hooks/use-pool-historical-data';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink, Info, TrendingUp, DollarSign, BarChart3, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/app-layout';
import { ProtectedRoute } from '@/components/auth/protected-route';

interface PoolDetails {
  id: string;
  address: string;
  chain: string;
  provider: string;
  fee: number;
  totalValueLockedUSD: number;
  tokens: Array<{
    symbol: string;
    logo: string;
    name: string;
    address: string;
    decimals: number;
    poolShareInPercentage: number;
  }>;
  stats?: {
    volumeInUSD?: number;
    feesInUSD?: number;
  };
  metrics?: {
    apr: number;
    tvl: number;
    volume24h: number;
    fees24h: number;
    composition: {
      token0: { symbol: string; percentage: number };
      token1: { symbol: string; percentage: number };
    };
    formatted: {
      apr: string;
      tvl: string;
      volume24h: string;
      fees24h: string;
      composition: string;
    };
  };
}

export default function PoolDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const poolId = params.id as string;

  // Buscar dados históricos para cálculo preciso de rentabilidade
  // Endpoint 3: GET /liquidity/pools/{id}/historical-data
  const { data: historicalData, isLoading: historicalLoading } = usePoolHistoricalData(poolId || '', 365);

  // Query para buscar detalhes do pool via API interna
  const { data: poolData, isLoading, error } = useQuery<PoolDetails>({
    queryKey: ['pool-details', poolId],
    queryFn: async () => {
      console.log('🔍 Buscando detalhes do pool via API interna:', poolId);
      
      try {
        const response = await fetch(`/api/liquidity/pools/${poolId}`);
        if (!response.ok) {
          throw new Error(`Erro na API: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Dados recebidos:', data);
        
        if (!data.pool) {
          throw new Error('Pool não encontrado');
        }
        
        const pool = data.pool;
        const metrics = pool.metrics;
        
        console.log('📊 Métricas calculadas:', {
          apr: metrics.formatted.apr,
          tvl: metrics.formatted.tvl,
          volume24h: metrics.formatted.volume24h,
          composition: metrics.formatted.composition
        });
        
        const processedPool: PoolDetails = {
          id: pool.id,
          address: pool.address,
          chain: pool.chain?.name || 'Polygon',
          provider: pool.provider?.name || 'Uniswap V3',
          fee: pool.fee,
          totalValueLockedUSD: typeof pool.totalValueLockedUSD === 'string' 
            ? parseFloat(pool.totalValueLockedUSD) 
            : pool.totalValueLockedUSD,
          tokens: pool.tokens.map((token: any) => ({
            symbol: token.symbol?.toUpperCase() || 'TOKEN',
            logo: token.logo || '',
            name: token.name || 'Token',
            address: token.address || '',
            decimals: token.decimals || 18,
            poolShareInPercentage: token.poolShareInPercentage || 0
          })),
          stats: {
            volumeInUSD: metrics.volume24h,
            feesInUSD: metrics.fees24h
          },
          // Adicionar métricas calculadas
          metrics: metrics
        };

        console.log('🎯 Pool processado:', processedPool);
        return processedPool;

      } catch (error) {
        console.error('❌ Erro ao buscar detalhes do pool:', error);
        throw error;
      }
    },
    enabled: !!poolId,
    staleTime: 30000,
  });

  // Log para debug
  console.log('🎯 Pool data carregado:', poolData);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (error || !poolData) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <h2 className="text-white text-xl mb-4">Erro ao carregar pool</h2>
          <Button onClick={() => router.back()} className="bg-yellow-500 hover:bg-yellow-600 text-slate-900">
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  const formatValue = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    if (value >= 1) return `$${value.toFixed(2)}`;
    if (value >= 0.01) return `$${value.toFixed(4)}`;
    if (value >= 0.0001) return `$${value.toFixed(6)}`;
    if (value > 0) return `$${value.toFixed(8)}`;
    return `$0.00`;
  };

  const formatCurrency = (value: number) => {
    if (value >= 1) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    } else if (value >= 0.01) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 4,
        maximumFractionDigits: 4,
      }).format(value);
    } else if (value > 0) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 6,
        maximumFractionDigits: 6,
      }).format(value);
    }
    return '$0.00';
  };

  // Usar APR calculado pelas métricas do servidor
  const apr = poolData?.metrics?.apr || 0;

  // Calcular composição da pool baseada nos dados reais
  const token0Percentage = poolData?.tokens?.[0]?.poolShareInPercentage || 0;
  const token1Percentage = poolData?.tokens?.[1]?.poolShareInPercentage || 0;

  return (
    <ProtectedRoute>
      <AppLayout
        title="Detalhes do Pool"
        description="Visualize detalhes e métricas do pool de liquidez"
      >
        <div className="w-full max-w-4xl mx-auto px-6">
          <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-slate-400">
        <Link href="/pools" className="hover:text-white transition-colors">
          Pools
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-white">
          {String(poolData.tokens?.[0]?.symbol || 'TOKEN1')}/{String(poolData.tokens?.[1]?.symbol || 'TOKEN2')}
        </span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            className="text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center space-x-3">
            <div className="flex items-center -space-x-2">
              {poolData.tokens.map((token, index) => (
                <div key={index} className="w-10 h-10 rounded-full bg-slate-700 border-2 border-slate-600 flex items-center justify-center">
                  {token.logo && (token.logo.startsWith('http') || token.logo.startsWith('data:')) ? (
                    <img 
                      src={token.logo} 
                      alt={String(token.symbol || `TOKEN${index + 1}`)} 
                      className="w-8 h-8 rounded-full object-cover"
                      onError={(e) => {
                        console.log('❌ Erro ao carregar logo do token:', String(token.symbol || `TOKEN${index + 1}`), token.logo);
                        e.currentTarget.style.display = 'none';
                        const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                        if (nextElement) {
                          nextElement.style.display = 'block';
                        }
                      }}
                    />
                  ) : null}
                  <span className="text-sm" style={{ display: token.logo && (token.logo.startsWith('http') || token.logo.startsWith('data:')) ? 'none' : 'block' }}>
                    {index === 0 ? '💙' : '💚'}
                  </span>
                </div>
              ))}
            </div>
            <div>
              <h1 className="text-white font-bold text-2xl">
                {String(poolData.tokens?.[0]?.symbol || 'TOKEN1')}/{String(poolData.tokens?.[1]?.symbol || 'TOKEN2')}
              </h1>
              <p className="text-slate-400 text-sm">{String(poolData.provider || 'Unknown')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="flex space-x-3 mb-6">
          <div className="flex-1 bg-slate-800 rounded-xl p-3 text-center">
            <p className="text-slate-400 text-sm">Tarifa</p>
            <p className="text-white font-bold">{poolData.fee}%</p>
          </div>
          <div className="flex-1 bg-slate-800 rounded-xl p-3 text-center">
            <p className="text-slate-400 text-sm">TVL</p>
            <p className="text-white font-bold">{formatValue(poolData.totalValueLockedUSD)}</p>
          </div>
          <div className="flex-1 bg-slate-800 rounded-xl p-3 text-center">
            <p className="text-slate-400 text-sm">Tarifas</p>
            <p className="text-white font-bold">{formatCurrency(poolData.stats?.feesInUSD || 0)}</p>
          </div>
        </div>

        {/* Rentabilidade Estimada */}
        <Card className="bg-slate-800/60 border border-slate-700/60 rounded-2xl mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <h3 className="text-white font-bold text-lg">Rentabilidade estimada</h3>
                <Info className="h-4 w-4 text-slate-400" />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="text-green-400 font-bold text-2xl">{apr.toFixed(2)}% a.a</p>
              </div>
            </div>
          </CardContent>
        </Card>

         {/* Composição da Pool */}
         <Card className="bg-slate-800/60 border border-slate-700/60 rounded-2xl mb-6">
           <CardContent className="p-6">
             <h3 className="text-white font-bold text-lg mb-4">Composição da Pool</h3>
             
             {/* Layout com tokens nas extremidades e barra no centro */}
             <div className="flex items-center justify-between">
               {/* Token 1 - Esquerda */}
               <div className="flex flex-col items-center space-y-2">
                 <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                   {poolData.tokens[0]?.logo && (poolData.tokens[0].logo.startsWith('http') || poolData.tokens[0].logo.startsWith('data:')) ? (
                     <img 
                       src={poolData.tokens[0].logo} 
                       alt={poolData.tokens[0].symbol} 
                       className="w-8 h-8 rounded-full object-cover"
                       onError={(e) => {
                         e.currentTarget.style.display = 'none';
                         const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                         if (nextElement) nextElement.style.display = 'block';
                       }}
                     />
                   ) : null}
                   <span className="text-lg" style={{ display: poolData.tokens[0]?.logo && (poolData.tokens[0].logo.startsWith('http') || poolData.tokens[0].logo.startsWith('data:')) ? 'none' : 'block' }}>
                     💙
                   </span>
                 </div>
                 <div className="text-center">
                   <div className="text-white font-medium text-sm">{String(poolData.tokens?.[0]?.symbol || 'TOKEN1')}</div>
                   <div className="text-white font-bold text-sm">{token0Percentage.toFixed(2)}%</div>
                 </div>
               </div>

               {/* Barra de progresso central */}
               <div className="flex-1 mx-6">
                 <div className="w-full bg-slate-700 rounded-full h-4 relative">
                   <div 
                     className="bg-red-500 h-4 rounded-l-full" 
                     style={{ width: `${token0Percentage}%` }}
                   ></div>
                   <div 
                     className="bg-blue-500 h-4 rounded-r-full absolute top-0" 
                     style={{ 
                       left: `${token0Percentage}%`,
                       width: `${token1Percentage}%`
                     }}
                   ></div>
                 </div>
               </div>

               {/* Token 2 - Direita */}
               <div className="flex flex-col items-center space-y-2">
                 <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                   {poolData.tokens[1]?.logo && (poolData.tokens[1].logo.startsWith('http') || poolData.tokens[1].logo.startsWith('data:')) ? (
                     <img 
                       src={poolData.tokens[1].logo} 
                       alt={poolData.tokens[1].symbol} 
                       className="w-8 h-8 rounded-full object-cover"
                       onError={(e) => {
                         e.currentTarget.style.display = 'none';
                         const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                         if (nextElement) nextElement.style.display = 'block';
                       }}
                     />
                   ) : null}
                   <span className="text-lg" style={{ display: poolData.tokens[1]?.logo && (poolData.tokens[1].logo.startsWith('http') || poolData.tokens[1].logo.startsWith('data:')) ? 'none' : 'block' }}>
                     💚
                   </span>
                 </div>
                 <div className="text-center">
                   <div className="text-white font-medium text-sm">{String(poolData.tokens?.[1]?.symbol || 'TOKEN2')}</div>
                   <div className="text-white font-bold text-sm">{token1Percentage.toFixed(2)}%</div>
                 </div>
               </div>
             </div>
           </CardContent>
         </Card>


        {/* Informações */}
        <Card className="bg-slate-800/60 border border-slate-700/60 rounded-2xl mb-6">
          <CardContent className="p-6">
            <h3 className="text-white font-bold text-lg mb-4">Informações</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">TVL</span>
                <span className="text-white">{formatValue(poolData.totalValueLockedUSD)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Volume (24h)</span>
                <span className="text-white">{formatValue(poolData.stats?.volumeInUSD || 0)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Tarifas (24h)</span>
                <span className="text-white">{formatValue(poolData.stats?.feesInUSD || 0)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Nível de tarifas</span>
                <span className="text-white">{poolData.fee}%</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Rendimento</span>
                <div className="flex items-center space-x-2">
                  {poolData.tokens.map((token, index) => (
                    <div key={index} className="flex items-center space-x-1">
                      <div className="w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center">
                        {token.logo && (token.logo.startsWith('http') || token.logo.startsWith('data:')) ? (
                          <img src={token.logo} alt={String(token.symbol || `TOKEN${index + 1}`)} className="w-3 h-3 rounded-full" />
                        ) : (
                          <span className="text-xs">💙</span>
                        )}
                      </div>
                      <span className="text-white text-sm">{String(token.symbol || `TOKEN${index + 1}`)}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Protocolo</span>
                <div className="flex items-center space-x-2">
                  <a 
                    href="https://app.uniswap.org/explore/pools/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-white hover:text-blue-400 transition-colors flex items-center space-x-2"
                  >
                    <span>{String(poolData.provider || 'Unknown')}</span>
                    <ExternalLink className="h-4 w-4 text-slate-400 hover:text-blue-400" />
                  </a>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Rede</span>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <span className="text-xs">∞</span>
                  </div>
                  <a 
                    href="https://polygonscan.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-white hover:text-blue-400 transition-colors flex items-center space-x-2"
                  >
                    <span>{poolData.chain}</span>
                    <ExternalLink className="h-4 w-4 text-slate-400 hover:text-blue-400" />
                  </a>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Par de tokens</span>
                <div className="flex items-center space-x-2">
                  {poolData.tokens.map((token, index) => (
                    <a 
                      key={index}
                      href={`https://polygonscan.com/token/${token.address}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 hover:opacity-80 transition-opacity"
                    >
                      <div className="w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center">
                        {token.logo && (token.logo.startsWith('http') || token.logo.startsWith('data:')) ? (
                          <img src={token.logo} alt={String(token.symbol || `TOKEN${index + 1}`)} className="w-3 h-3 rounded-full" />
                        ) : (
                          <span className="text-xs">💙</span>
                        )}
                      </div>
                      <span className="text-white text-sm">{String(token.symbol || `TOKEN${index + 1}`)}</span>
                      <ExternalLink className="h-3 w-3 text-slate-400 hover:text-blue-400" />
                    </a>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Contrato da Pool</span>
                <div className="flex items-center space-x-2">
                  <a 
                    href={`https://polygonscan.com/address/${poolData.address}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-white hover:text-blue-400 transition-colors flex items-center space-x-2"
                  >
                    <span className="text-sm font-mono">{poolData.address.slice(0, 6)}...{poolData.address.slice(-4)}</span>
                    <ExternalLink className="h-4 w-4 text-slate-400 hover:text-blue-400" />
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botão de Adicionar Liquidez */}
        <Button
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold py-4 rounded-xl text-lg"
          onClick={() => router.push(`/pools/${poolId}/add-liquidity`)}
        >
          Adicionar liquidez
        </Button>
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
