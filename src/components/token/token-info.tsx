/**
 * Token Info Component
 * Exibe informações básicas do token: logo, nome, rank, marketcap, volume
 */

"use client";

interface TokenInfoProps {
  token: any;
}

export function TokenInfo({ token }: TokenInfoProps) {
  const symbol = token?.symbol?.toUpperCase() || '';
  const name = token?.name || '';
  
  // Usar dados reais da API
  const marketCap = token?.marketCap || token?.marketCapUSD || token?.marketCapUsd || null;
  const volume24h = token?.volume24h || token?.volume24hUSD || token?.volume24hUsd || null;
  
  // Formatar marketcap
  const formatMarketCap = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(1)} T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)} B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)} M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(1)} K`;
    return `$${value.toFixed(2)}`;
  };
  
  // Formatar volume
  const formatVolume = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(1)} T Vol`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)} B Vol`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)} M Vol`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(1)} K Vol`;
    return `$${value.toFixed(2)} Vol`;
  };
  
  const marketcap = marketCap ? formatMarketCap(marketCap) : null;
  const volume = volume24h ? formatVolume(volume24h) : null;
  const rank = null; // Rank não disponível nas APIs atuais

  return (
    <div className="px-4 lg:px-6">
      <div className="flex items-start gap-4">
        {/* Logo do Token */}
        <div className={`
          w-16 h-16 rounded-full flex items-center justify-center border-2 flex-shrink-0 overflow-hidden
          ${symbol === 'BRZ' 
            ? 'bg-gradient-to-br from-green-500/20 to-yellow-500/20 border-green-500/30' 
            : symbol === 'USDC'
            ? 'bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30'
            : 'bg-slate-700/50 border-slate-600/50'
          }
        `}>
          {token?.logo ? (
            <img 
              src={token.logo} 
              alt={symbol}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback para ícone se a imagem falhar
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = symbol === 'BRZ' 
                    ? '<span class="text-2xl font-bold text-green-400">R$</span>'
                    : symbol === 'USDC'
                    ? '<span class="text-2xl font-bold text-blue-400">$</span>'
                    : `<span class="text-xl font-bold text-white">${symbol.slice(0, 2)}</span>`;
                }
              }}
            />
          ) : symbol === 'BRZ' ? (
            <span className="text-2xl font-bold text-green-400">R$</span>
          ) : symbol === 'USDC' ? (
            <span className="text-2xl font-bold text-blue-400">$</span>
          ) : (
            <span className="text-xl font-bold text-white">{symbol.slice(0, 2)}</span>
          )}
        </div>

        {/* Nome e Informações */}
        <div className="flex-1 min-w-0">
          <div className="text-2xl font-bold text-white mb-1">
            {name || symbol}
          </div>
          <div className="text-lg text-slate-400 mb-3">
            {symbol}
          </div>

          {/* Badges de informações */}
          <div className="flex flex-wrap gap-2">
            {rank && (
              <div className={`
                px-3 py-1 rounded-lg text-sm font-semibold
                ${symbol === 'BRZ' 
                  ? 'bg-yellow-400 text-slate-900' 
                  : 'bg-slate-700/50 text-white'
                }
              `}>
                {rank}
              </div>
            )}
            {marketcap && (
              <div className="px-3 py-1 rounded-lg text-sm font-semibold bg-slate-700/50 text-white">
                {marketcap} Marketcap
              </div>
            )}
            {volume && (
              <div className="px-3 py-1 rounded-lg text-sm font-semibold bg-slate-700/50 text-white">
                {volume}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

