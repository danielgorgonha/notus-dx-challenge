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
  
  // Informações da API (quando disponíveis)
  // Por enquanto, apenas para BRZ e USDC temos informações mockadas
  // Outros tokens podem ter dados reais da API no futuro
  const rank = symbol === 'BRZ' ? 'BB 67.94' : symbol === 'USDC' ? '#7' : null;
  const marketcap = symbol === 'BRZ' ? null : symbol === 'USDC' ? '$75.9 B' : null;
  const volume = symbol === 'BRZ' ? '$179.9 K Vol' : symbol === 'USDC' ? '$18.0 B Vol' : null;

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

