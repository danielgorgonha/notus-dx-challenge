/**
 * Dashboard Stats Component (Client)
 * Exibe estatísticas da carteira com toggle de moeda
 */

"use client";

import { TrendingUp, Activity, Zap, Loader2 } from "lucide-react";

interface DashboardStatsProps {
  totalBalance: number;
  transactionCount: number;
  tokenCount: number;
  portfolioLoading?: boolean;
  historyLoading?: boolean;
  exchangeRate?: number;
  currency?: 'USD' | 'BRL';
  onCurrencyChange?: (currency: 'USD' | 'BRL') => void;
}

export function DashboardStats({
  totalBalance,
  transactionCount,
  tokenCount,
  portfolioLoading = false,
  historyLoading = false,
  exchangeRate = 5.32,
  currency = 'BRL',
  onCurrencyChange,
}: DashboardStatsProps) {

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatUSD = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const convertCurrency = (value: number) => {
    if (currency === 'BRL') {
      return value * exchangeRate;
    }
    return value;
  };

  const formatValue = (value: number) => {
    const convertedValue = convertCurrency(value);
    return currency === 'BRL' ? formatCurrency(convertedValue) : formatUSD(convertedValue);
  };


  return (
    <div className="grid md:grid-cols-3 gap-6 mb-8">
      <div className="glass-card text-center">
        <div className="w-12 h-12 bg-gradient-to-r from-yellow-500/80 to-yellow-600/80 rounded-xl mx-auto mb-4 flex items-center justify-center">
          <TrendingUp className="h-6 w-6 text-slate-900" />
        </div>
        <div className="text-2xl font-bold text-white mb-1">
          {portfolioLoading ? (
            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
          ) : (
            formatValue(totalBalance)
          )}
        </div>
        <div className="text-slate-300 text-sm mb-1">Total na Carteira</div>
        <div className="text-yellow-400 text-sm">
          {portfolioLoading ? 'Carregando...' : formatValue(totalBalance)}
        </div>
        <div className="mt-2 text-xs text-slate-400">
          ℹ️ Seu dinheiro está seguro e só você pode movimentar
        </div>
      </div>

      <div className="glass-card text-center">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-500/80 to-blue-600/80 rounded-xl mx-auto mb-4 flex items-center justify-center">
          <Activity className="h-6 w-6 text-white" />
        </div>
        <div className="text-2xl font-bold text-white mb-1">
          {historyLoading ? (
            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
          ) : (
            transactionCount
          )}
        </div>
        <div className="text-slate-300 text-sm mb-1">Transações</div>
        <div className="text-blue-400 text-sm">
          {historyLoading ? 'Carregando...' : `${transactionCount} realizadas`}
        </div>
      </div>

      <div className="glass-card text-center">
        <div className="w-12 h-12 bg-gradient-to-r from-green-500/80 to-green-600/80 rounded-xl mx-auto mb-4 flex items-center justify-center">
          <Zap className="h-6 w-6 text-white" />
        </div>
        <div className="text-2xl font-bold text-white mb-1">
          {portfolioLoading ? (
            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
          ) : (
            tokenCount
          )}
        </div>
        <div className="text-slate-300 text-sm mb-1">Tokens na Carteira</div>
        <div className="text-green-400 text-sm">
          {tokenCount} tokens
        </div>
      </div>

    </div>
  );
}

