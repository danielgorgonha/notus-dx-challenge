/**
 * Pool Yields Component
 * Exibe rendimentos acumulados e botão para recolher
 */

"use client";

import { Hand } from "lucide-react";
import { useState } from "react";
import { liquidityActions } from "@/lib/actions/liquidity";

interface PoolYieldsProps {
  pool: any;
  token0: any;
  token1: any;
  walletAddress: string;
  poolId: string;
}

export function PoolYields({ pool, token0, token1, walletAddress, poolId }: PoolYieldsProps) {
  const [isCollecting, setIsCollecting] = useState(false);

  const token0Symbol = typeof token0 === 'object' ? token0?.symbol : token0;
  const token1Symbol = typeof token1 === 'object' ? token1?.symbol : token1;

  // Mockado - pode vir da API depois
  const yields = {
    token0: { amount: '0.00000042', usd: '$0.04' },
    token1: { amount: '0.000012', usd: '$0.04' },
  };

  const handleCollect = async () => {
    setIsCollecting(true);
    try {
      // TODO: Implementar coleta de rendimentos
      // await liquidityActions.collectFees({...});
    } catch (error) {
      console.error('Erro ao coletar rendimentos:', error);
    } finally {
      setIsCollecting(false);
    }
  };

  return (
    <div className="px-4 lg:px-6">
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
        <h3 className="text-white font-semibold mb-4">Rendimentos</h3>
        
        <div className="space-y-4 mb-4">
          {/* BTC Yield */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 flex items-center justify-center">
                {token0?.logo ? (
                  <img 
                    src={token0.logo} 
                    alt={token0Symbol}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-sm">{token0Symbol?.charAt(0)}</span>
                )}
              </div>
              <div>
                <div className="text-white font-medium">{token0Symbol}</div>
                <div className="text-slate-400 text-sm">{yields.token0.amount} {token0Symbol}</div>
                <div className="text-slate-400 text-xs">{yields.token0.usd}</div>
              </div>
            </div>
          </div>

          {/* ETH Yield */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                {token1?.logo ? (
                  <img 
                    src={token1.logo} 
                    alt={token1Symbol}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-purple-400 font-bold text-sm">{token1Symbol?.charAt(0)}</span>
                )}
              </div>
              <div>
                <div className="text-white font-medium">{token1Symbol}</div>
                <div className="text-slate-400 text-sm">{yields.token1.amount} {token1Symbol}</div>
                <div className="text-slate-400 text-xs">{yields.token1.usd}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Botão recolher rendimentos */}
        <button
          onClick={handleCollect}
          disabled={isCollecting}
          className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-yellow-400/50 text-slate-900 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <Hand className="h-5 w-5" />
          {isCollecting ? 'Recolhendo...' : 'Recolher rendimentos'}
        </button>
      </div>
    </div>
  );
}

