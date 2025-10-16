'use client';

import { useState } from 'react';
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
    }
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
                  onClick={() => setPriceRange(range as any)}
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
        </div>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-white text-xl font-bold mb-2">Etapa 2</h2>
        <p className="text-slate-400">Configuração de valores</p>
      </div>
      {/* Conteúdo da etapa 2 será implementado */}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-white text-xl font-bold mb-2">Etapa 3</h2>
        <p className="text-slate-400">Confirmação e transação</p>
      </div>
      {/* Conteúdo da etapa 3 será implementado */}
    </div>
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
                className="bg-yellow-500 text-black hover:bg-yellow-600 px-6 py-3 rounded-lg"
                disabled={currentStep === 3}
              >
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}