/**
 * Token Detail Header Component
 * Header com botões de navegação e controles
 */

"use client";

import { ArrowLeft, Eye, EyeOff, DollarSign, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TokenDetailHeaderProps {
  onBack: () => void;
  showBalance: boolean;
  onToggleBalance: (show: boolean) => void;
  currency: 'USD' | 'BRL';
  onCurrencyChange: (currency: 'USD' | 'BRL') => void;
  onShowMore?: () => void;
}

export function TokenDetailHeader({
  onBack,
  showBalance,
  onToggleBalance,
  currency,
  onCurrencyChange,
  onShowMore,
}: TokenDetailHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 lg:px-6">
      {/* Botão voltar */}
      <Button
        onClick={onBack}
        variant="ghost"
        size="icon"
        className="text-white hover:bg-slate-800/50"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>

      {/* Controles */}
      <div className="flex items-center gap-3">
        {/* Botão mostrar/esconder saldo */}
        <button
          onClick={() => onToggleBalance(!showBalance)}
          className="w-10 h-10 rounded-full border-2 border-white/20 hover:border-white/40 flex items-center justify-center transition-all active:scale-95"
          title={showBalance ? 'Ocultar saldo' : 'Mostrar saldo'}
        >
          {showBalance ? (
            <Eye className="h-5 w-5 text-white" />
          ) : (
            <EyeOff className="h-5 w-5 text-white" />
          )}
        </button>

        {/* Botão trocar moeda */}
        <button
          onClick={() => onCurrencyChange(currency === 'BRL' ? 'USD' : 'BRL')}
          className="w-10 h-10 rounded-full border-2 border-white/20 hover:border-white/40 flex items-center justify-center transition-all active:scale-95 font-bold text-white text-lg"
          title="Trocar moeda"
        >
          {currency === 'BRL' ? 'R$' : '$'}
        </button>
      </div>
    </div>
  );
}

