/**
 * Token Details Component
 * Exibe detalhes técnicos: rede, contrato, máximos/mínimos, volume, supply
 */

"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";

interface TokenDetailsProps {
  token: any;
}

export function TokenDetails({ token }: TokenDetailsProps) {
  const symbol = token?.symbol?.toUpperCase() || '';
  const address = token?.address || '';
  
  // Sempre usar Polygon (chainId: 137)
  const network = 'POLYGON';
  const chainId = 137;
  
  const allTimeHigh = symbol === 'BRZ' 
    ? { date: '29 Oct 2023, 20:35', price: '$9.99', change: '-98.14%' }
    : { date: '07 May 2019, 21:40', price: '$1.17', change: '-14.75%' };
    
  const allTimeLow = symbol === 'BRZ'
    ? { date: '09 Jun 2023, 01:54', price: '$0.0055', change: '+3268.57%' }
    : { date: '11 Mar 2023, 05:02', price: '$0.877', change: '+13.91%' };

  const volume24h = symbol === 'BRZ' ? '$ 179.9 K' : '$ 18.0 B';
  const marketcap = symbol === 'BRZ' ? null : '$ 75.9 B';
  const circulatingSupply = symbol === 'BRZ' ? null : '75.9 B';
  const totalSupply = symbol === 'BRZ' ? '9.0 M' : '75.9 B';

  const getExplorerUrl = (address: string) => {
    if (!address) return null;
    return `https://polygonscan.com/token/${address}`;
  };

  const explorerUrl = getExplorerUrl(address);

  return (
    <div className="px-4 lg:px-6 space-y-4">
      {/* Rede do Token */}
      <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
        <span className="text-white">Rede do Token</span>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
            <span className="text-purple-400 font-bold text-xs">P</span>
          </div>
          <span className="text-white font-medium">{network}</span>
        </div>
      </div>

      {/* Contrato */}
      {address && (
        <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
          <span className="text-white">Contrato</span>
          <div className="flex items-center gap-2">
            <span className="text-white font-mono text-sm">
              {address.slice(0, 5)}...{address.slice(-4)}
            </span>
            {explorerUrl && (
              <Link
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Máxima Histórica */}
      <div className="flex items-start justify-between py-3 border-b border-slate-700/50">
        <div>
          <div className="text-white mb-1">Máxima Histórica</div>
          <div className="text-slate-400 text-sm">{allTimeHigh.date}</div>
        </div>
        <div className="text-right">
          <div className="text-white font-semibold">{allTimeHigh.price}</div>
          <div className="text-red-400 text-sm">{allTimeHigh.change}</div>
        </div>
      </div>

      {/* Mínima Histórica */}
      <div className="flex items-start justify-between py-3 border-b border-slate-700/50">
        <div>
          <div className="text-white mb-1">Mínima Histórica</div>
          <div className="text-slate-400 text-sm">{allTimeLow.date}</div>
        </div>
        <div className="text-right">
          <div className="text-white font-semibold">{allTimeLow.price}</div>
          <div className="text-green-400 text-sm">{allTimeLow.change}</div>
        </div>
      </div>

      {/* Volume 24h */}
      <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
        <span className="text-white">Volume 24h</span>
        <span className="text-white font-semibold">{volume24h}</span>
      </div>

      {/* Marketcap (apenas USDC) */}
      {marketcap && (
        <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
          <span className="text-white">Marketcap</span>
          <span className="text-white font-semibold">{marketcap}</span>
        </div>
      )}

      {/* Suprimento Circulante (apenas USDC) */}
      {circulatingSupply && (
        <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
          <span className="text-white">Suprimento Circulante</span>
          <span className="text-white font-semibold">{circulatingSupply}</span>
        </div>
      )}

      {/* Suprimento Total */}
      <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
        <span className="text-white">Suprimento Total</span>
        <span className="text-white font-semibold">{totalSupply}</span>
      </div>

      {/* Saiba mais */}
      <div className="pt-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-white font-semibold">Saiba mais</div>
        </div>
        <div className="text-slate-400 text-sm leading-relaxed">
          {symbol === 'BRZ' ? (
            <>
              BRZ is the first stable coin backed by Brazilian Reais (BRL). It'll allow Brazilian residents to directly ramp up in international exchanges and actively trade the Brazilian currency against pairs of different classes, including Bitcoin, other stable coins, utility and security tokens. It will be a powerful tool that will allow Brazilians to move and hedge Brazilians reais internationally. BRZ is always fully backed and holders can either purchase it for 1BRL or redeem it with a discount of 1% in Brazil.
            </>
          ) : symbol === 'USDC' ? (
            <>
              USDC is a fully collateralized US dollar stablecoin. USDC is the bridge between dollars and trading on cryptocurrency exchanges. The technology behind CENTRE makes it possible to exchange value between people, businesses and financial institutions just like email between mail services and texts between SMS providers. We believe by removing artificial economic borders, we can create a more inclusive global economy.
            </>
          ) : (
            <>
              Informações sobre o token {symbol}.
            </>
          )}
        </div>
        
        {/* Site Oficial */}
        <div className="mt-4">
          <Link
            href={symbol === 'BRZ' ? 'https://brz.com.br' : symbol === 'USDC' ? 'https://centre.io/usdc' : '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-yellow-400 font-semibold hover:text-yellow-300 transition-colors"
          >
            Site Oficial
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

