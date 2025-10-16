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
import { TokenSelector } from "@/components/ui/token-selector";


export default function SwapPage() {
  const router = useRouter();
  const { wallet } = useSmartWallet();
  const { signMessage } = usePrivy();
  const toast = useToast();
  
  const [currentStep, setCurrentStep] = useState<"form" | "preview" | "executing" | "success">("form");
  const [fromToken, setFromToken] = useState<any>(null);
  const [toToken, setToToken] = useState<any>(null);

  // Funções para seleção de tokens com validação
  const handleFromTokenSelect = (token: any) => {
    if (toToken && token.address === toToken.address && token.chainId === toToken.chainId) {
      // Se o token selecionado é o mesmo do "Para", limpa o "Para"
      setToToken(null);
    }
    setFromToken(token);
  };

  const handleToTokenSelect = (token: any) => {
    if (fromToken && token.address === fromToken.address && token.chainId === fromToken.chainId) {
      // Se o token selecionado é o mesmo do "De", limpa o "De"
      setFromToken(null);
    }
    setToToken(token);
  };
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [slippage, setSlippage] = useState(0.5);
  const [isLoading, setIsLoading] = useState(false);
  const [quote, setQuote] = useState<any>(null);
  const [transactionHash, setTransactionHash] = useState("");
  const [userOperationHash, setUserOperationHash] = useState("");
  const [showSlippageModal, setShowSlippageModal] = useState(false);
  const [customSlippage, setCustomSlippage] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [tempSlippage, setTempSlippage] = useState(0.5);

  const walletAddress = wallet?.accountAbstraction;

  // Atualizar tokens selecionados com dados reais
  const currentFromToken = fromToken;
  const currentToToken = toToken;
  

  // Auto-selecionar tokens quando disponíveis
  React.useEffect(() => {
    if (!fromToken && !toToken && walletAddress) {
      // Aguardar um pouco para os tokens serem carregados
      const timer = setTimeout(() => {
        // A auto-seleção será feita pelo TokenSelector com autoSelectSymbol
        // Não precisamos fazer nada aqui, pois o TokenSelector já cuida disso
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [walletAddress, fromToken, toToken]);

  // Calcular taxa de câmbio (só se ambos tokens têm preço)
  const exchangeRate = (() => {
    console.log('🔍 DEBUG exchangeRate calculation:', {
      currentFromToken: currentFromToken?.symbol,
      currentToToken: currentToToken?.symbol,
      fromTokenPrice: currentFromToken?.price,
      toTokenPrice: currentToToken?.price
    });
    
    if (!currentFromToken || !currentToToken) {
      console.log('❌ DEBUG exchangeRate: Missing tokens');
      return 0;
    }
    
    // Usar preços reais da API
    const fromPrice = currentFromToken.price || 0;
    const toPrice = currentToToken.price || 0;
    
    // Taxa de câmbio: quantos tokens de destino por 1 token de origem
    let rate = toPrice > 0 ? fromPrice / toPrice : 0;
    
    // Fallback: se não há preços, usar taxa fixa temporária para BRZ/USDC
    if (rate === 0 && currentFromToken.symbol.toLowerCase() === 'brz' && currentToToken.symbol.toLowerCase() === 'usdc') {
      rate = 0.18; // 1 BRZ = 0.18 USDC (aproximadamente)
      console.log('✅ DEBUG exchangeRate: Using fallback rate:', rate);
    }
    
    // Fallback adicional: se USDC não tem preço mas BRZ tem, usar preço do BRZ
    if (rate === 0 && fromPrice > 0 && toPrice === 0 && currentFromToken.symbol.toLowerCase() === 'brz' && currentToToken.symbol.toLowerCase() === 'usdc') {
      rate = fromPrice; // Usar preço do BRZ como taxa
      console.log('✅ DEBUG exchangeRate: Using BRZ price as rate:', rate);
    }
    
    console.log('✅ DEBUG exchangeRate final:', rate);
    return rate;
  })();


  // Recalcular valores quando tokens ou exchangeRate mudarem
  useEffect(() => {
    console.log('🔍 DEBUG Auto-calculation:', {
      fromAmount,
      exchangeRate,
      currentFromToken: currentFromToken?.symbol,
      currentToToken: currentToToken?.symbol,
      fromTokenPrice: currentFromToken?.price,
      toTokenPrice: currentToToken?.price
    });
    
    if (fromAmount && exchangeRate > 0 && currentFromToken && currentToToken) {
      const calculatedTo = calculateToAmount(fromAmount);
      console.log('✅ DEBUG Calculated toAmount:', calculatedTo);
      setToAmount(calculatedTo);
    } else if (!fromAmount) {
      // Limpar campo receber quando campo enviar estiver vazio
      setToAmount("");
    } else {
      console.log('❌ DEBUG Conditions not met for auto-calculation');
    }
  }, [fromAmount, currentFromToken, currentToToken, exchangeRate]);

  // Recalcular fromAmount quando toAmount mudar
  useEffect(() => {
    if (toAmount && exchangeRate > 0 && currentFromToken && currentToToken) {
      const calculatedFrom = calculateFromAmount(toAmount);
      setFromAmount(calculatedFrom);
    }
  }, [toAmount, currentFromToken, currentToToken, exchangeRate]);

  // Buscar taxa USD/BRL ao carregar o componente
  useEffect(() => {
    fetchUSDBRLRate();
  }, []);

  // Validação automática de conversão fiat
  useEffect(() => {
    if (fromAmount && currentFromToken) {
      validateFiatConversion(currentFromToken, fromAmount);
    }
    if (toAmount && currentToToken) {
      validateFiatConversion(currentToToken, toAmount);
    }
  }, [fromAmount, toAmount, currentFromToken, currentToToken]);

  // Calcular valor de destino baseado no valor de origem
  const calculateToAmount = (fromValue: string) => {
    console.log('🔍 DEBUG calculateToAmount called:', {
      fromValue,
      exchangeRate,
      currentFromToken: currentFromToken?.symbol,
      currentToToken: currentToToken?.symbol
    });
    
    if (!fromValue || !exchangeRate || !currentFromToken || !currentToToken) {
      console.log('❌ DEBUG calculateToAmount: Missing required values');
      return "";
    }
    
    const fromNum = parseFloat(fromValue);
    if (isNaN(fromNum) || fromNum <= 0) {
      console.log('❌ DEBUG calculateToAmount: Invalid fromNum:', fromNum);
      return "";
    }
    
    // Aplicar taxa de câmbio diretamente (sem conversão de decimais)
    const toAmount = fromNum * exchangeRate;
    console.log('✅ DEBUG calculateToAmount result:', toAmount);
    
    return toAmount.toString();
  };

  // Calcular valor de origem baseado no valor de destino
  const calculateFromAmount = (toValue: string) => {
    if (!toValue || !exchangeRate || !currentFromToken || !currentToToken) return "";
    
    const toNum = parseFloat(toValue);
    if (isNaN(toNum) || toNum <= 0) return "";
    
    // Aplicar taxa de câmbio inversa diretamente (sem conversão de decimais)
    const fromAmount = toNum / exchangeRate;
    
    return fromAmount.toString();
  };


  // Validações com dados reais
  const isValidAmount = (amount: string) => {
    if (!currentFromToken) return false;
    const numAmount = parseFloat(amount);
    const tokenBalance = parseFloat(currentFromToken.balance || "0");
    return numAmount > 0 && numAmount <= tokenBalance;
  };

  const canProceed = fromAmount && currentFromToken && currentToToken && 
    isValidAmount(fromAmount) && currentFromToken.symbol !== currentToToken.symbol;

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
      
      // Assinar a User Operation
      const signature = await signMessage({ message: userOperationHash });
      
      if (!signature) {
        throw new Error('Assinatura cancelada pelo usuário');
      }

      
      // Executar a User Operation
      const result = await executeUserOperation({
        userOperationHash,
        signature: (signature as any).signature || signature
      });

      
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

  const handleMaxAmount = () => {
    if (currentFromToken && currentFromToken.balance) {
      setFromAmount(currentFromToken.balance);
      const calculatedTo = calculateToAmount(currentFromToken.balance);
      setToAmount(calculatedTo);
    }
  };

  const handleSlippageModalOpen = () => {
    setTempSlippage(slippage);
    setShowSlippageModal(true);
    setShowCustomInput(false);
    setCustomSlippage("");
  };

  const handleSlippageAccept = () => {
    if (showCustomInput && customSlippage) {
      const value = parseFloat(customSlippage);
      if (!isNaN(value) && value >= 0.1 && value <= 50) {
        setSlippage(value);
      }
    } else {
      setSlippage(tempSlippage);
    }
    setShowSlippageModal(false);
    setShowCustomInput(false);
    setCustomSlippage("");
  };

  const handleSlippageModalClose = () => {
    setShowSlippageModal(false);
    setShowCustomInput(false);
    setCustomSlippage("");
  };

  // Funções de formatação
  const formatTokenAmount = (amount: string, tokenDecimals?: number, forInput: boolean = false) => {
    if (!amount || amount === "0") return "0";
    
    const num = parseFloat(amount);
    if (num === 0) return "0";
    
    // Para inputs, mostrar mais precisão
    if (forInput) {
      if (tokenDecimals === 6) { // USDC
        return num.toFixed(6);
      } else if (tokenDecimals === 18) { // BRZ, ETH
        return num.toFixed(8);
      } else {
        return num.toFixed(8);
      }
    }
    
    // Para exibição geral, usar lógica baseada no valor
    if (num < 0.0001) {
      return num.toFixed(8);
    }
    
    if (num < 1) {
      return num.toFixed(4);
    }
    
    return num.toFixed(2);
  };

  const formatFiatAmount = (amount: number) => {
    if (amount === 0) return "R$0,00";
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatBalance = (balance: string, symbol: string, tokenDecimals?: number) => {
    if (!balance || balance === "0") return `0 ${symbol}`;
    
    const formatted = formatTokenAmount(balance, tokenDecimals);
    return `${formatted} ${symbol}`;
  };

  // Calcular valor em R$ baseado no preço do token
  const calculateFiatValue = (amount: string, token: any) => {
    if (!amount || !token || amount === "0") return 0;
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount === 0) return 0;
    
    // Usar preço real da API
    let price = token.price || 0;
    
    // Validação específica para USDC (1 USDC = 1 USD)
    if (token.symbol.toLowerCase() === 'usdc') {
      // Se USDC não tem preço, usar taxa USD/BRL dinâmica
      if (price === 0) {
        price = getUSDBRLRate(); // Taxa USD/BRL dinâmica
        console.log('🔍 DEBUG USDC: Using dynamic USD/BRL rate:', price);
      }
    }
    
    // Validação específica para BRZ (token brasileiro)
    if (token.symbol.toLowerCase() === 'brz') {
      // BRZ já deve vir em R$ da API
      console.log('🔍 DEBUG BRZ: Using API price:', price);
    }
    
    console.log('🔍 DEBUG calculateFiatValue:', {
      token: token.symbol,
      amount: numAmount,
      price: price,
      result: numAmount * price
    });
    
    return numAmount * price;
  };

  // Estado para taxa USD/BRL
  const [usdBRLRate, setUsdBRLRate] = useState(5.45); // Valor padrão

  // Função para buscar taxa USD/BRL atual
  const fetchUSDBRLRate = async () => {
    try {
      // Usar API pública para taxa USD/BRL
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const data = await response.json();
      const rate = data.rates.BRL;
      
      console.log('🔍 DEBUG USD/BRL Rate fetched:', rate);
      setUsdBRLRate(rate);
      return rate;
    } catch (error) {
      console.error('❌ DEBUG Error fetching USD/BRL rate:', error);
      // Manter valor padrão em caso de erro
      return 5.45;
    }
  };

  // Função para validar e obter taxa USD/BRL atual
  const getUSDBRLRate = () => {
    return usdBRLRate;
  };

  // Função para validar conversão fiat
  const validateFiatConversion = (token: any, amount: string) => {
    const numAmount = parseFloat(amount);
    if (!token || !amount || isNaN(numAmount)) return null;

    const validation = {
      token: token.symbol,
      amount: numAmount,
      apiPrice: token.price || 0,
      calculatedPrice: 0,
      isValid: false,
      message: ''
    };

    if (token.symbol.toLowerCase() === 'usdc') {
      // USDC deve ser 1 USD = taxa USD/BRL atual
      validation.calculatedPrice = getUSDBRLRate();
      validation.isValid = Math.abs(validation.apiPrice - validation.calculatedPrice) < 0.1;
      validation.message = `USDC: API=${validation.apiPrice}, Esperado=${validation.calculatedPrice} (USD/BRL dinâmico)`;
    } else if (token.symbol.toLowerCase() === 'brz') {
      // BRZ deve ter preço em R$
      validation.calculatedPrice = validation.apiPrice;
      validation.isValid = validation.apiPrice > 0;
      validation.message = `BRZ: API=${validation.apiPrice}`;
    }

    console.log('🔍 DEBUG validateFiatConversion:', validation);
    return validation;
  };

  const renderFormStep = () => (
    <div className="space-y-6">
      {/* Header com título e settings */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Conversão de criptomoedas</h1>
          <p className="text-slate-400 text-sm mt-1">Digite o valor que deseja converter.</p>
          <p className="text-xs text-slate-500 mt-1">
            USD/BRL: R$ {usdBRLRate.toFixed(2)}
          </p>
        </div>
        <Button
          onClick={handleSlippageModalOpen}
          variant="outline"
          size="sm"
          className="border-slate-600/50 text-slate-300 hover:border-blue-500/70 hover:text-blue-400 hover:bg-blue-500/10 transition-all duration-200 backdrop-blur-sm bg-slate-800/30"
        >
          <Settings className="h-4 w-4" />
                </Button>
      </div>

      {/* Seção Envia - Estilo Chainless */}
      <div className="space-y-3">
        <Label className="text-white text-lg">Envia</Label>
        <div className="bg-slate-800/50 rounded-lg p-4 space-y-4">
          {/* Input principal com token selector à direita */}
          <div className="flex items-center space-x-3">
            <div className="flex-1">
                <Input 
                type="text"
                placeholder="0"
                value={fromAmount ? formatTokenAmount(fromAmount, currentFromToken?.decimals, true) : ""}
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/[^\d.,]/g, '').replace(',', '.');
                  setFromAmount(rawValue);
                }}
                className="bg-transparent border-none text-white text-3xl font-bold text-right p-0 h-auto focus:ring-0 focus:outline-none"
                disabled={!currentFromToken}
                />
              </div>
            <TokenSelector
              selectedToken={currentFromToken}
              onTokenSelect={handleFromTokenSelect}
              chainId={SUPPORTED_CHAINS.POLYGON}
              walletAddress={walletAddress}
              placeholder="Selecionar token"
              showBalance={false}
              autoSelectSymbol="BRZ"
              compact={true}
            />
              </div>
          
          {/* Valor em R$ e saldo com MAX */}
          <div className="flex items-center justify-between">
            <div className="text-slate-400 text-sm">
              {formatFiatAmount(calculateFiatValue(fromAmount, currentFromToken))}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-slate-400 text-sm">
                Saldo: {formatBalance(currentFromToken?.balance || "0", currentFromToken?.symbol || "TOKEN", currentFromToken?.decimals)}
              </span>
              <Button
                onClick={handleMaxAmount}
                size="sm"
                variant="outline"
                className="text-xs px-2 py-1 h-auto bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
              >
                MAX
              </Button>
            </div>
            </div>

          {fromAmount && !isValidAmount(fromAmount) && (
            <p className="text-red-400 text-sm flex items-center space-x-1">
              <AlertCircle className="h-4 w-4" />
              <span>Saldo insuficiente</span>
            </p>
          )}
        </div>
            </div>

      {/* Botão de Swap - Estilo Chainless */}
      <div className="flex justify-center">
        <Button
          onClick={handleSwapTokens}
          size="sm"
          className="bg-white/10 hover:bg-white/20 border-2 border-white/20 hover:border-white/40 transition-all duration-200 rounded-full w-12 h-12"
        >
          <ArrowUpDown className="h-5 w-5" />
                </Button>
      </div>

      {/* Seção Recebe - Estilo Chainless */}
      <div className="space-y-3">
        <Label className="text-white text-lg">Recebe</Label>
        <div className="bg-slate-800/50 rounded-lg p-4 space-y-4">
          {/* Input principal com token selector à direita */}
          <div className="flex items-center space-x-3">
            <div className="flex-1">
                <Input 
                type="text"
                placeholder="0"
                value={toAmount ? formatTokenAmount(toAmount, currentToToken?.decimals, true) : ""}
                onChange={(e) => {
                  // Só permitir edição se não há valor no campo enviar
                  if (!fromAmount) {
                    const rawValue = e.target.value.replace(/[^\d.,]/g, '').replace(',', '.');
                    setToAmount(rawValue);
                  }
                }}
                className="bg-transparent border-none text-white text-3xl font-bold text-right p-0 h-auto focus:ring-0 focus:outline-none"
                disabled={!currentToToken || !!(fromAmount && fromAmount !== "")}
                readOnly={!!(fromAmount && fromAmount !== "")}
              />
            </div>
            <TokenSelector
              selectedToken={currentToToken}
              onTokenSelect={handleToTokenSelect}
              chainId={SUPPORTED_CHAINS.POLYGON}
              walletAddress={walletAddress}
              placeholder="Selecionar token"
              showBalance={false}
              autoSelectSymbol="USDC"
              compact={true}
            />
          </div>
          
          {/* Valor em R$ e saldo */}
          <div className="flex items-center justify-between">
            <div className="text-slate-400 text-sm">
              {fromAmount ? "Calculado automaticamente" : `~${formatFiatAmount(calculateFiatValue(toAmount, currentToToken))}`}
            </div>
            <div className="text-slate-400 text-sm">
              Saldo: {formatBalance(currentToToken?.balance || "0", currentToToken?.symbol || "TOKEN", currentToToken?.decimals)}
            </div>
          </div>
        </div>
      </div>

      {/* Taxa de conversão - Só aparece quando há valor */}
      {fromAmount && currentFromToken && (
        <div className="bg-slate-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-white font-medium">
              {currentToToken ? 
                `1 ${currentToToken.symbol} = ${exchangeRate.toFixed(3)} ${currentFromToken.symbol} (${formatFiatAmount(calculateFiatValue("1", currentToToken))})` :
                `Taxa de conversão será calculada quando selecionar o token de destino`
              }
            </span>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </div>
        </div>
      )}

      {/* Timer de preço e botão Revisar - Só aparece quando há valor */}
      {fromAmount && currentFromToken && (
        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-400" />
              <span className="text-yellow-400 text-sm">
                O preço efetivo será atualizado em:
              </span>
            </div>
            <span className="text-yellow-400 font-mono text-sm">00:47</span>
          </div>
          
          <Button
            onClick={handleGetQuote}
            disabled={!canProceed || isLoading}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Obtendo Cotação...</span>
              </div>
            ) : (
              <span>{currentToToken ? 'Revisar' : 'Selecionar Token de Destino'}</span>
            )}
          </Button>
        </div>
      )}
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
          {/* Resumo do Swap - Estilo Chainless */}
          <div className="space-y-4">
            {/* Você pagará */}
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{fromToken.icon}</div>
                  <div>
                    <p className="text-white font-semibold">Você pagará</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold text-xl">{fromAmount} {fromToken.symbol}</p>
                  <p className="text-slate-400 text-sm">{formatFiatAmount(calculateFiatValue(fromAmount, fromToken))}</p>
                </div>
              </div>
            </div>

            {/* Você receberá no mínimo */}
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{toToken.icon}</div>
                  <div>
                    <p className="text-white font-semibold">Você receberá no mínimo</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold text-xl">{toAmount} {toToken.symbol}</p>
                  <p className="text-slate-400 text-sm">{formatFiatAmount(calculateFiatValue(toAmount, toToken))}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Taxa de Conversão - Igual à Chainless */}
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white font-medium">Taxa de conversão</span>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </div>
            <div className="text-center">
              <p className="text-white text-lg font-semibold">
                1 {toToken.symbol} = {exchangeRate.toFixed(3)} {fromToken.symbol}
              </p>
              <p className="text-slate-400 text-sm">
                ({formatFiatAmount(calculateFiatValue("1", toToken))})
              </p>
            </div>
          </div>

          {/* Composição do Preço Efetivo - Expandível */}
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white font-medium">Composição do Preço Efetivo</span>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Câmbio do Provedor:</span>
                <span className="text-white">1 {toToken.symbol} = {(exchangeRate * 0.99).toFixed(3)} {fromToken.symbol}</span>
            </div>


              <div className="flex items-center justify-between">
                <span className="text-slate-400">Tolerância a Slippage:</span>
                <span className="text-yellow-400">{slippage}%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Taxa da Rede:</span>
                <div className="text-right">
                  <span className="text-white">0,0427 {fromToken.symbol}</span>
                  <p className="text-slate-400 text-xs">R$0,04</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Taxa da Chainless:</span>
                <div className="text-right">
                  <span className="text-white">0,100 {fromToken.symbol}</span>
                  <p className="text-slate-400 text-xs">R$0,10 (0,5%)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Detalhes da Operação */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-slate-400">Operação</span>
                <AlertCircle className="h-4 w-4 text-slate-400" />
              </div>
              <span className="text-white">Swap</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-slate-400">Provedor</span>
                <AlertCircle className="h-4 w-4 text-slate-400" />
              </div>
              <span className="text-white">Odos</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Tempo estimado:</span>
              <span className="text-white">~1min</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timer de atualização de preço - Estilo Chainless */}
      <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-yellow-400" />
            <span className="text-yellow-400 text-sm">
              O preço efetivo será atualizado em:
            </span>
          </div>
          <span className="text-yellow-400 font-mono text-sm">00:30</span>
        </div>
      </div>

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
          className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Executando...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>Confirmar</span>
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

  const renderSlippageModal = () => (
    showSlippageModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-slate-800 rounded-xl w-full max-w-md p-6 space-y-6 mx-4 relative">
          <button
            onClick={handleSlippageModalClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="text-center">
            <h3 className="text-xl font-bold text-white mb-2">Tolerância a Slippage</h3>
            <p className="text-slate-400 text-sm">
              Sua transação será revertida se o preço mudar mais do que a porcentagem (%) de slippage selecionada.
            </p>
          </div>
          
          <div className="space-y-3">
            <Button
              onClick={() => setTempSlippage(0.1)}
              variant={tempSlippage === 0.1 ? "default" : "outline"}
              className={`w-full ${tempSlippage === 0.1 ? 'bg-blue-600 text-white' : 'bg-slate-700 border-slate-600 text-slate-300'}`}
            >
              0.1%
            </Button>
            <Button
              onClick={() => setTempSlippage(0.5)}
              variant={tempSlippage === 0.5 ? "default" : "outline"}
              className={`w-full ${tempSlippage === 0.5 ? 'bg-blue-600 text-white' : 'bg-slate-700 border-slate-600 text-slate-300'}`}
            >
              0.5%
            </Button>
            {!showCustomInput ? (
              <Button
                onClick={() => setShowCustomInput(true)}
                variant="outline"
                className="w-full bg-slate-700 border-slate-600 text-slate-300"
              >
                Definir %
              </Button>
            ) : (
              <div className="space-y-2">
                <Input
                  type="number"
                  value={customSlippage}
                  onChange={(e) => setCustomSlippage(e.target.value)}
                  placeholder="Ex: 2.5"
                  className="bg-slate-700 border-slate-600 text-white"
                  min="0.1"
                  max="50"
                  step="0.1"
                  autoFocus
                />
                <p className="text-slate-400 text-xs">
                  Valor entre 0.1% e 50%
                </p>
              </div>
            )}
          </div>
          
          <Button
            onClick={handleSlippageAccept}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-3 rounded-lg"
          >
            Aceitar
          </Button>
      </div>
      </div>
    )
  );

  return (
    <ProtectedRoute>
      <AppLayout 
        title="Conversão de criptomoedas"
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
        {renderSlippageModal()}
    </AppLayout>
    </ProtectedRoute>
  );
}