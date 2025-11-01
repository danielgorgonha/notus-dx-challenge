/**
 * Portfolio Header Component
 * Header com título e botões de controle
 */

"use client";

import { Eye, EyeOff, DollarSign } from "lucide-react";

interface PortfolioHeaderProps {
  showBalance: boolean;
  onToggleBalance: (show: boolean) => void;
  currency: 'USD' | 'BRL';
  onCurrencyChange: (currency: 'USD' | 'BRL') => void;
}

export function PortfolioHeader({
  showBalance,
  onToggleBalance,
  currency,
  onCurrencyChange,
}: PortfolioHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 lg:px-6">
      <h1 className="text-2xl lg:text-3xl font-bold text-white">Portfólio</h1>
      
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

