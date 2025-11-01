/**
 * Estimated Profitability Component
 * Exibe rentabilidade estimada com badge Ativo
 */

"use client";

import { TrendingUp, Info } from "lucide-react";

interface EstimatedProfitabilityProps {
  pool: any;
  hasUserPosition: boolean;
}

export function EstimatedProfitability({ pool, hasUserPosition }: EstimatedProfitabilityProps) {
  // Calcular APR baseado nos dados da pool
  const apr = pool?.metrics?.apr || pool?.apr || 0;
  const formattedApr = typeof apr === 'number' 
    ? `${apr.toFixed(2)}% a.a` 
    : apr || '0% a.a';

  return (
    <div className="px-4 lg:px-6">
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-white font-semibold">Rentabilidade estimada</h3>
            <button className="text-slate-400 hover:text-white">
              <Info className="h-4 w-4" />
            </button>
          </div>
          {hasUserPosition && (
            <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-lg text-xs font-semibold border border-green-500/30">
              Ativo
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-green-400" />
          </div>
          <div className="text-green-400 font-bold text-xl">
            {formattedApr}
          </div>
        </div>
      </div>
    </div>
  );
}

