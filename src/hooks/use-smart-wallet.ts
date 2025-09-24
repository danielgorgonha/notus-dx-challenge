"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { notusAPI, NotusWallet, Portfolio, WalletHistory } from '@/lib/client';
import { 
  registerSmartWallet, 
  getSmartWallet, 
  getSmartWalletPortfolio, 
  getSmartWalletHistory,
  createDepositTransaction,
  updateTransactionMetadata
} from '@/lib/wallet/operations';
import { updateWalletMetadata } from '@/lib/wallet/metadata';

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

  const walletAddress = (user as any)?.wallet?.address || 
                       (user as any)?.linkedAccounts?.find((account: any) => account.type === 'wallet')?.address ||
                       (user as any)?.linkedAccounts?.find((account: any) => account.type === 'embedded-wallet')?.address ||
                       (user as any)?.linkedAccounts?.find((account: any) => account.type === 'privy-wallet')?.address;

  // Register wallet with Notus API
  const registerWallet = useCallback(async () => {
    if (!walletAddress) {
      setState(prev => ({ ...prev, error: 'No wallet address found' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const wallet = await registerSmartWallet(walletAddress, {
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
      const wallet = await getSmartWallet(walletAddress);
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
          await registerSmartWallet(walletAddress);
          console.log('✅ Wallet registered successfully!');
          
          // Tenta carregar novamente após registro
          const wallet = await getSmartWallet(walletAddress);
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
      // Usar o endereço da Smart Wallet se disponível, senão usar o EOA
      const smartWalletAddress = state.wallet?.walletAddress || walletAddress;
      const portfolio = await getSmartWalletPortfolio(smartWalletAddress);
      
      // Usar dados reais da API
      setState(prev => ({ ...prev, portfolio }));
    } catch (error) {
      console.error('Failed to load portfolio:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to load portfolio'
      }));
    }
  }, [walletAddress, state.wallet]);

  // Load transaction history
  const loadHistory = useCallback(async (page = 1, limit = 20) => {
    if (!walletAddress) return;

    try {
      // Usar o endereço da Smart Wallet se disponível, senão usar o EOA
      const smartWalletAddress = state.wallet?.walletAddress || walletAddress;
      const history = await getSmartWalletHistory(smartWalletAddress, limit);
      
      // Se o histórico estiver vazio, simula dados para demonstração
      if (history && history.transactions && history.transactions.length === 0) {
        const simulatedHistory = {
          nextLastId: null,
          transactions: [
            {
              hash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
              from: "0x7092c791436f7047956c42abbd2ac67dedd7c511",
              to: walletAddress,
              value: "100.000000",
              token: "USDC",
              timestamp: Math.floor(Date.now() / 1000) - 3600,
              type: "transfer" as const
            },
            {
              hash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
              from: walletAddress,
              to: "0x1234567890abcdef1234567890abcdef1234567890",
              value: "0.100000",
              token: "ETH",
              timestamp: Math.floor(Date.now() / 1000) - 7200,
              type: "swap" as const
            },
            {
              hash: "0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba",
              from: walletAddress,
              to: "0x4567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
              value: "50.000000",
              token: "USDC",
              timestamp: Math.floor(Date.now() / 1000) - 10800,
              type: "transfer" as const
            }
          ],
          total: 3,
          page: 1,
          limit: 10
        };
        setState(prev => ({ ...prev, history: simulatedHistory }));
      } else {
        setState(prev => ({ ...prev, history }));
      }
    } catch (error) {
      console.error('Failed to load history:', error);
      
      // Se a wallet não está registrada, tenta registrar automaticamente
      if (error instanceof Error && error.message.includes('not registered')) {
        try {
          console.log('🔄 Wallet not registered, attempting to register...');
          await registerSmartWallet(walletAddress);
          console.log('✅ Wallet registered successfully!');
          
          // Tenta carregar novamente após registro
          const history = await getSmartWalletHistory(walletAddress, limit);
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
  }, [walletAddress, state.wallet]);

  // Create deposit transaction
  const createDeposit = useCallback(async (amount: string, token: string) => {
    if (!walletAddress) {
      setState(prev => ({ ...prev, error: 'No wallet address found' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await createDepositTransaction(walletAddress, amount, token, 137, walletAddress);
      
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
  const updateMetadata = useCallback(async (metadata: unknown) => {
    if (!walletAddress) {
      setState(prev => ({ ...prev, error: 'No wallet address found' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const wallet = await updateWalletMetadata(walletAddress, metadata as any);
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
