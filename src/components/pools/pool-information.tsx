/**
 * Pool Information Component
 * Exibe informações técnicas da pool
 */

"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";

interface PoolInformationProps {
  pool: any;
  token0: any;
  token1: any;
}

export function PoolInformation({ pool, token0, token1 }: PoolInformationProps) {
  const token0Symbol = typeof token0 === 'object' ? token0?.symbol : token0;
  const token1Symbol = typeof token1 === 'object' ? token1?.symbol : token1;
  
  const tvl = parseFloat(pool?.totalValueLockedUSD || pool?.tvl || '0');
  const volume24h = parseFloat(pool?.stats?.volumeInUSD || '0');
  const fees24h = parseFloat(pool?.stats?.feesInUSD || '0');
  const fee = pool?.fee || 0;

  const formatValue = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)} M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)} K`;
    return `$${value.toFixed(2)}`;
  };

  const getExplorerUrl = (address: string, chainId?: number) => {
    if (!address) return null;
    const chainIdNum = chainId || pool?.chain?.id || 137;
    const explorers: Record<number, string> = {
      1: 'https://etherscan.io',
      137: 'https://polygonscan.com',
      42161: 'https://arbiscan.io',
    };
    const baseUrl = explorers[chainIdNum] || 'https://polygonscan.com';
    return `${baseUrl}/address/${address}`;
  };

  const getTokenExplorerUrl = (address: string) => {
    return getExplorerUrl(address)?.replace('/address/', '/token/') || null;
  };

  const nftContractAddress = '0xc36442b4a4522e871399cd717abdd847ab11fe88'; // Uniswap V3 NFT contract

  return (
    <div className="px-4 lg:px-6">
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
        <h3 className="text-white font-bold text-lg mb-4">Informações</h3>
        
        <div className="space-y-3">
          {/* TVL */}
          <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
            <span className="text-white">TVL</span>
            <span className="text-white font-semibold">
              {tvl >= 1000000 ? `$${(tvl / 1000000).toFixed(1)} M` : `$${(tvl / 1000).toFixed(1)} K`}
            </span>
          </div>

          {/* Volume 24h */}
          <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
            <span className="text-white">Volume (24h)</span>
            <span className="text-white font-semibold">{formatValue(volume24h)}</span>
          </div>

          {/* Tarifas 24h */}
          <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
            <span className="text-white">Tarifas (24h)</span>
            <span className="text-white font-semibold">{formatValue(fees24h)}</span>
          </div>

          {/* Nível de tarifas */}
          <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
            <span className="text-white">Nível de tarifas</span>
            <span className="text-white font-semibold">{fee}%</span>
          </div>

          {/* Rendimento */}
          <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
            <span className="text-white">Rendimento</span>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 flex items-center justify-center">
                {token0?.logo ? (
                  <img src={token0.logo} alt={token0Symbol} className="w-5 h-5 rounded-full" />
                ) : (
                  <span className="text-xs text-white">{token0Symbol?.charAt(0)}</span>
                )}
              </div>
              <span className="text-white text-sm">{token0Symbol}</span>
              <div className="w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                {token1?.logo ? (
                  <img src={token1.logo} alt={token1Symbol} className="w-5 h-5 rounded-full" />
                ) : (
                  <span className="text-xs text-purple-400">{token1Symbol?.charAt(0)}</span>
                )}
              </div>
              <span className="text-white text-sm">{token1Symbol}</span>
            </div>
          </div>

          {/* Protocolo */}
          <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
            <span className="text-white">Protocolo</span>
            <Link
              href={pool?.provider?.explorerURL || 'https://uniswap.org'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-white hover:text-yellow-400 transition-colors"
            >
              <span className="font-semibold">{pool?.provider?.name || 'UNISWAP V3'}</span>
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>

          {/* Rede */}
          <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
            <span className="text-white">Rede</span>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                <span className="text-purple-400 font-bold text-xs">P</span>
              </div>
              <span className="text-white font-semibold">{pool?.chain?.name || 'POLYGON'}</span>
            </div>
          </div>

          {/* Par de tokens */}
          <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
            <span className="text-white">Par de tokens</span>
            <div className="flex items-center gap-3">
              {token0?.address && (
                <Link
                  href={getTokenExplorerUrl(token0.address) || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-white hover:text-yellow-400 transition-colors"
                >
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 flex items-center justify-center">
                    {token0?.logo ? (
                      <img src={token0.logo} alt={token0Symbol} className="w-4 h-4 rounded-full" />
                    ) : (
                      <span className="text-[10px] text-white">{token0Symbol?.charAt(0)}</span>
                    )}
                  </div>
                  <span className="text-sm">{token0Symbol}</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              )}
              {token1?.address && (
                <Link
                  href={getTokenExplorerUrl(token1.address) || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-white hover:text-yellow-400 transition-colors"
                >
                  <div className="w-5 h-5 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                    {token1?.logo ? (
                      <img src={token1.logo} alt={token1Symbol} className="w-4 h-4 rounded-full" />
                    ) : (
                      <span className="text-[10px] text-purple-400">{token1Symbol?.charAt(0)}</span>
                    )}
                  </div>
                  <span className="text-sm">{token1Symbol}</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              )}
            </div>
          </div>

          {/* Contrato da Pool */}
          {pool?.address && (
            <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
              <span className="text-white">Contrato da Pool</span>
              <Link
                href={getExplorerUrl(pool.address) || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white hover:text-yellow-400 transition-colors font-mono text-sm"
              >
                <span>{pool.address.slice(0, 5)}...{pool.address.slice(-4)}</span>
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          )}

          {/* Contrato do NFT */}
          <div className="flex items-center justify-between py-3">
            <span className="text-white">Contrato do NFT</span>
            <Link
              href={getExplorerUrl(nftContractAddress) || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-white hover:text-yellow-400 transition-colors font-mono text-sm"
            >
              <span>{nftContractAddress.slice(0, 5)}...{nftContractAddress.slice(-4)}</span>
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

