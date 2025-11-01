/**
 * Crypto List Item Component
 * Item individual da lista de criptomoedas
 */

"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface CryptoListItemProps {
  token: any;
  currency: 'BRL' | 'USD';
}

export function CryptoListItem({ token, currency }: CryptoListItemProps) {
  const router = useRouter();
  
  const symbol = token.symbol?.toUpperCase() || '?';
  const name = token.name || symbol;
  const logo = token.logo || token.logoURL || token.logoUrl;
  
  // Preço formatado
  const price = token.displayPrice || token.priceUsd || token.priceUSD || token.price || 0;
  
  // Formatação de preço mais flexível (valores muito altos ou baixos)
  const formatPrice = (value: number, curr: 'BRL' | 'USD') => {
    if (value === 0) return curr === 'BRL' ? 'R$ 0,00' : '$0.00';
    if (value < 0.01) {
      // Para valores muito pequenos, mostrar mais decimais
      return new Intl.NumberFormat(curr === 'BRL' ? 'pt-BR' : 'en-US', {
        style: 'currency',
        currency: curr === 'BRL' ? 'BRL' : 'USD',
        minimumFractionDigits: 4,
        maximumFractionDigits: 6,
      }).format(value);
    }
    return new Intl.NumberFormat(curr === 'BRL' ? 'pt-BR' : 'en-US', {
      style: 'currency',
      currency: curr === 'BRL' ? 'BRL' : 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };
  
  const formattedPrice = formatPrice(price, currency);

  // Variação 24h - tentar vários campos possíveis
  const change24h = parseFloat(
    token.change24h || 
    token.change24hPercent || 
    token.change24H || 
    token.change24HPercent ||
    token.priceChange24h ||
    token.priceChange24hPercent ||
    '0'
  );
  const isPositive = change24h >= 0;
  const formattedChange = `${isPositive ? '+' : ''}${change24h.toFixed(2)}%`;

  // Cores do logo baseadas no símbolo
  const getTokenColor = (symbol: string) => {
    const upper = symbol.toUpperCase();
    if (upper === 'BTC') return 'from-orange-500/20 to-orange-600/20 border-orange-500/30 text-orange-400';
    if (upper === 'ETH') return 'from-purple-500/20 to-blue-500/20 border-purple-500/30 text-purple-400';
    if (upper === 'BNB') return 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30 text-yellow-400';
    if (upper === 'SOL') return 'from-purple-500/20 to-teal-500/20 border-purple-500/30 text-purple-400';
    if (upper === 'USDT' || upper === 'USDC') return 'from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-400';
    if (upper === 'XRP') return 'from-slate-600/20 to-slate-700/20 border-slate-600/30 text-white';
    return 'from-slate-700/20 to-slate-800/20 border-slate-700/30 text-white';
  };

  const tokenColor = getTokenColor(symbol);

  const handleClick = () => {
    // Navegar para detalhes do token via menu Cripto
    router.push(`/crypto/token/${symbol}`);
  };

  return (
    <button
      onClick={handleClick}
      className="w-full bg-slate-800/50 rounded-lg p-4 border border-slate-700/50 hover:bg-slate-700/50 transition-colors text-left"
    >
      <div className="flex items-center justify-between gap-4">
        {/* Lado Esquerdo: Logo, Nome e Símbolo */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Logo */}
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center border-2 flex-shrink-0 overflow-hidden bg-gradient-to-br",
            tokenColor
          )}>
            {logo ? (
              <img 
                src={logo} 
                alt={symbol}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback para iniciais se a imagem falhar
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    const initial = symbol.length > 2 ? symbol.slice(0, 2) : symbol.charAt(0);
                    parent.innerHTML = `<span class="text-white font-bold text-sm">${initial}</span>`;
                  }
                }}
              />
            ) : (
              <span className="text-white font-bold text-sm">
                {symbol.length > 2 ? symbol.slice(0, 2) : symbol.charAt(0)}
              </span>
            )}
          </div>

          {/* Nome e Símbolo */}
          <div className="flex-1 min-w-0">
            <div className="text-white font-semibold text-base mb-0.5 truncate">
              {name}
            </div>
            <div className="text-slate-400 text-sm truncate">
              {symbol}
            </div>
          </div>
        </div>

        {/* Lado Direito: Preço e Variação */}
        <div className="text-right flex-shrink-0">
          <div className="text-white font-semibold text-base mb-1 whitespace-nowrap">
            {formattedPrice}
          </div>
          <div className={cn(
            "text-sm font-medium whitespace-nowrap",
            isPositive ? "text-green-400" : "text-red-400"
          )}>
            {formattedChange} 24h
          </div>
        </div>
      </div>
    </button>
  );
}

