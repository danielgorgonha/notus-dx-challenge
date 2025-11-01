"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef, Suspense } from "react";
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
  Settings,
  ExternalLink
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSmartWallet } from "@/hooks/use-smart-wallet";
import { useToast } from "@/hooks/use-toast";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { SUPPORTED_CHAINS } from "@/lib/client";
import { createSwapQuote } from "@/lib/actions/swap";
import { executeUserOperation } from "@/lib/actions/user-operation";
import { listChains } from "@/lib/actions/blockchain";
import { usePrivy } from "@privy-io/react-auth";
import { Copy, ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getPortfolio } from "@/lib/actions/dashboard";
import { TokenSelector } from "@/components/ui/token-selector";
import { SlippageModal } from "@/components/ui/slippage-modal";


function SwapPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { wallet } = useSmartWallet();
  const { signMessage } = usePrivy();
  const toast = useToast();
  
  const [currentStep, setCurrentStep] = useState<"form" | "preview" | "executing" | "success">("form");
  const [fromToken, setFromToken] = useState<any>(null);
  const [toToken, setToToken] = useState<any>(null);
  
  // Token inicial de query params (para "Comprar" ou "Vender")
  const initialFromTokenSymbol = searchParams.get('fromToken');
  const initialToTokenSymbol = searchParams.get('toToken');

  // Funções para seleção de tokens com validação
  const handleFromTokenSelect = useCallback((token: any) => {
    if (toToken && token.address === toToken.address && token.chainId === toToken.chainId) {
      // Se o token selecionado é o mesmo do "Para", troca os tokens
      setFromToken(toToken);
      setToToken(fromToken);
    } else {
      setFromToken(token);
    }
  }, [toToken, fromToken]);

  const handleToTokenSelect = useCallback((token: any) => {
    if (fromToken && token.address === fromToken.address && token.chainId === fromToken.chainId) {
      // Se o token selecionado é o mesmo do "De", troca os tokens
      setFromToken(toToken);
      setToToken(fromToken);
    } else {
      setToToken(token);
    }
  }, [fromToken, toToken]);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [slippage, setSlippage] = useState(0.5);
  const [isLoading, setIsLoading] = useState(false);
  const [quote, setQuote] = useState<any>(null);
  const [transactionHash, setTransactionHash] = useState("");
  const [userOperationHash, setUserOperationHash] = useState("");
  const [showSlippageModal, setShowSlippageModal] = useState(false);
  const [isQuoteDetailsOpen, setIsQuoteDetailsOpen] = useState(false);
  const [isFromTokenDetailsOpen, setIsFromTokenDetailsOpen] = useState(false);
  const [isToTokenDetailsOpen, setIsToTokenDetailsOpen] = useState(false);
  const [quoteTimer, setQuoteTimer] = useState(47); // Timer em segundos
  
  // Estado para taxa USD/BRL
  const [usdBRLRate, setUsdBRLRate] = useState(5.45); // Valor padrão

  const walletAddress = wallet?.accountAbstraction;

  // Buscar chains reais da API
  const { data: chainsData } = useQuery({
    queryKey: ['chains'],
    queryFn: () => listChains({ page: 1, perPage: 50 }),
    staleTime: 300000, // 5 minutos
  });

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

  // Calcular taxa de câmbio (memoizado para evitar recálculos)
  const exchangeRate = useMemo(() => {
    if (!currentFromToken || !currentToToken) {
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
    }
    
    // Fallback adicional: se USDC não tem preço mas BRZ tem, usar preço do BRZ
    if (rate === 0 && fromPrice > 0 && toPrice === 0 && currentFromToken.symbol.toLowerCase() === 'brz' && currentToToken.symbol.toLowerCase() === 'usdc') {
      rate = fromPrice; // Usar preço do BRZ como taxa
    }
    
    return rate;
  }, [currentFromToken, currentToToken]);

  // Calcular valor de destino baseado no valor de origem (memoizado)
  const calculateToAmount = useCallback((fromValue: string) => {
    if (!fromValue || !exchangeRate || !currentFromToken || !currentToToken) {
      return "";
    }
    
    const fromNum = parseFloat(fromValue);
    if (isNaN(fromNum) || fromNum <= 0) {
      return "";
    }
    
    // Aplicar taxa de câmbio diretamente (sem conversão de decimais)
    const toAmount = fromNum * exchangeRate;
    
    return toAmount.toString();
  }, [exchangeRate, currentFromToken, currentToToken]);

  // Calcular valor de origem baseado no valor de destino (memoizado)
  const calculateFromAmount = useCallback((toValue: string) => {
    if (!toValue || !exchangeRate || !currentFromToken || !currentToToken) return "";
    
    const toNum = parseFloat(toValue);
    if (isNaN(toNum) || toNum <= 0) return "";
    
    // Aplicar taxa de câmbio inversa diretamente (sem conversão de decimais)
    const fromAmount = toNum / exchangeRate;
    
    return fromAmount.toString();
  }, [exchangeRate, currentFromToken, currentToToken]);

  // Recalcular valores quando tokens ou exchangeRate mudarem
  useEffect(() => {
    if (fromAmount && exchangeRate > 0 && currentFromToken && currentToToken) {
      const calculatedTo = calculateToAmount(fromAmount);
      setToAmount(calculatedTo);
    } else if (!fromAmount) {
      // Limpar campo receber quando campo enviar estiver vazio
      setToAmount("");
    }
  }, [fromAmount, exchangeRate, currentFromToken, currentToToken, calculateToAmount]);

  // Recalcular fromAmount quando toAmount mudar
  useEffect(() => {
    if (toAmount && exchangeRate > 0 && currentFromToken && currentToToken) {
      const calculatedFrom = calculateFromAmount(toAmount);
      setFromAmount(calculatedFrom);
    }
  }, [toAmount, exchangeRate, currentFromToken, currentToToken, calculateFromAmount]);

  // Buscar taxa USD/BRL ao carregar o componente
  useEffect(() => {
    fetchUSDBRLRate();
  }, []);

  // Validações com dados reais
  const isValidAmount = (amount: string) => {
    if (!currentFromToken) return false;
    const numAmount = parseFloat(amount);
    const tokenBalance = parseFloat(currentFromToken.balance || "0");
    return numAmount > 0 && numAmount <= tokenBalance;
  };

  // Declarar canProceed antes de usar no handleGetQuote
  const canProceed = fromAmount && currentFromToken && currentToToken && 
    isValidAmount(fromAmount) && currentFromToken.symbol !== currentToToken.symbol;

  // Declarar handleGetQuote antes de usar no useEffect
  const handleGetQuote = React.useCallback(async (isAutoRefresh = false) => {
    
    // Verificar se há dados mínimos para executar a cotação
    if (!walletAddress) {
      return;
    }
    
    if (!fromAmount || !currentFromToken || !currentToToken) {
        fromAmount,
        currentFromToken: currentFromToken?.symbol,
        currentToToken: currentToToken?.symbol
      });
      return;
    }
    
    if (!canProceed) {
        canProceed,
        isValidAmount: isValidAmount(fromAmount),
        sameToken: currentFromToken.symbol === currentToToken.symbol
      });
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

      
      // A API retorna { quotes: [...] }, então pegamos o primeiro quote
      const quote = swapQuote.quotes?.[0] || swapQuote.swap;
      
      const quoteData = {
        ...quote,
        fromToken,
        toToken,
        fromAmount,
        toAmount: quote.minAmountOut,
        exchangeRate: parseFloat(quote.minAmountOut) / parseFloat(fromAmount),
        slippage,
        estimatedGasFee: quote.estimatedGasFees?.gasFeeTokenAmount,
        gasFeeToken: fromToken.symbol,
        estimatedTime: "~3 minutes",
      };
      
      setQuote(quoteData);
      setUserOperationHash(quote.userOperationHash);
      setToAmount(quote.minAmountOut);
      setCurrentStep("preview");
      
      if (isAutoRefresh) {
        toast.success(
          'Preço Atualizado',
          'Nova cotação obtida automaticamente!',
          2000
        );
      } else {
        toast.success(
          'Cotação Gerada',
          'Cotação de swap criada com sucesso!',
          3000
        );
      }
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
  }, [canProceed, walletAddress, fromAmount, currentFromToken, currentToToken, slippage, toast]);

  // Wrapper para uso como onClick handler
  const handleGetQuoteClick = () => {
    handleGetQuote(false); // false = manual click
  };

  // Ref para manter referência estável do handleGetQuote
  const handleGetQuoteRef = useRef(handleGetQuote);
  handleGetQuoteRef.current = handleGetQuote;

  // Ref para controlar o timer
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isTimerActiveRef = useRef(false);

  // Memoizar dados do timer para evitar re-renders desnecessários
  const timerData = useMemo(() => ({
    walletAddress,
    currentFromToken,
    currentToToken,
    fromAmount
  }), [walletAddress, currentFromToken, currentToToken, fromAmount]);

  // Timer de contagem regressiva - independente das dependências
  useEffect(() => {
    if (!isTimerActiveRef.current) return;

    const interval = setInterval(() => {
      setQuoteTimer(prev => {
        if (prev <= 1) {
          // Timer chegou a zero, obter nova cotação
          setTimeout(() => {
            if (timerData.walletAddress && timerData.currentFromToken && timerData.currentToToken && timerData.fromAmount) {
              handleGetQuoteRef.current(true); // true = auto refresh
            }
          }, 0);
          return 47; // Reset para 47 segundos
        }
        return prev - 1;
      });
    }, 1000);

    timerRef.current = interval;

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [timerData]);

  // Controle de criação/pausa do timer
  useEffect(() => {
    // Limpar timer anterior
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Verificar se deve iniciar timer
    if (walletAddress && currentFromToken && currentToToken && fromAmount) {
      isTimerActiveRef.current = true;
    } else {
      isTimerActiveRef.current = false;
    }
  }, [walletAddress, currentFromToken, currentToToken, fromAmount]);

  // Limpar timer ao desmontar componente
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
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




  const handleSwapTokens = () => {
    const tempToken = fromToken;
    const tempAmount = fromAmount;
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(tempAmount);
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

  const handleSlippageAccept = (newSlippage: number) => {
    setSlippage(newSlippage);
    setShowSlippageModal(false);
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

  // Formatar timer para MM:SS
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calcular valor em R$ baseado no preço do token (memoizado)
  const calculateFiatValue = useCallback((amount: string, token: any) => {
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
      }
    }
    
    // Validação específica para BRZ (token brasileiro)
    if (token.symbol.toLowerCase() === 'brz') {
      // BRZ sempre deve ser 1:1 (1 BRZ = R$ 1,00)
      price = 1.0; // 1 BRZ = R$ 1,00
    }
    
    const result = numAmount * price;
    return result;
  }, [usdBRLRate]);

  // Função para buscar taxa USD/BRL atual
  const fetchUSDBRLRate = async () => {
    try {
      // Usar API pública para taxa USD/BRL
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const data = await response.json();
      const rate = data.rates.BRL;
      
      setUsdBRLRate(rate);
      return rate;
    } catch (error) {
      console.error('Error fetching USD/BRL rate:', error);
      // Manter valor padrão em caso de erro
      return 5.45;
    }
  };

  // Função para validar e obter taxa USD/BRL atual
  const getUSDBRLRate = () => {
    return usdBRLRate;
  };

  // Função para validar e formatar entrada de valor
  const validateAndFormatInput = (value: string, decimals: number = 18) => {
    // Remover caracteres não numéricos exceto ponto e vírgula
    const cleaned = value.replace(/[^\d.,]/g, '');
    
    // Substituir vírgula por ponto
    const normalized = cleaned.replace(',', '.');
    
    // Verificar se é um número válido
    const numValue = parseFloat(normalized);
    if (isNaN(numValue)) return '';
    
    // Limitar casas decimais
    const formatted = numValue.toFixed(decimals);
    
    return formatted;
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
          onClick={() => setShowSlippageModal(true)}
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
            <div className="flex-1 relative">
              <Input 
                type="text"
                placeholder="0"
                value={fromAmount ? formatTokenAmount(fromAmount, currentFromToken?.decimals, true) : ""}
                onChange={(e) => {
                  const formattedValue = validateAndFormatInput(e.target.value, currentFromToken?.decimals || 18);
                  setFromAmount(formattedValue);
                }}
                className="bg-transparent border-none text-white text-3xl font-bold text-right p-0 h-auto focus:ring-0 focus:outline-none placeholder:text-slate-500 transition-all duration-200 hover:bg-slate-700/30 focus:bg-slate-700/50 rounded-lg px-3 py-2"
                disabled={!currentFromToken}
                onFocus={(e) => e.target.select()}
                onBlur={(e) => {
                  // Validar e formatar valor ao sair do campo
                  if (e.target.value && !isNaN(parseFloat(e.target.value))) {
                    const formatted = parseFloat(e.target.value).toFixed(currentFromToken?.decimals || 18);
                    setFromAmount(formatted);
                  }
                }}
              />
              {/* Indicador de foco */}
              <div className="absolute inset-0 pointer-events-none rounded-lg border-2 border-transparent transition-all duration-200 focus-within:border-blue-500/50"></div>
            </div>
            <TokenSelector
              selectedToken={currentFromToken}
              onTokenSelect={handleFromTokenSelect}
              chainId={SUPPORTED_CHAINS.POLYGON}
              walletAddress={walletAddress}
              placeholder="Selecionar token"
              showBalance={false}
              autoSelectSymbol={initialFromTokenSymbol || "BRZ"}
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
                className="text-xs px-2 py-1 h-auto bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600 transition-all duration-200 hover:scale-105"
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
            <div className="flex-1 relative">
              <Input 
                type="text"
                placeholder="0"
                value={toAmount ? formatTokenAmount(toAmount, currentToToken?.decimals, true) : ""}
                onChange={(e) => {
                  // Só permitir edição se não há valor no campo enviar
                  if (!fromAmount) {
                    const formattedValue = validateAndFormatInput(e.target.value, currentToToken?.decimals || 18);
                    setToAmount(formattedValue);
                  }
                }}
                className={`bg-transparent border-none text-white text-3xl font-bold text-right p-0 h-auto focus:ring-0 focus:outline-none placeholder:text-slate-500 transition-all duration-200 rounded-lg px-3 py-2 ${
                  fromAmount && fromAmount !== "" 
                    ? "bg-slate-700/30 cursor-not-allowed opacity-75" 
                    : "hover:bg-slate-700/30 focus:bg-slate-700/50"
                }`}
                disabled={!currentToToken || !!(fromAmount && fromAmount !== "")}
                readOnly={!!(fromAmount && fromAmount !== "")}
                onFocus={(e) => {
                  if (!fromAmount) {
                    e.target.select();
                  }
                }}
                onBlur={(e) => {
                  // Validar e formatar valor ao sair do campo
                  if (e.target.value && !isNaN(parseFloat(e.target.value)) && !fromAmount) {
                    const formatted = parseFloat(e.target.value).toFixed(currentToToken?.decimals || 18);
                    setToAmount(formatted);
                  }
                }}
              />
              {/* Indicador de foco */}
              <div className={`absolute inset-0 pointer-events-none rounded-lg border-2 border-transparent transition-all duration-200 ${
                fromAmount && fromAmount !== "" 
                  ? "border-slate-600/50" 
                  : "focus-within:border-blue-500/50"
              }`}></div>
              
            </div>
            <TokenSelector
              selectedToken={currentToToken}
              onTokenSelect={handleToTokenSelect}
              chainId={SUPPORTED_CHAINS.POLYGON}
              walletAddress={walletAddress}
              placeholder="Selecionar token"
              showBalance={false}
              autoSelectSymbol={initialToTokenSymbol || "USDC"}
              compact={true}
            />
          </div>
          
          {/* Valor em R$ e saldo */}
          <div className="flex items-center justify-between">
            <div className="text-slate-400 text-sm">
              {fromAmount ? `~${formatFiatAmount(calculateFiatValue(toAmount, currentToToken))}` : `~${formatFiatAmount(calculateFiatValue(toAmount, currentToToken))}`}
            </div>
            <div className="text-slate-400 text-sm">
              Saldo: {formatBalance(currentToToken?.balance || "0", currentToToken?.symbol || "TOKEN", currentToToken?.decimals)}
            </div>
          </div>
        </div>
      </div>

      {/* Taxa de conversão expandível - Estilo Chainless */}
      {fromAmount && currentFromToken && currentToToken && (
        <div className="bg-slate-800/50 rounded-lg p-4">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setIsQuoteDetailsOpen(!isQuoteDetailsOpen)}
          >
            <span className="text-white font-medium">
              1 {currentToToken.symbol} = {exchangeRate.toFixed(3)} {currentFromToken.symbol} ({formatFiatAmount(calculateFiatValue("1", currentToToken))})
            </span>
            <ChevronDown 
              className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                isQuoteDetailsOpen ? 'rotate-180' : ''
              }`} 
            />
          </div>
          
          {/* Detalhes expandíveis */}
          {isQuoteDetailsOpen && (
            <div className="mt-4 space-y-3 pt-4 border-t border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Câmbio:</span>
                <span className="text-white">1 {currentToToken.symbol} = {(exchangeRate * 0.99).toFixed(3)} {currentFromToken.symbol}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Impacto no Preço:</span>
                <span className="text-red-400">
                  {quote?.estimatedCollectedFee?.collectedFeePercent ? 
                    `-${(parseFloat(quote.estimatedCollectedFee.collectedFeePercent) * 100).toFixed(2)}%` : 
                    '-9,69%'
                  }
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Tolerância a Slippage:</span>
                <span className="text-yellow-400">{slippage}%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Taxa da rede (gas):</span>
                <div className="text-right">
                  <span className="text-white">
                    {quote?.estimatedGasFees?.gasFeeTokenAmount ? 
                      `${parseFloat(quote.estimatedGasFees.gasFeeTokenAmount).toFixed(4)} ${currentFromToken.symbol}` : 
                      `0,0427 ${currentFromToken.symbol}`
                    }
                  </span>
                  <p className="text-slate-400 text-xs">
                    {quote?.estimatedGasFees?.gasFeeTokenAmountUSD ? 
                      `R$${parseFloat(quote.estimatedGasFees.gasFeeTokenAmountUSD).toFixed(2)}` : 
                      'R$0,04'
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Taxa da Notus DX:</span>
                <div className="text-right">
                  <span className="text-white">
                    {quote?.estimatedCollectedFee?.notusCollectedFee ? 
                      `${parseFloat(quote.estimatedCollectedFee.notusCollectedFee).toFixed(3)} ${currentFromToken.symbol}` : 
                      `0,100 ${currentFromToken.symbol}`
                    }
                  </span>
                  <p className="text-slate-400 text-xs">
                    {quote?.estimatedCollectedFee?.notusCollectedFeePercent ? 
                      `R$${(parseFloat(quote.estimatedCollectedFee.notusCollectedFee) * parseFloat(quote.estimatedGasFees?.gasFeeTokenAmount || '1')).toFixed(2)}` : 
                      'R$0,10'
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Tipo de transação:</span>
                <span className="text-white">Swap</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Provedor:</span>
                <span className="text-white">{quote?.swapProvider || 'ODOS'}</span>
              </div>
            </div>
          )}
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
            <span className="text-yellow-400 font-mono text-sm">{formatTimer(quoteTimer)}</span>
          </div>
          
          <Button
            onClick={handleGetQuoteClick}
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
        <h1 className="text-3xl font-bold text-white mb-2">Confirme os detalhes da transação</h1>
        <p className="text-slate-300">Conversão de {fromToken.symbol} para {toToken.symbol}</p>
      </div>

      {/* Cards principais - Estilo Chainless */}
      <div className="space-y-4">
        {/* Você pagará */}
        <div className="bg-slate-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img 
                  src={fromToken.logoUrl || fromToken.logo } 
                  alt={fromToken.symbol}
                  className="w-12 h-12 rounded-full"
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                  <img src={fromToken.chain?.logo || ''} alt="Polygon" className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-white font-semibold">Você pagará</p>
                <p className="text-slate-400 text-sm">{fromAmount} {fromToken.symbol}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white font-bold text-xl">{formatFiatAmount(calculateFiatValue(fromAmount, fromToken))}</p>
            </div>
          </div>
        </div>

        {/* Você receberá no mínimo */}
        <div className="bg-slate-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img 
                  src={toToken.logoUrl || toToken.logo} 
                  alt={toToken.symbol}
                  className="w-12 h-12 rounded-full"
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                  <img src={fromToken.chain?.logo || ''} alt="Polygon" className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-white font-semibold">Você receberá no mínimo</p>
                <p className="text-slate-400 text-sm">{toAmount} {toToken.symbol}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white font-bold text-xl">{formatFiatAmount(calculateFiatValue(toAmount, toToken))}</p>
            </div>
          </div>
        </div>

        {/* Taxa de conversão */}
        <div className="bg-slate-800/50 rounded-lg p-4">
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
          <div 
            className="flex items-center justify-between mb-4 cursor-pointer"
            onClick={() => setIsQuoteDetailsOpen(!isQuoteDetailsOpen)}
          >
            <span className="text-white font-medium">Composição do Preço Efetivo</span>
            <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isQuoteDetailsOpen ? 'rotate-180' : ''}`} />
          </div>
          
          {isQuoteDetailsOpen && (
            <div className="mt-4 space-y-3 pt-4 border-t border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Câmbio do Provedor:</span>
                <span className="text-white">
                  1 {toToken.symbol} = {quote?.exchangeRate?.toFixed(3) || exchangeRate.toFixed(3)} {fromToken.symbol}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Tolerância a Slippage:</span>
                <span className="text-yellow-400">{slippage}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Taxa da Rede:</span>
                <div className="text-right">
                  <span className="text-white">
                    {quote?.estimatedGasFees?.gasFeeTokenAmount ? parseFloat(quote.estimatedGasFees.gasFeeTokenAmount).toFixed(4) : '0.0000'} {fromToken.symbol}
                  </span>
                  <p className="text-slate-400 text-xs">
                    {quote?.estimatedGasFees?.gasFeeTokenAmountUSD ? formatFiatAmount(parseFloat(quote.estimatedGasFees.gasFeeTokenAmountUSD) * usdBRLRate) : 'R$0,00'}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Taxa da Notus DX:</span>
                <div className="text-right">
                  <span className="text-white">
                    {quote?.estimatedCollectedFee?.notusCollectedFee ? parseFloat(quote.estimatedCollectedFee.notusCollectedFee).toFixed(4) : '0.0000'} {fromToken.symbol}
                  </span>
                  <p className="text-slate-400 text-xs">
                    {quote?.estimatedCollectedFee?.notusCollectedFee ? formatFiatAmount(parseFloat(quote.estimatedCollectedFee.notusCollectedFee) * usdBRLRate) : 'R$0,00'}
                  </p>
                </div>
              </div>
            </div>
          )}
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
            <span className="text-white">{quote?.swapProvider || 'Odos'}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Tempo estimado:</span>
            <span className="text-white">~1min</span>
          </div>
        </div>

        {/* Envia */}
        <div className="bg-slate-800/50 rounded-lg p-4">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setIsFromTokenDetailsOpen(!isFromTokenDetailsOpen)}
          >
            <span className="text-white font-medium">Envia</span>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <img 
                  src={fromToken.logoUrl || fromToken.logo } 
                  alt={fromToken.symbol}
                  className="w-8 h-8 rounded-full"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-purple-600 rounded-full flex items-center justify-center">
                  <img src={fromToken.chain?.logo || ''} alt="Polygon" className="w-3 h-3" />
                </div>
              </div>
              <span className="text-white">{fromToken.symbol}</span>
              <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isFromTokenDetailsOpen ? 'rotate-180' : ''}`} />
            </div>
          </div>
          {isFromTokenDetailsOpen && (
            <div className="mt-3 space-y-2 pt-3 border-t border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Rede:</span>
                <div className="flex items-center space-x-2">
                  <img src={fromToken.chain?.logo || ''} alt="Polygon" className="w-6 h-6" />
                  <span className="text-white">Polygon</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Contrato do token:</span>
                <div className="flex items-center space-x-2">
                  <span className="text-white text-sm">{fromToken.address ? `${fromToken.address.slice(0, 6)}...${fromToken.address.slice(-4)}` : 'N/A'}</span>
                  <a 
                    href={`https://polygonscan.com/token/${fromToken.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recebe */}
        <div className="bg-slate-800/50 rounded-lg p-4">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setIsToTokenDetailsOpen(!isToTokenDetailsOpen)}
          >
            <span className="text-white font-medium">Recebe</span>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <img 
                  src={toToken.logoUrl || toToken.logo} 
                  alt={toToken.symbol}
                  className="w-8 h-8 rounded-full"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-purple-600 rounded-full flex items-center justify-center">
                  <img src={toToken.chain?.logo || ''} alt="Polygon" className="w-3 h-3" />
                </div>
              </div>
              <span className="text-white">{toToken.symbol}</span>
              <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isToTokenDetailsOpen ? 'rotate-180' : ''}`} />
            </div>
          </div>
          {isToTokenDetailsOpen && (
            <div className="mt-3 space-y-2 pt-3 border-t border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Rede:</span>
                <div className="flex items-center space-x-2">
                  <img src={fromToken.chain?.logo} alt="Polygon" className="w-6 h-6" />
                  <span className="text-white">Polygon</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Contrato do token:</span>
                <div className="flex items-center space-x-2">
                  <span className="text-white text-sm">{toToken.address ? `${toToken.address.slice(0, 6)}...${toToken.address.slice(-4)}` : 'N/A'}</span>
                  <a 
                    href={`https://polygonscan.com/token/${toToken.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Timer de atualização de preço - Estilo Chainless */}
      <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-yellow-400" />
            <span className="text-yellow-400 text-sm">
              O preço efetivo será atualizado em:
            </span>
          </div>
          <span className="text-yellow-400 font-mono text-sm">{formatTimer(quoteTimer)}</span>
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
          className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
              <span>Executando...</span>
            </div>
          ) : (
            "Confirmar"
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
        <SlippageModal
          isOpen={showSlippageModal}
          onClose={() => setShowSlippageModal(false)}
          currentSlippage={slippage}
          onAccept={handleSlippageAccept}
        />
    </AppLayout>
    </ProtectedRoute>
  );
}

export default function SwapPage() {
  return (
    <Suspense fallback={
      <ProtectedRoute>
        <AppLayout 
          title="Conversão de criptomoedas"
          description="Troque tokens instantaneamente"
        >
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
          </div>
        </AppLayout>
      </ProtectedRoute>
    }>
      <SwapPageContent />
    </Suspense>
  );
}