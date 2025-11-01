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
import { DashboardHeader } from "./dashboard-header";

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
  const { data: walletData, isLoading: isLoadingWallet } = useQuery({
    queryKey: ['wallet-address', user?.wallet?.address],
    queryFn: async () => {
      if (!user?.wallet?.address) return null;
      try {
        const data = await getWalletAddress({ externallyOwnedAccount: user.wallet.address });
        return data?.wallet || null;
      } catch (error) {
        console.error('Error fetching wallet address in client:', error);
        return null;
      }
    },
    enabled: needsClientFetch && !!user?.wallet?.address,
    retry: 1,
    retryDelay: 1000,
  });
  
  const finalAccountAddress = accountAbstractionAddress || walletData?.accountAbstraction || '';
  const hasFinalAddress = !!finalAccountAddress && (!needsClientFetch || !isLoadingWallet);
  
  // Buscar portfolio no cliente se necessário
  const { data: portfolioData } = useQuery({
    queryKey: ['portfolio', finalAccountAddress],
    queryFn: async () => {
      if (!finalAccountAddress) return null;
      try {
        return await getPortfolio(finalAccountAddress);
      } catch (error) {
        console.error('Error fetching portfolio in client:', error);
        return null;
      }
    },
    enabled: hasFinalAddress,
    retry: 1,
    retryDelay: 1000,
  });
  
  // Buscar history no cliente se necessário
  const { data: historyData } = useQuery({
    queryKey: ['history', finalAccountAddress],
    queryFn: async () => {
      if (!finalAccountAddress) return null;
      try {
        return await getHistory(finalAccountAddress, { take: 10 });
      } catch (error) {
        console.error('Error fetching history in client:', error);
        return null;
      }
    },
    enabled: hasFinalAddress,
    retry: 1,
    retryDelay: 1000,
  });
  
  // Buscar tokens no cliente se necessário
  const { data: tokensData } = useQuery({
    queryKey: ['supported-tokens'],
    queryFn: async () => {
      try {
        return await listSupportedTokens({ page: 1, perPage: 50 });
      } catch (error) {
        console.error('Error fetching tokens in client:', error);
        return { tokens: [], total: 0 };
      }
    },
    enabled: needsClientFetch && (!initialTokens || initialTokens.length === 0),
    retry: 1,
    retryDelay: 1000,
  });
  
  // Buscar pools no cliente se necessário
  const { data: poolsData } = useQuery({
    queryKey: ['pools'],
    queryFn: async () => {
      try {
        return await listPools();
      } catch (error) {
        console.error('Error fetching pools in client:', error);
        return { pools: [], total: 0 };
      }
    },
    enabled: needsClientFetch && (!initialPools || initialPools.length === 0),
    retry: 1,
    retryDelay: 1000,
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
        {/* Header Desktop */}
        {user?.email && (
          <DashboardHeader 
            userEmail={typeof user.email === 'string' ? user.email : user.email?.address}
          />
        )}
        
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

