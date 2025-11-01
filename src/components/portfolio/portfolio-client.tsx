/**
 * Portfolio Client Component
 * Componente client que gerencia as tabs e estado do portfolio
 */

"use client";

import { useState } from "react";
import { PortfolioHeader } from "./portfolio-header";
import { PortfolioTabs } from "./portfolio-tabs";
import { WalletTab } from "./wallet-tab";
import { ActivitiesTab } from "./activities-tab";

interface PortfolioClientProps {
  initialPortfolio: any;
  initialHistory: any;
  initialPools: any[];
  accountAbstractionAddress: string;
  totalBalance: number;
}

export function PortfolioClient({
  initialPortfolio,
  initialHistory,
  initialPools,
  accountAbstractionAddress,
  totalBalance,
}: PortfolioClientProps) {
  const [activeTab, setActiveTab] = useState<'wallet' | 'activities'>('wallet');
  const [showBalance, setShowBalance] = useState(true);
  const [currency, setCurrency] = useState<'USD' | 'BRL'>('USD');

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <PortfolioHeader
        showBalance={showBalance}
        onToggleBalance={setShowBalance}
        currency={currency}
        onCurrencyChange={setCurrency}
      />

      {/* Tabs */}
      <PortfolioTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Conteúdo das tabs */}
      {activeTab === 'wallet' ? (
        <WalletTab
          portfolio={initialPortfolio}
          pools={initialPools}
          currency={currency}
          showBalance={showBalance}
          totalBalance={totalBalance}
        />
      ) : (
        <ActivitiesTab
          history={initialHistory}
          walletAddress={accountAbstractionAddress}
        />
      )}
    </div>
  );
}

