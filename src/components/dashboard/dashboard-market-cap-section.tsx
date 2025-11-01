/**
 * Dashboard Market Cap Section (Mobile)
 * Exibe capitalização de mercado das principais criptomoedas
 */

"use client";

import { useRouter } from "next/navigation";
import { ChevronRight, TrendingUp, TrendingDown } from "lucide-react";

interface MarketCapItemProps {
  token: {
    symbol: string;
    name: string;
    logo?: string;
    price: number;
    change24h: number;
    color: string;
  };
}

function MarketCapItem({ token }: MarketCapItemProps) {
  const router = useRouter();
  const isPositive = token.change24h >= 0;
  const hasLogo = token.logo && (token.logo.startsWith('http') || token.logo.startsWith('data:') || token.logo.startsWith('/'));

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(price);
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(price);
  };

  return (
    <button
      onClick={() => router.push(`/swap?from=${token.symbol}`)}
      className="w-full bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/50 rounded-xl p-4 flex items-center justify-between hover:border-slate-600/70 transition-colors"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Logo do token */}
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg overflow-hidden border-2 border-white/10 flex-shrink-0"
          style={{ backgroundColor: token.color }}
        >
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

        <div className="flex-1 min-w-0">
          <div className="text-white font-bold text-sm truncate">{token.name}</div>
          <div className="text-slate-400 text-xs font-medium">{token.symbol}</div>
        </div>
      </div>

      <div className="text-right flex-shrink-0 ml-4">
        <div className="text-white font-bold text-sm mb-1">
          {formatPrice(token.price)}
        </div>
        <div className={`flex items-center gap-1 justify-end text-xs font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isPositive ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          <span>
            {isPositive ? '+' : ''}{token.change24h.toFixed(2)}% 24h
          </span>
        </div>
      </div>
    </button>
  );
}

interface DashboardMarketCapSectionProps {
  tokens?: Array<{
    symbol: string;
    name: string;
    logo?: string;
    price?: number;
    priceUsd?: number | string;
    change24h?: number;
    color?: string;
  }>;
}

export function DashboardMarketCapSection({ tokens = [] }: DashboardMarketCapSectionProps) {
  const router = useRouter();

  // Cores padrão por token
  const defaultColors: Record<string, string> = {
    'BTC': '#F7931A',
    'ETH': '#627EEA',
    'USDT': '#26A17B',
    'XRP': '#000000',
    'BNB': '#F3BA2F',
    'USDC': '#2775CA',
    'DAI': '#F5AC37',
    'BRZ': '#00D9A0'
  };

  // Processar tokens para exibir
  const processedTokens = tokens.slice(0, 5).map((token) => {
    const price = typeof token.priceUsd === 'string' 
      ? parseFloat(token.priceUsd) 
      : (token.priceUsd || token.price || 0);
    
    return {
      symbol: token.symbol || 'UNKNOWN',
      name: token.name || token.symbol || 'Unknown',
      logo: token.logo,
      price,
      change24h: token.change24h || 0,
      color: token.color || defaultColors[token.symbol?.toUpperCase() || ''] || '#64748b'
    };
  });

  // Se não houver tokens, usar dados padrão para demonstração
  const defaultTokens = [
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      color: '#F7931A',
      price: 109570.00,
      change24h: 1.63
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      color: '#627EEA',
      price: 3855.15,
      change24h: 2.05
    },
    {
      symbol: 'USDT',
      name: 'Tether',
      color: '#26A17B',
      price: 0.99,
      change24h: -0.05
    },
    {
      symbol: 'XRP',
      name: 'XRP',
      color: '#000000',
      price: 2.51,
      change24h: 2.93
    },
    {
      symbol: 'BNB',
      name: 'BNB',
      color: '#F3BA2F',
      price: 1088.25,
      change24h: 1.86
    }
  ];

  const displayTokens = processedTokens.length > 0 ? processedTokens : defaultTokens;

  return (
    <div className="lg:hidden px-5 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-bold text-lg">Capitalização de mercado</h2>
        <button
          onClick={() => router.push('/swap')}
          className="text-yellow-400 hover:text-yellow-300 text-sm font-semibold flex items-center gap-1"
        >
          Ver todas
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-3">
        {displayTokens.map((token) => (
          <MarketCapItem key={token.symbol} token={token} />
        ))}
      </div>
    </div>
  );
}

