"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft, 
  Settings, 
  Loader2,
  AlertCircle,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import { useSmartWallet } from "@/hooks/use-smart-wallet";
import { useToast } from "@/hooks/use-toast";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { SUPPORTED_CHAINS } from "@/lib/client";
import { createSwapQuote } from "@/lib/actions/swap";
import { executeUserOperation } from "@/lib/actions/user-operation";
import { usePrivy } from "@privy-io/react-auth";
import { useQuery } from "@tanstack/react-query";
import { getPortfolio } from "@/lib/actions/dashboard";
import { getTokenBySymbol } from "@/lib/actions/token";
import { formatTokenBalance as formatTokenBalanceUtil, formatCurrency as formatCurrencyUtil } from "@/lib/utils";
import { SlippageModal } from "@/components/ui/slippage-modal";

type Step = "currency" | "amount" | "preview" | "executing" | "success";

export default function BuyTokenPage() {
  const params = useParams();
  const router = useRouter();
  const { wallet } = useSmartWallet();
  const { signMessage } = usePrivy();
  const toast = useToast();

  const symbol = (params.symbol as string)?.toUpperCase() || '';
  
  const [currentStep, setCurrentStep] = useState<Step>("currency");
  const [selectedCurrency, setSelectedCurrency] = useState<'BRZ' | 'USDC' | null>(null);
  const [amount, setAmount] = useState("");
  const [quote, setQuote] = useState<any>(null);
  const [userOperationHash, setUserOperationHash] = useState("");
  const [transactionHash, setTransactionHash] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [slippage, setSlippage] = useState(0.5);
  const [estimatedReceived, setEstimatedReceived] = useState('0');
  const [isCalculatingQuote, setIsCalculatingQuote] = useState(false);
  const [minRequiredAmount, setMinRequiredAmount] = useState<string | null>(null);
  const [showSlippageModal, setShowSlippageModal] = useState(false);

  const walletAddress = wallet?.accountAbstraction;

  // Buscar portfolio para obter saldos de BRZ/USDC
  const { data: portfolioData } = useQuery({
    queryKey: ['portfolio', walletAddress],
    queryFn: () => walletAddress ? getPortfolio(walletAddress) : null,
    enabled: !!walletAddress,
    staleTime: 30000,
  });

  // Buscar informações do token a ser comprado
  const { data: tokenData } = useQuery({
    queryKey: ['token', symbol],
    queryFn: () => getTokenBySymbol(symbol),
    enabled: !!symbol,
    staleTime: 300000,
  });

  // Encontrar tokens BRZ e USDC no portfolio
  const brzToken = useMemo(() => {
    return portfolioData?.tokens?.find((t: any) => t.symbol?.toUpperCase() === 'BRZ');
  }, [portfolioData]);

  const usdcToken = useMemo(() => {
    return portfolioData?.tokens?.find((t: any) => 
      t.symbol?.toUpperCase() === 'USDC' || t.symbol?.toUpperCase() === 'USDC.E'
    );
  }, [portfolioData]);

  // Usar função utilitária centralizada
  const formatTokenBalance = useCallback((balance: string, decimals: number = 18): string => {
    return formatTokenBalanceUtil(balance, decimals);
  }, []);

  // Obter saldo formatado da moeda selecionada
  const selectedToken = useMemo(() => {
    if (selectedCurrency === 'BRZ') return brzToken;
    if (selectedCurrency === 'USDC') return usdcToken;
    return null;
  }, [selectedCurrency, brzToken, usdcToken]);

  // Balance em unidades legíveis (já formatado)
  const selectedBalance = useMemo(() => {
    if (!selectedToken) return '0';
    return formatTokenBalance(selectedToken.balance || '0', selectedToken.decimals || 18);
  }, [selectedToken, formatTokenBalance]);

  // Balance em wei (para cálculos e API)
  const selectedBalanceWei = useMemo(() => {
    if (!selectedToken) return '0';
    return selectedToken.balance || '0';
  }, [selectedToken]);

  // Validar valor
  const isValidAmount = useMemo(() => {
    if (!amount || !selectedToken) return false;
    const numAmount = parseFloat(amount);
    const balance = parseFloat(selectedBalance);
    return numAmount > 0 && numAmount <= balance;
  }, [amount, selectedToken, selectedBalance]);

  // Formatar valor em BRL ou USD usando utilitário centralizado
  const formatFiatAmount = (value: string) => {
    const num = parseFloat(value || '0');
    return formatCurrencyUtil(num, selectedCurrency === 'BRZ' ? 'BRL' : 'USD', selectedCurrency === 'BRZ' ? 'pt-BR' : 'en-US');
  };

  // Step 1: Seleção de moeda
  const renderCurrencySelection = () => {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-6 w-6 text-white" />
          </button>
          <h1 className="text-2xl font-bold text-white text-center flex-1">
            Qual moeda você utilizar para comprar {symbol}?
          </h1>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Opções de moeda */}
        <div className="space-y-4">
          {/* BRZ */}
          <button
            onClick={() => {
              setSelectedCurrency('BRZ');
              setCurrentStep('amount');
            }}
            className="w-full p-4 rounded-xl bg-slate-800/50 border-2 border-slate-700 hover:border-yellow-400/50 transition-colors text-left"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-yellow-500 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">R$</span>
                </div>
                <div>
                  <div className="text-white font-semibold text-lg">Real Brasileiro</div>
                  <div className="text-slate-400 text-sm">BRZ</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-semibold">
                  {brzToken ? formatFiatAmount(formatTokenBalance(brzToken.balance || '0', brzToken.decimals || 18)) : 'R$ 0,00'}
                </div>
                <div className="text-slate-400 text-sm">
                  ${parseFloat(brzToken?.balanceUSD || brzToken?.balanceUsd || '0').toFixed(2)}
                </div>
              </div>
            </div>
          </button>

          {/* USDC */}
          <button
            onClick={() => {
              setSelectedCurrency('USDC');
              setCurrentStep('amount');
            }}
            className="w-full p-4 rounded-xl bg-slate-800/50 border-2 border-slate-700 hover:border-yellow-400/50 transition-colors text-left"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">$</span>
                </div>
                <div>
                  <div className="text-white font-semibold text-lg">Dólar</div>
                  <div className="text-slate-400 text-sm">USDC</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-semibold">
                  {usdcToken ? `${formatTokenBalance(usdcToken.balance || '0', usdcToken.decimals || 6)} USDC` : '0 USDC'}
                </div>
                <div className="text-slate-400 text-sm">
                  ${parseFloat(usdcToken?.balanceUSD || usdcToken?.balanceUsd || '0').toFixed(2)}
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>
    );
  };


  // Calcular valor em USD do estimado (no nível do componente)
  const estimatedUSD = useMemo(() => {
    if (!estimatedReceived || !tokenData?.price) return '0.00';
    return (parseFloat(estimatedReceived) * (tokenData.price || 0)).toFixed(2);
  }, [estimatedReceived, tokenData?.price]);

  // Calcular estimativa quando o valor muda
  useEffect(() => {
    if (currentStep === 'amount' && amount && isValidAmount && selectedToken && tokenData && walletAddress) {
      const calculateEstimate = async () => {
        setIsCalculatingQuote(true);
        try {
          // Converter amount para wei (considerando os decimals do token de entrada)
          const decimals = selectedToken.decimals || (selectedCurrency === 'USDC' ? 6 : 18);
          const amountInWei = (parseFloat(amount) * Math.pow(10, decimals)).toString();

          // Obter cotação preliminar
          const swapQuote = await createSwapQuote({
            amountIn: amountInWei,
            chainIdIn: SUPPORTED_CHAINS.POLYGON,
            chainIdOut: SUPPORTED_CHAINS.POLYGON,
            tokenIn: selectedToken.address,
            tokenOut: tokenData.address,
            walletAddress: walletAddress,
            toAddress: walletAddress,
            slippage: slippage,
            gasFeePaymentMethod: 'ADD_TO_AMOUNT',
            payGasFeeToken: selectedToken.address,
          });

          const quote = swapQuote.quotes?.[0] || swapQuote.swap;
          if (quote?.minAmountOut) {
            // Converter minAmountOut de wei para unidades legíveis
            const tokenDecimals = tokenData.decimals || 18;
            const receivedAmount = parseFloat(quote.minAmountOut) / Math.pow(10, tokenDecimals);
            setEstimatedReceived(receivedAmount.toString());
          }
        } catch (error) {
          // Se falhar, não mostrar erro, apenas não atualizar estimativa
        } finally {
          setIsCalculatingQuote(false);
        }
      };

      // Debounce para não fazer muitas requisições
      const timer = setTimeout(calculateEstimate, 500);
      return () => clearTimeout(timer);
    } else {
      setEstimatedReceived('0');
    }
  }, [amount, isValidAmount, selectedToken, tokenData, walletAddress, currentStep, slippage]);

  // Step 2: Input de valor
  const renderAmountInput = () => {
    if (!selectedCurrency || !selectedToken || !tokenData) return null;

    const handleMax = () => {
      setAmount(selectedBalance);
    };

    const handleNext = async () => {
      if (!isValidAmount || !walletAddress) {
        toast.error('Erro', 'Valor inválido ou carteira não conectada', 3000);
        return;
      }

      setIsLoading(true);
      try {
        // Converter amount para wei (considerando os decimals do token de entrada)
        const decimals = selectedToken.decimals || (selectedCurrency === 'USDC' ? 6 : 18);
        const amountInWei = (parseFloat(amount) * Math.pow(10, decimals)).toString();

        // Obter cotação final
        const swapQuote = await createSwapQuote({
          amountIn: amountInWei,
          chainIdIn: SUPPORTED_CHAINS.POLYGON,
          chainIdOut: SUPPORTED_CHAINS.POLYGON,
          tokenIn: selectedToken.address,
          tokenOut: tokenData.address,
          walletAddress: walletAddress,
          toAddress: walletAddress,
          slippage: slippage,
          gasFeePaymentMethod: 'ADD_TO_AMOUNT',
          payGasFeeToken: selectedToken.address,
        });

        const quote = swapQuote.quotes?.[0] || swapQuote.swap;
        
        // Verificar quantidade mínima
        if (quote.minAmountOut && parseFloat(quote.minAmountOut) <= 0) {
          throw new Error('Quantidade recebida muito baixa. Aumente o valor da compra.');
        }
        
        // Converter minAmountOut de wei para unidades legíveis para exibição
        const tokenDecimals = tokenData.decimals || 18;
        const toAmountFormatted = parseFloat(quote.minAmountOut) / Math.pow(10, tokenDecimals);
        
        const quoteData = {
          ...quote,
          fromToken: selectedToken,
          toToken: tokenData,
          fromAmount: amount,
          toAmount: toAmountFormatted.toString(), // Valor formatado para exibição
          toAmountWei: quote.minAmountOut, // Valor em wei para cálculos
          exchangeRate: toAmountFormatted / parseFloat(amount),
          slippage,
          estimatedGasFee: quote.estimatedGasFees?.gasFeeTokenAmount,
          gasFeeToken: selectedToken.symbol,
          estimatedTime: "~3 minutes",
          swapProvider: quote.swapProvider || 'Odos',
        };

        setQuote(quoteData);
        setUserOperationHash(quote.userOperationHash);
        setCurrentStep('preview');
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

    // Calcular quantidade mínima baseada no token (placeholder - pode ser ajustado)
    const minAmount = minRequiredAmount || '1.0';

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentStep('currency')}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-6 w-6 text-white" />
          </button>
          <h1 className="text-2xl font-bold text-white text-center flex-1">
            Quanto você quer comprar?
          </h1>
          <button 
            onClick={() => setShowSlippageModal(true)}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Settings className="h-6 w-6 text-white" />
          </button>
        </div>

        {/* Info mínima */}
        <div className="text-slate-400 text-sm">
          A quantidade mínima é de {minAmount} {selectedCurrency}.
        </div>

        {/* Saldo */}
        <div className="text-slate-400">
          Saldo: {selectedBalance} {selectedCurrency}
        </div>

        {/* Input */}
        <div className="space-y-4">
          <div className="relative">
            <Input
              type="text"
              value={amount}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.');
                setAmount(value);
              }}
              placeholder="0.00"
              className="bg-slate-800/50 border-slate-700 text-white text-3xl font-bold text-right pr-24"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <span className="text-white font-semibold">{selectedCurrency}</span>
              <Button
                onClick={handleMax}
                size="sm"
                variant="outline"
                className="text-xs px-3 py-1 h-auto"
              >
                MAX
              </Button>
            </div>
          </div>

          {/* Valor em USD */}
          <div className="text-slate-400 text-sm">
            {formatFiatAmount(amount || '0')}
          </div>

          {/* Preview do token a receber */}
          <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
            <div className="flex items-center gap-3">
              {tokenData.logoUrl && (
                <img src={tokenData.logoUrl} alt={symbol} className="w-8 h-8 rounded-full" />
              )}
              <span className="text-white font-semibold">{symbol}</span>
            </div>
            <div className="text-right">
              {isCalculatingQuote ? (
                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
              ) : (
                <>
                  <div className="text-white">
                    {parseFloat(estimatedReceived).toFixed(6)}
                  </div>
                  <div className="text-slate-400 text-sm">~${estimatedUSD}</div>
                </>
              )}
            </div>
          </div>

          {/* Aviso de quantidade mínima */}
          {amount && estimatedReceived && parseFloat(estimatedReceived) > 0 && parseFloat(estimatedReceived) < 0.000001 && (
            <div className="flex items-center gap-2 text-orange-400 text-sm bg-orange-400/10 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <span>Para {symbol}, as transações devem ser de no mínimo {minAmount} {selectedCurrency}</span>
            </div>
          )}

          {/* Erro de validação */}
          {amount && !isValidAmount && (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>Saldo insuficiente ou valor inválido</span>
            </div>
          )}
        </div>

        {/* Botão Avançar */}
        <div className="fixed bottom-16 right-4 lg:relative lg:bottom-auto lg:right-auto">
          <Button
            onClick={handleNext}
            disabled={!isValidAmount || isLoading}
            size="lg"
            className="w-full lg:w-auto bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-semibold px-8 py-6 rounded-xl"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Avançar
                <ArrowRight className="h-5 w-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    );
  };

  // Calcular valor fiat para preview
  const calculateFiatValue = (tokenAmount: string, token: any) => {
    if (!tokenAmount || !token.price) return '0.00';
    return (parseFloat(tokenAmount) * (token.price || 0)).toFixed(2);
  };

  // Step 3: Preview/Cotação
  const renderPreview = () => {
    if (!quote || !selectedToken || !tokenData) return null;

    const handleConfirm = async () => {
      if (!userOperationHash) {
        toast.error('Erro', 'Cotação não encontrada', 3000);
        return;
      }

      setIsLoading(true);
      setCurrentStep('executing');

      try {
        const signature = await signMessage({ message: userOperationHash });
        
        if (!signature) {
          throw new Error('Assinatura cancelada pelo usuário');
        }

        const result = await executeUserOperation({
          userOperationHash,
          signature: (signature as any).signature || signature
        });

        setTransactionHash(result.userOperationHash);
        setCurrentStep('success');

        toast.success(
          'Compra Executada',
          'Sua compra foi processada com sucesso!',
          5000
        );
      } catch (error) {
        console.error("❌ Erro ao executar compra:", error);
        toast.error(
          'Erro na Compra',
          error instanceof Error ? error.message : 'Não foi possível executar a compra. Tente novamente.',
          5000
        );
        setCurrentStep('preview');
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentStep('amount')}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-6 w-6 text-white" />
          </button>
          <h1 className="text-xl font-bold text-white text-center flex-1">
            Confirme os detalhes da transação
          </h1>
          <div className="w-10" />
        </div>

        <p className="text-slate-300 text-center">Compra de {symbol} com {selectedCurrency}</p>

        {/* Cards principais */}
        <div className="space-y-4">
          {/* Você pagará */}
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img 
                    src={selectedToken.logoUrl || selectedToken.logo} 
                    alt={selectedToken.symbol}
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                    <img src={selectedToken.chain?.logo || ''} alt="Polygon" className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <p className="text-white font-semibold">Você pagará</p>
                  <p className="text-slate-400 text-sm">{amount} {selectedToken.symbol}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-bold text-xl">{formatFiatAmount(amount)}</p>
              </div>
            </div>
          </div>

          {/* Você receberá no mínimo */}
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img 
                    src={tokenData.logoUrl || tokenData.logo} 
                    alt={symbol}
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                    <img src={tokenData.chain?.logo || ''} alt="Polygon" className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <p className="text-white font-semibold">Você receberá no mínimo</p>
                  <p className="text-slate-400 text-sm">{quote.toAmount} {symbol}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-bold text-xl">${calculateFiatValue(quote.toAmount, tokenData)}</p>
              </div>
            </div>
          </div>

          {/* Taxa de conversão */}
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="text-center">
              <p className="text-white text-lg font-semibold">
                1 {symbol} = {quote.exchangeRate.toFixed(6)} {selectedCurrency}
              </p>
              <p className="text-slate-400 text-sm">
                (${tokenData.price?.toFixed(2) || '0.00'})
              </p>
            </div>
          </div>

          {/* Detalhes */}
          <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Taxa de gás estimada</span>
              <span className="text-white">{quote.estimatedGasFee || '0'} {quote.gasFeeToken}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Tolerância a Slippage</span>
              <span className="text-yellow-400">{quote.slippage}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Provedor</span>
              <span className="text-white">{quote.swapProvider || 'Odos'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Tempo estimado</span>
              <span className="text-white">{quote.estimatedTime}</span>
            </div>
          </div>
        </div>

        {/* Botão Confirmar */}
        <div className="pb-safe-area-inset-bottom">
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            size="lg"
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-semibold py-6 rounded-xl"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Processando...
              </>
            ) : (
              'Confirmar Compra'
            )}
          </Button>
        </div>
      </div>
    );
  };

  // Step 4: Executando
  const renderExecuting = () => {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
        <Loader2 className="h-16 w-16 animate-spin text-yellow-400" />
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">Processando compra...</h2>
          <p className="text-slate-400">Aguarde enquanto processamos sua transação</p>
        </div>
      </div>
    );
  };

  // Step 5: Sucesso
  const renderSuccess = () => {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
        <CheckCircle className="h-16 w-16 text-green-400" />
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">Compra realizada com sucesso!</h2>
          <p className="text-slate-400">Sua transação foi processada</p>
          {transactionHash && (
            <p className="text-slate-500 text-xs break-all mt-4">
              Hash: {transactionHash}
            </p>
          )}
        </div>
        <Button
          onClick={() => router.push(`/portfolio/token/${symbol}`)}
          size="lg"
          className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-semibold px-8 py-6 rounded-xl"
        >
          Ver Token
        </Button>
      </div>
    );
  };

  // Handler para aceitar slippage
  const handleSlippageAccept = (newSlippage: number) => {
    setSlippage(newSlippage);
    setShowSlippageModal(false);
  };

  return (
    <ProtectedRoute>
      <AppLayout 
        title="Comprar Token"
        description="Compre tokens usando BRZ ou USDC"
        showHeader={false}
      >
        <div className="flex justify-center pb-24 lg:pb-8">
          <div className="w-full max-w-2xl">
            {currentStep === "currency" && renderCurrencySelection()}
            {currentStep === "amount" && renderAmountInput()}
            {currentStep === "preview" && renderPreview()}
            {currentStep === "executing" && renderExecuting()}
            {currentStep === "success" && renderSuccess()}
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

