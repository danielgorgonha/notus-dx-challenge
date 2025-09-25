"use client";

import { useState, useCallback } from 'react';
import { notusAPI } from '@/lib/client';
import { FiatDepositQuote, FiatDepositOrder } from '@/types/fiat';
import { useAuth } from '@/contexts/auth-context';
import { useKYCManager } from './use-kyc-manager';

export interface DepositParams {
  amount: string;
  receiveCryptoCurrency: 'USDC' | 'BRZ';
  chainId: number;
  individualId: string;
}

export interface DepositState {
  quote: FiatDepositQuote | null;
  order: FiatDepositOrder | null;
  isLoading: boolean;
  error: string | null;
  step: 'idle' | 'quote' | 'order' | 'completed' | 'error';
}

export function useFiatDeposit() {
  const { user, individualId, walletAddress } = useAuth();
  const kycManager = useKYCManager(walletAddress || '');
  const [state, setState] = useState<DepositState>({
    quote: null,
    order: null,
    isLoading: false,
    error: null,
    step: 'idle'
  });

  // Validar se o usuário pode fazer depósito
  const canDeposit = useCallback((amount?: number) => {
    if (!walletAddress) {
      return { canDeposit: false, reason: 'Carteira não conectada' };
    }
    
    const currentStage = kycManager.getCurrentStage();
    if (currentStage === '0') {
      return { canDeposit: false, reason: 'KYC aprovado necessário para depósitos' };
    }

    // Se um valor foi fornecido, verificar se o nível de KYC permite
    if (amount !== undefined) {
      const currentLimit = kycManager.getCurrentLimit();
      if (amount > currentLimit) {
        return { canDeposit: false, reason: `Valor excede limite de R$ ${currentLimit.toLocaleString()}` };
      }
    }
    
    return { canDeposit: true, reason: null };
  }, [walletAddress, kycManager]);

  // Criar cotação de depósito
  const createQuote = useCallback(async (params: DepositParams): Promise<FiatDepositQuote | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // TODO: Implement real API call when fiat deposit is ready
      throw new Error('Fiat deposit feature is under development');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar cotação';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
        step: 'error'
      }));
      throw error;
    }
  }, [walletAddress, canDeposit]);

  // Criar ordem de depósito
  const createOrder = useCallback(async (quoteId: string, individualId: string, chainId: number) => {
    if (!walletAddress) {
      throw new Error('Carteira não conectada');
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // TODO: Implement real API call when fiat deposit is ready
      throw new Error('Fiat deposit feature is under development');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar ordem';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
        step: 'error'
      }));
      throw error;
    }
  }, [walletAddress]);

  // Fluxo completo de depósito
  const createDeposit = useCallback(async (params: DepositParams) => {
    try {
      // 1. Criar cotação
      const quote = await createQuote(params);
      if (!quote) return null;

      // 2. Criar ordem
      const order = await createOrder(quote.quoteId, params.individualId, params.chainId);
      
      setState(prev => ({ ...prev, step: 'completed' }));
      
      return { quote, order };
    } catch (error) {
      console.error('Erro no fluxo de depósito:', error);
      throw error;
    }
  }, [createQuote, createOrder]);

  // Reset do estado
  const reset = useCallback(() => {
    setState({
      quote: null,
      order: null,
      isLoading: false,
      error: null,
      step: 'idle'
    });
  }, []);

  return {
    ...state,
    canDeposit,
    createQuote,
    createOrder,
    createDeposit,
    reset
  };
}
