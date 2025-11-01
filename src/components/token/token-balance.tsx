/**
 * Token Balance Component
 * Exibe saldo do usuário no token
 */

"use client";

import { formatTokenBalance, formatCurrency as formatCurrencyUtil } from "@/lib/utils";

interface TokenBalanceProps {
  token: any;
  showBalance: boolean;
  currency: 'USD' | 'BRL';
}

export function TokenBalance({ token, showBalance, currency }: TokenBalanceProps) {
  const symbol = token?.symbol?.toUpperCase() || '';
  
  // Usar dados reais da API
  const balance = token?.balance || token?.balanceFormatted || '0';
  const balanceUSD = token?.balanceUSD || token?.balanceUsd || '0';
  const decimals = token?.decimals || 18;

  const formatCurrencyLocal = (value: number) => {
    if (!showBalance) return '••••';
    return formatCurrencyUtil(value, currency === 'BRL' ? 'BRL' : 'USD', currency === 'BRL' ? 'pt-BR' : 'en-US');
  };

  const formatTokenBalanceLocal = (balance: string, decimals: number = 18) => {
    return formatTokenBalance(balance, decimals, {
      showHidden: !showBalance,
      formatLocale: 'pt-BR',
      minDecimals: 2,
      maxDecimals: 6,
    });
  };

  return (
    <div className="px-4 lg:px-6">
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
        <div className="text-slate-400 text-sm mb-2">Saldo</div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-white">
              {formatCurrencyLocal(parseFloat(balanceUSD))}
            </div>
            <div className="text-slate-400 text-sm mt-1">
              {formatTokenBalanceLocal(balance, decimals)} {symbol}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

