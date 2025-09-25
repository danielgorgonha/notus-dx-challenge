"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { walletActions } from '@/lib/actions';

// Tipos simplificados
export interface NotusWallet {
  walletAddress: string;
  accountAbstraction: string;
  factory: string;
  implementation: string;
  deployedChains: number[];
  salt: string;
  registeredAt: string | null;
  metadata?: {
    name?: string;
    description?: string;
  };
}

export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  balance: string;
  balanceUSD: string;
}

export interface Portfolio {
  tokens: Token[];
  totalValueUSD: string;
}

export interface Transaction {
  id: string;
  hash: string;
  type: string;
  status: string;
  amount: string;
  token: string;
  from: string;
  to: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface WalletHistory {
  transactions: Transaction[];
  total: number;
  page: number;
  limit: number;
}

export interface SmartWalletState {
  wallet: NotusWallet | null;
  portfolio: Portfolio | null;
  history: WalletHistory | null;
  loading: boolean;
  error: string | null;
  isRegistered: boolean;
}

export function useSmartWallet() {
  const { user } = useAuth();
  const [state, setState] = useState<SmartWalletState>({
    wallet: null,
    portfolio: null,
    history: null,
    loading: false,
    error: null,
    isRegistered: false,
  });

  const walletAddress = (user as any)?.wallet?.address;

  // Carregar dados da wallet quando o usuário estiver disponível
  useEffect(() => {
    if (walletAddress) {
      loadWallet();
    }
  }, [walletAddress]);

  // Carregar dados da wallet
  const loadWallet = useCallback(async () => {
    if (!walletAddress) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Verificar se a wallet está registrada
      const response = await walletActions.getAddress({ externallyOwnedAccount: walletAddress });
      const walletData = response.wallet;

      if (walletData.registeredAt) {
        // Wallet já registrada
        setState(prev => ({ 
          ...prev, 
          wallet: {
            walletAddress,
            accountAbstraction: walletData.accountAbstraction,
            factory: '0x7a1dbab750f12a90eb1b60d2ae3ad17d4d81effe',
            implementation: '',
            deployedChains: [],
            salt: '0',
            registeredAt: walletData.registeredAt,
          } as NotusWallet,
          isRegistered: true, 
          loading: false 
        }));
      } else {
        // Wallet não registrada
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

  // Registrar wallet
  const registerWallet = useCallback(async () => {
    if (!walletAddress) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await walletActions.register({
        externallyOwnedAccount: walletAddress,
        metadata: {
          name: 'Notus DX Challenge Wallet',
          description: 'Smart wallet for testing Notus API functionality',
        },
      });

      // Recarregar dados após registro
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
      const portfolio = await walletActions.getPortfolio(state.wallet.accountAbstraction);
      setState(prev => ({ ...prev, portfolio: portfolio as Portfolio }));
    } catch (error) {
      console.error('Failed to load portfolio:', error);
    }
  }, [walletAddress, state.wallet]);

  // Carregar histórico
  const loadHistory = useCallback(async (limit: number = 10) => {
    if (!walletAddress || !state.wallet) return;

    try {
      const history = await walletActions.getHistory(state.wallet.accountAbstraction, { take: limit });
      setState(prev => ({ ...prev, history: history as WalletHistory }));
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  }, [walletAddress, state.wallet]);

  // Atualizar metadata
  const updateMetadata = useCallback(async (metadata: Record<string, unknown>) => {
    if (!walletAddress || !state.wallet) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await walletActions.updateMetadata(state.wallet.accountAbstraction, metadata);
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
    registerWallet,
    loadPortfolio,
    loadHistory,
    updateMetadata,
  };
}