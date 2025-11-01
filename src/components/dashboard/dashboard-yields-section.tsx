/**
 * Dashboard Yields Section (Mobile)
 * Exibe cards de rendimentos (APY) para diferentes tokens
 */

"use client";

import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";

interface YieldCardProps {
  token: {
    symbol: string;
    name: string;
    logo?: string;
    apy: number;
    description: string;
    color: string;
  };
}

function YieldCard({ token }: YieldCardProps) {
  const hasLogo = token.logo && (token.logo.startsWith('http') || token.logo.startsWith('data:') || token.logo.startsWith('/'));
  
  return (
    <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/50 rounded-2xl p-4 relative overflow-hidden">
      {/* Header do card */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg overflow-hidden border-2 border-white/10`} style={{ backgroundColor: token.color }}>
            {hasLogo ? (
              <img 
                src={token.logo} 
                alt={token.symbol}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            <span 
              className="text-white text-xs font-black"
              style={{ display: hasLogo ? 'none' : 'flex' }}
            >
              {token.symbol.charAt(0)}
            </span>
          </div>
          <div>
            <div className="text-white font-bold text-base">{token.symbol}</div>
          </div>
        </div>
      </div>

      {/* APY */}
      <div className="mb-2">
        <div className="text-white font-black text-3xl leading-tight">
          {token.apy.toFixed(2)}% a.a
        </div>
      </div>

      {/* Descrição */}
      <div className="text-slate-400 text-xs font-medium">
        {token.description}
      </div>
    </div>
  );
}

interface DashboardYieldsSectionProps {
  yields?: Array<{
    symbol: string;
    name: string;
    logo?: string;
    apy: number;
    description: string;
    color: string;
  }>;
}

export function DashboardYieldsSection({ yields = [] }: DashboardYieldsSectionProps) {
  const router = useRouter();

  // Dados padrão se não houver yields
  const defaultYields = [
    {
      symbol: 'DAI',
      name: 'Dai',
      color: '#F5AC37',
      apy: 4.14,
      description: 'Rendimento em dólar'
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      color: '#2775CA',
      apy: 4.13,
      description: 'Rendimento em dólar'
    }
  ];

  const displayYields = yields.length > 0 ? yields.slice(0, 2) : defaultYields;

  return (
    <div className="lg:hidden px-5 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-bold text-lg">Rendimentos</h2>
        <button
          onClick={() => router.push('/pools')}
          className="text-yellow-400 hover:text-yellow-300 text-sm font-semibold flex items-center gap-1"
        >
          Ver todas
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {displayYields.map((yieldToken) => (
          <YieldCard key={yieldToken.symbol} token={yieldToken} />
        ))}
      </div>
    </div>
  );
}

