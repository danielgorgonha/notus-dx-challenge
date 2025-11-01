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
  const symbol = token?.symbol?.toUpperCase() || '';
  
  // Performance mockada (podem vir da API depois)
  const performance: Record<string, { value: string; isPositive: boolean }> = {
    '1H': { value: symbol === 'BRZ' ? '0,34%' : '0,0%', isPositive: true },
    '1D': { value: symbol === 'BRZ' ? '0,31%' : '-0,0%', isPositive: symbol !== 'USDC' },
    '7D': { value: symbol === 'BRZ' ? '0,41%' : '-0,0%', isPositive: symbol !== 'USDC' },
    '30D': { value: symbol === 'BRZ' ? '-1,2%' : '0,0%', isPositive: symbol === 'USDC' },
    '1A': { value: symbol === 'BRZ' ? '8,1%' : '0,03%', isPositive: true },
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

