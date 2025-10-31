/**
 * Dashboard Client Wrapper
 * Componente client que gerencia estado e formatação
 */

"use client";

import { useState } from "react";
import { DashboardStats } from "./dashboard-stats";
import { PortfolioSection } from "./portfolio-section";
import { QuickActions } from "./quick-actions";
import { RecentTransactions } from "./recent-transactions";

interface DashboardClientWrapperProps {
  initialTotalBalance: number;
  initialPortfolio: any;
  initialHistory: any;
  initialTransactionCount: number;
  initialTokenCount: number;
  accountAbstractionAddress: string;
}

export function DashboardClientWrapper({
  initialTotalBalance,
  initialPortfolio,
  initialHistory,
  initialTransactionCount,
  initialTokenCount,
  accountAbstractionAddress,
}: DashboardClientWrapperProps) {
  const [currency, setCurrency] = useState<'USD' | 'BRL'>('BRL');
  const [exchangeRate] = useState(5.32);

  const handleCurrencyChange = (newCurrency: 'USD' | 'BRL') => {
    setCurrency(newCurrency);
  };

  // Funções de formatação
  const formatTokenBalance = (balance: string | number, decimals: number = 18) => {
    const num = parseFloat(balance.toString());
    
    if (num === 0) return '0';
    
    const realValue = num / Math.pow(10, decimals);
    
    if (realValue < 0.0001) {
      return realValue.toFixed(8);
    }
    
    if (realValue >= 1e9) {
      return realValue.toExponential(2);
    }
    
    if (realValue >= 1) {
      return realValue.toFixed(2);
    } else {
      return realValue.toFixed(4);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatUSD = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const convertCurrency = (value: number) => {
    if (currency === 'BRL') {
      return value * exchangeRate;
    }
    return value;
  };

  const formatValue = (value: number) => {
    const convertedValue = convertCurrency(value);
    return currency === 'BRL' ? formatCurrency(convertedValue) : formatUSD(convertedValue);
  };

  return (
    <>
      <DashboardStats
        totalBalance={initialTotalBalance}
        transactionCount={initialTransactionCount}
        tokenCount={initialTokenCount}
        exchangeRate={exchangeRate}
        currency={currency}
        onCurrencyChange={handleCurrencyChange}
      />

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <PortfolioSection
          tokens={initialPortfolio?.tokens || []}
          formatTokenBalance={formatTokenBalance}
          formatValue={formatValue}
        />

        <QuickActions />
      </div>

      <RecentTransactions
        transactions={initialHistory?.transactions || []}
      />
    </>
  );
}

