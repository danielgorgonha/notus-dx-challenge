"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { notusAPI, NotusWallet, Portfolio, NotusWalletHistory } from '@/lib/api/notus';

export interface SmartWalletState {
  wallet: NotusWallet | null;
  portfolio: Portfolio | null;
  history: NotusWalletHistory | null;
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

  const walletAddress = user?.wallet?.address || 
                       user?.linkedAccounts?.find(account => account.type === 'wallet')?.address ||
                       user?.linkedAccounts?.find(account => account.type === 'embedded-wallet')?.address ||
                       user?.linkedAccounts?.find(account => account.type === 'privy-wallet')?.address;

  // Register wallet with Notus API
  const registerWallet = useCallback(async () => {
    if (!walletAddress) {
      setState(prev => ({ ...prev, error: 'No wallet address found' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const wallet = await notusAPI.registerSmartWallet(walletAddress, {
        name: 'Notus DX Challenge Wallet',
        description: 'Smart wallet for testing Notus API functionality',
      });

      setState(prev => ({ 
        ...prev, 
        wallet, 
        isRegistered: true, 
        loading: false 
      }));

      // Load portfolio and history after registration
      await Promise.all([
        loadPortfolio(),
        loadHistory(),
      ]);

    } catch (error) {
      console.error('Failed to register wallet:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to register wallet',
        loading: false 
      }));
    }
  }, [walletAddress]);

  // Load wallet information
  const loadWallet = useCallback(async () => {
    if (!walletAddress) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const wallet = await notusAPI.getSmartWallet(walletAddress);
      setState(prev => ({ 
        ...prev, 
        wallet, 
        isRegistered: true, 
        loading: false 
      }));
    } catch (error) {
      console.error('Failed to load wallet:', error);
      
      // Se a wallet não está registrada, tenta registrar automaticamente
      if (error instanceof Error && error.message.includes('not registered')) {
        try {
          console.log('🔄 Wallet not registered, attempting to register...');
          await notusAPI.registerSmartWallet(walletAddress);
          console.log('✅ Wallet registered successfully!');
          
          // Tenta carregar novamente após registro
          const wallet = await notusAPI.getSmartWallet(walletAddress);
          setState(prev => ({ 
            ...prev, 
            wallet, 
            isRegistered: true, 
            loading: false 
          }));
          return;
        } catch (registerError) {
          console.error('Failed to register wallet:', registerError);
        }
      }
      
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to load wallet',
        loading: false,
        isRegistered: false
      }));
    }
  }, [walletAddress]);

  // Load portfolio
  const loadPortfolio = useCallback(async () => {
    if (!walletAddress) return;

    try {
      const portfolio = await notusAPI.getSmartWalletPortfolio(walletAddress);
      setState(prev => ({ ...prev, portfolio }));
    } catch (error) {
      console.error('Failed to load portfolio:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to load portfolio'
      }));
    }
  }, [walletAddress]);

  // Load transaction history
  const loadHistory = useCallback(async (page = 1, limit = 20) => {
    if (!walletAddress) return;

    try {
      const history = await notusAPI.getSmartWalletHistory(walletAddress, page, limit);
      setState(prev => ({ ...prev, history }));
    } catch (error) {
      console.error('Failed to load history:', error);
      
      // Se a wallet não está registrada, tenta registrar automaticamente
      if (error instanceof Error && error.message.includes('not registered')) {
        try {
          console.log('🔄 Wallet not registered, attempting to register...');
          await notusAPI.registerSmartWallet(walletAddress);
          console.log('✅ Wallet registered successfully!');
          
          // Tenta carregar novamente após registro
          const history = await notusAPI.getSmartWalletHistory(walletAddress, page, limit);
          setState(prev => ({ ...prev, history }));
          return;
        } catch (registerError) {
          console.error('Failed to register wallet:', registerError);
        }
      }
      
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to load history'
      }));
    }
  }, [walletAddress]);

  // Create deposit transaction
  const createDeposit = useCallback(async (amount: string, token: string) => {
    if (!walletAddress) {
      setState(prev => ({ ...prev, error: 'No wallet address found' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await notusAPI.createDepositTransaction(walletAddress, amount, token);
      
      // Reload portfolio and history after deposit
      await Promise.all([
        loadPortfolio(),
        loadHistory(),
      ]);

      setState(prev => ({ ...prev, loading: false }));
      return result;
    } catch (error) {
      console.error('Failed to create deposit:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to create deposit',
        loading: false 
      }));
    }
  }, [walletAddress, loadPortfolio, loadHistory]);

  // Update wallet metadata
  const updateMetadata = useCallback(async (metadata: any) => {
    if (!walletAddress) {
      setState(prev => ({ ...prev, error: 'No wallet address found' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const wallet = await notusAPI.updateWalletMetadata(walletAddress, metadata);
      setState(prev => ({ ...prev, wallet, loading: false }));
    } catch (error) {
      console.error('Failed to update metadata:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to update metadata',
        loading: false 
      }));
    }
  }, [walletAddress]);

  // Auto-load wallet data when wallet address changes
  useEffect(() => {
    if (walletAddress) {
      loadWallet();
    } else {
      setState({
        wallet: null,
        portfolio: null,
        history: null,
        loading: false,
        error: null,
        isRegistered: false,
      });
    }
  }, [walletAddress, loadWallet]);

  return {
    ...state,
    walletAddress,
    registerWallet,
    loadWallet,
    loadPortfolio,
    loadHistory,
    createDeposit,
    updateMetadata,
  };
}
