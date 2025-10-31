/**
 * useWalletUI Hook
 * Hook simplificado apenas para gerenciar estado de UI
 * Toda lógica de negócio foi movida para Server Actions e Use Cases
 */

"use client";

import { useState, useEffect, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { getWalletAddress, registerWallet, getPortfolio, getHistory } from '@/lib/actions/dashboard';
import { updateMetadata } from '@/lib/actions/wallet';

export interface WalletUIState {
  wallet: {
    walletAddress: string;
    accountAbstraction: string;
    registeredAt: string | null;
  } | null;
  portfolio: {
    tokens: Array<{
      address: string;
      symbol: string;
      name: string;
      balance: string;
      balanceUSD: string;
    }>;
    totalValueUSD: string;
  } | null;
  history: {
    transactions: Array<{
      id: string;
      hash: string;
      type: string;
      status: string;
      amount: string;
      timestamp: string;
    }>;
  } | null;
  loading: boolean;
  error: string | null;
  isRegistered: boolean;
}

export function useWalletUI() {
  const { user } = usePrivy();
  const [state, setState] = useState<WalletUIState>({
    wallet: null,
    portfolio: null,
    history: null,
    loading: false,
    error: null,
    isRegistered: false,
  });

  const walletAddress = (user as { wallet?: { address: string } })?.wallet?.address;

  // Carregar dados da wallet
  const loadWallet = useCallback(async () => {
    if (!walletAddress) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const walletData = await getWalletAddress({ externallyOwnedAccount: walletAddress }) as any;
      const accountAbstraction = walletData.accountAbstraction || walletData.wallet?.accountAbstraction;
      const registeredAt = walletData.registeredAt || walletData.wallet?.registeredAt;

      if (accountAbstraction) {
        setState(prev => ({ 
          ...prev, 
          wallet: {
            walletAddress,
            accountAbstraction,
            registeredAt: registeredAt || null,
          },
          isRegistered: !!registeredAt, 
          loading: false 
        }));
      } else {
        setState(prev => ({ 
          ...prev, 
          wallet: null,
          isRegistered: false, 
          loading: false 
        }));
      }
    } catch (error) {
      console.error('Failed to load wallet:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to load wallet',
        loading: false 
      }));
    }
  }, [walletAddress]);

  // Carregar wallet quando usuário estiver disponível
  useEffect(() => {
    if (walletAddress) {
      loadWallet();
    }
  }, [walletAddress, loadWallet]);

  // Registrar wallet
  const handleRegisterWallet = useCallback(async () => {
    if (!walletAddress) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await registerWallet({
        externallyOwnedAccount: walletAddress,
        factory: '0x7a1dbab750f12a90eb1b60d2ae3ad17d4d81effe',
        salt: '0'
      });

      await loadWallet();
    } catch (error) {
      console.error('Failed to register wallet:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to register wallet',
        loading: false 
      }));
    }
  }, [walletAddress, loadWallet]);

  // Carregar portfolio
  const loadPortfolio = useCallback(async () => {
    if (!walletAddress || !state.wallet) return;

    try {
      const portfolio = await getPortfolio(state.wallet.accountAbstraction);
      setState(prev => ({ ...prev, portfolio: portfolio as WalletUIState['portfolio'] }));
    } catch (error) {
      console.error('Failed to load portfolio:', error);
    }
  }, [walletAddress, state.wallet]);

  // Carregar histórico
  const loadHistory = useCallback(async (limit: number = 10) => {
    if (!walletAddress || !state.wallet) return;

    try {
      const history = await getHistory(state.wallet.accountAbstraction, { take: limit });
      setState(prev => ({ ...prev, history: history as WalletUIState['history'] }));
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  }, [walletAddress, state.wallet]);

  // Atualizar metadata
  const handleUpdateMetadata = useCallback(async (metadata: Record<string, unknown>) => {
    if (!walletAddress || !state.wallet) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await updateMetadata(state.wallet.accountAbstraction, metadata);
      setState(prev => ({ ...prev, loading: false }));
    } catch (error) {
      console.error('Failed to update metadata:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to update metadata',
        loading: false 
      }));
    }
  }, [walletAddress, state.wallet]);

  return {
    ...state,
    loadWallet,
    registerWallet: handleRegisterWallet,
    loadPortfolio,
    loadHistory,
    updateMetadata: handleUpdateMetadata,
  };
}

