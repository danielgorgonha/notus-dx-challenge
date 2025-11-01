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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
      {/* Card Total na Carteira */}
      <div className="glass-card text-center relative overflow-hidden group hover:shadow-2xl hover:shadow-yellow-500/10 transition-all duration-300">
        {/* Gradiente decorativo de fundo */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-500/10 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative">
          <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-yellow-500/30 group-hover:scale-110 transition-transform duration-300">
            <TrendingUp className="h-7 w-7 text-slate-900" />
          </div>
          <div className="text-3xl sm:text-4xl font-bold text-white mb-2 bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
            {portfolioLoading ? (
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-yellow-400" />
            ) : (
              formatValue(totalBalance)
            )}
          </div>
          <div className="text-slate-300 text-sm font-medium mb-2">Total na Carteira</div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            <span className="text-yellow-400 text-xs font-semibold">
              {portfolioLoading ? 'Carregando...' : 'Ativo'}
            </span>
          </div>
          <div className="mt-4 text-xs text-slate-400/80 flex items-center justify-center gap-1">
            <span>🔒</span>
            <span>Protegido e seguro</span>
          </div>
        </div>
      </div>

      {/* Card Transações */}
      <div className="glass-card text-center relative overflow-hidden group hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
            <Activity className="h-7 w-7 text-white" />
          </div>
          <div className="text-3xl sm:text-4xl font-bold text-white mb-2">
            {historyLoading ? (
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-400" />
            ) : (
              transactionCount
            )}
          </div>
          <div className="text-slate-300 text-sm font-medium mb-2">Transações</div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
            <span className="text-blue-400 text-xs font-semibold">
              {historyLoading ? 'Carregando...' : `${transactionCount} realizadas`}
            </span>
          </div>
          <div className="mt-4 text-xs text-slate-400/80">
            Todas as operações registradas
          </div>
        </div>
      </div>

      {/* Card Tokens */}
      <div className="glass-card text-center relative overflow-hidden group hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative">
          <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-green-500/30 group-hover:scale-110 transition-transform duration-300">
            <Zap className="h-7 w-7 text-white" />
          </div>
          <div className="text-3xl sm:text-4xl font-bold text-white mb-2">
            {portfolioLoading ? (
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-green-400" />
            ) : (
              tokenCount
            )}
          </div>
          <div className="text-slate-300 text-sm font-medium mb-2">Tokens na Carteira</div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
            <span className="text-green-400 text-xs font-semibold">
              {tokenCount} {tokenCount === 1 ? 'token' : 'tokens'}
            </span>
          </div>
          <div className="mt-4 text-xs text-slate-400/80">
            Diversificação de ativos
          </div>
        </div>
      </div>
    </div>
  );
}

