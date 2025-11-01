/**
 * Token Price Chart Component
 * Exibe preço atual e gráfico com seletor de período
 */

"use client";

import { cn } from "@/lib/utils";

interface TokenPriceChartProps {
  token: any;
  period: '1D' | '7D' | '1M' | '3M' | '1A' | 'ALL';
  onPeriodChange: (period: '1D' | '7D' | '1M' | '3M' | '1A' | 'ALL') => void;
}

export function TokenPriceChart({ token, period, onPeriodChange }: TokenPriceChartProps) {
  const symbol = token?.symbol?.toUpperCase() || '';
  
  // Usar preço real da API
  const priceUsd = token?.priceUsd || token?.priceUSD || token?.price || '0';
  const currentPriceNum = parseFloat(String(priceUsd));
  
  // Formatar preço
  const formatPrice = (price: number) => {
    if (price === 0) return '$0.00';
    if (price < 0.01) return `$${price.toFixed(6)}`;
    if (price < 1) return `$${price.toFixed(4)}`;
    return `$${price.toFixed(2)}`;
  };
  
  // Usar mudança de preço real do CoinGecko (24h)
  const priceChange24h = token?.priceChange24h || token?.change24h || 0;
  const priceChangeNum = parseFloat(String(priceChange24h));
  const priceChangeValue = (currentPriceNum * priceChangeNum) / 100;
  const isPositive = priceChangeNum >= 0;
  const sign = isPositive ? '+' : '';
  
  const currentPrice = formatPrice(currentPriceNum);
  const priceChange = `${sign}${formatPrice(Math.abs(priceChangeValue))} (${sign}${priceChangeNum.toFixed(2)}%)`;

  const periods: Array<'1D' | '7D' | '1M' | '3M' | '1A' | 'ALL'> = ['1D', '7D', '1M', '3M', '1A', 'ALL'];

  return (
    <div className="px-4 lg:px-6 space-y-4">
      {/* Preço Atual */}
      <div>
        <div className="text-slate-400 text-sm mb-1">Preço Atual</div>
        <div className="text-3xl font-bold text-white mb-2">{currentPrice}</div>
        <div className={cn(
          "text-lg font-semibold",
          isPositive ? "text-green-400" : "text-red-400"
        )}>
          {priceChange}
        </div>
      </div>

      {/* Gráfico Placeholder */}
      <div className="h-64 bg-slate-800/50 rounded-xl border border-slate-700/50 flex items-center justify-center">
        <div className="text-center text-slate-400">
          <div className="text-4xl mb-2">📈</div>
          <div className="text-sm">Gráfico de preço</div>
          <div className="text-xs mt-1">Período: {period}</div>
        </div>
      </div>

      {/* Seletor de Período */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {periods.map((p) => (
          <button
            key={p}
            onClick={() => onPeriodChange(p)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
              period === p
                ? "bg-yellow-400 text-slate-900"
                : "bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50"
            )}
          >
            {p === 'ALL' ? 'All' : p}
          </button>
        ))}
      </div>
    </div>
  );
}

