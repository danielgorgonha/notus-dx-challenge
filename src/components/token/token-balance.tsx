/**
 * Token Balance Component
 * Exibe saldo do usuário no token
 */

"use client";

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

  const formatCurrency = (value: number) => {
    if (!showBalance) return '••••';
    return new Intl.NumberFormat(currency === 'BRL' ? 'pt-BR' : 'en-US', {
      style: 'currency',
      currency: currency === 'BRL' ? 'BRL' : 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatTokenBalance = (balance: string, decimals: number = 18) => {
    if (!showBalance) return '••••';
    const num = parseFloat(balance || '0') / Math.pow(10, decimals);
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(num);
  };

  return (
    <div className="px-4 lg:px-6">
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
        <div className="text-slate-400 text-sm mb-2">Saldo</div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(parseFloat(balanceUSD))}
            </div>
            <div className="text-slate-400 text-sm mt-1">
              {formatTokenBalance(balance, decimals)} {symbol}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

