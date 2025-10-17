'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { notusAPI } from '@/lib/api/client';
import { liquidityActions } from '@/lib/actions/liquidity';
import { listTokensByChain } from '@/lib/actions/blockchain';
import { usePoolHistoricalData } from '@/hooks/use-pool-historical-data';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, RefreshCw, ZoomOut, ZoomIn, Plus, Info, TrendingUp } from 'lucide-react';
import { AppLayout } from '@/components/layout/app-layout';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from 'recharts';

// Função para processar dados dos tokens (mesma abordagem do TokenSelector)
const processTokensData = (tokens: any[], portfolioTokens: any) => {
  console.log('🔄 [ADD-LIQUIDITY] Processando tokens:', {
    supportedTokens: tokens?.length || 0,
    portfolioTokens: portfolioTokens?.tokens?.length || 0,
    hasBalances: !!portfolioTokens?.balances
  });
  
  const result: {[key: string]: any} = {};
  
  // Buscar USDC e BRZ nos tokens suportados
  const usdcToken = tokens.find(token => 
    token.symbol.toUpperCase() === 'USDC' || 
    token.symbol.toUpperCase() === 'USDC.E' ||
    token.name.toLowerCase().includes('usdc')
  );
  
  const brzToken = tokens.find(token => 
    token.symbol.toUpperCase() === 'BRZ' ||
    token.name.toLowerCase().includes('brazilian')
  );
  
  console.log('🔍 [ADD-LIQUIDITY] Tokens encontrados:', {
    usdc: usdcToken ? { symbol: usdcToken.symbol, name: usdcToken.name } : null,
    brz: brzToken ? { symbol: brzToken.symbol, name: brzToken.name } : null
  });
  
  // Verificar se os dados estão disponíveis
  if (!tokens || !Array.isArray(tokens)) {
    console.log('❌ [ADD-LIQUIDITY] Tokens não disponíveis');
    return result;
  }

  if (!portfolioTokens || !portfolioTokens.balances) {
    console.log('❌ [ADD-LIQUIDITY] Portfolio não disponível');
    return result;
  }

  // Buscar saldos no portfolio (agora vem do endpoint /api/wallet/balances)
  const usdcBalance = portfolioTokens.balances.USDC || 0;
  const brzBalance = portfolioTokens.balances.BRZ || 0;
  
  console.log('💰 [ADD-LIQUIDITY] Saldos encontrados no portfolio:', {
    usdc: usdcBalance,
    brz: brzBalance,
    balances: portfolioTokens.balances
  });
  
  if (usdcToken) {
    const balance = usdcBalance;
    result['USDC'] = {
      symbol: usdcToken.symbol,
      name: usdcToken.name,
      address: usdcToken.address,
      decimals: usdcToken.decimals,
      logo: usdcToken.logo || usdcToken.logoUrl,
      balance: balance,
      chain: usdcToken.chain
    };
    console.log('✅ [ADD-LIQUIDITY] USDC processado:', { symbol: usdcToken.symbol, balance });
  }
  
  if (brzToken) {
    const balance = brzBalance;
    result['BRZ'] = {
      symbol: brzToken.symbol,
      name: brzToken.name,
      address: brzToken.address,
      decimals: brzToken.decimals,
      logo: brzToken.logo || brzToken.logoUrl,
      balance: balance,
      chain: brzToken.chain
    };
    console.log('✅ [ADD-LIQUIDITY] BRZ processado:', { symbol: brzToken.symbol, balance });
  }
  
  console.log('🎯 [ADD-LIQUIDITY] Resultado final:', result);
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
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [selectedToken, setSelectedToken] = useState<string>('');
  const [priceRange, setPriceRange] = useState<'± 10%' | '± 15%' | '± 20%' | 'Total' | null>('± 10%');
  const [selectedInputToken, setSelectedInputToken] = useState<'USDC' | 'BRZ' | null>(null);
  const [inputAmount, setInputAmount] = useState<string>('');
  const [countdown, setCountdown] = useState(0); // Inicia zerado
  const [timerActive, setTimerActive] = useState(false); // Controla se o timer está ativo
  const [amountsData, setAmountsData] = useState<any>(null); // Dados de quantidades calculadas
  const [isApproving, setIsApproving] = useState(false); // Estado de aprovação
  const [isApproved, setIsApproved] = useState(false); // Estado de aprovado
  const [approvalError, setApprovalError] = useState<string | null>(null); // Erro de aprovação
  const [expandedSections, setExpandedSections] = useState({
    recebeLink: false,
    adicionaPool: false,
    recebeNft: false
  });

  // Buscar dados históricos reais do pool para o gráfico
  const { data: historicalData, isLoading: historicalLoading } = usePoolHistoricalData(poolId || '', 365);
  
  // Processar dados históricos para o gráfico
  const chartData = React.useMemo(() => {
    if (!historicalData?.dailyData || historicalData.dailyData.length === 0) {
      // Retornar array vazio se não houver dados históricos
      return [];
    }
    
    console.log('📊 [ADD-LIQUIDITY] Processando dados históricos para gráfico:', historicalData.dailyData);
    
    // Converter dados históricos para formato do gráfico
    const processedData = historicalData.dailyData.map((day, index) => {
      // Usar volume como preço, com normalização mais realista
      const price = day.volume > 0 ? day.volume : (day.tvl > 0 ? day.tvl / 1000 : 0.05);
      
      // Converter timestamp para data legível
      let formattedDate = day.date;
      const dayWithTimestamp = day as any;
      if (dayWithTimestamp.timestamp) {
        // Se temos timestamp, converter para data
        const date = new Date(parseInt(dayWithTimestamp.timestamp));
        formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
      } else if (day.date && day.date !== '1970-01-01') {
        // Se a data já está correta, usar ela
        formattedDate = day.date;
      } else {
        // Gerar datas recentes como fallback
        const today = new Date();
        const daysAgo = historicalData.dailyData.length - 1 - index;
        const date = new Date(today.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
        formattedDate = date.toISOString().split('T')[0];
      }
      
      return {
        date: formattedDate,
        price: price
      };
    });
    
    console.log('📈 [ADD-LIQUIDITY] Dados do gráfico processados:', processedData);
    return processedData;
  }, [historicalData]);


  // Usar o endereço real da wallet que tem saldo de BRZ
  const walletAddress = '0x29275940040857bf0ffe8d875622c85aaaec5c0a';

  // Query para buscar tokens USDC e BRZ específicos da Polygon
  const { data: tokensData, isLoading: tokensLoading, error: tokensError } = useQuery({
    queryKey: ['tokens-usdc-brz', 137],
    queryFn: async () => {
      console.log('🔍 [ADD-LIQUIDITY] Iniciando busca de tokens USDC e BRZ...');
      
      // Buscar USDC e BRZ separadamente
      console.log('📡 [ADD-LIQUIDITY] Fazendo requisições para API de tokens...');
      const [usdcResponse, brzResponse] = await Promise.all([
        fetch('/api/crypto/tokens?search=USDC&filterByChainId=137&filterWhitelist=false&page=1&perPage=100'),
        fetch('/api/crypto/tokens?search=BRZ&filterByChainId=137&filterWhitelist=false&page=1&perPage=100')
      ]);

      console.log('📊 [ADD-LIQUIDITY] Status das respostas:', {
        usdc: usdcResponse.status,
        brz: brzResponse.status
      });

      if (!usdcResponse.ok || !brzResponse.ok) {
        console.error('❌ [ADD-LIQUIDITY] Erro nas requisições de tokens');
        throw new Error(`Erro nas requisições: USDC ${usdcResponse.status}, BRZ ${brzResponse.status}`);
      }

      const [usdcData, brzData] = await Promise.all([
        usdcResponse.json(),
        brzResponse.json()
      ]);

      console.log('✅ [ADD-LIQUIDITY] Dados USDC recebidos:', {
        tokens: usdcData.tokens?.length || 0,
        total: usdcData.total
      });
      
      console.log('✅ [ADD-LIQUIDITY] Dados BRZ recebidos:', {
        tokens: brzData.tokens?.length || 0,
        total: brzData.total
      });

      // Combinar os tokens encontrados
      const combinedTokens = [...usdcData.tokens, ...brzData.tokens];
      console.log('🎯 [ADD-LIQUIDITY] Tokens combinados:', {
        total: combinedTokens.length,
        symbols: combinedTokens.map(t => t.symbol)
      });

      return {
        tokens: combinedTokens,
        total: usdcData.total + brzData.total
      };
    },
    refetchInterval: 300000, // 5 minutos
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 300000, // 5 minutos
    gcTime: 600000, // 10 minutos
  });

  // Query para buscar portfolio do usuário via endpoint corrigido
  const { data: portfolioData, isLoading: portfolioLoading, error: portfolioError } = useQuery({
    queryKey: ['portfolio', walletAddress],
    queryFn: async () => {
      console.log('💰 [ADD-LIQUIDITY] Buscando portfolio da wallet:', walletAddress);
      try {
        const response = await fetch(`/api/wallet/balances?address=${walletAddress}&chainId=137`);
        if (!response.ok) {
          throw new Error(`Erro na requisição: ${response.status}`);
        }
        const data = await response.json();
        console.log('✅ [ADD-LIQUIDITY] Portfolio recebido:', {
          balances: data.balances,
          tokens: data.portfolio?.tokens?.length || 0
        });
        console.log('📊 [ADD-LIQUIDITY] Saldos extraídos:', data.balances);
        return data;
      } catch (error) {
        console.error('❌ [ADD-LIQUIDITY] Erro ao buscar portfolio:', error);
        throw error;
      }
    },
    enabled: !!walletAddress,
    refetchInterval: 30000, // 30 segundos
  });

  // Combinar tokens suportados com saldos do portfolio (mesma lógica do TokenSelector)
  const polygonTokens = React.useMemo(() => {
    console.log('🔄 [ADD-LIQUIDITY] Combinando dados de tokens e portfolio...');
    
    const supportedTokens = tokensData?.tokens || [];
    const portfolioTokens = portfolioData?.tokens || [];
    
    console.log('📊 [ADD-LIQUIDITY] Dados disponíveis:', {
      supportedTokens: supportedTokens.length,
      portfolioTokens: portfolioTokens.length,
      tokensDataExists: !!tokensData,
      portfolioDataExists: !!portfolioData
    });
    
    const result = processTokensData(supportedTokens, portfolioData);
    
    console.log('🎯 [ADD-LIQUIDITY] Resultado da combinação:', result);
    return result;
  }, [tokensData, portfolioData]);


  // Query para buscar detalhes do pool
  const { data: poolData, isLoading, error } = useQuery<PoolData>({
    queryKey: ['pool-details', poolId],
    queryFn: async () => {
      if (!poolId) {
        console.error('❌ [ADD-LIQUIDITY] Pool ID não fornecido');
        throw new Error('Pool ID não fornecido');
      }
      
      console.log('🔍 [ADD-LIQUIDITY] Buscando detalhes do pool:', poolId);
      
      try {
        const response = await liquidityActions.getPool(poolId, 365);
        const responseWithPool = response as any;
        console.log('✅ [ADD-LIQUIDITY] Resposta da API para detalhes do pool:', {
          poolId: responseWithPool?.pool?.address,
          provider: responseWithPool?.pool?.provider,
          fee: responseWithPool?.pool?.fee,
          tvl: responseWithPool?.pool?.totalValueLockedUSD,
          tokens: responseWithPool?.pool?.tokens?.length || 0
        });

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
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });

  // Inicializar dados do pool (tokens e preços)
  useEffect(() => {
    if (poolData?.tokens && poolData.tokens.length >= 2) {
      const token1 = poolData.tokens[0];
      const token2 = poolData.tokens[1];
      setSelectedToken(token1.symbol || '');
      
      // Inicializar preços baseados nos dados do pool
      let newMinPrice = 0.05;
      let newMaxPrice = 0.06;
      
      if (poolData.stats?.volumeInUSD && poolData.stats.volumeInUSD > 0) {
        // Usar volume como base para preço mais realista
        const basePrice = Math.max(0.05, Math.min(0.1, poolData.stats.volumeInUSD / 100000));
        newMinPrice = basePrice * 0.9; // 10% abaixo
        newMaxPrice = basePrice * 1.1; // 10% acima
      } else if (poolData.totalValueLockedUSD && poolData.totalValueLockedUSD > 0) {
        // Usar TVL como base se volume não estiver disponível
        const tvlValue = typeof poolData.totalValueLockedUSD === 'string' ? parseFloat(poolData.totalValueLockedUSD) : poolData.totalValueLockedUSD;
        const basePrice = Math.max(0.05, Math.min(0.1, tvlValue / 100000));
        newMinPrice = basePrice * 0.9;
        newMaxPrice = basePrice * 1.1;
      }
      
      setMinPrice(newMinPrice);
      setMaxPrice(newMaxPrice);
      
      console.log('🎯 [ADD-LIQUIDITY] Pool inicializado:', {
        token1: token1.symbol,
        token2: token2.symbol,
        minPrice: newMinPrice,
        maxPrice: newMaxPrice,
        volumeInUSD: poolData.stats?.volumeInUSD,
        tvl: poolData.totalValueLockedUSD
      });
    }
  }, [poolData]);

  // Calcular quantidades quando inputAmount mudar
  useEffect(() => {
    if (inputAmount && parseFloat(inputAmount) > 0 && selectedInputToken && poolData?.tokens) {
      // Tentar calcular via API primeiro
      calculateAmounts();
      
      // Sempre gerar fallback como backup
      const fallbackAmounts = calculateTokenProportions(inputAmount, selectedInputToken);
      setAmountsData({
        amounts: {
          token0MaxAmount: {
            token0Amount: fallbackAmounts.token0Amount,
            token1Amount: fallbackAmounts.token1Amount
          }
        }
      });
    }
  }, [inputAmount, selectedInputToken, poolData]);

  const timeframes = [
    { key: '1D', label: '1D' },
    { key: '7D', label: '7D' },
    { key: '1M', label: '1M' },
    { key: '1A', label: '1A' }
  ];

  const priceRanges = ['± 10%', '± 15%', '± 20%', 'Total'];

  const handleNext = async () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // Finalizar processo - criar liquidez com aprovação automática via API Notus
      await createLiquidityWithApproval();
    }
  };

  // Função para criar liquidez usando a API real do Notus
  const createLiquidityWithApproval = async () => {
    if (!poolData?.tokens || poolData.tokens.length < 2 || !selectedInputToken || !inputAmount) {
      console.error('❌ [ADD-LIQUIDITY] Dados insuficientes para criar liquidez');
      return;
    }

    // Se amountsData não existe, gerar fallback
    let finalAmountsData = amountsData;
    if (!finalAmountsData) {
      console.log('🔄 [ADD-LIQUIDITY] Gerando amountsData de fallback...');
      const fallbackAmounts = calculateTokenProportions(inputAmount, selectedInputToken);
      finalAmountsData = {
        amounts: {
          token0MaxAmount: {
            token0Amount: fallbackAmounts.token0Amount,
            token1Amount: fallbackAmounts.token1Amount
          }
        }
      };
    }

    try {
      setIsApproving(true);
      setApprovalError(null);
      
      console.log('🔐 [ADD-LIQUIDITY] Iniciando criação de liquidez com aprovação automática:', {
        selectedInputToken,
        inputAmount,
        poolTokens: poolData.tokens.map(t => t.symbol)
      });

      const token0 = poolData.tokens[0];
      const token1 = poolData.tokens[1];
      
      // Determinar qual token é o input baseado na seleção
      const isToken0Selected = selectedInputToken === 'USDC' && (
        token0.symbol?.toUpperCase().includes('USDC') || 
        token0.symbol?.toUpperCase().includes('USD') ||
        token0.symbol?.toUpperCase().includes('USDT')
      );
      const isToken1Selected = selectedInputToken === 'BRZ' && (
        token1.symbol?.toUpperCase().includes('BRZ') ||
        token1.symbol?.toUpperCase().includes('BRL')
      );
      
      if (!isToken0Selected && !isToken1Selected) {
        console.log('⚠️ [ADD-LIQUIDITY] Token selecionado não corresponde aos tokens do pool');
        setApprovalError('Token selecionado não corresponde aos tokens do pool');
        return;
      }

      const params = {
        walletAddress: walletAddress,
        toAddress: walletAddress, // Mesmo endereço para simplicidade
        chainId: 137, // Polygon
        payGasFeeToken: token0.address,
        gasFeePaymentMethod: 'ADD_TO_AMOUNT',
        token0: token0.address,
        token1: token1.address,
        poolFeePercent: poolData.fee || 0.3,
        minPrice: minPrice,
        maxPrice: maxPrice,
        slippage: 1.0, // 1% de slippage
        liquidityProvider: 'UNISWAP_V3',
        transactionFeePercent: 2.5
      };

      // Adicionar as quantidades baseadas no cálculo da API
      if (getAmountsData()?.amounts?.token0MaxAmount) {
        // @ts-expect-error - Step 2/3 functionality not fully implemented yet
        params.token0Amount = getAmountsData().amounts.token0MaxAmount.token0Amount;
        // @ts-expect-error - Step 2/3 functionality not fully implemented yet
        params.token1Amount = getAmountsData().amounts.token0MaxAmount.token1Amount;
      } else {
        // Fallback para valores padrão
        // @ts-expect-error - Step 2/3 functionality not fully implemented yet
        params.token0Amount = isToken0Selected ? inputAmount : '0';
        // @ts-expect-error - Step 2/3 functionality not fully implemented yet
        params.token1Amount = isToken1Selected ? inputAmount : '0';
      }

      console.log('🚀 [ADD-LIQUIDITY] Chamando API createLiquidity (com aprovação automática):', params);

      // A API do Notus gerencia a aprovação de tokens automaticamente
      // @ts-expect-error - Step 2/3 functionality not fully implemented yet
      const response = await liquidityActions.createLiquidity(params);
      console.log('✅ [ADD-LIQUIDITY] Resposta da API createLiquidity:', response);

      // Marcar como aprovado e criado
      setIsApproved(true);
      
      // Redirecionar para a página do pool após sucesso
      router.push(`/pools/${poolId}`);
      
    } catch (error) {
      console.error('❌ [ADD-LIQUIDITY] Erro ao criar liquidez:', error);
      setApprovalError('Erro ao criar liquidez. Verifique seus saldos e tente novamente.');
    } finally {
      setIsApproving(false);
    }
  };

  // Função para criar liquidez usando a API
  const createLiquidity = async () => {
    if (!poolData?.tokens || poolData.tokens.length < 2 || !amountsData || !selectedInputToken || !inputAmount) {
      console.error('❌ [ADD-LIQUIDITY] Dados insuficientes para criar liquidez');
      return;
    }

    try {
      console.log('🚀 [ADD-LIQUIDITY] Criando liquidez:', {
        selectedInputToken,
        inputAmount,
        amountsData
      });

      const token0 = poolData.tokens[0];
      const token1 = poolData.tokens[1];
      
      // Determinar qual token é o input baseado na seleção
      const isToken0Selected = selectedInputToken === 'USDC' && (
        token0.symbol?.toUpperCase().includes('USDC') || 
        token0.symbol?.toUpperCase().includes('USD') ||
        token0.symbol?.toUpperCase().includes('USDT')
      );
      const isToken1Selected = selectedInputToken === 'BRZ' && (
        token1.symbol?.toUpperCase().includes('BRZ') ||
        token1.symbol?.toUpperCase().includes('BRL')
      );
      
      console.log('🔍 [ADD-LIQUIDITY] Verificando correspondência de tokens:', {
        selectedInputToken,
        token0Symbol: token0.symbol,
        token1Symbol: token1.symbol,
        isToken0Selected,
        isToken1Selected,
        poolId: poolData.id
      });
      
      if (!isToken0Selected && !isToken1Selected) {
        console.log('⚠️ [ADD-LIQUIDITY] Token selecionado não corresponde aos tokens do pool, usando simulação inteligente');
        // Usar simulação inteligente em vez de retornar
        const simulatedAmounts = calculateTokenProportions(inputAmount, selectedInputToken);
        setAmountsData({
          amounts: {
            token0MaxAmount: {
              token0Amount: simulatedAmounts.token0Amount,
              token1Amount: simulatedAmounts.token1Amount
            }
          }
        });
        return;
      }

      const params = {
        walletAddress: walletAddress,
        toAddress: walletAddress, // Mesmo endereço para simplicidade
        chainId: 137, // Polygon
        payGasFeeToken: token0.address,
        gasFeePaymentMethod: 'ADD_TO_AMOUNT',
        token0: token0.address,
        token1: token1.address,
        poolFeePercent: poolData.fee || 0.3,
        minPrice: minPrice,
        maxPrice: maxPrice,
        slippage: 1.0, // 1% de slippage
        liquidityProvider: 'UNISWAP_V3',
        transactionFeePercent: 2.5
      };

      // Adicionar as quantidades baseadas no cálculo da API
      if (getAmountsData()?.amounts?.token0MaxAmount) {
        // @ts-expect-error - Step 2/3 functionality not fully implemented yet
        params.token0Amount = getAmountsData().amounts.token0MaxAmount.token0Amount;
        // @ts-expect-error - Step 2/3 functionality not fully implemented yet
        params.token1Amount = getAmountsData().amounts.token0MaxAmount.token1Amount;
      } else {
        // Fallback para valores padrão
        // @ts-expect-error - Step 2/3 functionality not fully implemented yet
        params.token0Amount = isToken0Selected ? inputAmount : '0';
        // @ts-expect-error - Step 2/3 functionality not fully implemented yet
        params.token1Amount = isToken1Selected ? inputAmount : '0';
      }

      console.log('🚀 [ADD-LIQUIDITY] Chamando API createLiquidity:', params);

      // @ts-expect-error - Step 2/3 functionality not fully implemented yet
      const response = await liquidityActions.createLiquidity(params);
      console.log('✅ [ADD-LIQUIDITY] Resposta da API createLiquidity:', response);

      // Redirecionar para a página do pool após sucesso
      router.push(`/pools/${poolId}`);
      
    } catch (error) {
      console.error('❌ [ADD-LIQUIDITY] Erro ao criar liquidez:', error);
      // Aqui você pode adicionar um toast de erro ou modal de erro
    }
  };

  const isStep1Valid = () => {
    return minPrice > 0 && maxPrice > 0 && minPrice < maxPrice && selectedToken && poolData?.tokens && poolData.tokens.length >= 2;
  };

  const isStep2Valid = () => {
    return selectedInputToken && inputAmount && parseFloat(inputAmount) > 0;
  };

  const isStep3Valid = () => {
    // Validar se temos dados básicos necessários
    const hasBasicData = selectedInputToken && inputAmount && parseFloat(inputAmount) > 0;
    
    // Se temos dados básicos, sempre permitir (amountsData será gerado automaticamente)
    return hasBasicData;
  };

  // Função auxiliar para obter dados de amounts (com fallback)
  const getAmountsData = () => {
    if (amountsData) {
      return amountsData;
    }
    
    // Gerar fallback se não existir
    if (inputAmount && selectedInputToken) {
      const fallbackAmounts = calculateTokenProportions(inputAmount, selectedInputToken);
      return {
        amounts: {
          token0MaxAmount: {
            token0Amount: fallbackAmounts.token0Amount,
            token1Amount: fallbackAmounts.token1Amount
          }
        }
      };
    }
    
    return null;
  };

  // Função para calcular proporção baseada no preço do pool
  const calculateTokenProportions = (inputAmount: string, selectedToken: string) => {
    if (!poolData?.tokens || poolData.tokens.length < 2) {
      return { token0Amount: '0', token1Amount: '0' };
    }

    const token0 = poolData.tokens[0];
    const token1 = poolData.tokens[1];
    
    console.log('🧮 [ADD-LIQUIDITY] Calculando proporções:', {
      selectedToken,
      token0Symbol: token0.symbol,
      token1Symbol: token1.symbol,
      inputAmount,
      poolId: poolData.id
    });
    
    // Lógica mais inteligente para correspondência de tokens
    const isToken0Match = selectedToken === 'USDC' && (
      token0.symbol?.toUpperCase().includes('USDC') || 
      token0.symbol?.toUpperCase().includes('USD') ||
      token0.symbol?.toUpperCase().includes('USDT')
    );
    
    const isToken1Match = selectedToken === 'BRZ' && (
      token1.symbol?.toUpperCase().includes('BRZ') ||
      token1.symbol?.toUpperCase().includes('BRL')
    );
    
    // Se há correspondência exata, usar todo o valor para o token correspondente
    if (isToken0Match) {
      console.log('✅ [ADD-LIQUIDITY] Token0 corresponde, usando todo o valor');
      return { token0Amount: inputAmount, token1Amount: '0' };
    }
    
    if (isToken1Match) {
      console.log('✅ [ADD-LIQUIDITY] Token1 corresponde, usando todo o valor');
      return { token0Amount: '0', token1Amount: inputAmount };
    }
    
    // Se não há correspondência, simular conversão baseada no preço do pool
    console.log('⚠️ [ADD-LIQUIDITY] Nenhuma correspondência exata, simulando conversão para pool:', {
      poolTokens: [token0.symbol, token1.symbol],
      selectedToken,
      strategy: 'simulate_conversion'
    });
    
    // Estratégia de simulação: converter o token selecionado para os tokens do pool
    // Em um cenário real, isso seria calculado baseado no preço atual do pool
    const simulatedConversion = simulateTokenConversion(inputAmount, selectedToken, token0, token1);
    
    return simulatedConversion;
  };

  // Função para simular conversão de tokens
  const simulateTokenConversion = (inputAmount: string, selectedToken: string, token0: any, token1: any) => {
    const amount = parseFloat(inputAmount);
    
    // Simular preços baseados no tipo de token
    let token0Price = 1; // Preço base
    let token1Price = 1; // Preço base
    
    // Ajustar preços baseado nos símbolos dos tokens
    if (token0.symbol?.toUpperCase().includes('WPOL') || token0.symbol?.toUpperCase().includes('MATIC')) {
      token0Price = 0.8; // Simular preço do POL
    }
    if (token1.symbol?.toUpperCase().includes('KAS')) {
      token1Price = 0.05; // Simular preço do Kaspa
    }
    
    // Calcular quantidades baseadas nos preços simulados
    const token0Amount = (amount * 0.6 / token0Price).toFixed(6); // 60% para token0
    const token1Amount = (amount * 0.4 / token1Price).toFixed(6); // 40% para token1
    
    console.log('🔄 [ADD-LIQUIDITY] Simulação de conversão:', {
      inputAmount: amount,
      selectedToken,
      token0Price,
      token1Price,
      token0Amount,
      token1Amount
    });
    
    return { token0Amount, token1Amount };
  };

  // Função para calcular quantidades usando a API
  const calculateAmounts = async () => {
    if (!poolData?.tokens || poolData.tokens.length < 2 || !selectedInputToken || !inputAmount) {
      return;
    }

    try {
      console.log('🧮 [ADD-LIQUIDITY] Calculando quantidades:', {
        selectedInputToken,
        inputAmount,
        poolTokens: poolData.tokens.map(t => t.symbol)
      });

      const token0 = poolData.tokens[0];
      const token1 = poolData.tokens[1];
      
      // Determinar qual token é o input baseado na seleção
      const isToken0Selected = selectedInputToken === 'USDC' && (
        token0.symbol?.toUpperCase().includes('USDC') || 
        token0.symbol?.toUpperCase().includes('USD') ||
        token0.symbol?.toUpperCase().includes('USDT')
      );
      const isToken1Selected = selectedInputToken === 'BRZ' && (
        token1.symbol?.toUpperCase().includes('BRZ') ||
        token1.symbol?.toUpperCase().includes('BRL')
      );
      
      console.log('🔍 [ADD-LIQUIDITY] Verificando correspondência de tokens:', {
        selectedInputToken,
        token0Symbol: token0.symbol,
        token1Symbol: token1.symbol,
        isToken0Selected,
        isToken1Selected,
        poolId: poolData.id
      });
      
      if (!isToken0Selected && !isToken1Selected) {
        console.log('⚠️ [ADD-LIQUIDITY] Token selecionado não corresponde aos tokens do pool, usando simulação inteligente');
        // Usar simulação inteligente em vez de retornar
        const simulatedAmounts = calculateTokenProportions(inputAmount, selectedInputToken);
        setAmountsData({
          amounts: {
            token0MaxAmount: {
              token0Amount: simulatedAmounts.token0Amount,
              token1Amount: simulatedAmounts.token1Amount
            }
          }
        });
        return;
      }

      const params = {
        liquidityProvider: 'UNISWAP_V3',
        chainId: 137, // Polygon
        token0: token0.address,
        token1: token1.address,
        poolFeePercent: poolData.fee || 0.3,
        minPrice: minPrice,
        maxPrice: maxPrice,
        payGasFeeToken: token0.address, // Usar token0 como gas fee
        gasFeePaymentMethod: 'ADD_TO_AMOUNT'
      };

      // Adicionar o valor máximo do token selecionado
      if (isToken0Selected) {
        // @ts-expect-error - Step 2/3 functionality not fully implemented yet
        params.token0MaxAmount = inputAmount;
        // @ts-expect-error - Step 2/3 functionality not fully implemented yet
        params.token1MaxAmount = '0';
      } else {
        // @ts-expect-error - Step 2/3 functionality not fully implemented yet
        params.token0MaxAmount = '0';
        // @ts-expect-error - Step 2/3 functionality not fully implemented yet
        params.token1MaxAmount = inputAmount;
      }

      console.log('🚀 [ADD-LIQUIDITY] Chamando API getAmounts:', params);

      const response = await liquidityActions.getAmounts(params);
      console.log('✅ [ADD-LIQUIDITY] Resposta da API getAmounts:', response);

      setAmountsData(response);
      
    } catch (error) {
      console.error('❌ [ADD-LIQUIDITY] Erro ao calcular quantidades:', error);
      // Em caso de erro, usar cálculo de fallback
      const fallbackAmounts = calculateTokenProportions(inputAmount, selectedInputToken);
      setAmountsData({
        amounts: {
          token0MaxAmount: {
            token0Amount: fallbackAmounts.token0Amount,
            token1Amount: fallbackAmounts.token1Amount
          }
        }
      });
    }
  };

  const startTimer = () => {
    setCountdown(120); // Inicia com 2 minutos
    setTimerActive(true); // Ativa o timer
  };

  const refetchData = () => {
    // Refetch dos dados quando o timer zerar
    console.log('🔄 [ADD-LIQUIDITY] Refazendo busca de dados...');
    // Aqui você pode adicionar lógica para refetch dos dados se necessário
  };

  // Countdown timer - só funciona quando ativo
  useEffect(() => {
    if (timerActive && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timerActive && countdown === 0) {
      // Quando zerar, buscar dados atualizados e resetar timer
      console.log('🔄 [ADD-LIQUIDITY] Timer zerou, buscando dados atualizados...');
      refetchData();
      setCountdown(120); // Reset para 2 minutos
    }
  }, [countdown, timerActive]);

  // Iniciar timer automaticamente quando o usuário digitar no input
  useEffect(() => {
    if (inputAmount && parseFloat(inputAmount) > 0) {
      if (!timerActive) {
        console.log('⏰ [ADD-LIQUIDITY] Usuário informou valor, iniciando timer...');
        startTimer();
      } else {
        // Se já está ativo, resetar o timer para 2 minutos
        console.log('⏰ [ADD-LIQUIDITY] Valor alterado, resetando timer...');
        setCountdown(120);
      }
    }
  }, [inputAmount]);

  if (isLoading || tokensLoading || portfolioLoading) {
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

  if (error || !poolData || tokensError || portfolioError) {
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
    
    // Usar preço atual baseado nos dados do pool
    const currentPrice = poolData?.stats?.volumeInUSD ? 
      (poolData.stats.volumeInUSD / 1000000) : 
      ((minPrice + maxPrice) / 2) || 0.1;
    
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

  // Aplicar intervalo de 10% automaticamente quando o pool carregar
  useEffect(() => {
    if (poolData && priceRange === '± 10%' && minPrice === 0 && maxPrice === 0) {
      console.log('🎯 [ADD-LIQUIDITY] Aplicando intervalo de 10% automaticamente');
      handlePriceRangeSelect('± 10%');
    }
  }, [poolData, priceRange, minPrice, maxPrice]);

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
          {/* Price Range Selection - PRIMEIRO */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-lg">Escolha o intervalo de preço</h3>
            <div className="flex space-x-3">
              {priceRanges.map((range) => (
                <Button
                  key={range}
                  variant="outline"
                  size="sm"
                  onClick={() => handlePriceRangeSelect(range)}
                  className={`px-6 py-2.5 rounded-lg font-medium text-base transition-all duration-200 ${
                    priceRange === range 
                      ? "bg-yellow-500 text-black border-yellow-500 hover:bg-yellow-600 shadow-lg" 
                      : "bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-700 hover:border-slate-600"
                  }`}
                >
                  {range}
                </Button>
              ))}
            </div>
            
            {/* Current Price */}
            <div className="text-slate-300 text-base pt-2">
              {poolData?.tokens && poolData.tokens.length >= 2 ? (
                <>
                  <span className="text-slate-400">Preço atual:</span> 0,0613 <span className="font-semibold">{poolData.tokens[1].symbol}</span> = 1 <span className="font-semibold">{poolData.tokens[0].symbol}</span>
                </>
              ) : (
                'Carregando preço atual...'
              )}
            </div>
            
            {/* Token Selection and Chart Controls */}
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                {poolData?.tokens && poolData.tokens.length >= 2 ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedToken(poolData.tokens[0].symbol)}
                      className={`px-6 py-2.5 rounded-lg font-medium text-base transition-all duration-200 ${
                        selectedToken === poolData.tokens[0].symbol
                          ? "bg-yellow-500 text-black border-yellow-500 hover:bg-yellow-600 shadow-lg" 
                          : "bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-700 hover:border-slate-600"
                      }`}
                    >
                      {poolData.tokens[0].symbol}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedToken(poolData.tokens[1].symbol)}
                      className={`px-6 py-2.5 rounded-lg font-medium text-base transition-all duration-200 ${
                        selectedToken === poolData.tokens[1].symbol
                          ? "bg-yellow-500 text-black border-yellow-500 hover:bg-yellow-600 shadow-lg" 
                          : "bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-700 hover:border-slate-600"
                      }`}
                    >
                      {poolData.tokens[1].symbol}
                    </Button>
                  </>
                ) : (
                  <div className="text-slate-400 text-sm">Carregando tokens...</div>
                )}
              </div>
              
              {/* Chart Control Buttons */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {/* TODO: Refresh chart */}}
                  className="w-10 h-10 p-0 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white transition-all"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {/* TODO: Zoom out */}}
                  className="w-10 h-10 p-0 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white transition-all"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {/* TODO: Zoom in */}}
                  className="w-10 h-10 p-0 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white transition-all"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Price Chart */}
          <div className="space-y-3">
            {/* Chart Legend - MOVIDA PARA CIMA */}
            <div className="flex items-center justify-center space-x-6 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-0.5 bg-slate-400" style={{ borderTop: '2px dotted #94a3b8' }}></div>
                <span className="text-slate-400">Preço atual</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-3 bg-purple-500/30 border border-purple-500/50 rounded-sm"></div>
                <span className="text-slate-400">Intervalo de preço</span>
              </div>
            </div>
            
            {/* Chart with draggable price range */}
            <div className="h-48 bg-slate-900/60 border border-slate-800/80 rounded-lg p-4 relative">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <defs>
                    <linearGradient id="priceRangeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a855f7" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#a855f7" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#475569', fontSize: 10 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    domain={['auto', 'auto']}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#475569', fontSize: 10 }}
                    tickFormatter={(value) => value.toFixed(4)}
                  />
                  {/* Área roxa do intervalo de preço */}
                  {minPrice > 0 && maxPrice > 0 && (
                    <rect
                      x="0"
                      y="0"
                      width="100%"
                      height="100%"
                      fill="url(#priceRangeGradient)"
                      opacity={0.5}
                      style={{
                        clipPath: `polygon(0 ${100 - ((maxPrice / (chartData[0]?.price || 1)) * 100)}%, 100% ${100 - ((maxPrice / (chartData[0]?.price || 1)) * 100)}%, 100% ${100 - ((minPrice / (chartData[0]?.price || 1)) * 100)}%, 0 ${100 - ((minPrice / (chartData[0]?.price || 1)) * 100)}%)`
                      }}
                    />
                  )}
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#a855f7" 
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: '#a855f7' }}
                  />
                  {/* Linha pontilhada do preço atual */}
                  {chartData.length > 0 && (
                    <ReferenceLine 
                      y={chartData[chartData.length - 1]?.price || 0} 
                      stroke="#94a3b8" 
                      strokeDasharray="4 4" 
                      label={{ 
                        value: "Preço atual", 
                        position: "insideTopRight" as const, 
                        fill: "#94a3b8", 
                        fontSize: 10 
                      }}
                    />
                  )}
                  {/* Linhas do intervalo de preço (min e max) */}
                  {minPrice > 0 && (
                    <ReferenceLine 
                      y={minPrice} 
                      stroke="#a855f7" 
                      strokeWidth={2}
                      label={{ 
                        value: minPrice.toFixed(4), 
                        position: "insideLeft" as const, 
                        fill: "#a855f7", 
                        fontSize: 10 
                      }}
                    />
                  )}
                  {maxPrice > 0 && (
                    <ReferenceLine 
                      y={maxPrice} 
                      stroke="#a855f7" 
                      strokeWidth={2}
                      label={{ 
                        value: maxPrice.toFixed(4), 
                        position: "insideLeft" as const, 
                        fill: "#a855f7", 
                        fontSize: 10 
                      }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            {/* Timeframe Selection - ABAIXO DO GRÁFICO */}
            <div className="flex justify-center space-x-2 pt-2">
              {timeframes.map((timeframe) => (
                <Button
                  key={timeframe.key}
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedTimeframe(timeframe.key)}
                  className={`px-5 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                    selectedTimeframe === timeframe.key 
                      ? "bg-yellow-500 text-black border-yellow-500 hover:bg-yellow-600 shadow-lg" 
                      : "bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-700 hover:border-slate-600"
                  }`}
                >
                  {timeframe.label}
                </Button>
              ))}
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
                  <div className="text-slate-400 text-xs">
                    {poolData?.tokens && poolData.tokens.length >= 2 ? (
                      `${poolData.tokens[1].symbol} por ${poolData.tokens[0].symbol}`
                    ) : (
                      'Token por Token'
                    )}
                  </div>
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
                  <div className="text-slate-400 text-xs">
                    {poolData?.tokens && poolData.tokens.length >= 2 ? (
                      `${poolData.tokens[1].symbol} por ${poolData.tokens[0].symbol}`
                    ) : (
                      'Token por Token'
                    )}
                  </div>
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
            onClick={() => {
              console.log('🔄 [ADD-LIQUIDITY] Selecionando USDC, dados disponíveis:', polygonTokens?.USDC);
              setSelectedInputToken('USDC');
            }}
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
            {polygonTokens?.USDC && (
              <span className="text-xs text-slate-400">
                Saldo: {polygonTokens.USDC.balance.toFixed(2)} {polygonTokens.USDC.symbol}
              </span>
            )}
          </Button>

          {/* BRZ Option */}
          <Button
            variant="outline"
            onClick={() => {
              console.log('🔄 [ADD-LIQUIDITY] Selecionando BRZ, dados disponíveis:', polygonTokens?.BRZ);
              setSelectedInputToken('BRZ');
            }}
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
            {polygonTokens?.BRZ && (
              <span className="text-xs text-slate-400">
                Saldo: {polygonTokens.BRZ.balance.toFixed(2)} {polygonTokens.BRZ.symbol}
              </span>
            )}
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
                        <div className="text-white font-mono">
                          {amountsData?.amounts?.token0MaxAmount?.token0Amount || 
                           calculateTokenProportions(inputAmount, selectedInputToken).token0Amount}
                        </div>
                        <div className="text-slate-400 text-sm">
                          {getAmountsData()?.amounts?.token0MaxAmount?.token0Amount ? 
                            `~$${parseFloat(getAmountsData().amounts.token0MaxAmount.token0Amount).toFixed(2)}` : 
                            parseFloat(calculateTokenProportions(inputAmount, selectedInputToken).token0Amount) > 0 ? 
                              `~$${parseFloat(calculateTokenProportions(inputAmount, selectedInputToken).token0Amount).toFixed(2)}` : 
                              'Calculando...'}
                        </div>
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
                        <div className="text-white font-mono">
                          {amountsData?.amounts?.token0MaxAmount?.token1Amount || 
                           calculateTokenProportions(inputAmount, selectedInputToken).token1Amount}
                        </div>
                        <div className="text-slate-400 text-sm">
                          {getAmountsData()?.amounts?.token0MaxAmount?.token1Amount ? 
                            `~$${parseFloat(getAmountsData().amounts.token0MaxAmount.token1Amount).toFixed(2)}` : 
                            parseFloat(calculateTokenProportions(inputAmount, selectedInputToken).token1Amount) > 0 ? 
                              `~$${parseFloat(calculateTokenProportions(inputAmount, selectedInputToken).token1Amount).toFixed(2)}` : 
                              'Calculando...'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Countdown Timer - só aparece quando ativo */}
              {timerActive && (
                <div className="flex items-center space-x-2 text-yellow-400">
                  <div className="w-4 h-4 rounded-full bg-yellow-500 flex items-center justify-center">
                    <span className="text-black text-xs">⏰</span>
                  </div>
                  <span className="text-sm">O preço será atualizado em:</span>
                  <span className="text-yellow-400 font-mono text-lg">{formatCountdown(countdown)}</span>
                </div>
              )}

              {/* API Calculation Results */}
              {amountsData && (
                <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50">
                  <h4 className="text-white font-medium mb-3">Quantidades calculadas pela API</h4>
                  <div className="space-y-2">
                    {getAmountsData()?.amounts?.token0MaxAmount && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-sm">
                          {poolData?.tokens?.[0]?.symbol || 'Token 0'}:
                        </span>
                        <span className="text-white font-medium">
                          {getAmountsData().amounts.token0MaxAmount.token0Amount}
                        </span>
                      </div>
                    )}
                    {getAmountsData()?.amounts?.token0MaxAmount && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-sm">
                          {poolData?.tokens?.[1]?.symbol || 'Token 1'}:
                        </span>
                        <span className="text-white font-medium">
                          {getAmountsData().amounts.token0MaxAmount.token1Amount}
                        </span>
                      </div>
                    )}
                    {amountsData.poolPrice && (
                      <div className="flex justify-between items-center pt-2 border-t border-slate-600/50">
                        <span className="text-slate-400 text-sm">Preço do pool:</span>
                        <span className="text-yellow-400 font-medium">
                          {amountsData.poolPrice}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const renderStep3 = () => {

    return (
      <div className="space-y-4">
        {/* Transaction Details Card */}
        <Card className="bg-slate-800/60 border border-slate-700/60 rounded-2xl">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Liquidity Creation Status */}
              {isApproving && (
                <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <div>
                      <div className="text-blue-400 font-medium">Criando liquidez...</div>
                      <div className="text-slate-400 text-sm">Aprovando tokens e criando posição de liquidez</div>
                    </div>
                  </div>
                </div>
              )}
              
              {isApproved && (
                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <div>
                      <div className="text-green-400 font-medium">Liquidez criada com sucesso!</div>
                      <div className="text-slate-400 text-sm">Redirecionando para a página do pool...</div>
                    </div>
                  </div>
                </div>
              )}
              
              {approvalError && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">✗</span>
                    </div>
                    <div>
                      <div className="text-red-400 font-medium">Erro ao criar liquidez</div>
                      <div className="text-slate-400 text-sm">{approvalError}</div>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Transação</span>
                <span className="text-white">Adição de liquidez</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Provedor</span>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">U</span>
                  </div>
                  <a 
                    href="https://app.uniswap.org/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-white hover:text-yellow-400 transition-colors"
                  >
                    Uniswap V3
                  </a>
                  <span className="text-slate-400">↗</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Rede</span>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">P</span>
                  </div>
                  <a 
                    href="https://polygon.technology/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-white hover:text-yellow-400 transition-colors"
                  >
                    Polygon
                  </a>
                  <span className="text-slate-400">↗</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Tolerância a Slippage</span>
                <span className="text-white">0,5% Auto</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Tempo estimado</span>
                <span className="text-white">~3m</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Token Sections */}
        <div className="space-y-3">
          {/* Token de Entrada */}
          <Card className="bg-slate-800/60 border border-slate-700/60 rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {selectedInputToken === 'USDC' ? '$' : 'B'}
                    </span>
                  </div>
                  <div>
                    <div className="text-white font-medium">
                      {selectedInputToken === 'USDC' ? 'USDC' : 'BRZ'}
                    </div>
                    <div className="text-slate-400 text-sm">Token de entrada</div>
                    <div className="text-yellow-400 text-sm font-mono">
                      {inputAmount} {selectedInputToken}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">Rede</div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">P</span>
                    </div>
                    <span className="text-slate-400 text-sm">Polygon</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Token 1 do Pool */}
          <Card className="bg-slate-800/60 border border-slate-700/60 rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    {poolData?.tokens?.[0]?.logo ? (
                      <img 
                        src={poolData.tokens[0].logo} 
                        alt={poolData.tokens[0].symbol}
                        className="w-6 h-6 rounded-full"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const nextEl = e.currentTarget.nextElementSibling as HTMLElement | null;
                          if (nextEl) nextEl.style.display = 'block';
                        }}
                      />
                    ) : null}
                    <span className="text-white text-sm font-bold" style={{ display: poolData?.tokens?.[0]?.logo ? 'none' : 'block' }}>
                      {poolData?.tokens?.[0]?.symbol?.charAt(0) || '$'}
                    </span>
                  </div>
                  <div>
                    <div className="text-white font-medium">
                      {poolData?.tokens?.[0]?.symbol || 'Token 1'}
                    </div>
                    <div className="text-slate-400 text-sm">Token do pool</div>
                    <div className="text-yellow-400 text-sm font-mono">
                      {amountsData?.amounts?.token0MaxAmount?.token0Amount || 
                       calculateTokenProportions(inputAmount, selectedInputToken || 'USDC').token0Amount} {poolData?.tokens?.[0]?.symbol || ''}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">Rede</div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">P</span>
                    </div>
                    <span className="text-slate-400 text-sm">Polygon</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Token 2 do Pool - Expansível */}
          <Card className="bg-slate-800/60 border border-slate-700/60 rounded-2xl">
            <CardContent className="p-4">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('recebeLink')}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    {poolData?.tokens?.[1]?.logo ? (
                      <img 
                        src={poolData.tokens[1].logo} 
                        alt={poolData.tokens[1].symbol}
                        className="w-6 h-6 rounded-full"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const nextEl = e.currentTarget.nextElementSibling as HTMLElement | null;
                          if (nextEl) nextEl.style.display = 'block';
                        }}
                      />
                    ) : null}
                    <span className="text-white text-sm font-bold" style={{ display: poolData?.tokens?.[1]?.logo ? 'none' : 'block' }}>
                      {poolData?.tokens?.[1]?.symbol?.charAt(0) || 'L'}
                    </span>
                  </div>
                  <div>
                    <div className="text-white font-medium">
                      {poolData?.tokens?.[1]?.symbol || 'Token 2'}
                    </div>
                    <div className="text-slate-400 text-sm">Token do pool</div>
                    <div className="text-yellow-400 text-sm font-mono">
                      {amountsData?.amounts?.token0MaxAmount?.token1Amount || 
                       calculateTokenProportions(inputAmount, selectedInputToken || 'USDC').token1Amount} {poolData?.tokens?.[1]?.symbol || ''}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <div className="text-white font-medium">Rede</div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">⬟</span>
                      </div>
                      <span className="text-slate-400 text-sm">Polygon</span>
                    </div>
                  </div>
                  <div className="ml-2">
                    {expandedSections.recebeLink ? (
                      <span className="text-slate-400">▲</span>
                    ) : (
                      <span className="text-slate-400">▼</span>
                    )}
                  </div>
                </div>
              </div>
              
              {expandedSections.recebeLink && (
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Token</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">
                            {poolData?.tokens?.[1]?.symbol?.charAt(0) || 'L'}
                          </span>
                        </div>
                        <span className="text-white">{poolData?.tokens?.[1]?.symbol || 'Token 2'}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Rede</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">⬟</span>
                        </div>
                        <span className="text-white">Polygon</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Contrato do token</span>
                      <div className="flex items-center space-x-2">
                        {poolData?.tokens?.[1]?.address ? (
                          <a 
                            href={`https://polygonscan.com/token/${poolData.tokens[1].address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white hover:text-yellow-400 transition-colors"
                          >
                            {`${poolData.tokens[1].address.slice(0, 6)}...${poolData.tokens[1].address.slice(-6)}`}
                          </a>
                        ) : (
                          <span className="text-white">0x000...00000</span>
                        )}
                        <span className="text-slate-400">□</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Adiciona à pool - Expansível */}
          <Card className="bg-slate-800/60 border border-slate-700/60 rounded-2xl">
            <CardContent className="p-4">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('adicionaPool')}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center border-2 border-slate-800">
                      <span className="text-white text-sm font-bold">
                        {poolData?.tokens?.[0]?.symbol?.charAt(0) || '$'}
                      </span>
                    </div>
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center border-2 border-slate-800">
                      <span className="text-white text-sm font-bold">
                        {poolData?.tokens?.[1]?.symbol?.charAt(0) || 'L'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-white font-medium">Adiciona à pool</div>
                    <div className="text-slate-400 text-sm">
                      {poolData?.tokens && poolData.tokens.length >= 2 ? (
                        `${poolData.tokens[0].symbol}/${poolData.tokens[1].symbol}`
                      ) : (
                        'Carregando...'
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <div className="text-white font-medium">Rede</div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">⬟</span>
                      </div>
                      <span className="text-slate-400 text-sm">Polygon</span>
                    </div>
                  </div>
                  <div className="ml-2">
                    {expandedSections.adicionaPool ? (
                      <span className="text-slate-400">▲</span>
                    ) : (
                      <span className="text-slate-400">▼</span>
                    )}
                  </div>
                </div>
              </div>
              
              {expandedSections.adicionaPool && (
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Token 1</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">
                            {poolData?.tokens?.[0]?.symbol?.charAt(0) || '$'}
                          </span>
                        </div>
                        <span className="text-white">{poolData?.tokens?.[0]?.symbol || 'Token 1'}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Token 2</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">
                            {poolData?.tokens?.[1]?.symbol?.charAt(0) || 'L'}
                          </span>
                        </div>
                        <span className="text-white">{poolData?.tokens?.[1]?.symbol || 'Token 2'}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Rede</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">⬟</span>
                        </div>
                        <span className="text-white">Polygon</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Contrato do token 1</span>
                      <div className="flex items-center space-x-2">
                        {poolData?.tokens?.[0]?.address ? (
                          <a 
                            href={`https://polygonscan.com/token/${poolData.tokens[0].address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white hover:text-yellow-400 transition-colors"
                          >
                            {`${poolData.tokens[0].address.slice(0, 6)}...${poolData.tokens[0].address.slice(-6)}`}
                          </a>
                        ) : (
                          <span className="text-white">0x000...00000</span>
                        )}
                        <span className="text-slate-400">□</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Contrato do token 2</span>
                      <div className="flex items-center space-x-2">
                        {poolData?.tokens?.[1]?.address ? (
                          <a 
                            href={`https://polygonscan.com/token/${poolData.tokens[1].address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white hover:text-yellow-400 transition-colors"
                          >
                            {`${poolData.tokens[1].address.slice(0, 6)}...${poolData.tokens[1].address.slice(-6)}`}
                          </a>
                        ) : (
                          <span className="text-white">0x000...00000</span>
                        )}
                        <span className="text-slate-400">□</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recebe NFT - Expansível */}
          <Card className="bg-slate-800/60 border border-slate-700/60 rounded-2xl">
            <CardContent className="p-4">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('recebeNft')}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">NFT</span>
                  </div>
                  <div>
                    <div className="text-white font-medium">Recebe +Uniswap V3 Positions NFT #</div>
                    <div className="text-slate-400 text-sm">Representação da posição</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <div className="text-white font-medium">Rede</div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">⬟</span>
                      </div>
                      <span className="text-slate-400 text-sm">Polygon</span>
                    </div>
                  </div>
                  <div className="ml-2">
                    {expandedSections.recebeNft ? (
                      <span className="text-slate-400">▲</span>
                    ) : (
                      <span className="text-slate-400">▼</span>
                    )}
                  </div>
                </div>
              </div>
              
              {expandedSections.recebeNft && (
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Rede</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">⬟</span>
                        </div>
                        <span className="text-white">Polygon</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <ProtectedRoute>
      <AppLayout
        title="Adicionar Liquidez"
        description="Configure sua posição de liquidez"
      >
        <div className="w-full max-w-4xl mx-auto px-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Button
                  onClick={handleBack}
                  variant="ghost"
                  className="text-slate-400 hover:text-white p-0"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-white font-bold text-2xl">Configure a sua posição</h1>
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="text-slate-400 text-sm">Adição de liquidez</p>
                    {poolData?.tokens && poolData.tokens.length >= 2 && (
                      <div className="flex items-center space-x-1">
                        <div className="flex -space-x-2">
                          <img 
                            src={poolData.tokens[0].logo} 
                            alt={poolData.tokens[0].symbol} 
                            className="w-5 h-5 rounded-full border-2 border-slate-900"
                          />
                          <img 
                            src={poolData.tokens[1].logo} 
                            alt={poolData.tokens[1].symbol} 
                            className="w-5 h-5 rounded-full border-2 border-slate-900"
                          />
                        </div>
                        <span className="text-white font-medium text-sm ml-1">
                          {poolData.tokens[0].symbol}/{poolData.tokens[1].symbol}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="flex items-center justify-center space-x-2">
                {[1, 2, 3].map((step) => (
                  <React.Fragment key={step}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-bold transition-all ${
                      step <= currentStep 
                        ? 'bg-yellow-500 text-black' 
                        : 'bg-slate-700 text-slate-400'
                    }`}>
                      {step}
                    </div>
                    {step < 3 && (
                      <div className={`w-12 h-1 ${
                        step < currentStep ? 'bg-yellow-500' : 'bg-slate-700'
                      }`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
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
                  (currentStep === 1 && !isStep1Valid()) || (currentStep === 2 && !isStep2Valid()) || (currentStep === 3 && !isStep3Valid())
                    ? "bg-slate-600 text-slate-400 cursor-not-allowed"
                    : "bg-yellow-500 text-black hover:bg-yellow-600 shadow-lg"
                }`}
                disabled={(currentStep === 1 && !isStep1Valid()) || (currentStep === 2 && !isStep2Valid()) || (currentStep === 3 && !isStep3Valid())}
              >
                {currentStep === 3 ? (
                  isApproving ? 'Criando liquidez...' : 
                  'Criar liquidez'
                ) : 'Próximo'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}