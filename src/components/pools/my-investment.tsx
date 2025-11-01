/**
 * My Investment Component
 * Exibe valor total e posição dos ativos do usuário
 */

"use client";

interface MyInvestmentProps {
  pool: any;
  token0: any;
  token1: any;
  userPosition: any;
}

export function MyInvestment({ pool, token0, token1, userPosition }: MyInvestmentProps) {
  const token0Symbol = typeof token0 === 'object' ? token0?.symbol : token0;
  const token1Symbol = typeof token1 === 'object' ? token1?.symbol : token1;

  // Extrair dados da posição do usuário
  const totalValueUSD = parseFloat(userPosition?.totalValue || userPosition?.balanceUSD || userPosition?.amountUSD || '0');
  const token0AmountRaw = userPosition?.token0Amount || '0';
  const token1AmountRaw = userPosition?.token1Amount || '0';
  
  // Converter para números com decimais
  const token0Decimals = token0?.decimals || 18;
  const token1Decimals = token1?.decimals || 18;
  
  const token0Amount = parseFloat(token0AmountRaw) / Math.pow(10, token0Decimals);
  const token1Amount = parseFloat(token1AmountRaw) / Math.pow(10, token1Decimals);
  
  // Calcular valores em USD (aproximado baseado na divisão proporcional)
  const token0Price = parseFloat(pool?.tokens?.[0]?.priceUsd || '0') || 1;
  const token1Price = parseFloat(pool?.tokens?.[1]?.priceUsd || '0') || 1;
  
  const token0ValueUSD = token0Amount * token0Price;
  const token1ValueUSD = token1Amount * token1Price;

  const formatCurrency = (value: string | number) => {
    if (typeof value === 'string' && value.startsWith('$')) return value;
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  return (
    <div className="px-4 lg:px-6">
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
        <h3 className="text-white font-semibold mb-4">Meu investimento</h3>
        
        {/* Valor total */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-700/50">
          <span className="text-white">Valor total</span>
          <span className="text-white font-bold text-lg">
            {formatCurrency(totalValueUSD || token0ValueUSD + token1ValueUSD)}
          </span>
        </div>

        {/* Posição dos ativos */}
        <div>
          <div className="text-slate-400 text-sm mb-3">Posição dos ativos</div>
          
          <div className="space-y-3">
            {/* Token 0 */}
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
                  <div className="text-white font-medium">
                    {token0Amount.toFixed(8).replace(/\.?0+$/, '')} {token0Symbol}
                  </div>
                  <div className="text-slate-400 text-sm">{formatCurrency(token0ValueUSD)}</div>
                </div>
              </div>
            </div>

            {/* Token 1 */}
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
                  <div className="text-white font-medium">
                    {token1Amount.toFixed(8).replace(/\.?0+$/, '')} {token1Symbol}
                  </div>
                  <div className="text-slate-400 text-sm">{formatCurrency(token1ValueUSD)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

