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
  tokens: Array<{
    symbol: string;
    logo: string;
    name: string;
    address: string;
    decimals: number;
  }>;
  totalValueLockedUSD: number;
  stats: {
    volumeInUSD: number;
    feesInUSD: number;
  };
  fee: number;
  apr: number;
}

export default function PoolDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const poolId = params.id as string;

  // Query para buscar detalhes do pool
  const { data: poolData, isLoading, error } = useQuery({
    queryKey: ['pool', poolId],
    queryFn: async () => {
      console.log('🔍 Buscando detalhes do pool:', poolId);
      
      // Simular dados baseados no ID do pool
      // Em uma implementação real, você faria uma chamada para a API
      const mockPoolData: PoolDetails = {
        id: poolId,
        address: '0x94a...bfbe',
        chain: 'Polygon',
        provider: 'Uniswap V3',
        tokens: [
          {
            symbol: 'USDC.E',
            logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiMwMDUyQjkiLz4KPHBhdGggZD0iTTE2IDZMMjAgMTBIMTZWNloiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xNiAyNkwyMCAyMkgxNlYyNloiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xNiAxMEwyMCAxNEgxNlYxMFoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xNiAyMkwyMCAyNkgxNlYyMloiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=',
            name: 'USD Coin',
            address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
            decimals: 6
          },
          {
            symbol: 'LINK',
            logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiMyQTVBRkYiLz4KPHBhdGggZD0iTTE2IDZMMjAgMTBIMTZWNloiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xNiAyNkwyMCAyMkgxNlYyNloiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xNiAxMEwyMCAxNEgxNlYxMFoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xNiAyMkwyMCAyNkgxNlYyMloiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=',
            name: 'Chainlink',
            address: '0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39',
            decimals: 18
          }
        ],
        totalValueLockedUSD: 486400,
        stats: {
          volumeInUSD: 371900,
          feesInUSD: 1100
        },
        fee: 0.30,
        apr: 83.71
      };

      console.log('📊 Dados mockados do pool:', mockPoolData);
      console.log('📊 Tipo dos dados:', typeof mockPoolData);
      console.log('📊 Chaves dos dados:', Object.keys(mockPoolData));
      return mockPoolData;
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

  // Calcular composição da pool (simulado)
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
          {poolData.tokens[0]?.symbol}/{poolData.tokens[1]?.symbol}
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
                      alt={token.symbol} 
                      className="w-8 h-8 rounded-full object-cover"
                      onError={(e) => {
                        console.log('❌ Erro ao carregar logo do token:', token.symbol, token.logo);
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
                {poolData.tokens[0]?.symbol}/{poolData.tokens[1]?.symbol}
              </h1>
              <p className="text-slate-400 text-sm">{poolData.provider}</p>
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
            <p className="text-white font-bold">{formatCurrency(poolData.stats.feesInUSD)}</p>
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
                <p className="text-green-400 font-bold text-2xl">{poolData.apr}% a.a</p>
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
                  <span className="text-white font-medium">{poolData.tokens[0]?.symbol} {token0Percentage}%</span>
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
                  <span className="text-white font-medium">{poolData.tokens[1]?.symbol} {token1Percentage}%</span>
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
                <span className="text-white">{formatValue(poolData.stats.volumeInUSD)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Tarifas (24h)</span>
                <span className="text-white">{formatValue(poolData.stats.feesInUSD)}</span>
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
                          <img src={token.logo} alt={token.symbol} className="w-3 h-3 rounded-full" />
                        ) : (
                          <span className="text-xs">💙</span>
                        )}
                      </div>
                      <span className="text-white text-sm">{token.symbol}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Protocolo</span>
                <div className="flex items-center space-x-2">
                  <span className="text-white">{poolData.provider}</span>
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
                          <img src={token.logo} alt={token.symbol} className="w-3 h-3 rounded-full" />
                        ) : (
                          <span className="text-xs">💙</span>
                        )}
                      </div>
                      <span className="text-white text-sm">{token.symbol}</span>
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
