"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  X, 
  Plus, 
  ArrowDown,
  Banknote,
  Smartphone,
  CreditCard,
  User,
  AlertCircle,
  Sparkles
} from "lucide-react";
import { KYCModal } from "./kyc-modal";
import { WithdrawModal } from "./withdraw-modal";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKYCComplete: (individualId: string) => void;
  onWithdrawComplete: (amount: string, method: string) => void;
  kycCompleted: boolean;
  individualId: string;
}

export function DepositModal({ 
  isOpen, 
  onClose, 
  onKYCComplete,
  onWithdrawComplete,
  kycCompleted,
  individualId
}: DepositModalProps) {
  const [depositAmount, setDepositAmount] = useState('');
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  if (!isOpen) return null;

  const calculateUSDCAmount = (amount: string) => {
    // Simula conversão: 1 BRL = 0.18 USDC (taxa aproximada)
    const usdcAmount = parseFloat(amount) * 0.18;
    return usdcAmount.toFixed(2);
  };

  const getAvailableUSDC = () => {
    // Simula saldo USDC disponível
    return 100.0;
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-2xl glass-card border-white/20">
          <CardContent className="p-0">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-lg">
                  <Plus className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    Fazer Depósito
                  </h2>
                  <p className="text-slate-400 text-sm">On-ramp fiat para USDC</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-full p-2 transition-all duration-200"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Deposit Info */}
              <div className="p-4 bg-gradient-to-r from-blue-600/20 to-emerald-600/20 rounded-xl border border-blue-500/30">
                <div className="flex items-center mb-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg mr-3">
                    <Banknote className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">Depósito Unificado</div>
                    <div className="text-slate-400 text-sm">PIX e Cartão de Crédito</div>
                  </div>
                </div>
                <p className="text-slate-300 text-sm">
                  On-ramp fiat para USDC. Suporte a PIX instantâneo e cartões de crédito. KYC obrigatório.
                </p>
              </div>

              {/* Amount Input */}
              <div>
                <Label htmlFor="amount" className="text-slate-300 text-sm font-medium">
                  Valor (BRL) *
                </Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0,00"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="bg-slate-800/50 border-white/10 text-white mt-1"
                />
              </div>

              {/* USDC Preview */}
              {depositAmount && (
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-slate-400 text-sm">Você receberá</div>
                      <div className="text-white font-semibold text-lg">
                        {calculateUSDCAmount(depositAmount)} USDC
                      </div>
                    </div>
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Sparkles className="h-5 w-5 text-blue-400" />
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button
                  className="btn-primary bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 transition-all duration-200"
                  onClick={() => {/* TODO: Implementar modal de pagamento */}}
                  disabled={!depositAmount || !kycCompleted}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {!kycCompleted ? 'KYC Necessário' : 'Escolher Método'}
                </Button>
                
                <Button
                  variant="outline"
                  className="border-slate-500/30 bg-slate-800/30 text-slate-200 hover:text-white hover:bg-slate-700/60 hover:border-slate-400/50 transition-all duration-200"
                  onClick={() => setShowWithdrawModal(true)}
                  disabled={!kycCompleted}
                >
                  <ArrowDown className="h-4 w-4 mr-2" />
                  {!kycCompleted ? 'KYC Necessário' : 'Saque (Off-Ramp)'}
                </Button>
              </div>

              {/* KYC Warning */}
              {!kycCompleted && (
                <div className="p-4 bg-yellow-600/20 rounded-xl border border-yellow-500/30">
                  <div className="flex items-start">
                    <div className="p-2 bg-yellow-500/20 rounded-lg mr-3 mt-1">
                      <AlertCircle className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div>
                      <div className="text-white font-semibold mb-2">KYC Obrigatório</div>
                      <p className="text-slate-300 text-sm mb-3">
                        Para realizar depósitos e saques, é necessário completar a verificação de identidade.
                      </p>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 transition-all duration-200"
                        onClick={() => setShowKYCModal(true)}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Iniciar KYC
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* KYC Status */}
              {kycCompleted && (
                <div className="p-4 bg-green-600/20 rounded-xl border border-green-500/30">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-500/20 rounded-lg mr-3">
                      <User className="h-5 w-5 text-green-400" />
                    </div>
                    <div>
                      <div className="text-white font-semibold">KYC Aprovado</div>
                      <div className="text-slate-300 text-sm">Individual ID: {individualId}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KYC Modal */}
      <KYCModal
        isOpen={showKYCModal}
        onClose={() => setShowKYCModal(false)}
        onKYCComplete={onKYCComplete}
      />

      {/* Withdraw Modal */}
      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        onWithdrawComplete={onWithdrawComplete}
        availableUSDC={getAvailableUSDC()}
      />
    </>
  );
}
