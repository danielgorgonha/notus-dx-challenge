/**
 * Token Performance Component
 * Exibe métricas de performance por período
 */

"use client";

import { cn } from "@/lib/utils";

interface TokenPerformanceProps {
  token: any;
}

export function TokenPerformance({ token }: TokenPerformanceProps) {
  // Usar dados reais quando disponíveis
  // Por enquanto, só temos dados de 24h do CoinGecko
  const priceChange24h = token?.priceChange24h || token?.change24h || 0;
  const priceChangeNum = parseFloat(String(priceChange24h));
  const isPositive = priceChangeNum >= 0;
  
  // Formatar valor
  const formatChange = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };
  
  // Performance: mostrar apenas 24h (único dado disponível do CoinGecko)
  // Outros períodos podem ser adicionados no futuro com dados históricos
  const performance: Record<string, { value: string; isPositive: boolean }> = {
    '1H': { value: 'N/A', isPositive: true }, // Não disponível via CoinGecko free tier
    '1D': { value: formatChange(priceChangeNum), isPositive: isPositive },
    '7D': { value: 'N/A', isPositive: true }, // Não disponível via CoinGecko free tier
    '30D': { value: 'N/A', isPositive: true }, // Não disponível via CoinGecko free tier
    '1A': { value: 'N/A', isPositive: true }, // Não disponível via CoinGecko free tier
  };

  return (
    <div className="px-4 lg:px-6">
      <div className="grid grid-cols-5 gap-2">
        {Object.entries(performance).map(([period, data]) => (
          <div
            key={period}
            className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50 text-center"
          >
            <div className="text-slate-400 text-xs mb-1">{period}</div>
            <div className={cn(
              "text-sm font-semibold",
              data.isPositive ? "text-green-400" : "text-red-400"
            )}>
              {data.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

