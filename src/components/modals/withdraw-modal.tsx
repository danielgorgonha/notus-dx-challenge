"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  X, 
  ArrowDown, 
  Banknote,
  CreditCard,
  Smartphone,
  Loader2
} from "lucide-react";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWithdrawComplete: (amount: string, method: string) => void;
  availableUSDC: number;
}

export function WithdrawModal({ 
  isOpen, 
  onClose, 
  onWithdrawComplete,
  availableUSDC 
}: WithdrawModalProps) {
  const [usdcAmount, setUsdcAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState<'pix' | 'bank'>('pix');
  const [pixKey, setPixKey] = useState('');
  const [bankAccount, setBankAccount] = useState({
    bank: '',
    agency: '',
    account: '',
    name: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const calculateBRLAmount = (usdc: string) => {
    // Simula conversão: 1 USDC = 5.5 BRL (taxa aproximada)
    const brlAmount = parseFloat(usdc) * 5.5;
    return brlAmount.toFixed(2);
  };

  const handleWithdraw = async () => {
    if (!usdcAmount || parseFloat(usdcAmount) > availableUSDC) {
      alert('Valor inválido ou insuficiente');
      return;
    }

    if (withdrawMethod === 'pix' && !pixKey) {
      alert('Por favor, informe a chave PIX');
      return;
    }

    if (withdrawMethod === 'bank' && (!bankAccount.bank || !bankAccount.agency || !bankAccount.account || !bankAccount.name)) {
      alert('Por favor, preencha todos os dados bancários');
      return;
    }

    setIsProcessing(true);
    
    // Simula processamento
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    onWithdrawComplete(usdcAmount, withdrawMethod);
    setIsProcessing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md glass-card border-white/20">
        <CardContent className="p-0">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-xl font-semibold text-white">
              Saque (Off-Ramp)
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Available Balance */}
            <div className="p-4 bg-blue-600/20 rounded-xl border border-blue-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-slate-400 text-sm">Saldo Disponível</div>
                  <div className="text-white font-semibold text-lg">
                    {availableUSDC.toFixed(2)} USDC
                  </div>
                </div>
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Banknote className="h-5 w-5 text-blue-400" />
                </div>
              </div>
            </div>

            {/* Amount Input */}
            <div>
              <Label htmlFor="usdc-amount" className="text-slate-300 text-sm font-medium">
                Valor em USDC *
              </Label>
              <Input
                id="usdc-amount"
                type="number"
                placeholder="0.00"
                value={usdcAmount}
                onChange={(e) => setUsdcAmount(e.target.value)}
                className="bg-slate-800/50 border-white/10 text-white mt-1"
                max={availableUSDC}
              />
            </div>

            {/* BRL Preview */}
            {usdcAmount && (
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-slate-400 text-sm">Você receberá</div>
                    <div className="text-white font-semibold text-lg">
                      R$ {calculateBRLAmount(usdcAmount)}
                    </div>
                  </div>
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <ArrowDown className="h-5 w-5 text-green-400" />
                  </div>
                </div>
              </div>
            )}

            {/* Withdraw Method */}
            <div>
              <h3 className="text-white font-medium mb-4">Método de Saque:</h3>
              <div className="space-y-3">
                {/* PIX Option */}
                <button
                  onClick={() => setWithdrawMethod('pix')}
                  className={`w-full p-4 rounded-xl border-2 transition-all ${
                    withdrawMethod === 'pix'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-white/20 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Smartphone className="h-6 w-6 text-blue-400" />
                    </div>
                    <div className="text-left">
                      <div className="text-white font-semibold">PIX</div>
                      <div className="text-slate-400 text-sm">Transferência instantânea</div>
                    </div>
                  </div>
                </button>

                {/* Bank Transfer Option */}
                <button
                  onClick={() => setWithdrawMethod('bank')}
                  className={`w-full p-4 rounded-xl border-2 transition-all ${
                    withdrawMethod === 'bank'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-white/20 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <CreditCard className="h-6 w-6 text-purple-400" />
                    </div>
                    <div className="text-left">
                      <div className="text-white font-semibold">Transferência Bancária</div>
                      <div className="text-slate-400 text-sm">TED/DOC - 1 dia útil</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* PIX Key Input */}
            {withdrawMethod === 'pix' && (
              <div>
                <Label htmlFor="pix-key" className="text-slate-300 text-sm font-medium">
                  Chave PIX *
                </Label>
                <Input
                  id="pix-key"
                  placeholder="CPF, CNPJ, email ou telefone"
                  value={pixKey}
                  onChange={(e) => setPixKey(e.target.value)}
                  className="bg-slate-800/50 border-white/10 text-white mt-1"
                />
              </div>
            )}

            {/* Bank Account Input */}
            {withdrawMethod === 'bank' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bank" className="text-slate-300 text-sm font-medium">
                      Banco *
                    </Label>
                    <Input
                      id="bank"
                      placeholder="Ex: Banco do Brasil"
                      value={bankAccount.bank}
                      onChange={(e) => setBankAccount(prev => ({ ...prev, bank: e.target.value }))}
                      className="bg-slate-800/50 border-white/10 text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="agency" className="text-slate-300 text-sm font-medium">
                      Agência *
                    </Label>
                    <Input
                      id="agency"
                      placeholder="1234"
                      value={bankAccount.agency}
                      onChange={(e) => setBankAccount(prev => ({ ...prev, agency: e.target.value }))}
                      className="bg-slate-800/50 border-white/10 text-white mt-1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="account" className="text-slate-300 text-sm font-medium">
                      Conta *
                    </Label>
                    <Input
                      id="account"
                      placeholder="12345-6"
                      value={bankAccount.account}
                      onChange={(e) => setBankAccount(prev => ({ ...prev, account: e.target.value }))}
                      className="bg-slate-800/50 border-white/10 text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="name" className="text-slate-300 text-sm font-medium">
                      Nome Completo *
                    </Label>
                    <Input
                      id="name"
                      placeholder="João Silva"
                      value={bankAccount.name}
                      onChange={(e) => setBankAccount(prev => ({ ...prev, name: e.target.value }))}
                      className="bg-slate-800/50 border-white/10 text-white mt-1"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-white/20 text-slate-300 hover:text-white hover:bg-white/10"
                onClick={onClose}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                onClick={handleWithdraw}
                disabled={isProcessing || !usdcAmount}
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processando...
                  </div>
                ) : (
                  <>
                    <ArrowDown className="h-4 w-4 mr-2" />
                    Solicitar Saque
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
