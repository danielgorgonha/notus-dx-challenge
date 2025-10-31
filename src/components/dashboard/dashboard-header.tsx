/**
 * Dashboard Header Component (Client)
 * Header com informações de segurança e toggle de moeda
 */

"use client";

import { Shield } from "lucide-react";
import { useState } from "react";

interface DashboardHeaderProps {
  userEmail?: string;
  exchangeRate?: number;
  onCurrencyToggle?: (currency: 'USD' | 'BRL') => void;
}

export function DashboardHeader({ 
  userEmail, 
  exchangeRate = 5.32,
  onCurrencyToggle 
}: DashboardHeaderProps) {
  const [currency, setCurrency] = useState<'USD' | 'BRL'>('BRL');

  const toggleCurrency = () => {
    const newCurrency = currency === 'BRL' ? 'USD' : 'BRL';
    setCurrency(newCurrency);
    onCurrencyToggle?.(newCurrency);
  };

  return (
    <div className="glass-card mb-8 bg-gradient-to-r from-slate-800/30 to-slate-700/30 border-slate-600/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gradient-to-r from-yellow-500/80 to-yellow-600/80 rounded-xl flex items-center justify-center mr-4">
            <Shield className="h-6 w-6 text-slate-900" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">🔒 Carteira Protegida</h3>
            <p className="text-slate-300 text-sm">
              {userEmail || 'Usuário'} • Sua chave privada fica só com você
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleCurrency}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-colors border border-slate-600/50"
          >
            <span className="text-white font-semibold">
              {currency === 'BRL' ? 'R$' : '$'}
            </span>
            <span className="text-slate-300 text-sm">
              {currency === 'BRL' ? 'Real' : 'Dólar'}
            </span>
          </button>
          <div className="text-right">
            <div className="text-slate-400 text-sm">Status</div>
            <div className="text-green-400 font-semibold">✓ Seguro</div>
          </div>
        </div>
      </div>
    </div>
  );
}

