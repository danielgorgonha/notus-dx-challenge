"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, DollarSign, Clock, Copy, QrCode, Plus, Shield, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useKYC } from "@/contexts/kyc-context";
import { useFiatDeposit } from "@/hooks/use-fiat-deposit";
import { useAuth } from "@/contexts/auth-context";
import { useKYCManager } from "@/hooks/use-kyc-manager";
import { SUPPORTED_CHAINS } from "@/lib/client";

export default function DepositPage() {
  const router = useRouter();
  const { user, walletAddress } = useAuth();
  const kycManager = useKYCManager(walletAddress || '');
  const { 
    quote, 
    order, 
    isLoading, 
    error, 
    step, 
    canDeposit: canDepositValidation,
    createDeposit,
    reset 
  } = useFiatDeposit();
  
  const [amount, setAmount] = useState("");
  const [receiveCryptoCurrency, setReceiveCryptoCurrency] = useState<"USDC" | "BRZ">("USDC");
  const [chainId, setChainId] = useState(SUPPORTED_CHAINS.POLYGON);
  const [currentStep, setCurrentStep] = useState<"amount" | "confirm" | "pix">("amount");
  const [availableLimit, setAvailableLimit] = useState(0);

  // Limites baseados no nível de KYC
  const getAvailableLimit = () => {
    const level = kycManager.getCurrentStage();
    if (level === '2') return 50000.00; // Nível 2 - R$ 50.000,00
    if (level === '1') return 2000.00;  // Nível 1 - R$ 2.000,00
    return 0; // Sem KYC - sem limite
  };

  // Atualizar limite quando o status do KYC mudar
  useEffect(() => {
    setAvailableLimit(getAvailableLimit());
  }, [kycManager]);
  const minAmount = 20.00;
  const exchangeRate = 1.00; // 1 BRZ = 1.00 BRL

  const handleAmountSubmit = () => {
    const numAmount = parseFloat(amount);
    if (numAmount >= minAmount && numAmount <= availableLimit) {
      setCurrentStep("confirm");
    }
  };

  const generatePixPayload = (amount: number) => {
    // Gerar um PIX válido com payload real
    const merchantName = "Notus DX Challenge";
    const merchantCity = "São Paulo";
    const pixKey = "notus@example.com"; // Chave PIX simulada
    const transactionId = Math.random().toString(36).substring(2, 15);
    
    // Payload PIX válido seguindo o padrão EMV
    const payload = [
      "000201", // Payload Format Indicator
      "0102", // Point of Initiation Method
      "26", // Merchant Account Information
      `0014br.gov.bcb.pix01${pixKey.length.toString().padStart(2, '0')}${pixKey}`,
      "52", // Merchant Category Code
      "0000", // MCC genérico
      "53", // Transaction Currency
      "03986", // BRL
      "54", // Transaction Amount
      `${amount.toFixed(2).length.toString().padStart(2, '0')}${amount.toFixed(2)}`,
      "58", // Country Code
      "02BR", // Brasil
      "59", // Merchant Name
      `${merchantName.length.toString().padStart(2, '0')}${merchantName}`,
      "60", // Merchant City
      `${merchantCity.length.toString().padStart(2, '0')}${merchantCity}`,
      "62", // Additional Data Field Template
      `05${transactionId.length.toString().padStart(2, '0')}${transactionId}`,
      "63" // CRC16
    ].join("");
    
    // Calcular CRC16 (simplificado para demonstração)
    const crc = "1234"; // CRC16 simulado
    return payload + crc;
  };

  const handleConfirm = async () => {
    if (!kycManager.kycMetadata?.userData?.individualId) {
      alert('Individual ID não encontrado. Por favor, complete o KYC primeiro.');
      router.push('/wallet/kyc');
      return;
    }

    // Verificar se o valor está dentro do limite do nível atual
    const numAmount = parseFloat(amount);
    const level = kycManager.getCurrentStage();
    
    if (level === '1' && numAmount > 2000) {
      alert('Valor acima do limite do Nível 1. Complete o KYC Nível 2 para valores acima de R$ 2.000.');
      router.push('/wallet/kyc');
      return;
    }

    try {
      await createDeposit({
        amount,
        receiveCryptoCurrency,
        chainId,
        individualId: kycManager.kycMetadata?.userData?.individualId || ''
      });

      setCurrentStep("pix");
    } catch (error) {
      console.error("Erro ao criar depósito:", error);
    }
  };

  const copyPixKey = () => {
    if (order?.paymentInstructions?.pixKey) {
      navigator.clipboard.writeText(order.paymentInstructions.pixKey);
      // Mostrar toast de sucesso
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const renderKYCBlock = () => {
    const level = kycManager.getCurrentStage();
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Depósito PIX</h1>
          <p className="text-slate-300">Complete sua verificação para fazer depósitos</p>
        </div>

        <Card className="glass-card bg-yellow-600/20 border-yellow-500/30">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-yellow-500/20 rounded-full">
                <AlertCircle className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-2">
                  {level === '0' ? 'KYC Necessário' : 'Upgrade de KYC Necessário'}
                </h3>
                <p className="text-slate-300 mb-4">
                  {level === '0' 
                    ? 'Complete a verificação de identidade usando a API real da Notus para fazer depósitos.'
                    : 'Para valores acima de R$ 2.000, complete o KYC Nível 2 com documentos e liveness.'
                  }
                </p>
                <Link href="/wallet/kyc">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                    <Shield className="mr-2 h-4 w-4" />
                    {level === '0' ? 'Iniciar KYC' : 'Upgrade para Nível 2'}
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Níveis de Verificação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Nível 1 - Dados Pessoais</span>
                <span className={parseInt(level) >= 1 ? "text-green-400 font-semibold" : "text-slate-400 font-semibold"}>
                  {parseInt(level) >= 1 ? "✓ Completo" : "⏳ Pendente"}
                </span>
              </div>
              <div className="text-sm text-slate-400 ml-4">• Nome, CPF, data nascimento</div>
              <div className="text-sm text-slate-400 ml-4">• Limite: até R$ 2.000,00</div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Nível 2 - Documentos + Liveness</span>
                <span className={parseInt(level) >= 2 ? "text-green-400 font-semibold" : "text-slate-400 font-semibold"}>
                  {parseInt(level) >= 2 ? "✓ Completo" : "⏸️ Bloqueado"}
                </span>
              </div>
              <div className="text-sm text-slate-400 ml-4">• Foto do documento</div>
              <div className="text-sm text-slate-400 ml-4">• Verificação facial (liveness)</div>
              <div className="text-sm text-slate-400 ml-4">• Limite: até R$ 50.000,00</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderAmountStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Quanto você quer depositar?</h1>
        <p className="text-slate-300">Limite disponível: <span className="text-yellow-400 font-semibold">{formatCurrency(availableLimit)}</span></p>
      </div>

      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-white text-lg">Valor do depósito</Label>
              <div className="relative">
                <Input
                  id="amount"
                  type="number"
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white text-2xl text-center py-4"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <span className="text-slate-400">R$</span>
                </div>
              </div>
              {amount && parseFloat(amount) < minAmount && (
                <p className="text-red-400 text-sm flex items-center space-x-1">
                  <AlertCircle className="h-4 w-4" />
                  <span>O depósito mínimo é de {formatCurrency(minAmount)}</span>
                </p>
              )}
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">B</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold">BRZ</p>
                    <p className="text-slate-400 text-sm">Brazilian Real Token</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">{amount || "0,00"} BRZ</p>
                  <p className="text-slate-400 text-sm">~{formatCurrency(parseFloat(amount) || 0)}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">O preço efetivo será atualizado em:</span>
              <span className="text-yellow-400 font-semibold">05:55</span>
            </div>

            <div className="text-center">
              <p className="text-slate-400 text-sm mb-2">Preço efetivo</p>
              <p className="text-white font-semibold">1 BRZ = {exchangeRate.toFixed(2)} BRL</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleAmountSubmit}
        disabled={!amount || parseFloat(amount) < minAmount || parseFloat(amount) > availableLimit}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 disabled:opacity-50"
      >
        Continuar
      </Button>
    </div>
  );

  const renderConfirmStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Confirme os detalhes da transação</h1>
        <p className="text-slate-300">Depósito via PIX</p>
      </div>

      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Seleção de Criptomoeda */}
            <div className="space-y-3">
              <Label className="text-white">Criptomoeda a receber</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setReceiveCryptoCurrency("USDC")}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    receiveCryptoCurrency === "USDC"
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-white/20 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">U</span>
                    </div>
                    <div className="text-left">
                      <p className="text-white font-semibold">USDC</p>
                      <p className="text-slate-400 text-sm">USD Coin</p>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => setReceiveCryptoCurrency("BRZ")}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    receiveCryptoCurrency === "BRZ"
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-white/20 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">B</span>
                    </div>
                    <div className="text-left">
                      <p className="text-white font-semibold">BRZ</p>
                      <p className="text-slate-400 text-sm">Brazilian Real Token</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Seleção de Rede */}
            <div className="space-y-3">
              <Label className="text-white">Rede Blockchain</Label>
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => setChainId(SUPPORTED_CHAINS.POLYGON)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    chainId === SUPPORTED_CHAINS.POLYGON
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-white/20 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">P</span>
                    </div>
                    <div className="text-left">
                      <p className="text-white font-semibold">Polygon</p>
                      <p className="text-slate-400 text-sm">Taxas baixas e rápida</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">R$</span>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Você pagará</p>
                  <p className="text-white font-bold text-xl">{formatCurrency(parseFloat(amount))}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  receiveCryptoCurrency === "USDC" ? "bg-blue-500" : "bg-green-500"
                }`}>
                  <span className="text-white font-bold">
                    {receiveCryptoCurrency === "USDC" ? "U" : "B"}
                  </span>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Você receberá</p>
                  <p className="text-white font-bold text-xl">{amount} {receiveCryptoCurrency}</p>
                  <p className="text-slate-400 text-sm">~{formatCurrency(parseFloat(amount))}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Operação</span>
                <span className="text-white">Ramp</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Provedor</span>
                <span className="text-white">Transfero</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Taxa Estimada</span>
                <span className="text-green-400">Sem Taxa</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Tempo estimado</span>
                <span className="text-white">~5min</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card bg-yellow-600/20 border-yellow-500/30">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
            <div>
              <h4 className="font-semibold text-white mb-1">Importante</h4>
              <p className="text-slate-300 text-sm">
                A Notus DX só aceita depósitos de contas da sua própria titularidade. 
                Depósitos de terceiros não serão processados.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex space-x-4">
        <Button
          onClick={() => setCurrentStep("amount")}
          variant="outline"
          className="flex-1 border-blue-500/50 text-blue-400 hover:bg-blue-500/10 hover:border-blue-400 hover:text-blue-300 transition-all duration-200"
        >
          Voltar
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={isLoading}
          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 disabled:opacity-50"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Processando...</span>
            </div>
          ) : (
            "Gerar PIX Copia e Cola"
          )}
        </Button>
      </div>
    </div>
  );

  const renderPixStep = () => {
    if (isLoading) {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Processando depósito...</h1>
            <p className="text-slate-300">Aguarde enquanto configuramos sua conta e criamos a ordem</p>
          </div>
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-3">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
                  <span className="text-white">Verificando conta na Notus...</span>
                </div>
                <div className="text-center">
                  <p className="text-slate-400 text-sm">
                    Isso pode incluir a criação automática do seu perfil KYC
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (error) {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Erro no depósito</h1>
            <p className="text-red-400">{error}</p>
          </div>
          <Card className="glass-card bg-red-600/20 border-red-500/30">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white mb-1">Erro</h4>
                  <p className="text-slate-300 text-sm">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="flex space-x-4">
            <Button
              onClick={() => setCurrentStep("amount")}
              variant="outline"
              className="flex-1 border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
            >
              Tentar Novamente
            </Button>
          </div>
        </div>
      );
    }

    if (!order) {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Ordem não encontrada</h1>
            <p className="text-slate-300">Não foi possível criar a ordem de depósito</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Detalhes do depósito via PIX</h1>
          <p className="text-slate-300">Depósito de <span className="text-green-400 font-semibold">{receiveCryptoCurrency}</span></p>
        </div>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* QR Code */}
              <div className="text-center">
                <div className="inline-block p-4 bg-white rounded-lg">
                  <img 
                    src={`data:image/png;base64,${(order.paymentInstructions as any).qrCode || ''}`} 
                    alt="PIX QR Code" 
                    className="w-48 h-48" 
                  />
                </div>
              </div>

              {/* PIX Key */}
              <div className="space-y-3">
                <Label className="text-white">PIX Copia e Cola</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={order.paymentInstructions.pixKey}
                    readOnly
                    className="bg-slate-800 border-slate-600 text-white text-sm"
                  />
                  <Button
                    onClick={copyPixKey}
                    size="sm"
                    className="bg-slate-700 hover:bg-slate-600"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Transaction Details */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Total a pagar</span>
                  <span className="text-white font-semibold">{formatCurrency(parseFloat(amount))}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Você vai receber</span>
                  <span className="text-green-400 font-semibold">
                    {quote?.amountToReceiveInCryptoCurrency} {receiveCryptoCurrency}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Taxa de conversão</span>
                  <span className="text-white">1 BRL = {quote ? (parseFloat(quote.amountToReceiveInCryptoCurrency) / parseFloat(quote.amountToSendInFiatCurrency)).toFixed(4) : '1.0000'} {receiveCryptoCurrency}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Válido até</span>
                  <span className="text-white">{new Date(order.paymentInstructions.expiresAt).toLocaleString('pt-BR')}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card bg-yellow-600/20 border-yellow-500/30">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
              <div>
                <h4 className="font-semibold text-white mb-1">Importante</h4>
                <p className="text-slate-300 text-sm">
                  A Notus DX só aceita depósitos de contas da sua própria titularidade. 
                  Depósitos de terceiros não serão processados.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex space-x-4">
          <Button
            onClick={() => setCurrentStep("amount")}
            variant="outline"
            className="flex-1 border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
          >
            Novo Depósito
          </Button>
          <Button
            onClick={() => router.push('/wallet')}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3"
          >
            Voltar para Carteira
          </Button>
        </div>
      </div>
    );
  };

  return (
    <AppLayout 
      title="Depósito PIX"
      description="Deposite reais e receba BRZ tokens"
    >
      <div className="flex justify-center">
        <div className="w-full max-w-2xl space-y-6">
          {/* Content */}
          {kycManager.getCurrentStage() === '0' ? (
            renderKYCBlock()
          ) : (
            <>
              {currentStep === "amount" && renderAmountStep()}
              {currentStep === "confirm" && renderConfirmStep()}
              {currentStep === "pix" && renderPixStep()}
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}