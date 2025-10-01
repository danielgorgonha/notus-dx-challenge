"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { TrendingUp, Activity, Zap, ArrowRightLeft, Wallet, Droplets, Shield, Loader2 } from "lucide-react";
import { useSmartWallet } from "@/hooks/use-smart-wallet";
import { usePrivy } from "@privy-io/react-auth";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useQuery } from "@tanstack/react-query";
import { clientWalletActions, clientBlockchainActions } from "@/lib/api/client-side";
import { useState, useEffect } from "react";

export default function DashboardPage() {
  const { user } = usePrivy();
  const { wallet } = useSmartWallet();
  const [totalBalance, setTotalBalance] = useState(0);
  const [portfolioData, setPortfolioData] = useState<any>(null);
  const [transactionHistory, setTransactionHistory] = useState<any>(null);

  // Usar accountAbstractionAddress do useSmartWallet hook
  const accountAbstractionAddress = wallet?.accountAbstraction;


  // Query para buscar portfolio da wallet
  const { data: portfolio, isLoading: portfolioLoading, error: portfolioError } = useQuery({
    queryKey: ['portfolio', accountAbstractionAddress],
    queryFn: () => clientWalletActions.getPortfolio(accountAbstractionAddress || ''),
    enabled: !!accountAbstractionAddress,
    refetchInterval: 30000, // Refetch a cada 30 segundos
  });

  // Query para buscar histórico de transações
  const { data: history, isLoading: historyLoading, error: historyError } = useQuery({
    queryKey: ['history', accountAbstractionAddress],
    queryFn: () => clientWalletActions.getHistory(accountAbstractionAddress || '', { take: 10 }),
    enabled: !!accountAbstractionAddress,
    refetchInterval: 30000, // Refetch a cada 30 segundos
  });

  // Query para buscar tokens suportados
  const { data: tokens, isLoading: tokensLoading } = useQuery({
    queryKey: ['tokens'],
    queryFn: () => clientBlockchainActions.listTokens(1, 50),
    refetchInterval: 60000, // Refetch a cada 1 minuto
  });

  // Calcular total balance quando portfolio for carregado
  useEffect(() => {
    if (portfolio && typeof portfolio === 'object' && portfolio !== null) {
      if ('tokens' in portfolio && Array.isArray(portfolio.tokens)) {
        const total = portfolio.tokens.reduce((sum: number, token: any) => {
          return sum + parseFloat(token.balanceUsd || '0');
        }, 0);
        setTotalBalance(total);
        setPortfolioData(portfolio);
      }
    }
  }, [portfolio]);

  // Atualizar histórico quando dados chegarem
  useEffect(() => {
    if (history && typeof history === 'object' && history !== null) {
      if ('transactions' in history && Array.isArray(history.transactions)) {
        setTransactionHistory(history);
      }
    }
  }, [history]);

  return (
    <ProtectedRoute>
      <AppLayout 
        title="Dashboard"
        description="Testing Notus API - Authentication, Transfers, Swaps, and Liquidity Pools"
      >
        <div className="space-y-8">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-emerald-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {portfolioLoading ? (
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
              ) : (
                `$${totalBalance.toFixed(2)}`
              )}
            </div>
            <div className="text-slate-400 text-sm mb-1">Total Balance</div>
            <div className="text-emerald-400 text-sm">
              {portfolioData?.totalValueUSD ? `$${portfolioData.totalValueUSD}` : 'Loading...'}
            </div>
          </div>

          <div className="glass-card text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {historyLoading ? (
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
              ) : (
                transactionHistory?.transactions?.length || 0
              )}
            </div>
            <div className="text-slate-400 text-sm mb-1">Total Transactions</div>
                   <div className="text-blue-400 text-sm">
                     {accountAbstractionAddress ? 
                       `${accountAbstractionAddress.slice(0, 6)}...${accountAbstractionAddress.slice(-4)}` : 
                       'No wallet'
                     }
                   </div>
          </div>

          <div className="glass-card text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {portfolioLoading ? (
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
              ) : (
                portfolioData?.tokens?.length || 0
              )}
            </div>
            <div className="text-slate-400 text-sm mb-1">Tokens in Portfolio</div>
            <div className="text-emerald-400 text-sm">
              {tokensLoading ? 'Loading...' : `${(tokens && typeof tokens === 'object' && tokens !== null && 'tokens' in tokens && Array.isArray(tokens.tokens)) ? tokens.tokens.length : 0} supported`}
            </div>
          </div>
        </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Portfolio */}
        <div className="glass-card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Portfolio</h2>
            <Button variant="ghost" className="text-blue-400 hover:text-blue-300">
              View All
            </Button>
          </div>
          
          <div className="space-y-4">
            {portfolioLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
                <span className="ml-2 text-slate-400">Loading portfolio...</span>
              </div>
            ) : portfolioError ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-red-400 text-center">
                  <div className="font-semibold">Error loading portfolio</div>
                  <div className="text-sm text-slate-400 mt-1">
                    {portfolioError instanceof Error ? portfolioError.message : 'Unknown error'}
                  </div>
                </div>
              </div>
            ) : portfolioData?.tokens?.length > 0 ? (
              portfolioData.tokens.slice(0, 3).map((token: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                      {token.symbol?.slice(0, 4) || 'TOK'}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{token.name || 'Unknown Token'}</div>
                      <div className="text-slate-400 text-sm">
                        {parseFloat(token.balance || '0').toFixed(4)} {token.symbol || 'TOK'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-white">
                      ${parseFloat(token.balanceUsd || '0').toFixed(2)}
                    </div>
                    <div className="text-emerald-400 text-sm">
                      {token.symbol || 'TOK'}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center p-8">
                <div className="text-slate-400 text-center">
                  <div className="font-semibold">No tokens found</div>
                  <div className="text-sm mt-1">Your portfolio is empty</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-card">
          <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Button className="h-24 flex flex-col items-center justify-center bg-blue-600/10 border border-blue-500/20 hover:bg-blue-600/20">
              <ArrowRightLeft className="h-8 w-8 text-blue-400 mb-2" />
              <span className="font-semibold text-white">Swap</span>
              <span className="text-xs text-slate-400">Exchange tokens</span>
            </Button>

            <Button className="h-24 flex flex-col items-center justify-center bg-emerald-600/10 border border-emerald-500/20 hover:bg-emerald-600/20">
              <Wallet className="h-8 w-8 text-emerald-400 mb-2" />
              <span className="font-semibold text-white">Send</span>
              <span className="text-xs text-slate-400">Transfer tokens</span>
            </Button>

            <Button className="h-24 flex flex-col items-center justify-center bg-purple-600/10 border border-purple-500/20 hover:bg-purple-600/20">
              <Droplets className="h-8 w-8 text-purple-400 mb-2" />
              <span className="font-semibold text-white">Pool</span>
              <span className="text-xs text-slate-400">Add liquidity</span>
            </Button>

            <Button className="h-24 flex flex-col items-center justify-center bg-yellow-600/10 border border-yellow-500/20 hover:bg-yellow-600/20">
              <Shield className="h-8 w-8 text-yellow-400 mb-2" />
              <span className="font-semibold text-white">KYC</span>
              <span className="text-xs text-slate-400">Verify identity</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="glass-card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Recent Transactions</h2>
          <Button variant="ghost" className="text-blue-400 hover:text-blue-300">
            View All
          </Button>
        </div>

        <div className="space-y-4">
          {historyLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
              <span className="ml-2 text-slate-400">Loading transactions...</span>
            </div>
          ) : historyError ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-red-400 text-center">
                <div className="font-semibold">Error loading transactions</div>
                <div className="text-sm text-slate-400 mt-1">
                  {historyError instanceof Error ? historyError.message : 'Unknown error'}
                </div>
              </div>
            </div>
          ) : transactionHistory?.transactions?.length > 0 ? (
            transactionHistory.transactions.slice(0, 5).map((transaction: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-emerald-600/20 rounded-full flex items-center justify-center mr-3">
                    {transaction.type === 'swap' ? (
                      <ArrowRightLeft className="h-5 w-5 text-emerald-400" />
                    ) : transaction.type === 'liquidity' ? (
                      <Droplets className="h-5 w-5 text-blue-400" />
                    ) : (
                      <Activity className="h-5 w-5 text-purple-400" />
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-white">
                      {transaction.type?.charAt(0).toUpperCase() + transaction.type?.slice(1) || 'Transaction'}
                    </div>
                    <div className="text-slate-400 text-sm">
                      {transaction.createdAt ? 
                        new Date(transaction.createdAt).toLocaleString() : 
                        'Unknown time'
                      }
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-white">
                    {transaction.amount ? `${transaction.amount} ${transaction.token || ''}` : 'N/A'}
                  </div>
                  <div className="text-slate-400 text-sm">
                    {transaction.status || 'Unknown status'}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center p-8">
              <div className="text-slate-400 text-center">
                <div className="font-semibold">No transactions found</div>
                <div className="text-sm mt-1">Your transaction history is empty</div>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </AppLayout>
    </ProtectedRoute>
  );
}
