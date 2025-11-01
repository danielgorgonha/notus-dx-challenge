/**
 * Dashboard Mobile Balances Component
 * Cards de saldo para Real (BRZ) e Dólar (USDC)
 */

"use client";

import { Info } from "lucide-react";
import { useState } from "react";

interface BalanceCardProps {
  currency: 'BRZ' | 'USDC';
  balance: number;
  balanceLabel: string;
  currencySymbol: string;
  formatValue: (value: number) => string;
  showBalance: boolean;
  tokenLogo?: string;
}

function BalanceCard({ 
  currency, 
  balance, 
  balanceLabel, 
  currencySymbol,
  formatValue,
  showBalance,
  tokenLogo
}: BalanceCardProps) {
  const [showInfo, setShowInfo] = useState(false);

  const isBRZ = currency === 'BRZ';
  const bgColor = isBRZ 
    ? 'bg-gradient-to-br from-green-600/20 to-green-700/20 border-green-500/30'
    : 'bg-gradient-to-br from-blue-600/20 to-blue-700/20 border-blue-500/30';
  const iconBg = isBRZ 
    ? 'bg-green-500'
    : 'bg-blue-500';
  const textColor = isBRZ
    ? 'text-green-400'
    : 'text-blue-400';
  
  const hasLogo = tokenLogo && (tokenLogo.startsWith('http') || tokenLogo.startsWith('data:') || tokenLogo.startsWith('/'));

  return (
    <div className={`${bgColor} border rounded-2xl p-4 relative overflow-hidden group`}>
      {/* Header do card */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className={`w-11 h-11 ${iconBg} rounded-full flex items-center justify-center text-white font-bold shadow-lg overflow-hidden border-2 border-white/20`}>
            {hasLogo ? (
              <img 
                src={tokenLogo} 
                alt={currency}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            <span 
              className="text-xs font-black"
              style={{ display: hasLogo ? 'none' : 'flex' }}
            >
              {currencySymbol}
            </span>
          </div>
          <div>
            <div className="text-white font-bold text-sm leading-tight">
              {isBRZ ? 'Real' : 'Dólar'}
            </div>
            <div className="text-slate-400 text-xs font-medium">
              {currency}
            </div>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowInfo(!showInfo);
          }}
          className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <Info className="h-4 w-4 text-white/70" />
        </button>
      </div>

      {/* Saldo */}
      <div>
        <div className="text-white font-black text-2xl leading-tight">
          {showBalance ? formatValue(balance) : '••••••'}
        </div>
      </div>

      {/* Tooltip de informação */}
      {showInfo && (
        <div className="absolute top-12 right-4 bg-slate-900 border border-slate-700 rounded-lg p-3 z-10 shadow-xl min-w-[200px]">
          <div className="text-white text-sm font-medium mb-1">
            {isBRZ ? 'Real (BRZ)' : 'Dólar (USDC)'}
          </div>
          <div className="text-slate-400 text-xs">
            {isBRZ 
              ? 'Token lastreado em Real brasileiro'
              : 'USD Coin - stablecoin lastreada em dólar'}
          </div>
        </div>
      )}
    </div>
  );
}

interface DashboardMobileBalancesProps {
  brzBalance: number;
  usdcBalance: number;
  formatValue: (value: number) => string;
  showBalance: boolean;
  brzToken?: any;
  usdcToken?: any;
}

export function DashboardMobileBalances({
  brzBalance,
  usdcBalance,
  formatValue,
  showBalance,
  brzToken,
  usdcToken,
}: DashboardMobileBalancesProps) {
  return (
    <div className="lg:hidden space-y-4 px-5 pb-6">
      <div className="text-white font-bold text-lg mb-5">Saldo para investir</div>
      <div className="grid grid-cols-2 gap-4">
        <BalanceCard
          currency="BRZ"
          balance={brzBalance}
          balanceLabel="Real"
          currencySymbol="R$"
          formatValue={formatValue}
          showBalance={showBalance}
          tokenLogo={brzToken?.logo || brzToken?.logoUrl}
        />
        <BalanceCard
          currency="USDC"
          balance={usdcBalance}
          balanceLabel="Dólar"
          currencySymbol="$"
          formatValue={formatValue}
          showBalance={showBalance}
          tokenLogo={usdcToken?.logo || usdcToken?.logoUrl}
        />
      </div>
    </div>
  );
}

