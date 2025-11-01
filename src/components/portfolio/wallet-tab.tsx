/**
 * Wallet Tab Component
 * Exibe cards: Meu patrimônio, Saldo para investir, Pools de liquidez
 */

"use client";

import { Clock, Coins } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface WalletTabProps {
  portfolio: any;
  pools: any[];
  currency: 'USD' | 'BRL';
  showBalance: boolean;
  totalBalance: number;
}

export function WalletTab({
  portfolio,
  pools,
  currency,
  showBalance,
  totalBalance,
}: WalletTabProps) {
  const router = useRouter();
  // Encontrar tokens BRZ e USDC
  const brzToken = portfolio?.tokens?.find((t: any) => 
    t.symbol?.toUpperCase() === 'BRZ'
  );
  const usdcToken = portfolio?.tokens?.find((t: any) => 
    t.symbol?.toUpperCase() === 'USDC' || t.symbol?.toUpperCase() === 'USDC.E'
  );

  // Calcular saldo para investir (total BRZ + USDC)
  const investBalance = (parseFloat(brzToken?.balanceUSD || brzToken?.balanceUsd || '0') + parseFloat(usdcToken?.balanceUSD || usdcToken?.balanceUsd || '0'));

  // Calcular total de pools do usuário
  // O totalValueLockedUSD aqui representa o valor do usuário no pool, não o TVL total do pool
  // Se não houver valor específico, tentar calcular baseado nos tokens ou usar 0
  const poolsTotal = pools.reduce((sum: number, pool: any) => {
    // Se o pool tiver um campo com valor do usuário, usar ele
    // Caso contrário, usar totalValueLockedUSD (pode ser o valor do usuário ou TVL total)
    const userValue = parseFloat(
      pool.userValueUSD || 
      pool.balanceUSD || 
      pool.totalValueLockedUSD || 
      '0'
    );
    return sum + userValue;
  }, 0);

  const formatCurrency = (value: number) => {
    if (!showBalance) return '••••';
    
    // Sempre mostrar em USD conforme design da Notus
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatTokenBalance = (balance: string, decimals: number = 18) => {
    if (!showBalance) return '••••';
    const num = parseFloat(balance || '0') / Math.pow(10, decimals);
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(num);
  };

  return (
    <div className="space-y-4 lg:space-y-6 px-4 lg:px-6 pb-20 lg:pb-6">
      {/* Card: Meu patrimônio */}
      <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">Meu patrimônio</h2>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-3xl lg:text-4xl font-bold text-white">
            {formatCurrency(totalBalance)}
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-700/50 flex items-center justify-center border border-slate-600/50">
            <Clock className="h-4 w-4 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Card: Saldo para investir */}
      <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">Saldo para investir</h2>
        </div>
        
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-700/50">
          <span className="text-white">Total</span>
          <span className="text-white font-semibold">{formatCurrency(investBalance)}</span>
        </div>

        <div className="space-y-3">
          {/* BRZ */}
          {brzToken && (
            <button
              onClick={() => router.push('/portfolio/token/BRZ')}
              className="w-full flex items-center justify-between bg-slate-700/30 rounded-lg p-4 hover:bg-slate-700/40 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30">
                  <span className="text-white font-bold text-sm">R$</span>
                </div>
                <div>
                  <div className="text-white font-medium">Real (BRZ)</div>
                  <div className="text-slate-400 text-sm">BRZ</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-semibold">
                  {formatCurrency(parseFloat(brzToken.balanceUSD || brzToken.balanceUsd || '0'))}
                </div>
                <div className="text-slate-400 text-sm">
                  {formatTokenBalance(brzToken.balance || '0', brzToken.decimals)} BRZ
                </div>
              </div>
            </button>
          )}

          {/* USDC */}
          {usdcToken && (
            <button
              onClick={() => router.push('/portfolio/token/USDC')}
              className="w-full flex items-center justify-between bg-slate-700/30 rounded-lg p-4 hover:bg-slate-700/40 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                  <span className="text-white font-bold text-sm">$</span>
                </div>
                <div>
                  <div className="text-white font-medium">Dólar (USDC)</div>
                  <div className="text-slate-400 text-sm">USDC</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-semibold">
                  {formatCurrency(parseFloat(usdcToken.balanceUSD || usdcToken.balanceUsd || '0'))}
                </div>
                <div className="text-slate-400 text-sm">
                  {formatTokenBalance(usdcToken.balance || '0', usdcToken.decimals)} USDC
                </div>
              </div>
            </button>
          )}

          {/* Mensagem se não houver tokens */}
          {!brzToken && !usdcToken && (
            <div className="text-center py-8 text-slate-400">
              <Coins className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum saldo disponível para investir</p>
            </div>
          )}
        </div>
      </div>

      {/* Card: Pools de liquidez */}
      <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">Pools de liquidez</h2>
        </div>
        
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-700/50">
          <span className="text-white">Total</span>
          <span className="text-white font-semibold">{formatCurrency(poolsTotal)}</span>
        </div>

        <div className="space-y-3">
          {pools.length > 0 ? (
            pools.map((pool: any, index: number) => {
              const token0 = pool.tokens?.[0];
              const token1 = pool.tokens?.[1];
              
              // Extrair símbolo do token (pode ser string ou objeto)
              const token0Symbol = typeof token0 === 'object' ? token0?.symbol : token0;
              const token1Symbol = typeof token1 === 'object' ? token1?.symbol : token1;
              
              const tokenPair = `${token0Symbol || 'TOKEN1'}/${token1Symbol || 'TOKEN2'}`;
              const providerName = typeof pool.provider === 'object' ? pool.provider?.name || 'Uniswap V3' : pool.provider || 'Uniswap V3';
              
              return (
                <div key={pool.id || index} className="space-y-3">
                  <div className="flex items-center justify-between bg-slate-700/30 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500/20 to-purple-500/20 flex items-center justify-center border border-yellow-500/30">
                        <Coins className="h-5 w-5 text-yellow-400" />
                      </div>
                      <div>
                        <div className="text-white font-medium">{tokenPair}</div>
                        <div className="text-slate-400 text-sm">{providerName}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-semibold">
                        {formatCurrency(parseFloat(pool.totalValueLockedUSD || pool.userValueUSD || pool.balanceUSD || '0'))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Mostrar intervalo de preço se disponível (conforme design) */}
                  {pool.stats?.priceRange && (
                    <div className="flex items-center justify-between px-4 text-sm">
                      <span className="text-slate-400">Intervalo</span>
                      <span className="text-white">
                        {pool.stats.priceRange.min} - {pool.stats.priceRange.max}
                      </span>
                    </div>
                  )}
                  
                  {/* Mostrar preço atual se disponível */}
                  {pool.stats?.currentPrice && (
                    <div className="px-4 text-sm">
                      <span className="text-slate-400">Preço atual</span>
                      <span className="text-white ml-2">{pool.stats.currentPrice}</span>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-slate-400">
              <Coins className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum pool de liquidez ativo</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

