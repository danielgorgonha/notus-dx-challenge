/**
 * Dashboard Client Wrapper
 * Componente client que gerencia estado e formatação
 */

"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { DashboardStats } from "./dashboard-stats";
import { PortfolioSection } from "./portfolio-section";
import { QuickActions } from "./quick-actions";
import { RecentTransactions } from "./recent-transactions";
import { DashboardMobileHeader } from "./dashboard-mobile-header";
import { DashboardMobileBalances } from "./dashboard-mobile-balances";
import { DashboardMobileActions } from "./dashboard-mobile-actions";
import { formatTokenBalance as formatTokenBalanceUtil, formatCurrency as formatCurrencyUtil } from "@/lib/utils";
import { getWalletAddress, getPortfolio, getHistory, listSupportedTokens } from "@/lib/actions/dashboard";
import { listPools } from "@/lib/actions/pools";

import { DashboardYieldsSection } from "./dashboard-yields-section";
import { DashboardPoolsSection } from "./dashboard-pools-section";
import { DashboardMarketCapSection } from "./dashboard-market-cap-section";

interface DashboardClientWrapperProps {
  initialTotalBalance: number;
  initialPortfolio: any;
  initialHistory: any;
  initialTransactionCount: number;
  initialTokenCount: number;
  accountAbstractionAddress: string;
  initialPools?: any[];
  initialTokens?: any[];
}

export function DashboardClientWrapper({
  initialTotalBalance,
  initialPortfolio,
  initialHistory,
  initialTransactionCount,
  initialTokenCount,
  accountAbstractionAddress,
  initialPools = [],
  initialTokens = [],
}: DashboardClientWrapperProps) {
  const { user, ready, authenticated } = usePrivy();
  const [currency, setCurrency] = useState<'USD' | 'BRL'>('BRL');
  const [exchangeRate] = useState(5.32);
  
  // Se não tiver accountAbstractionAddress, tentar buscar no cliente
  const needsClientFetch = !accountAbstractionAddress && ready && authenticated && user?.wallet?.address;
  
  // Buscar wallet address no cliente se necessário
  const { data: walletData } = useQuery({
    queryKey: ['wallet-address', user?.wallet?.address],
    queryFn: async () => {
      if (!user?.wallet?.address) return null;
      const data = await getWalletAddress({ externallyOwnedAccount: user.wallet.address });
      return data.wallet;
    },
    enabled: needsClientFetch && !!user?.wallet?.address,
  });
  
  const finalAccountAddress = accountAbstractionAddress || walletData?.accountAbstraction || '';
  
  // Buscar portfolio no cliente se necessário
  const { data: portfolioData } = useQuery({
    queryKey: ['portfolio', finalAccountAddress],
    queryFn: () => getPortfolio(finalAccountAddress),
    enabled: needsClientFetch && !!finalAccountAddress,
  });
  
  // Buscar history no cliente se necessário
  const { data: historyData } = useQuery({
    queryKey: ['history', finalAccountAddress],
    queryFn: () => getHistory(finalAccountAddress, { take: 10 }),
    enabled: needsClientFetch && !!finalAccountAddress,
  });
  
  // Buscar tokens no cliente se necessário
  const { data: tokensData } = useQuery({
    queryKey: ['supported-tokens'],
    queryFn: () => listSupportedTokens({ page: 1, perPage: 50 }),
    enabled: needsClientFetch && (!initialTokens || initialTokens.length === 0),
  });
  
  // Buscar pools no cliente se necessário
  const { data: poolsData } = useQuery({
    queryKey: ['pools'],
    queryFn: () => listPools(),
    enabled: needsClientFetch && (!initialPools || initialPools.length === 0),
  });
  
  // Usar dados do cliente se disponíveis, senão usar dados iniciais
  const portfolio = portfolioData || initialPortfolio;
  const history = historyData || initialHistory;
  const tokens = tokensData?.tokens || initialTokens;
  const pools = poolsData?.pools || initialPools;
  
  // Recalcular totalBalance se portfolio mudou
  const totalBalance = portfolio?.tokens?.reduce((sum: number, token: any) => {
    return sum + parseFloat(token.balanceUsd || '0');
  }, 0) || initialTotalBalance;
  
  const transactionCount = history?.transactions?.length || initialTransactionCount;
  const tokenCount = portfolio?.tokens?.length || initialTokenCount;

  const handleCurrencyChange = (newCurrency: 'USD' | 'BRL') => {
    setCurrency(newCurrency);
  };

  // Funções de formatação usando utilitários centralizados
  const formatTokenBalance = (balance: string | number, decimals: number = 18) => {
    // Se já está formatado (número), converter para string em wei
    if (typeof balance === 'number') {
      const balanceInWei = (balance * Math.pow(10, decimals)).toString();
      return formatTokenBalanceUtil(balanceInWei, decimals);
    }
    return formatTokenBalanceUtil(balance, decimals);
  };

  const formatCurrency = (value: number) => {
    return formatCurrencyUtil(value, 'BRL', 'pt-BR');
  };

  const formatUSD = (value: number) => {
    return formatCurrencyUtil(value, 'USD', 'en-US');
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

  // Calcular saldos de BRZ e USDC usando portfolio atualizado
  const getTokenData = (symbol: string) => {
    const token = portfolio?.tokens?.find((t: any) => 
      t.symbol?.toUpperCase() === symbol.toUpperCase()
    );
    return {
      balance: token ? parseFloat(token.balanceUsd || '0') : 0,
      token: token || null
    };
  };

  const brzData = getTokenData('BRZ');
  const usdcData = getTokenData('USDC');
  const [showBalance, setShowBalance] = useState(true);
  const [headerHeight, setHeaderHeight] = useState(220);
  
  // Debug: Log quando dados são buscados no cliente
  useEffect(() => {
    if (needsClientFetch) {
      console.log('🔄 DashboardClientWrapper: Buscando dados no cliente...', {
        hasWalletAddress: !!user?.wallet?.address,
        hasWalletData: !!walletData,
        hasPortfolio: !!portfolioData,
        hasHistory: !!historyData,
        accountAddress: finalAccountAddress,
      });
    }
  }, [needsClientFetch, walletData, portfolioData, historyData, finalAccountAddress, user]);

  // Ajustar altura do espaçador baseado no scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      setHeaderHeight(scrollY > 50 ? 70 : 220);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Layout Mobile */}
      <div className="lg:hidden">
        <DashboardMobileHeader
          totalBalance={totalBalance}
          currency={currency}
          onCurrencyChange={handleCurrencyChange}
          exchangeRate={exchangeRate}
          showBalance={showBalance}
          onToggleBalance={setShowBalance}
        />

        {/* Espaçador para compensar header fixo - altura dinâmica baseada no scroll */}
        <div 
          className="transition-all duration-300 lg:h-0" 
          style={{ height: `${headerHeight}px` }}
          id="dashboard-header-spacer" 
        />

        <DashboardMobileBalances
          brzBalance={brzData.balance}
          usdcBalance={usdcData.balance}
          formatValue={formatValue}
          showBalance={showBalance}
          brzToken={brzData.token}
          usdcToken={usdcData.token}
        />

        <DashboardMobileActions />

        {/* Seções adicionais */}
        <DashboardYieldsSection />
        <DashboardPoolsSection pools={pools} />
        <DashboardMarketCapSection tokens={tokens} />
      </div>

      {/* Layout Desktop */}
      <div className="hidden lg:block space-y-4 sm:space-y-6 lg:space-y-8">
        <DashboardStats
          totalBalance={totalBalance}
          transactionCount={transactionCount}
          tokenCount={tokenCount}
          exchangeRate={exchangeRate}
          currency={currency}
          onCurrencyChange={handleCurrencyChange}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <PortfolioSection
            tokens={portfolio?.tokens || []}
            formatTokenBalance={formatTokenBalance}
            formatValue={formatValue}
          />

          <QuickActions />
        </div>

        <RecentTransactions
          transactions={history?.transactions || []}
        />
      </div>
    </>
  );
}

