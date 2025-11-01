/**
 * Pool Detail Header Component
 * Header com logos sobrepostos e preço atual
 */

"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PoolDetailHeaderProps {
  pool: any;
  token0: any;
  token1: any;
  onBack: () => void;
}

export function PoolDetailHeader({
  pool,
  token0,
  token1,
  onBack,
}: PoolDetailHeaderProps) {
  const token0Symbol = typeof token0 === 'object' ? token0?.symbol : token0;
  const token1Symbol = typeof token1 === 'object' ? token1?.symbol : token1;
  
  // Calcular preço atual (token0 por token1)
  // Calcular baseado nos preços dos tokens se disponíveis
  let currentPrice = '28.421'; // Fallback mockado
  
  if (token0?.priceUsd && token1?.priceUsd) {
    const price0 = parseFloat(token0.priceUsd);
    const price1 = parseFloat(token1.priceUsd);
    if (price0 > 0 && price1 > 0) {
      currentPrice = (price0 / price1).toFixed(3);
    }
  } else if (pool?.stats?.poolPrice) {
    currentPrice = parseFloat(pool.stats.poolPrice).toFixed(3);
  }

  return (
    <div className="px-4 lg:px-6">
      {/* Botão voltar */}
      <Button
        onClick={onBack}
        variant="ghost"
        size="icon"
        className="text-white hover:bg-slate-800/50 mb-4"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>

      {/* Logos sobrepostos e nome */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center -space-x-3">
          {/* Token 0 (fundo) */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-2 border-orange-500/30 flex items-center justify-center overflow-hidden z-10">
            {token0?.logo ? (
              <img 
                src={token0.logo} 
                alt={token0Symbol}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <span className="text-white font-bold text-lg">
                {token0Symbol?.charAt(0) || '?'}
              </span>
            )}
          </div>
          
          {/* Token 1 (sobreposto) */}
          <div className="w-12 h-12 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center overflow-hidden z-20">
            {token1?.logo ? (
              <img 
                src={token1.logo} 
                alt={token1Symbol}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <span className="text-purple-400 font-bold text-lg">
                {token1Symbol?.charAt(0) || '?'}
              </span>
            )}
          </div>
        </div>

        <div>
          <h1 className="text-white font-bold text-2xl">
            {token0Symbol}/{token1Symbol}
          </h1>
        </div>
      </div>

      {/* Preço atual */}
      <div className="text-center mb-2">
        <div className="text-slate-400 text-sm mb-1">{token0Symbol} por {token1Symbol}</div>
        <div className="text-white font-bold text-4xl">{currentPrice}</div>
        <div className="text-slate-400 text-sm mt-1">{token0Symbol} por {token1Symbol}</div>
      </div>
    </div>
  );
}

