"use client";

import { useState, useEffect, useMemo } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  TrendingUp, 
  Activity, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp,
  ExternalLink,
  Info,
  Filter,
  BarChart3,
  DollarSign,
  Clock,
  Plus,
  Minus
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSmartWallet } from "@/hooks/use-smart-wallet";
import { useToast } from "@/hooks/use-toast";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { TokenSelector } from "@/components/ui/token-selector";
import { liquidityActions } from "@/lib/actions/liquidity";
import { listChains } from "@/lib/actions/blockchain";
import { useQuery } from "@tanstack/react-query";

export default function LiquidityPage() {
  const router = useRouter();
  const { wallet } = useSmartWallet();
  const toast = useToast();
  
  const [currentView, setCurrentView] = useState<"pools" | "pool-details" | "add-liquidity">("pools");
  
  // Debug log para verificar o estado
  console.log('🔍 DEBUG currentView:', currentView);
  console.log('🔍 DEBUG poolsData:', poolsData);
  console.log('🔍 DEBUG poolsLoading:', poolsLoading);
  console.log('🔍 DEBUG poolsError:', poolsError);
  const [selectedPool, setSelectedPool] = useState<any>(null);
  const [sortBy, setSortBy] = useState<"rentabilidade" | "tvl" | "tarifa" | "volume">("rentabilidade");
  const [showSortModal, setShowSortModal] = useState(false);
  
  // Estados para adicionar liquidez
  const [addLiquidityStep, setAddLiquidityStep] = useState<1 | 2 | 3>(1);
  const [selectedBaseToken, setSelectedBaseToken] = useState<"usdc" | "brz">("brz");
  const [totalAmount, setTotalAmount] = useState<string>("25");
  const [minPrice, setMinPrice] = useState<string>("0.04999986");
  const [maxPrice, setMaxPrice] = useState<string>("0.06111094");
  const [feeTier, setFeeTier] = useState<string>("0.30%");
  const [timeframe, setTimeframe] = useState<"1D" | "7D" | "1M" | "1A">("1M");

  const walletAddress = wallet?.accountAbstraction;

  // Buscar pools de liquidez da API
  const { data: poolsData, isLoading: poolsLoading, error: poolsError } = useQuery({
    queryKey: ['liquidity-pools'],
    queryFn: async () => {
      try {
        const response = await liquidityActions.listPools({
          page: 1,
          perPage: 20,
          chainId: 137 // Polygon
        });
        console.log('🔍 DEBUG API Response:', response);
        return response.pools || response.data || [];
      } catch (error) {
        console.error('Erro ao buscar pools:', error);
        // Fallback para dados mockados em caso de erro
        return [
          {
            id: "usdc-usdt",
            protocol: "Uniswap V3",
            tokenPair: "USDC/USDT",
            token1: { symbol: "USDC", logo: "💙", color: "blue" },
            token2: { symbol: "USDT", logo: "💚", color: "green" },
            rentabilidade: "12.5%",
            tvl: "$1.25M",
            tarifa: "0.05%",
            volume24h: "$850.0K",
            composition: { usdc: "50%", usdt: "50%" },
            userLiquidity: "-"
          },
          {
            id: "brz-usdc",
            protocol: "Uniswap V3",
            tokenPair: "BRZ/USDC",
            token1: { symbol: "BRZ", logo: "🇧🇷", color: "blue" },
            token2: { symbol: "USDC", logo: "💙", color: "blue" },
            rentabilidade: "8.3%",
            tvl: "$450.0K",
            tarifa: "0.30%",
            volume24h: "$125.0K",
            composition: { brz: "45%", usdc: "55%" },
            userLiquidity: "-"
          },
          {
            id: "wmatic-usdc",
            protocol: "Uniswap V3",
            tokenPair: "WMATIC/USDC",
            token1: { symbol: "WMATIC", logo: "🔷", color: "purple" },
            token2: { symbol: "USDC", logo: "💙", color: "blue" },
            rentabilidade: "15.7%",
            tvl: "$2.10M",
            tarifa: "0.30%",
            volume24h: "$1.25M",
            composition: { wmatic: "40%", usdc: "60%" },
            userLiquidity: "-"
          }
        ];
      }
    },
    staleTime: 30000, // 30 segundos
  });

  // Buscar chains para logos
  const { data: chainsData } = useQuery({
    queryKey: ['chains'],
    queryFn: () => listChains({ page: 1, perPage: 50 }),
    staleTime: 300000, // 5 minutos
  });

  // Buscar dados históricos do pool selecionado
  const { data: historicalData, isLoading: historicalLoading } = useQuery({
    queryKey: ['pool-historical', selectedPool?.id],
    queryFn: async () => {
      if (!selectedPool?.id) return null;
      return await liquidityActions.getHistoricalData(selectedPool.id, { days: 30 });
    },
    enabled: !!selectedPool?.id,
    staleTime: 300000, // 5 minutos
  });

  // Buscar quantidades de liquidez do usuário
  const { data: userAmounts, isLoading: amountsLoading } = useQuery({
    queryKey: ['user-amounts', selectedPool?.id, walletAddress],
    queryFn: async () => {
      if (!selectedPool?.id || !walletAddress) return null;
      return await liquidityActions.getAmounts({
        poolId: selectedPool.id,
        walletAddress: walletAddress
      });
    },
    enabled: !!selectedPool?.id && !!walletAddress,
    staleTime: 60000, // 1 minuto
  });

  const handlePoolClick = async (pool: any) => {
    setSelectedPool(pool);
    setCurrentView("pool-details");
    
    // Buscar detalhes reais do pool
    try {
      const poolDetails = await liquidityActions.getPool(pool.id);
      setSelectedPool({ ...pool, ...poolDetails });
    } catch (error) {
      console.error('Erro ao buscar detalhes do pool:', error);
      // Manter dados mockados em caso de erro
    }
  };

  const handleAddLiquidity = async () => {
    if (!walletAddress) {
      toast({
        title: "Erro",
        description: "Carteira não conectada",
        variant: "destructive",
      });
      return;
    }

    try {
      // Criar liquidez usando a API
      const result = await liquidityActions.createLiquidity({
        poolId: selectedPool?.id || "usdc-link",
        amount0: totalAmount,
        amount1: "0", // Será calculado automaticamente
        walletAddress: walletAddress,
        chainId: 137, // Polygon
        slippageTolerance: 0.5
      });

      toast({
        title: "Sucesso",
        description: "Liquidez adicionada com sucesso!",
      });

      // Voltar para a lista de pools
      setCurrentView("pools");
      setSelectedPool(null);
    } catch (error) {
      console.error('Erro ao adicionar liquidez:', error);
      toast({
        title: "Erro",
        description: "Falha ao adicionar liquidez",
        variant: "destructive",
      });
    }
  };

  // Função para alterar liquidez (adicionar/remover)
  const handleChangeLiquidity = async (liquidityAmount: string, action: 'add' | 'remove') => {
    if (!walletAddress || !selectedPool?.id) {
      toast({
        title: "Erro",
        description: "Dados insuficientes",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await liquidityActions.changeLiquidity({
        poolId: selectedPool.id,
        liquidityAmount: action === 'remove' ? `-${liquidityAmount}` : liquidityAmount,
        walletAddress: walletAddress,
        chainId: 137, // Polygon
        slippageTolerance: 0.5
      });

      toast({
        title: "Sucesso",
        description: `Liquidez ${action === 'add' ? 'adicionada' : 'removida'} com sucesso!`,
      });

      // Atualizar dados do usuário
      // Refetch user amounts
    } catch (error) {
      console.error('Erro ao alterar liquidez:', error);
      toast({
        title: "Erro",
        description: `Falha ao ${action === 'add' ? 'adicionar' : 'remover'} liquidez`,
        variant: "destructive",
      });
    }
  };

  // Função para coletar taxas
  const handleCollectFees = async () => {
    if (!walletAddress || !selectedPool?.id) {
      toast({
        title: "Erro",
        description: "Dados insuficientes",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await liquidityActions.collectFees({
        poolId: selectedPool.id,
        walletAddress: walletAddress,
        chainId: 137 // Polygon
      });

      toast({
        title: "Sucesso",
        description: "Taxas coletadas com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao coletar taxas:', error);
      toast({
        title: "Erro",
        description: "Falha ao coletar taxas",
        variant: "destructive",
      });
    }
  };

  const handleBackToPools = () => {
    setCurrentView("pools");
    setSelectedPool(null);
  };

  const handleBackToDetails = () => {
    setCurrentView("pool-details");
  };

  const renderPoolsList = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Pools de Liquidez</h1>
          <p className="text-slate-300">Disponíveis - {poolsData.length}</p>
        </div>
        <Button
          onClick={() => setShowSortModal(true)}
          variant="outline"
          className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
        >
          <Filter className="h-4 w-4 mr-2" />
          Rent. estimada ↓
        </Button>
      </div>

      {/* Pools List */}
      <div className="space-y-4">
        {poolsLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
            <span className="ml-2 text-slate-300">Carregando pools...</span>
          </div>
        ) : poolsError ? (
          <div className="text-center py-8">
            <p className="text-red-400">Erro ao carregar pools</p>
            <p className="text-slate-400 text-sm mt-1">Usando dados de exemplo</p>
          </div>
        ) : (
          poolsData?.map((pool) => {
            console.log('🔍 DEBUG Pool data:', pool);
            return (
          <Card 
            key={pool.id}
            className="bg-slate-800/50 border-slate-700/50 rounded-xl cursor-pointer hover:bg-slate-700/30 transition-all duration-200"
            onClick={() => handlePoolClick(pool)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="flex -space-x-2">
                    <div className={`w-10 h-10 rounded-full bg-${pool.token1.color}-500/20 flex items-center justify-center border-2 border-slate-800`}>
                      <span className="text-xl">{pool.token1.logo}</span>
                    </div>
                    <div className={`w-10 h-10 rounded-full bg-${pool.token2.color}-500/20 flex items-center justify-center border-2 border-slate-800`}>
                      <span className="text-xl">{pool.token2.logo}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">{pool.tokenPair}</h3>
                    <p className="text-slate-400 text-sm">{pool.protocol}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1 mb-1">
                    <span className="text-slate-400 text-sm">Rent. estimada</span>
                    <Info className="h-4 w-4 text-slate-400" />
                  </div>
                  <p className="text-green-400 font-bold text-lg">{pool.rentabilidade}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-slate-400 text-sm">TVL</p>
                  <p className="text-white font-semibold">{pool.tvl}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Volume 24h</p>
                  <p className="text-white font-semibold">{pool.volume24h}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Sua Liquidez</p>
                  <p className="text-white font-semibold">{pool.userLiquidity || "-"}</p>
                </div>
                <div className="flex justify-end">
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddLiquidity();
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                  >
                    + Adicionar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
            );
          })
        )}
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <Card className="bg-slate-800/50 border-slate-700/50 rounded-xl">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Clock className="h-4 w-4 text-purple-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{poolsData?.length || 0}</p>
            <p className="text-slate-400 text-sm">Pools Disponíveis</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50 rounded-xl">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-green-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">15.7%</p>
            <p className="text-slate-400 text-sm">Maior APR</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50 rounded-xl">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-blue-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">$0</p>
            <p className="text-slate-400 text-sm">Sua Liquidez Total</p>
          </CardContent>
        </Card>
      </div>

      {/* Card de Funcionalidade em Implementação */}
      <Card className="bg-slate-800/50 border-slate-700/50 rounded-xl">
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
              <span className="text-2xl">∞</span>
            </div>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Funcionalidade em Implementação</h3>
          <p className="text-slate-400 mb-4">
            A integração com a API da Notus para adicionar liquidez será implementada na próxima fase do projeto.
          </p>
          <Button 
            variant="outline" 
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
            onClick={() => setCurrentView("pools")}
          >
            Fechar
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderPoolDetails = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          onClick={handleBackToPools}
          variant="ghost"
          className="text-slate-400 hover:text-white"
        >
          <ArrowRight className="h-5 w-5 rotate-180" />
              </Button>
        <div className="flex items-center space-x-3">
          <div className="flex -space-x-2">
            <div className={`w-10 h-10 rounded-full bg-${selectedPool?.token1.color}-500/20 flex items-center justify-center border-2 border-slate-800`}>
              <span className="text-xl">{selectedPool?.token1.logo}</span>
            </div>
            <div className={`w-10 h-10 rounded-full bg-${selectedPool?.token2.color}-500/20 flex items-center justify-center border-2 border-slate-800`}>
              <span className="text-xl">{selectedPool?.token2.logo}</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white">{selectedPool?.tokenPair}</h1>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="flex space-x-4">
        <Badge className="bg-slate-700/50 text-slate-300 border-slate-600/50">
          {selectedPool?.tarifa} Tarifa
        </Badge>
        <Badge className="bg-slate-700/50 text-slate-300 border-slate-600/50">
          {selectedPool?.tvl} TVL
        </Badge>
        <Badge className="bg-slate-700/50 text-slate-300 border-slate-600/50">
          R${selectedPool?.volume24h.replace('$', '').replace(' K', 'K')} Tarifas
        </Badge>
            </div>

      {/* Rentabilidade */}
      <Card className="bg-slate-800/50 border-slate-700/50 rounded-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-white font-semibold">Rentabilidade estimada</span>
              <Info className="h-4 w-4 text-slate-400" />
                  </div>
            <div className="flex items-center space-x-2">
              <span className="text-3xl font-bold text-green-400">{selectedPool?.rentabilidade}</span>
              <DollarSign className="h-6 w-6 text-green-400" />
                  </div>
                </div>
        </CardContent>
      </Card>

      {/* Composição da Pool */}
      <Card className="bg-slate-800/50 border-slate-700/50 rounded-xl">
        <CardHeader>
          <CardTitle className="text-white">Composição da Pool</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full bg-${selectedPool?.token1.color}-500/20 flex items-center justify-center`}>
                <span className="text-lg">{selectedPool?.token1.logo}</span>
              </div>
              <span className="text-white font-semibold">{selectedPool?.token1.symbol}</span>
            </div>
            <span className="text-white font-semibold">{selectedPool?.composition?.usdc || selectedPool?.composition?.eth}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full bg-${selectedPool?.token2.color}-500/20 flex items-center justify-center`}>
                <span className="text-lg">{selectedPool?.token2.logo}</span>
              </div>
              <span className="text-white font-semibold">{selectedPool?.token2.symbol}</span>
            </div>
            <span className="text-white font-semibold">{selectedPool?.composition?.link || selectedPool?.composition?.usdt}</span>
          </div>

          {/* Barra visual */}
          <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
            <div className="flex h-full">
              <div 
                className="bg-red-500/80" 
                style={{ width: selectedPool?.composition?.usdc || selectedPool?.composition?.eth || "20%" }}
              ></div>
              <div 
                className="bg-blue-500/80" 
                style={{ width: selectedPool?.composition?.link || selectedPool?.composition?.usdt || "80%" }}
              ></div>
            </div>
            </div>
          </CardContent>
        </Card>

      {/* Informações */}
      <Card className="bg-slate-800/50 border-slate-700/50 rounded-xl">
          <CardHeader>
          <CardTitle className="text-white">Informações</CardTitle>
          </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-slate-400">TVL:</span>
            <span className="text-white">{selectedPool?.tvl}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Volume (24h):</span>
            <span className="text-white">{selectedPool?.volume24h}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Tarifas (24h):</span>
            <span className="text-white">$1.1 K</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Nível de tarifas:</span>
            <span className="text-white">{selectedPool?.tarifa}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Rendimento:</span>
            <div className="flex items-center space-x-2">
              <div className={`w-6 h-6 rounded-full bg-${selectedPool?.token1.color}-500/20 flex items-center justify-center`}>
                <span className="text-sm">{selectedPool?.token1.logo}</span>
              </div>
              <div className={`w-6 h-6 rounded-full bg-${selectedPool?.token2.color}-500/20 flex items-center justify-center`}>
                <span className="text-sm">{selectedPool?.token2.logo}</span>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Protocolo:</span>
            <div className="flex items-center space-x-2">
              <span className="text-white">UNISWAP V3</span>
              <ExternalLink className="h-4 w-4 text-slate-400" />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Rede:</span>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                <span className="text-sm">∞</span>
              </div>
              <span className="text-white">Polygon</span>
              <ExternalLink className="h-4 w-4 text-slate-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dados do Usuário */}
      {userAmounts && (
        <Card className="bg-slate-800/50 border-slate-700/50 rounded-xl">
          <CardHeader>
            <CardTitle className="text-white">Sua Posição</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Liquidez Total:</span>
              <span className="text-white">{userAmounts.totalLiquidity || '0'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Taxas Acumuladas:</span>
              <span className="text-white">{userAmounts.accumulatedFees || '0'}</span>
            </div>
            {userAmounts.accumulatedFees && parseFloat(userAmounts.accumulatedFees) > 0 && (
              <Button 
                onClick={handleCollectFees}
                className="w-full bg-green-600 hover:bg-green-700 text-white mt-4"
              >
                Coletar Taxas
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dados Históricos */}
      {historicalData && (
        <Card className="bg-slate-800/50 border-slate-700/50 rounded-xl">
          <CardHeader>
            <CardTitle className="text-white">Dados Históricos (30 dias)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {historicalLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-500"></div>
                <span className="ml-2 text-slate-300">Carregando dados...</span>
              </div>
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="text-slate-400">Volume Total:</span>
                  <span className="text-white">{historicalData.totalVolume || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Taxas Geradas:</span>
                  <span className="text-white">{historicalData.totalFees || 'N/A'}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Botão Adicionar Liquidez */}
      <Button
        onClick={handleAddLiquidity}
        className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold py-4 rounded-xl"
      >
        Adicionar liquidez
                </Button>
    </div>
  );

  const renderAddLiquidityStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Configure a sua posição</h1>
        <p className="text-slate-300 flex items-center justify-center space-x-2">
          <span>Adição de liquidez</span>
          <div className="flex -space-x-1">
            <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center border-2 border-slate-800">
              <span className="text-sm">💙</span>
            </div>
            <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center border-2 border-slate-800">
              <span className="text-sm">🔗</span>
            </div>
          </div>
          <span className="font-semibold">USDC.E/LINK</span>
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="flex justify-center items-center space-x-2">
        {[1, 2, 3].map((step) => (
          <div
            key={step}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
              ${step === 1 ? "bg-white text-slate-900" : "bg-slate-700 text-slate-400"}
            `}
          >
            {step}
          </div>
        ))}
      </div>

      {/* Escolha como vai adicionar */}
      <div className="space-y-4">
        <h2 className="text-white text-lg">Escolha como vai adicionar a liquidez</h2>
        <div className="grid grid-cols-2 gap-4">
          <Card 
            className={`cursor-pointer transition-all duration-200 ${
              selectedBaseToken === "usdc" 
                ? "bg-slate-700/50 border-blue-500/50" 
                : "bg-slate-800/50 border-slate-600/50 hover:bg-slate-700/30"
            }`}
            onClick={() => setSelectedBaseToken("usdc")}
          >
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💙</span>
              </div>
              <h3 className="text-white font-semibold">Utilizar USDC</h3>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all duration-200 ${
              selectedBaseToken === "brz" 
                ? "bg-slate-700/50 border-yellow-500/50" 
                : "bg-slate-800/50 border-slate-600/50 hover:bg-slate-700/30"
            }`}
            onClick={() => setSelectedBaseToken("brz")}
          >
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🇧🇷</span>
              </div>
              <h3 className="text-white font-semibold">Utilizar BRZ</h3>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Escolha quanto vai adicionar */}
      <Card className="bg-slate-800/50 border-slate-700/50 rounded-xl">
        <CardContent className="p-6">
          <h2 className="text-white text-lg mb-4">Escolha quanto vai adicionar</h2>
          
          <div className="space-y-4">
            <div>
              <Label className="text-slate-400 text-sm">Total</Label>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  className="bg-slate-700/50 border-slate-600/50 text-white text-2xl font-bold"
                  placeholder="0,00"
                />
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">🇧🇷</span>
                  <span className="text-white font-semibold">BRZ</span>
                </div>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-slate-400 text-sm">R$24,86</span>
                <div className="flex items-center space-x-2">
                  <span className="text-slate-400 text-sm">Saldo: 25,00 BRZ</span>
                  <Button size="sm" variant="outline" className="text-xs">
                    MAX
                </Button>
                </div>
              </div>
            </div>

            {/* Breakdown dos tokens */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-600/50">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-lg">💙</span>
                  <span className="text-white font-semibold">USDC.E</span>
                </div>
                <p className="text-2xl font-bold text-white">2,135</p>
                <p className="text-slate-400 text-sm">R$11.64</p>
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-lg">🔗</span>
                  <span className="text-white font-semibold">LINK</span>
                </div>
                <p className="text-2xl font-bold text-white">0,131</p>
                <p className="text-slate-400 text-sm">R$12.89</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timer de atualização de preço */}
      <div className="flex items-center justify-between bg-slate-800/50 rounded-xl p-4">
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-slate-400" />
          <span className="text-slate-300">O preço será atualizado em:</span>
        </div>
        <span className="text-orange-400 font-bold text-lg">01:57</span>
      </div>

      {/* Botão Próximo */}
      <Button
        onClick={() => setAddLiquidityStep(2)}
        className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-4 rounded-xl"
      >
        Próximo
      </Button>
    </div>
  );

  const renderAddLiquidityStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Configure a sua posição</h1>
        <p className="text-slate-300 flex items-center justify-center space-x-2">
          <span>Adição de liquidez</span>
          <div className="flex -space-x-1">
            <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center border-2 border-slate-800">
              <span className="text-sm">💙</span>
            </div>
            <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center border-2 border-slate-800">
              <span className="text-sm">🔗</span>
            </div>
          </div>
          <span className="font-semibold">USDC.E/LINK</span>
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="flex justify-center items-center space-x-2">
        {[1, 2, 3].map((step) => (
          <div
            key={step}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
              ${step <= 2 ? "bg-white text-slate-900" : "bg-slate-700 text-slate-400"}
            `}
          >
            {step}
          </div>
        ))}
      </div>

      {/* Escolha o intervalo de preço */}
      <div className="space-y-4">
        <h2 className="text-white text-lg">Escolha o intervalo de preço</h2>
        
        {/* Botões de intervalo */}
        <div className="grid grid-cols-4 gap-2">
          {["± 10%", "± 15%", "± 20%", "Total"].map((option, index) => (
            <Button
              key={option}
              variant={index === 0 ? "default" : "outline"}
              className={index === 0 ? "bg-yellow-500 text-slate-900" : "border-slate-600 text-slate-300 hover:bg-slate-700"}
            >
              {option}
            </Button>
          ))}
        </div>

        {/* Preço atual */}
        <div className="text-center">
          <p className="text-slate-300">Preço atual: 0,0555 LINK = 1 USDC.E</p>
        </div>

        {/* Seleção de tokens */}
        <div className="flex space-x-2">
          <Button className="flex-1 bg-yellow-500 text-slate-900">USDC.E</Button>
          <Button variant="outline" className="flex-1 border-slate-600 text-slate-300">LINK</Button>
        </div>

        {/* Gráfico (placeholder) */}
        <Card className="bg-slate-800/50 border-slate-700/50 rounded-xl">
          <CardContent className="p-6">
            <div className="h-48 bg-slate-700/30 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-400">Gráfico de preços</p>
              </div>
            </div>
            
            {/* Controles do gráfico */}
            <div className="flex justify-between items-center mt-4">
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" className="border-slate-600">
                  <ArrowRight className="h-4 w-4 rotate-180" />
                </Button>
                <Button size="sm" variant="outline" className="border-slate-600">
                  <Minus className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" className="border-slate-600">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex space-x-2">
                {["1D", "7D", "1M", "1A"].map((period) => (
                  <Button
                    key={period}
                    size="sm"
                    variant={period === "1M" ? "default" : "outline"}
                    className={period === "1M" ? "bg-yellow-500 text-slate-900" : "border-slate-600 text-slate-300"}
                    onClick={() => setTimeframe(period as any)}
                  >
                    {period}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preços mínimo e máximo */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-slate-400 text-sm">Preço mínimo</Label>
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="outline" className="border-slate-600">
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="bg-slate-700/50 border-slate-600/50 text-white text-lg font-bold text-center"
              />
              <Button size="sm" variant="outline" className="border-slate-600">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-slate-400 text-sm mt-1">LINK por USDC.E</p>
          </div>

          <div>
            <Label className="text-slate-400 text-sm">Preço máximo</Label>
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="outline" className="border-slate-600">
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="bg-slate-700/50 border-slate-600/50 text-white text-lg font-bold text-center"
              />
              <Button size="sm" variant="outline" className="border-slate-600">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-slate-400 text-sm mt-1">LINK por USDC.E</p>
          </div>
        </div>

        {/* Nível de tarifas */}
        <div>
          <Label className="text-slate-400 text-sm">Nível de tarifas</Label>
          <p className="text-white font-semibold text-lg">{feeTier}</p>
        </div>
      </div>

      {/* Botão Próximo */}
      <Button
        onClick={() => setAddLiquidityStep(3)}
        className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold py-4 rounded-xl"
      >
        <ArrowRight className="h-5 w-5" />
      </Button>
    </div>
  );

  const renderAddLiquidityStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Configure a sua posição</h1>
        <p className="text-slate-300 flex items-center justify-center space-x-2">
          <span>Adição de liquidez</span>
          <div className="flex -space-x-1">
            <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center border-2 border-slate-800">
              <span className="text-sm">💙</span>
            </div>
            <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center border-2 border-slate-800">
              <span className="text-sm">🔗</span>
            </div>
          </div>
          <span className="font-semibold">USDC.E/LINK</span>
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="flex justify-center items-center space-x-2">
        {[1, 2, 3].map((step) => (
          <div
            key={step}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
              ${step <= 3 ? "bg-white text-slate-900" : "bg-slate-700 text-slate-400"}
            `}
          >
            {step}
          </div>
        ))}
      </div>

      {/* Valor principal */}
      <div className="text-center">
        <p className="text-5xl font-bold text-white">{totalAmount}</p>
        <p className="text-slate-400 text-3xl">LINK</p>
      </div>

      {/* Seções colapsáveis */}
      <div className="space-y-4">
        {/* Recebe */}
        <Card className="bg-slate-800/50 border-slate-700/50 rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <span className="text-lg">🔗</span>
                </div>
                <span className="text-white font-semibold">Recebe</span>
              </div>
              <ChevronUp className="h-5 w-5 text-slate-400" />
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Token:</span>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🔗</span>
                  <span className="text-white">LINK</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Rede:</span>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">∞</span>
                  <span className="text-white">Polygon</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Contrato do token:</span>
                <div className="flex items-center space-x-2">
                  <span className="text-white font-mono text-sm">0x53e...bad39</span>
                  <ExternalLink className="h-4 w-4 text-slate-400" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Adiciona à pool */}
        <Card className="bg-slate-800/50 border-slate-700/50 rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex -space-x-1">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center border-2 border-slate-800">
                    <span className="text-sm">💙</span>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center border-2 border-slate-800">
                    <span className="text-sm">🔗</span>
                  </div>
                </div>
                <span className="text-white font-semibold">Adiciona à pool</span>
              </div>
              <ChevronUp className="h-5 w-5 text-slate-400" />
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Token 1:</span>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">💙</span>
                  <span className="text-white">USDC.E</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Token 2:</span>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🔗</span>
                  <span className="text-white">LINK</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Rede:</span>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">∞</span>
                  <span className="text-white">Polygon</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Contrato do token 1:</span>
                <div className="flex items-center space-x-2">
                  <span className="text-white font-mono text-sm">0x279...84174</span>
                  <ExternalLink className="h-4 w-4 text-slate-400" />
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Contrato do token 2:</span>
                <div className="flex items-center space-x-2">
                  <span className="text-white font-mono text-sm">0x53e...bad39</span>
                  <ExternalLink className="h-4 w-4 text-slate-400" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recebe NFT */}
        <Card className="bg-slate-800/50 border-slate-700/50 rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-white font-semibold">Recebe +Uniswap V3 Positions NFT #</span>
              <ChevronUp className="h-5 w-5 text-slate-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Botão Aprovar */}
      <Button
        onClick={() => {
          toast.success("Transação aprovada!", "Sua liquidez foi adicionada com sucesso!");
          setCurrentView("pools");
        }}
        className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold py-4 rounded-xl"
      >
        Aprovar a transação
      </Button>
    </div>
  );

  const renderSortModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
      <div className="bg-slate-800 rounded-t-xl w-full max-w-md p-6">
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
        <div className="flex justify-center">
          <div className="w-full max-w-2xl space-y-6">
            {currentView === "pools" && renderPoolsList()}
            {currentView === "pool-details" && renderPoolDetails()}
            {currentView === "add-liquidity" && addLiquidityStep === 1 && renderAddLiquidityStep1()}
            {currentView === "add-liquidity" && addLiquidityStep === 2 && renderAddLiquidityStep2()}
            {currentView === "add-liquidity" && addLiquidityStep === 3 && renderAddLiquidityStep3()}
          </div>
        </div>
        
        {showSortModal && renderSortModal()}
    </AppLayout>
    </ProtectedRoute>
  );
}
