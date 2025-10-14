"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  ArrowRight, 
  AlertCircle, 
  Loader2, 
  Copy, 
  CheckCircle,
  Wallet,
  Coins,
  Clock,
  Zap
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSmartWallet } from "@/hooks/use-smart-wallet";
import { useToast } from "@/hooks/use-toast";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { SUPPORTED_CHAINS } from "@/lib/client";
import { createTransferQuote } from "@/lib/actions/transfer";
import { executeUserOperation } from "@/lib/actions/user-operation";
import { usePrivy } from "@privy-io/react-auth";
import { TokenSelector } from "@/components/ui/token-selector";


export default function TransferPage() {
  const router = useRouter();
  const { wallet } = useSmartWallet();
  const { signMessage } = usePrivy();
  const toast = useToast();
  
  const [currentStep, setCurrentStep] = useState<"form" | "preview" | "executing" | "success">("form");
  const [selectedToken, setSelectedToken] = useState<any>(null);
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [quote, setQuote] = useState<any>(null);
  const [transactionHash, setTransactionHash] = useState("");
  const [userOperationHash, setUserOperationHash] = useState("");

  const walletAddress = wallet?.accountAbstraction;

  // Validações
  const isValidAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const isValidAmount = (amount: string) => {
    if (!selectedToken) return false;
    const numAmount = parseFloat(amount);
    const tokenBalance = parseFloat(selectedToken.balance || "0");
    return numAmount > 0 && numAmount <= tokenBalance;
  };

  const canProceed = toAddress && amount && selectedToken && isValidAddress(toAddress) && isValidAmount(amount);

  const handleGetQuote = async () => {
    if (!canProceed || !walletAddress) {
      toast.error(
        'Erro',
        'Carteira não conectada ou dados inválidos.',
        3000
      );
      return;
    }

    setIsLoading(true);
    try {
      
      const transferQuote = await createTransferQuote({
        amount: amount,
        chainId: SUPPORTED_CHAINS.POLYGON, // Polygon
        gasFeePaymentMethod: 'ADD_TO_AMOUNT',
        payGasFeeToken: selectedToken.address,
        token: selectedToken.address,
        walletAddress: walletAddress,
        toAddress: toAddress,
        metadata: memo ? { memo } : undefined
      });

      
      const quoteData = {
        ...transferQuote.transfer,
        fromToken: selectedToken,
        toAddress,
        amount: transferQuote.transfer.amountToSend,
        estimatedGasFee: transferQuote.transfer.estimatedGasFees.gasFeeTokenAmount,
        gasFeeToken: selectedToken.symbol,
        totalCost: transferQuote.transfer.amountToSend,
        estimatedTime: "~2 minutes",
      };
      
      setQuote(quoteData);
      setUserOperationHash(transferQuote.transfer.userOperationHash);
      setCurrentStep("preview");
      
      toast.success(
        'Cotação Gerada',
        'Cotação de transferência criada com sucesso!',
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

  const handleExecuteTransfer = async () => {
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
        'Transferência Executada',
        'Sua transferência foi processada com sucesso!',
        5000
      );
    } catch (error) {
      console.error("❌ Erro ao executar transferência:", error);
      toast.error(
        'Erro na Transferência',
        error instanceof Error ? error.message : 'Não foi possível executar a transferência. Tente novamente.',
        5000
      );
      setCurrentStep("preview");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(
      'Copiado!',
      'Texto copiado para a área de transferência',
      2000
    );
  };

  const resetForm = () => {
    setCurrentStep("form");
    setToAddress("");
    setAmount("");
    setMemo("");
    setQuote(null);
    setTransactionHash("");
    setUserOperationHash("");
  };

  const renderFormStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Transferir Tokens</h1>
        <p className="text-slate-300">Envie tokens para qualquer endereço</p>
      </div>

      <Card className="glass-card">
        <CardContent className="p-6 space-y-6">
          {/* Seleção de Token */}
          <div className="space-y-3">
            <Label className="text-white text-lg">Token a transferir</Label>
            <TokenSelector
              selectedToken={selectedToken}
              onTokenSelect={setSelectedToken}
              chainId={SUPPORTED_CHAINS.POLYGON}
              walletAddress={walletAddress}
              placeholder="Selecionar token para transferir"
              showBalance={true}
            />
          </div>

          {/* Endereço de Destino */}
          <div className="space-y-2">
            <Label htmlFor="toAddress" className="text-white text-lg">Endereço de destino</Label>
            <div className="relative">
              <Input
                id="toAddress"
                type="text"
                placeholder="0x..."
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
                className="bg-slate-800 border-slate-600 text-white text-lg py-4 pr-12"
              />
              {toAddress && (
                <button
                  onClick={() => copyToClipboard(toAddress)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  title="Copiar endereço"
                >
                  <Copy className="h-4 w-4" />
                </button>
              )}
            </div>
            {toAddress && !isValidAddress(toAddress) && (
              <p className="text-red-400 text-sm flex items-center space-x-1">
                <AlertCircle className="h-4 w-4" />
                <span>Endereço inválido</span>
              </p>
            )}
          </div>

          {/* Valor */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-white text-lg">Valor</Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-slate-800 border-slate-600 text-white text-2xl text-center py-4"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <span className="text-slate-400">{selectedToken?.symbol || "TOKEN"}</span>
              </div>
            </div>
            {amount && !isValidAmount(amount) && (
              <p className="text-red-400 text-sm flex items-center space-x-1">
                <AlertCircle className="h-4 w-4" />
                <span>Valor inválido ou saldo insuficiente</span>
              </p>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Saldo disponível:</span>
              <span className="text-white">{selectedToken?.balance || "0.00"} {selectedToken?.symbol || "TOKEN"}</span>
            </div>
          </div>

          {/* Memo (Opcional) */}
          <div className="space-y-2">
            <Label htmlFor="memo" className="text-white text-lg">Memo (opcional)</Label>
            <Input
              id="memo"
              type="text"
              placeholder="Adicione uma nota..."
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="bg-slate-800 border-slate-600 text-white py-4"
            />
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
            <Send className="h-5 w-5" />
            <span>Obter Cotação</span>
          </div>
        )}
      </Button>
    </div>
  );

  const renderPreviewStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Revisar Transferência</h1>
        <p className="text-slate-300">Confirme os detalhes antes de executar</p>
      </div>

      <Card className="glass-card">
        <CardContent className="p-6 space-y-6">
          {/* Resumo da Transferência */}
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">
                  {selectedToken?.logoUrl ? (
                    <img src={selectedToken.logoUrl} alt={selectedToken.symbol} className="w-6 h-6 rounded-full" />
                  ) : (
                    selectedToken?.symbol === 'USDC' ? '💙' : 
                    selectedToken?.symbol === 'BRZ' ? '🇧🇷' :
                    selectedToken?.symbol === 'ETH' ? '💎' :
                    selectedToken?.symbol === 'MATIC' ? '🟣' : '🪙'
                  )}
                </div>
                <div>
                  <p className="text-white font-semibold">{selectedToken?.symbol || "TOKEN"}</p>
                  <p className="text-slate-400 text-sm">{selectedToken?.name || "Unknown Token"}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-bold text-xl">{amount} {selectedToken?.symbol || "TOKEN"}</p>
                <p className="text-slate-400 text-sm">Valor a transferir</p>
              </div>
            </div>
          </div>

          {/* Detalhes da Transação */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Para:</span>
              <div className="flex items-center space-x-2">
                <span className="text-white font-mono text-sm">{toAddress.slice(0, 6)}...{toAddress.slice(-4)}</span>
                <button
                  onClick={() => copyToClipboard(toAddress)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
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
              <span className="text-slate-400">Tempo estimado:</span>
              <span className="text-white">{quote?.estimatedTime}</span>
            </div>

            {memo && (
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Memo:</span>
                <span className="text-white">{memo}</span>
              </div>
            )}
          </div>

          {/* Total */}
          <div className="border-t border-slate-600 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-lg">Total:</span>
              <span className="text-white font-bold text-xl">{quote?.totalCost} {quote?.gasFeeToken}</span>
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
          onClick={handleExecuteTransfer}
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
              <span>Executar Transferência</span>
            </div>
          )}
        </Button>
      </div>
    </div>
  );

  const renderExecutingStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Executando Transferência</h1>
        <p className="text-slate-300">Aguarde enquanto processamos sua transação</p>
      </div>

      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
              <span className="text-white text-lg">Processando transação...</span>
            </div>
            
            <div className="text-center space-y-2">
              <p className="text-slate-400 text-sm">
                Transferindo {amount} {selectedToken?.symbol || "TOKEN"} para {toAddress.slice(0, 6)}...{toAddress.slice(-4)}
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
        <h1 className="text-3xl font-bold text-white mb-2">Transferência Concluída!</h1>
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
                onClick={() => copyToClipboard(transactionHash)}
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
                <span className="text-slate-400">Valor transferido:</span>
                <span className="text-white font-semibold">{amount} {selectedToken?.symbol || "TOKEN"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Para:</span>
                <span className="text-white font-mono text-sm">{toAddress.slice(0, 6)}...{toAddress.slice(-4)}</span>
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
            <Send className="h-4 w-4" />
            <span>Nova Transferência</span>
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
        title="Transferir Tokens"
        description="Envie tokens para qualquer endereço"
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
