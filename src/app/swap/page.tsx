"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRightLeft, 
  ArrowDown, 
  ArrowUpDown,
  AlertCircle, 
  Loader2, 
  CheckCircle,
  Wallet,
  Coins,
  Clock,
  Zap,
  TrendingUp,
  Settings
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSmartWallet } from "@/hooks/use-smart-wallet";
import { useToast } from "@/hooks/use-toast";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { SUPPORTED_CHAINS } from "@/lib/client";
import { createSwapQuote } from "@/lib/actions/swap";
import { executeUserOperation } from "@/lib/actions/user-operation";
import { usePrivy } from "@privy-io/react-auth";
import { Copy, ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getPortfolio } from "@/lib/actions/dashboard";

// Tokens padrão para seleção inicial
const DEFAULT_TOKENS = [
  {
    symbol: "USDC",
    name: "USD Coin",
    address: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
    decimals: 6,
    icon: "💙"
  },
  {
    symbol: "BRZ",
    name: "Brazilian Real Token", 
    address: "0x4e15361fd6b4bb609fa63c81a2be19d873717870",
    decimals: 18,
    icon: "🇧🇷"
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    address: "0x0000000000000000000000000000000000000000",
    decimals: 18,
    icon: "💎"
  }
];

export default function SwapPage() {
  const router = useRouter();
  const { wallet } = useSmartWallet();
  const { signMessage } = usePrivy();
  const toast = useToast();
  
  const [currentStep, setCurrentStep] = useState<"form" | "preview" | "executing" | "success">("form");
  const [fromToken, setFromToken] = useState(DEFAULT_TOKENS[0]);
  const [toToken, setToToken] = useState(DEFAULT_TOKENS[2]);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [slippage, setSlippage] = useState(0.5);
  const [isLoading, setIsLoading] = useState(false);
  const [quote, setQuote] = useState<any>(null);
  const [transactionHash, setTransactionHash] = useState("");
  const [userOperationHash, setUserOperationHash] = useState("");
  const [showFromTokenSelector, setShowFromTokenSelector] = useState(false);
  const [showToTokenSelector, setShowToTokenSelector] = useState(false);

  const walletAddress = wallet?.accountAbstraction;

  // Buscar portfolio real da carteira
  const { data: portfolio, isLoading: portfolioLoading } = useQuery({
    queryKey: ['portfolio', walletAddress],
    queryFn: () => getPortfolio(walletAddress || ''),
    enabled: !!walletAddress,
    refetchInterval: 30000,
  });

  // Criar lista de tokens com saldos reais
  const availableTokens = React.useMemo(() => {
    if (!portfolio?.tokens) return DEFAULT_TOKENS;
    
    return DEFAULT_TOKENS.map(defaultToken => {
      const portfolioToken = portfolio.tokens.find((t: any) => 
        t.symbol === defaultToken.symbol || t.address === defaultToken.address
      );
      
      return {
        ...defaultToken,
        balance: portfolioToken?.balance || "0",
        balanceUsd: portfolioToken?.balanceUsd || "0",
        price: portfolioToken?.price || 0
      };
    });
  }, [portfolio]);

  // Atualizar tokens selecionados com dados reais
  const currentFromToken = availableTokens.find(t => t.symbol === fromToken.symbol) || fromToken;
  const currentToToken = availableTokens.find(t => t.symbol === toToken.symbol) || toToken;

  // Calcular taxa de câmbio (só se ambos tokens têm preço)
  const exchangeRate = currentFromToken.price && currentToToken.price 
    ? currentToToken.price / currentFromToken.price 
    : 0;
  const calculatedToAmount = fromAmount && exchangeRate > 0 
    ? (parseFloat(fromAmount) * exchangeRate).toFixed(6) 
    : "";

  // Validações com dados reais
  const isValidAmount = (amount: string) => {
    const numAmount = parseFloat(amount);
    const tokenBalance = parseFloat(currentFromToken.balance || "0");
    return numAmount > 0 && numAmount <= tokenBalance;
  };

  const canProceed = fromAmount && isValidAmount(fromAmount) && currentFromToken.symbol !== currentToToken.symbol;

  const handleSwapTokens = () => {
    const tempToken = fromToken;
    const tempAmount = fromAmount;
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };

  const handleGetQuote = async () => {
    if (!canProceed || !walletAddress) {
      toast.error(
        'Erro',
        'Carteira não conectada ou valor inválido.',
        3000
      );
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔄 Obtendo cotação de swap...');
      
      const swapQuote = await createSwapQuote({
        amountIn: fromAmount,
        chainIdIn: SUPPORTED_CHAINS.POLYGON, // Polygon
        chainIdOut: SUPPORTED_CHAINS.POLYGON, // Polygon (mesmo chain)
        tokenIn: currentFromToken.address,
        tokenOut: currentToToken.address,
        walletAddress: walletAddress,
        toAddress: walletAddress,
        slippage: slippage,
        gasFeePaymentMethod: 'ADD_TO_AMOUNT',
        payGasFeeToken: currentFromToken.address
      });

      console.log('✅ Cotação obtida:', swapQuote);
      
      const quoteData = {
        ...swapQuote.swap,
        fromToken,
        toToken,
        fromAmount,
        toAmount: swapQuote.swap.minAmountOut,
        exchangeRate: parseFloat(swapQuote.swap.minAmountOut) / parseFloat(fromAmount),
        slippage,
        estimatedGasFee: swapQuote.swap.estimatedGasFees.gasFeeTokenAmount,
        gasFeeToken: fromToken.symbol,
        estimatedTime: "~3 minutes",
      };
      
      setQuote(quoteData);
      setUserOperationHash(swapQuote.swap.userOperationHash);
      setToAmount(swapQuote.swap.minAmountOut);
      setCurrentStep("preview");
      
      toast.success(
        'Cotação Gerada',
        'Cotação de swap criada com sucesso!',
        3000
      );
    } catch (error) {
      console.error("❌ Erro ao obter cotação:", error);
      toast.error(
        'Erro na Cotação',
        error instanceof Error ? error.message : 'Não foi possível obter a cotação. Tente novamente.',
        5000
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteSwap = async () => {
    if (!userOperationHash) {
      toast.error(
        'Erro',
        'Cotação não encontrada. Obtenha uma nova cotação.',
        3000
      );
      return;
    }

    setIsLoading(true);
    setCurrentStep("executing");
    
    try {
      console.log('⚙️ Assinando User Operation...');
      
      // Assinar a User Operation
      const signature = await signMessage(userOperationHash);
      
      if (!signature) {
        throw new Error('Assinatura cancelada pelo usuário');
      }

      console.log('✅ Assinatura obtida, executando swap...');
      
      // Executar a User Operation
      const result = await executeUserOperation({
        userOperationHash,
        signature
      });

      console.log('✅ Swap executado:', result);
      
      setTransactionHash(result.userOperationHash);
      setCurrentStep("success");
      
      toast.success(
        'Swap Executado',
        'Seu swap foi processado com sucesso!',
        5000
      );
    } catch (error) {
      console.error("❌ Erro ao executar swap:", error);
      toast.error(
        'Erro no Swap',
        error instanceof Error ? error.message : 'Não foi possível executar o swap. Tente novamente.',
        5000
      );
      setCurrentStep("preview");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentStep("form");
    setFromAmount("");
    setToAmount("");
    setQuote(null);
    setTransactionHash("");
    setUserOperationHash("");
  };

  const renderFormStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Swap de Tokens</h1>
        <p className="text-slate-300">Troque tokens instantaneamente</p>
      </div>

        <Card className="glass-card">
        <CardContent className="p-6 space-y-6">
            {/* From Token */}
          <div className="space-y-3">
            <Label className="text-white text-lg">De</Label>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => setShowFromTokenSelector(!showFromTokenSelector)}
                  className="flex items-center space-x-3 hover:bg-slate-700/50 rounded-lg p-2 transition-colors"
                >
                  <div className="text-2xl">{currentFromToken.icon}</div>
                  <div className="text-left">
                    <p className="text-white font-semibold">{currentFromToken.symbol}</p>
                    <p className="text-slate-400 text-sm">{currentFromToken.name}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </button>
                <div className="text-right">
                  <p className="text-slate-400 text-sm">Saldo</p>
                  <p className="text-white font-semibold">
                    {portfolioLoading ? "..." : currentFromToken.balance}
                  </p>
                </div>
              </div>
              <div className="relative">
                <Input 
                  type="number"
                  placeholder="0.0" 
                  value={fromAmount}
                  onChange={(e) => {
                    setFromAmount(e.target.value);
                    setToAmount(calculatedToAmount);
                  }}
                  className="bg-slate-700 border-slate-600 text-white text-2xl text-right py-4 pr-16"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <span className="text-slate-400">{currentFromToken.symbol}</span>
              </div>
              </div>
              {fromAmount && !isValidAmount(fromAmount) && (
                <p className="text-red-400 text-sm flex items-center space-x-1 mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>Saldo insuficiente</span>
                </p>
              )}
              </div>
            </div>

            {/* Swap Arrow */}
            <div className="flex justify-center">
            <Button
              onClick={handleSwapTokens}
              size="sm"
              className="bg-white/10 hover:bg-white/20 border-2 border-white/20 hover:border-white/40 transition-all duration-200"
            >
              <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>

            {/* To Token */}
          <div className="space-y-3">
            <Label className="text-white text-lg">Para</Label>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => setShowToTokenSelector(!showToTokenSelector)}
                  className="flex items-center space-x-3 hover:bg-slate-700/50 rounded-lg p-2 transition-colors"
                >
                  <div className="text-2xl">{currentToToken.icon}</div>
                  <div className="text-left">
                    <p className="text-white font-semibold">{currentToToken.symbol}</p>
                    <p className="text-slate-400 text-sm">{currentToToken.name}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </button>
                <div className="text-right">
                  <p className="text-slate-400 text-sm">Saldo</p>
                  <p className="text-white font-semibold">
                    {portfolioLoading ? "..." : currentToToken.balance}
                  </p>
                </div>
              </div>
              <div className="relative">
                <Input 
                  type="number"
                  placeholder="0.0" 
                  value={toAmount}
                  onChange={(e) => {
                    setToAmount(e.target.value);
                    setFromAmount(e.target.value ? (parseFloat(e.target.value) / exchangeRate).toFixed(6) : "");
                  }}
                  className="bg-slate-700 border-slate-600 text-white text-2xl text-right py-4 pr-16"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <span className="text-slate-400">{currentToToken.symbol}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Exchange Rate */}
          {fromAmount && toAmount && (
            <div className="bg-slate-800/30 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Taxa de câmbio</span>
                <span className="text-white font-semibold">
                  1 {currentFromToken.symbol} = {exchangeRate > 0 ? exchangeRate.toFixed(6) : "..."} {currentToToken.symbol}
                </span>
              </div>
            </div>
          )}

          {/* Slippage Settings */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-white text-lg">Tolerância ao deslizamento</Label>
              <Button
                onClick={() => setSlippage(slippage === 0.5 ? 1.0 : slippage === 1.0 ? 2.0 : 0.5)}
                variant="outline"
                size="sm"
                className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
              >
                <Settings className="h-4 w-4 mr-1" />
                {slippage}%
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleGetQuote}
        disabled={!canProceed || isLoading}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-slate-600 disabled:to-slate-600"
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Obtendo Cotação...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <ArrowRightLeft className="h-5 w-5" />
            <span>Obter Cotação</span>
          </div>
        )}
      </Button>
    </div>
  );

  const renderPreviewStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Revisar Swap</h1>
        <p className="text-slate-300">Confirme os detalhes antes de executar</p>
            </div>

      <Card className="glass-card">
        <CardContent className="p-6 space-y-6">
          {/* Resumo do Swap */}
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{fromToken.icon}</div>
                <div>
                  <p className="text-white font-semibold">{fromToken.symbol}</p>
                  <p className="text-slate-400 text-sm">{fromToken.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-bold text-xl">{fromAmount} {fromToken.symbol}</p>
                <p className="text-slate-400 text-sm">Você envia</p>
              </div>
            </div>
            
            <div className="flex justify-center mb-4">
              <ArrowDown className="h-5 w-5 text-slate-400" />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{toToken.icon}</div>
                <div>
                  <p className="text-white font-semibold">{toToken.symbol}</p>
                  <p className="text-slate-400 text-sm">{toToken.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-bold text-xl">{toAmount} {toToken.symbol}</p>
                <p className="text-slate-400 text-sm">Você recebe</p>
              </div>
            </div>
          </div>

          {/* Detalhes da Transação */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Taxa de câmbio:</span>
              <span className="text-white">1 {fromToken.symbol} = {exchangeRate.toFixed(6)} {toToken.symbol}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Tolerância ao deslizamento:</span>
              <span className="text-white">{slippage}%</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Taxa de rede:</span>
              <span className="text-white">{quote?.estimatedGasFee} {quote?.gasFeeToken}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Taxa da plataforma:</span>
              <span className="text-white">{quote?.transactionFee} {quote?.gasFeeToken}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Impacto no preço:</span>
              <span className="text-white">{quote?.priceImpact}%</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Tempo estimado:</span>
              <span className="text-white">{quote?.estimatedTime}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex space-x-4">
        <Button
          onClick={() => setCurrentStep("form")}
          variant="outline"
          className="flex-1 border-blue-500/50 text-blue-400 hover:bg-blue-500/10 hover:border-blue-400 hover:text-blue-300 transition-all duration-200"
        >
          Voltar
        </Button>
        <Button
          onClick={handleExecuteSwap}
          disabled={isLoading}
          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Executando...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>Executar Swap</span>
            </div>
          )}
            </Button>
      </div>
    </div>
  );

  const renderExecutingStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Executando Swap</h1>
        <p className="text-slate-300">Aguarde enquanto processamos sua transação</p>
      </div>

      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
              <span className="text-white text-lg">Processando swap...</span>
            </div>
            
            <div className="text-center space-y-2">
              <p className="text-slate-400 text-sm">
                Trocando {fromAmount} {fromToken.symbol} por {toAmount} {toToken.symbol}
              </p>
              <p className="text-slate-400 text-sm">
                Isso pode levar alguns minutos
              </p>
            </div>
          </div>
          </CardContent>
        </Card>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-green-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Swap Concluído!</h1>
        <p className="text-slate-300">Sua transação foi processada com sucesso</p>
      </div>

      <Card className="glass-card">
        <CardContent className="p-6 space-y-6">
          {/* Hash da Transação */}
          <div className="space-y-3">
            <Label className="text-white">Hash da Transação</Label>
            <div className="flex items-center space-x-2">
              <Input
                value={transactionHash}
                readOnly
                className="bg-slate-800 border-slate-600 text-white text-sm font-mono"
              />
              <Button
                onClick={() => navigator.clipboard.writeText(transactionHash)}
                size="sm"
                className="bg-slate-700 hover:bg-slate-600 text-white transition-all duration-200 hover:scale-105"
                title="Copiar hash"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Resumo */}
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Você enviou:</span>
                <span className="text-white font-semibold">{fromAmount} {fromToken.symbol}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Você recebeu:</span>
                <span className="text-white font-semibold">{toAmount} {toToken.symbol}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Status:</span>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  Concluído
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex space-x-4">
        <Button
          onClick={resetForm}
          variant="outline"
          className="flex-1 border-blue-500/50 text-blue-400 hover:bg-blue-500/10 hover:border-blue-400 hover:text-blue-300 transition-all duration-200"
        >
          <div className="flex items-center space-x-2">
            <ArrowRightLeft className="h-4 w-4" />
            <span>Novo Swap</span>
          </div>
        </Button>
        <Button
          onClick={() => router.push('/dashboard')}
          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 transition-all duration-200"
        >
          <div className="flex items-center space-x-2">
            <Wallet className="h-4 w-4" />
            <span>Voltar para Dashboard</span>
          </div>
        </Button>
      </div>
    </div>
  );

  return (
    <ProtectedRoute>
      <AppLayout 
        title="Swap de Tokens"
        description="Troque tokens instantaneamente"
      >
        <div className="flex justify-center">
          <div className="w-full max-w-2xl space-y-6">
            {currentStep === "form" && renderFormStep()}
            {currentStep === "preview" && renderPreviewStep()}
            {currentStep === "executing" && renderExecutingStep()}
            {currentStep === "success" && renderSuccessStep()}
      </div>
      </div>
    </AppLayout>
    </ProtectedRoute>
  );
}
