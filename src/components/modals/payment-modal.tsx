"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  X, 
  Zap, 
  CreditCard, 
  ShoppingBag,
  Shield,
  ArrowLeft
} from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: string;
  onPaymentComplete: (method: 'pix' | 'credit') => void;
}

export function PaymentModal({ 
  isOpen, 
  onClose, 
  amount, 
  onPaymentComplete 
}: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<'pix' | 'credit'>('pix');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simula processamento
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    onPaymentComplete(selectedMethod);
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
              Escolher Método de Pagamento
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

          {/* Subtitle */}
          <div className="px-6 pt-4">
            <p className="text-slate-400 text-sm">Selecione como deseja pagar</p>
          </div>

          {/* Payment Details */}
          <div className="px-6 py-4 space-y-3">
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/10">
              <span className="text-slate-300">Valor:</span>
              <span className="text-white font-semibold">R$ {amount}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/10">
              <span className="text-slate-300">Você receberá:</span>
              <span className="text-white font-semibold">USDC</span>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="px-6 py-4">
            <h3 className="text-white font-medium mb-4">Método de Pagamento:</h3>
            <div className="space-y-3">
              {/* PIX Option */}
              <button
                onClick={() => setSelectedMethod('pix')}
                className={`w-full p-4 rounded-xl border-2 transition-all ${
                  selectedMethod === 'pix'
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-white/20 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Zap className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-white font-semibold">PIX</div>
                    <div className="text-slate-400 text-sm">Aprovação instantânea</div>
                  </div>
                </div>
              </button>

              {/* Credit Card Option */}
              <button
                onClick={() => setSelectedMethod('credit')}
                className={`w-full p-4 rounded-xl border-2 transition-all ${
                  selectedMethod === 'credit'
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-white/20 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <CreditCard className="h-6 w-6 text-purple-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-white font-semibold">Cartão de Crédito</div>
                    <div className="text-slate-400 text-sm">Visa, Mastercard, Elo</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Security Message */}
          <div className="px-6 py-4">
            <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
              <Shield className="h-5 w-5 text-green-400" />
              <span className="text-green-400 text-sm font-medium">
                Transação segura e criptografada
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-6 flex gap-3">
            <Button
              variant="outline"
              className="flex-1 border-white/20 text-slate-300 hover:text-white hover:bg-white/10"
              onClick={onClose}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700"
              onClick={handlePayment}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processando...
                </div>
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Finalizar Compra
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
