'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { notusAPI } from '@/lib/api/client';
import { liquidityActions } from '@/lib/actions/liquidity';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, RefreshCw, ZoomOut, ZoomIn, Plus, Info, TrendingUp } from 'lucide-react';
import { AppLayout } from '@/components/layout/app-layout';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from 'recharts';

// Função para processar dados dos tokens (movida para fora do componente)
const processTokensData = (tokens: any[], walletBalances?: {[key: string]: number}) => {
  const result: {[key: string]: any} = {};
  
  tokens.forEach(token => {
    const symbol = token.symbol.toUpperCase();
    if (symbol === 'USDC' || symbol === 'BRZ') {
      result[symbol] = {
        symbol: token.symbol,
        name: token.name,
        address: token.address,
        decimals: token.decimals,
        logo: token.logo,
        balance: walletBalances?.[symbol] || (symbol === 'USDC' ? 1000.00 : 25.00),
        chain: token.chain
      };
    }
  });

  console.log('🎯 Tokens processados:', result);
  return result;
};

interface Token {
  symbol: string;
  logo: string;
  name: string;
  address: string;
  decimals: number;
  poolShareInPercentage: number;
}

interface PoolData {
  id: string;
  address: string;
  chain: string;
  provider: string;
  fee: number;
  totalValueLockedUSD: number;
  tokens: Token[];
  stats?: {
    volumeInUSD?: number;
    feesInUSD?: number;
  };
}

export default function AddLiquidityPage() {
  const params = useParams();
  const router = useRouter();
  const poolId = params.id as string;
  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1M');
  const [minPrice, setMinPrice] = useState(0.04999986);
  const [maxPrice, setMaxPrice] = useState(0.06111094);
  const [selectedToken, setSelectedToken] = useState<'USDC.E' | 'LINK'>('USDC.E');
  const [priceRange, setPriceRange] = useState<'± 10%' | '± 15%' | '± 20%' | 'Total' | null>(null);
  const [selectedInputToken, setSelectedInputToken] = useState<'USDC' | 'BRZ' | null>(null);
  const [inputAmount, setInputAmount] = useState<string>('');
  const [countdown, setCountdown] = useState(117); // 1:57 em segundos
  const [tokenBalances, setTokenBalances] = useState<{[key: string]: number}>({
    USDC: 1000.00,
    BRZ: 25.00
  });

  // Dados mock para o gráfico
  const chartData = [
    { date: '26/09/2025', price: 0.049 },
    { date: '27/09/2025', price: 0.051 },
    { date: '28/09/2025', price: 0.053 },
    { date: '29/09/2025', price: 0.055 },
    { date: '30/09/2025', price: 0.057 },
    { date: '01/10/2025', price: 0.059 },
    { date: '02/10/2025', price: 0.061 },
    { date: '03/10/2025', price: 0.059 },
    { date: '04/10/2025', price: 0.057 },
    { date: '05/10/2025', price: 0.055 },
    { date: '06/10/2025', price: 0.055 }
  ];

  // Query para buscar tokens da Polygon
  const { data: polygonTokens, isLoading: tokensLoading, error: tokensError } = useQuery({
    queryKey: ['polygon-tokens'],
    queryFn: async () => {
      console.log('🔍 Buscando tokens USDC e BRZ na Polygon...');
      
      try {
        // Tentativa 1: Busca múltipla (USDC,BRZ)
        try {
          const multiSearchResponse = await fetch('/api/crypto/tokens?search=USDC,BRZ&filterByChainId=137&filterWhitelist=false&page=1&perPage=100');
          if (multiSearchResponse.ok) {
            const multiData = await multiSearchResponse.json();
            console.log('✅ Busca múltipla bem-sucedida:', multiData);
            return processTokensData(multiData.tokens, walletBalances);
          }
        } catch (error) {
          console.log('⚠️ Busca múltipla falhou, tentando buscas separadas...');
        }

        // Tentativa 2: Buscas separadas
        console.log('🔄 Executando buscas separadas para USDC e BRZ...');
        const [usdcResponse, brzResponse] = await Promise.all([
          fetch('/api/crypto/tokens?search=USDC&filterByChainId=137&filterWhitelist=false&page=1&perPage=100'),
          fetch('/api/crypto/tokens?search=BRZ&filterByChainId=137&filterWhitelist=false&page=1&perPage=100')
        ]);

        const [usdcData, brzData] = await Promise.all([
          usdcResponse.json(),
          brzResponse.json()
        ]);

        console.log('📊 Dados USDC:', usdcData);
        console.log('📊 Dados BRZ:', brzData);

        const allTokens = [...usdcData.tokens, ...brzData.tokens];
        return processTokensData(allTokens, walletBalances);

      } catch (error) {
        console.error('❌ Erro ao buscar tokens:', error);
        // Fallback para dados mock em caso de erro
        return {
          USDC: {
            symbol: 'USDC',
            name: 'USD Coin',
            address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
            decimals: 6,
            logo: 'https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png',
            balance: 1000.00
          },
          BRZ: {
            symbol: 'BRZ',
            name: 'Brazilian Digital Token',
            address: '0x4e0603e2a27a30480e5e3a4fe548e29ef12f64be',
            decimals: 4,
            logo: 'https://assets.coingecko.com/coins/images/10119/large/brz.png',
            balance: 25.00
          }
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });

  // Query para buscar saldos da smart wallet
  const { data: walletBalances, isLoading: balancesLoading } = useQuery({
    queryKey: ['wallet-balances'],
    queryFn: async () => {
      console.log('💰 Buscando saldos da smart wallet...');
      
      try {
        // TODO: Implementar endpoint real para saldos da smart wallet
        // Por enquanto, usando dados mock
        return {
          USDC: 1000.00,
          BRZ: 25.00
        };
      } catch (error) {
        console.error('❌ Erro ao buscar saldos:', error);
        return {
          USDC: 1000.00,
          BRZ: 25.00
        };
      }
    },
    staleTime: 30 * 1000, // 30 segundos (saldos mudam frequentemente)
    gcTime: 60 * 1000, // 1 minuto
  });


  // Query para buscar detalhes do pool
  const { data: poolData, isLoading, error } = useQuery<PoolData>({
    queryKey: ['pool-details', poolId],
    queryFn: async () => {
      console.log('🔍 Buscando detalhes do pool para adicionar liquidez:', poolId);
      
      try {
        const response = await liquidityActions.getPool(poolId, 365);
        console.log('✅ Resposta da API para detalhes do pool:', response);

        if (!response) {
          throw new Error('Pool não encontrado');
        }

        const apiResponse = (response as any).pool;
        console.log('📊 Dados do pool da API:', apiResponse);
        
        if (!apiResponse) {
          throw new Error('Dados do pool não encontrados na resposta');
        }
        
        const processedPool: PoolData = {
          id: apiResponse.id || poolId,
          address: apiResponse.address || 'N/A',
          chain: typeof apiResponse.chain === 'object' ? apiResponse.chain.name : (apiResponse.chain || 'Polygon'),
          provider: typeof apiResponse.provider === 'object' ? apiResponse.provider.name : (apiResponse.provider || 'Uniswap V3'),
          fee: typeof apiResponse.fee === 'number' ? apiResponse.fee : parseFloat(apiResponse.fee) || 0,
          totalValueLockedUSD: typeof apiResponse.totalValueLockedUSD === 'number' 
            ? apiResponse.totalValueLockedUSD 
            : parseFloat(apiResponse.totalValueLockedUSD) || 0,
          tokens: Array.isArray(apiResponse.tokens) ? apiResponse.tokens.map((token: any) => ({
            symbol: String(token.symbol || 'TOKEN'),
            logo: String(token.logo || ''),
            name: String(token.name || 'Token'),
            address: String(token.address || ''),
            decimals: typeof token.decimals === 'number' ? token.decimals : parseInt(token.decimals) || 18,
            poolShareInPercentage: typeof token.poolShareInPercentage === 'number' 
              ? token.poolShareInPercentage 
              : parseFloat(token.poolShareInPercentage) || 0
          })) : [],
          stats: apiResponse.stats ? {
            volumeInUSD: typeof apiResponse.stats.volumeInUSD === 'number' 
              ? apiResponse.stats.volumeInUSD 
              : parseFloat(apiResponse.stats.volumeInUSD) || 0,
            feesInUSD: typeof apiResponse.stats.feesInUSD === 'number' 
              ? apiResponse.stats.feesInUSD 
              : parseFloat(apiResponse.stats.feesInUSD) || 0
          } : undefined
        };

        console.log('✅ Pool processado com sucesso:', processedPool);
        return processedPool;
        
      } catch (error) {
        console.error('❌ Erro ao buscar detalhes do pool:', error);
        throw error;
      }
    },
    enabled: !!poolId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });

  if (isLoading) {
    return (
      <ProtectedRoute>
        <AppLayout
          title="Adicionar Liquidez"
          description="Configure sua posição de liquidez"
        >
          <div className="w-full max-w-4xl mx-auto px-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-white">Carregando...</div>
            </div>
          </div>
        </AppLayout>
      </ProtectedRoute>
    );
  }

  if (error || !poolData) {
    return (
      <ProtectedRoute>
        <AppLayout
          title="Adicionar Liquidez"
          description="Configure sua posição de liquidez"
        >
          <div className="w-full max-w-4xl mx-auto px-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-red-400">Erro ao carregar dados do pool</div>
            </div>
          </div>
        </AppLayout>
      </ProtectedRoute>
    );
  }

  const timeframes = [
    { key: '1D', label: '1D' },
    { key: '7D', label: '7D' },
    { key: '1M', label: '1M' },
    { key: '1A', label: '1A' }
  ];

  const priceRanges = ['± 10%', '± 15%', '± 20%', 'Total'];

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // Finalizar processo
      console.log('Processo de adição de liquidez finalizado');
      router.push(`/pools/${poolId}`);
    }
  };

  const isStep1Valid = () => {
    return minPrice > 0 && maxPrice > 0 && minPrice < maxPrice && selectedToken;
  };

  const isStep2Valid = () => {
    return selectedInputToken && inputAmount && parseFloat(inputAmount) > 0;
  };

  // Countdown timer
  useEffect(() => {
    if (currentStep === 2 && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, currentStep]);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const adjustPrice = (type: 'min' | 'max', direction: 'up' | 'down') => {
    const step = 0.00000001;
    if (type === 'min') {
      setMinPrice(prev => direction === 'up' ? prev + step : prev - step);
    } else {
      setMaxPrice(prev => direction === 'up' ? prev + step : prev - step);
    }
  };

  const handlePriceRangeSelect = (range: string) => {
    setPriceRange(range as any);
    const currentPrice = 0.0555;
    
    switch (range) {
      case '± 10%':
        setMinPrice(currentPrice * 0.9);
        setMaxPrice(currentPrice * 1.1);
        break;
      case '± 15%':
        setMinPrice(currentPrice * 0.85);
        setMaxPrice(currentPrice * 1.15);
        break;
      case '± 20%':
        setMinPrice(currentPrice * 0.8);
        setMaxPrice(currentPrice * 1.2);
        break;
      case 'Total':
        setMinPrice(0.001);
        setMaxPrice(1.0);
        break;
    }
  };

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

  const renderStep1 = () => (
    <Card className="bg-slate-800/60 border border-slate-700/60 rounded-2xl">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Token Pair Selection */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex -space-x-2">
                {poolData.tokens.map((token, index) => (
                  <div key={index} className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-600 flex items-center justify-center">
                    {token.logo && (token.logo.startsWith('http') || token.logo.startsWith('data:')) ? (
                      <img 
                        src={token.logo} 
                        alt={String(token.symbol || `TOKEN${index + 1}`)} 
                        className="w-6 h-6 rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                          if (nextElement) nextElement.style.display = 'block';
                        }}
                      />
                    ) : null}
                    <span className="text-sm" style={{ display: token.logo && (token.logo.startsWith('http') || token.logo.startsWith('data:')) ? 'none' : 'block' }}>
                      {index === 0 ? '💙' : '💚'}
                    </span>
                  </div>
                ))}
              </div>
              <span className="text-white font-medium">
                {String(poolData.tokens?.[0]?.symbol || 'TOKEN1')}/{String(poolData.tokens?.[1]?.symbol || 'TOKEN2')}
              </span>
            </div>
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Price Chart */}
          <div className="space-y-4">
            {/* Chart */}
            <div className="h-48 bg-slate-700/50 rounded-lg p-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    domain={[0.045, 0.065]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickFormatter={(value) => value.toFixed(3)}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: '#8b5cf6' }}
                  />
                  <ReferenceLine 
                    y={0.055} 
                    stroke="#64748b" 
                    strokeDasharray="5 5" 
                    label={{ value: "Preço atual", position: "topRight", fill: "#64748b" }}
                  />
                  <ReferenceLine 
                    y={minPrice} 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    label={{ value: "Min", position: "topLeft", fill: "#ef4444" }}
                  />
                  <ReferenceLine 
                    y={maxPrice} 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    label={{ value: "Max", position: "topRight", fill: "#3b82f6" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            {/* Chart Legend */}
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-0.5 bg-slate-400 border-dashed border-t"></div>
                <span className="text-slate-400">Preço atual</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-0.5 bg-white"></div>
                <span className="text-slate-400">Intervalo de preço</span>
              </div>
            </div>
          </div>

          {/* Timeframe Selection */}
          <div className="flex space-x-2">
            {timeframes.map((timeframe) => (
              <Button
                key={timeframe.key}
                variant="outline"
                size="sm"
                onClick={() => setSelectedTimeframe(timeframe.key)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  selectedTimeframe === timeframe.key 
                    ? "bg-yellow-500 text-black border-yellow-500 hover:bg-yellow-600 shadow-lg" 
                    : "bg-slate-800 border-slate-600 text-white hover:bg-slate-700 hover:border-slate-500"
                }`}
              >
                {timeframe.label}
              </Button>
            ))}
          </div>

          {/* Price Range Selection */}
          <div className="space-y-4">
            <h3 className="text-white font-medium">Escolha o intervalo de preço</h3>
            <div className="flex space-x-2">
              {priceRanges.map((range) => (
                <Button
                  key={range}
                  variant="outline"
                  size="sm"
                  onClick={() => handlePriceRangeSelect(range)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    priceRange === range 
                      ? "bg-yellow-500 text-black border-yellow-500 hover:bg-yellow-600 shadow-lg" 
                      : "bg-slate-800 border-slate-600 text-white hover:bg-slate-700 hover:border-slate-500"
                  }`}
                >
                  {range}
                </Button>
              ))}
            </div>
            
            <div className="text-slate-400 text-sm">
              Preço atual: 0.0555 LINK = 1 USDC.E
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setSelectedToken('USDC.E')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  selectedToken === 'USDC.E' 
                    ? "bg-yellow-500 text-black border-yellow-500 hover:bg-yellow-600 shadow-lg" 
                    : "bg-slate-800 border-slate-600 text-white hover:bg-slate-700 hover:border-slate-500"
                }`}
              >
                USDC.E
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedToken('LINK')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  selectedToken === 'LINK' 
                    ? "bg-yellow-500 text-black border-yellow-500 hover:bg-yellow-600 shadow-lg" 
                    : "bg-slate-800 border-slate-600 text-white hover:bg-slate-700 hover:border-slate-500"
                }`}
              >
                LINK
              </Button>
            </div>
          </div>

          {/* Price Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Minimum Price */}
            <Card className="bg-slate-800/60 border border-slate-700/60 rounded-2xl">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <h4 className="text-slate-400 text-sm">Preço mínimo</h4>
                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => adjustPrice('min', 'down')}
                      className="w-10 h-10 rounded-full bg-slate-700 hover:bg-slate-600 border border-slate-600 hover:border-slate-500 transition-all duration-200"
                    >
                      <span className="text-white font-bold">-</span>
                    </Button>
                    <span className="text-white text-lg font-mono px-4">{minPrice.toFixed(8)}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => adjustPrice('min', 'up')}
                      className="w-10 h-10 rounded-full bg-slate-700 hover:bg-slate-600 border border-slate-600 hover:border-slate-500 transition-all duration-200"
                    >
                      <span className="text-white font-bold">+</span>
                    </Button>
                  </div>
                  <div className="text-slate-400 text-xs">LINK por USDC.E</div>
                </div>
              </CardContent>
            </Card>

            {/* Maximum Price */}
            <Card className="bg-slate-800/60 border border-slate-700/60 rounded-2xl">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <h4 className="text-slate-400 text-sm">Preço máximo</h4>
                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => adjustPrice('max', 'down')}
                      className="w-10 h-10 rounded-full bg-slate-700 hover:bg-slate-600 border border-slate-600 hover:border-slate-500 transition-all duration-200"
                    >
                      <span className="text-white font-bold">-</span>
                    </Button>
                    <span className="text-white text-lg font-mono px-4">{maxPrice.toFixed(8)}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => adjustPrice('max', 'up')}
                      className="w-10 h-10 rounded-full bg-slate-700 hover:bg-slate-600 border border-slate-600 hover:border-slate-500 transition-all duration-200"
                    >
                      <span className="text-white font-bold">+</span>
                    </Button>
                  </div>
                  <div className="text-slate-400 text-xs">LINK por USDC.E</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Fee Level */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-slate-400 text-sm">Nível de tarifas</h4>
              <div className="text-white text-lg font-bold">{poolData.fee}%</div>
            </div>
          </div>

          {/* Validation Message */}
          {currentStep === 1 && !isStep1Valid() && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-red-400 text-sm">
                  Por favor, configure os preços mínimo e máximo válidos
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      {/* Token Selection */}
      <div className="space-y-4">
        <h3 className="text-white font-medium">Escolha como vai adicionar a liquidez</h3>
        
        {/* Loading State */}
        {tokensLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
            <span className="ml-3 text-slate-400">Carregando tokens...</span>
          </div>
        )}

        {/* Error State */}
        {tokensError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <p className="text-red-400 text-sm">
              Erro ao carregar tokens. Usando dados padrão.
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {/* USDC Option */}
          <Button
            variant="outline"
            onClick={() => setSelectedInputToken('USDC')}
            className={`p-6 h-auto flex flex-col items-center space-y-3 ${
              selectedInputToken === 'USDC'
                ? "bg-yellow-500/20 border-yellow-500 text-white"
                : "bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
            }`}
          >
            {polygonTokens?.USDC?.logo ? (
              <img 
                src={polygonTokens.USDC.logo} 
                alt="USDC"
                className="w-12 h-12 rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                  if (nextElement) nextElement.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center"
              style={{ display: polygonTokens?.USDC?.logo ? 'none' : 'flex' }}
            >
              <span className="text-white text-xl font-bold">$</span>
            </div>
            <span className="font-medium">Utilizar USDC</span>
          </Button>

          {/* BRZ Option */}
          <Button
            variant="outline"
            onClick={() => setSelectedInputToken('BRZ')}
            className={`p-6 h-auto flex flex-col items-center space-y-3 ${
              selectedInputToken === 'BRZ'
                ? "bg-yellow-500/20 border-yellow-500 text-white"
                : "bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
            }`}
          >
            {polygonTokens?.BRZ?.logo ? (
              <img 
                src={polygonTokens.BRZ.logo} 
                alt="BRZ"
                className="w-12 h-12 rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                  if (nextElement) nextElement.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-yellow-500 flex items-center justify-center"
              style={{ display: polygonTokens?.BRZ?.logo ? 'none' : 'flex' }}
            >
              <span className="text-white text-sm font-bold">BRZ</span>
            </div>
            <span className="font-medium">Utilizar BRZ</span>
          </Button>
        </div>
      </div>

      {/* Amount Input Section */}
      {selectedInputToken && polygonTokens && (
        <Card className="bg-slate-800/60 border border-slate-700/60 rounded-2xl">
          <CardContent className="p-6">
            <div className="space-y-6">
              <h3 className="text-white font-medium">Escolha quanto vai adicionar</h3>
              
              {/* Amount Input */}
              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm">Total</span>
                  <span className="text-slate-400 text-sm">
                    Saldo: {polygonTokens[selectedInputToken]?.balance.toFixed(2)} {selectedInputToken}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={inputAmount}
                    onChange={(e) => setInputAmount(e.target.value)}
                    placeholder="0,00"
                    className="flex-1 bg-transparent text-white text-2xl font-mono border-none outline-none"
                  />
                  <div className="flex items-center space-x-2">
                    {polygonTokens[selectedInputToken]?.logo ? (
                      <img 
                        src={polygonTokens[selectedInputToken].logo} 
                        alt={selectedInputToken}
                        className="w-6 h-6 rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                          if (nextElement) nextElement.style.display = 'block';
                        }}
                      />
                    ) : null}
                    <div 
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        selectedInputToken === 'USDC' 
                          ? 'bg-blue-500' 
                          : 'bg-gradient-to-r from-green-500 to-yellow-500'
                      }`}
                      style={{ display: polygonTokens[selectedInputToken]?.logo ? 'none' : 'block' }}
                    >
                      <span className="text-white text-xs font-bold">
                        {selectedInputToken === 'USDC' ? '$' : 'B'}
                      </span>
                    </div>
                    <span className="text-white font-medium">{selectedInputToken}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInputAmount(polygonTokens[selectedInputToken]?.balance.toString() || '0')}
                    className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
                  >
                    MAX
                  </Button>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-slate-400 text-sm">
                    R${(parseFloat(inputAmount || '0') * 0.9944).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Token Breakdown */}
              {inputAmount && parseFloat(inputAmount) > 0 && (
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-3">Composição da liquidez</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <span className="text-blue-400 text-sm">$</span>
                        </div>
                        <span className="text-white font-medium">USDC.E</span>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-mono">{(parseFloat(inputAmount) * 0.427).toFixed(3)}</div>
                        <div className="text-slate-400 text-sm">R$11.64</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                          <span className="text-purple-400 text-sm">L</span>
                        </div>
                        <span className="text-white font-medium">LINK</span>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-mono">{(parseFloat(inputAmount) * 0.0262).toFixed(3)}</div>
                        <div className="text-slate-400 text-sm">R$12.89</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Countdown Timer */}
              <div className="flex items-center space-x-2 text-yellow-400">
                <div className="w-4 h-4 rounded-full bg-yellow-500 flex items-center justify-center">
                  <span className="text-black text-xs">⏰</span>
                </div>
                <span className="text-sm">O preço será atualizado em:</span>
                <span className="text-yellow-400 font-mono text-lg">{formatCountdown(countdown)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderStep3 = () => (
    <Card className="bg-slate-800/60 border border-slate-700/60 rounded-2xl">
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-white text-xl font-bold mb-2">Confirmação</h2>
            <p className="text-slate-400">Revise os detalhes antes de confirmar</p>
          </div>

          {/* Transaction Details */}
          <div className="space-y-4">
            <div className="bg-slate-700/30 rounded-lg p-4">
              <h3 className="text-white font-medium mb-3">Detalhes da Transação</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Par de tokens:</span>
                  <span className="text-white">{String(poolData.tokens?.[0]?.symbol || 'TOKEN1')}/{String(poolData.tokens?.[1]?.symbol || 'TOKEN2')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Preço mínimo:</span>
                  <span className="text-white">{minPrice.toFixed(8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Preço máximo:</span>
                  <span className="text-white">{maxPrice.toFixed(8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Taxa:</span>
                  <span className="text-white">{poolData.fee}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Rede:</span>
                  <span className="text-white">{poolData.chain}</span>
                </div>
              </div>
            </div>

            {/* Gas Fee */}
            <div className="bg-slate-700/30 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Taxa de gás estimada:</span>
                <span className="text-white">~$2.50</span>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div className="text-yellow-400 text-sm">
                <p className="font-medium mb-1">Atenção:</p>
                <p>Certifique-se de que os preços estão corretos. Uma vez confirmada, a transação não pode ser desfeita.</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <ProtectedRoute>
      <AppLayout
        title="Adicionar Liquidez"
        description="Configure sua posição de liquidez"
      >
        <div className="w-full max-w-4xl mx-auto px-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  onClick={handleBack}
                  variant="ghost"
                  className="text-slate-400 hover:text-white"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-white font-bold text-2xl">Configure a sua posição</h1>
                  <p className="text-slate-400 text-sm">Adição de liquidez</p>
                </div>
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center justify-center space-x-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step <= currentStep 
                      ? 'bg-yellow-500 text-black' 
                      : 'bg-slate-700 text-slate-400'
                  }`}>
                    {step}
                  </div>
                  {step < 3 && (
                    <div className={`w-8 h-0.5 mx-2 ${
                      step < currentStep ? 'bg-yellow-500' : 'bg-slate-700'
                    }`} />
                  )}
                </div>
              ))}
            </div>

            {/* Step Content */}
            <div className="max-w-2xl mx-auto">
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
            </div>

            {/* Navigation */}
            <div className="flex justify-end">
              <Button
                onClick={handleNext}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  (currentStep === 1 && !isStep1Valid()) || (currentStep === 2 && !isStep2Valid())
                    ? "bg-slate-600 text-slate-400 cursor-not-allowed"
                    : "bg-yellow-500 text-black hover:bg-yellow-600 shadow-lg"
                }`}
                disabled={(currentStep === 1 && !isStep1Valid()) || (currentStep === 2 && !isStep2Valid())}
              >
                {currentStep === 3 ? 'Finalizar' : 'Próximo'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}