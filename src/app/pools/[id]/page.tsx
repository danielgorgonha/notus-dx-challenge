'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { notusAPI } from '@/lib/api/client';
import { Card, CardContent } from '@/components/ui/card';
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
  }>;
  stats?: {
    volumeInUSD?: number;
    feesInUSD?: number;
  };
}

export default function PoolDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const poolId = params.id as string;

  // Query para buscar detalhes do pool
  const { data: poolData, isLoading, error } = useQuery<PoolDetails>({
    queryKey: ['pool-details', poolId],
    queryFn: async () => {
      console.log('🔍 Buscando detalhes do pool:', poolId);
      
      try {
        // Fazer chamada direta para a API da Notus com o endpoint correto
        const response = await notusAPI.get(`liquidity/pools/${poolId}?rangeInDays=30`).json();
        console.log('✅ Resposta da API para detalhes do pool:', response);
        console.log('📊 Tipo da resposta:', typeof response);
        console.log('📊 Chaves da resposta:', Object.keys(response || {}));

        if (!response) {
          throw new Error('Pool não encontrado');
        }

        // Processar dados da API - a resposta vem em {pool: {...}}
        const apiResponse = (response as any).pool;
        console.log('📊 Dados do pool da API:', apiResponse);
        console.log('🔍 Provider (objeto):', apiResponse.provider);
        console.log('🔍 Chain (objeto):', apiResponse.chain);
        console.log('🔍 Estrutura dos tokens:', apiResponse.tokens);
        console.log('🔍 Tipo dos tokens:', typeof apiResponse.tokens);
        console.log('🔍 Array dos tokens:', Array.isArray(apiResponse.tokens));
        
        // Log detalhado de cada token
        if (apiResponse.tokens && Array.isArray(apiResponse.tokens)) {
          apiResponse.tokens.forEach((token: any, index: number) => {
            console.log(`🔍 Token ${index}:`, {
              symbol: token.symbol,
              logo: token.logo,
              name: token.name,
              address: token.address,
              decimals: token.decimals,
              symbolType: typeof token.symbol,
              logoType: typeof token.logo,
              nameType: typeof token.name
            });
          });
        }
        
        const processedPool: PoolDetails = {
          id: apiResponse.id || poolId,
          address: apiResponse.address || 'N/A',
          chain: typeof apiResponse.chain === 'object' ? apiResponse.chain.name : (apiResponse.chain || 'Polygon'),
          provider: typeof apiResponse.provider === 'object' ? apiResponse.provider.name : (apiResponse.provider || 'Uniswap V3'),
          fee: typeof apiResponse.fee === 'number' ? apiResponse.fee : parseFloat(apiResponse.fee) || 0,
          totalValueLockedUSD: typeof apiResponse.totalValueLockedUSD === 'number' 
            ? apiResponse.totalValueLockedUSD 
            : parseFloat(apiResponse.totalValueLockedUSD) || 0,
          tokens: Array.isArray(apiResponse.tokens) ? apiResponse.tokens.map((token: any, index: number) => {
            console.log(`🔧 Processando token ${index}:`, token);
            
            // Verificar se token é um objeto válido
            if (!token || typeof token !== 'object') {
              console.log(`⚠️ Token ${index} inválido:`, token);
              return {
                symbol: `TOKEN${index + 1}`,
                logo: '',
                name: `Token ${index + 1}`,
                address: '',
                decimals: 18
              };
            }
            
            return {
              symbol: typeof token.symbol === 'string' ? token.symbol.toUpperCase() : `TOKEN${index + 1}`,
              logo: typeof token.logo === 'string' ? token.logo : '',
              name: typeof token.name === 'string' ? token.name : `Token ${index + 1}`,
              address: typeof token.address === 'string' ? token.address : '',
              decimals: typeof token.decimals === 'number' ? token.decimals : 18
            };
          }) : [],
          stats: {
            volumeInUSD: typeof apiResponse.stats?.volumeInUSD === 'number' 
              ? apiResponse.stats.volumeInUSD 
              : parseFloat(apiResponse.stats?.volumeInUSD) || 0,
            feesInUSD: typeof apiResponse.stats?.feesInUSD === 'number' 
              ? apiResponse.stats.feesInUSD 
              : parseFloat(apiResponse.stats?.feesInUSD) || 0
          }
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
    return `$${value.toFixed(2)}`;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Calcular APR baseado nos dados reais
  const calculateAPR = () => {
    if (!poolData) return 0;
    
    const tvl = poolData.totalValueLockedUSD;
    const volume24h = poolData.stats?.volumeInUSD || 0;
    const fee = poolData.fee;
    
    if (tvl > 0 && volume24h > 0) {
      const dailyFees = volume24h * (fee / 100);
      const annualFees = dailyFees * 365;
      return (annualFees / tvl) * 100;
    }
    
    return 0;
  };

  const apr = calculateAPR();

  // Calcular composição da pool baseada nos dados reais
  // Por enquanto, vamos usar valores simulados até termos dados de composição da API
  const token0Percentage = 20.05;
  const token1Percentage = 79.95;

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
                  {token.logo && token.logo.startsWith('data:') ? (
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
                  <span className="text-sm" style={{ display: token.logo && token.logo.startsWith('data:') ? 'none' : 'block' }}>
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
            
            <div className="space-y-4">
              {/* Token 1 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    {poolData.tokens[0]?.logo && poolData.tokens[0].logo.startsWith('data:') ? (
                      <img 
                        src={poolData.tokens[0].logo} 
                        alt={poolData.tokens[0].symbol} 
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => {
                          console.log('❌ Erro ao carregar logo do token0:', poolData.tokens[0].symbol);
                          e.currentTarget.style.display = 'none';
                          const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                          if (nextElement) {
                            nextElement.style.display = 'block';
                          }
                        }}
                      />
                    ) : null}
                    <span className="text-lg" style={{ display: poolData.tokens[0]?.logo && poolData.tokens[0].logo.startsWith('data:') ? 'none' : 'block' }}>
                      💙
                    </span>
                  </div>
                  <span className="text-white font-medium">{String(poolData.tokens?.[0]?.symbol || 'TOKEN1')} {token0Percentage}%</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-700 rounded-full h-3">
                <div className="flex h-full">
                  <div 
                    className="bg-red-500 rounded-l-full" 
                    style={{ width: `${token0Percentage}%` }}
                  ></div>
                  <div 
                    className="bg-blue-500 rounded-r-full" 
                    style={{ width: `${token1Percentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Token 2 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    {poolData.tokens[1]?.logo && poolData.tokens[1].logo.startsWith('data:') ? (
                      <img 
                        src={poolData.tokens[1].logo} 
                        alt={poolData.tokens[1].symbol} 
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => {
                          console.log('❌ Erro ao carregar logo do token1:', poolData.tokens[1].symbol);
                          e.currentTarget.style.display = 'none';
                          const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                          if (nextElement) {
                            nextElement.style.display = 'block';
                          }
                        }}
                      />
                    ) : null}
                    <span className="text-lg" style={{ display: poolData.tokens[1]?.logo && poolData.tokens[1].logo.startsWith('data:') ? 'none' : 'block' }}>
                      💚
                    </span>
                  </div>
                  <span className="text-white font-medium">{String(poolData.tokens?.[1]?.symbol || 'TOKEN2')} {token1Percentage}%</span>
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
                        {token.logo && token.logo.startsWith('data:') ? (
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
                  <span className="text-white">{String(poolData.provider || 'Unknown')}</span>
                  <ExternalLink className="h-4 w-4 text-slate-400" />
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Rede</span>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <span className="text-xs">∞</span>
                  </div>
                  <span className="text-white">{poolData.chain}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Par de tokens</span>
                <div className="flex items-center space-x-2">
                  {poolData.tokens.map((token, index) => (
                    <div key={index} className="flex items-center space-x-1">
                      <div className="w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center">
                        {token.logo && token.logo.startsWith('data:') ? (
                          <img src={token.logo} alt={String(token.symbol || `TOKEN${index + 1}`)} className="w-3 h-3 rounded-full" />
                        ) : (
                          <span className="text-xs">💙</span>
                        )}
                      </div>
                      <span className="text-white text-sm">{String(token.symbol || `TOKEN${index + 1}`)}</span>
                      <ExternalLink className="h-3 w-3 text-slate-400" />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Contrato da Pool</span>
                <div className="flex items-center space-x-2">
                  <span className="text-white text-sm">{poolData.address}</span>
                  <ExternalLink className="h-4 w-4 text-slate-400" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

           {/* Botão de Adicionar Liquidez */}
           <Button
             className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold py-4 rounded-xl text-lg"
             onClick={() => {
               // Implementar lógica de adicionar liquidez
               console.log('Adicionar liquidez para pool:', poolId);
             }}
           >
             Adicionar liquidez
           </Button>
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
