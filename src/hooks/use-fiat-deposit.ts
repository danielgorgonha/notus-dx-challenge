"use client";

import { useState, useCallback } from 'react';
import { 
  FiatDepositQuote, 
  FiatDepositOrder, 
  PixDepositDetails, 
  DepositStatus,
  DepositCurrency 
} from '@/types/fiat';
import { useKYCManager } from './use-kyc-manager';
import { useSmartWallet } from './use-smart-wallet';
import {
  getDepositCurrencies,
  createDepositQuote,
  createDepositOrder,
  getDepositPixDetails,
  getDepositStatus,
} from '@/lib/actions/fiat';

export interface DepositParams {
  amount: string;
  sendFiatCurrency: 'BRL' | 'USD';
  receiveCryptoCurrency: 'USDC' | 'BRZ';
  chainId: number;
  individualId: string;
}

export interface DepositState {
  currencies: DepositCurrency[];
  quote: FiatDepositQuote | null;
  order: FiatDepositOrder | null;
  pixDetails: PixDepositDetails | null;
  status: DepositStatus | null;
  isLoading: boolean;
  error: string | null;
  step: 'idle' | 'currencies' | 'quote' | 'order' | 'pix' | 'completed' | 'error';
}

export function useFiatDeposit() {
  const { wallet } = useSmartWallet();
  const walletAddress = wallet?.accountAbstraction;
  const kycManager = useKYCManager(walletAddress || '');
  const [state, setState] = useState<DepositState>({
    currencies: [],
    quote: null,
    order: null,
    pixDetails: null,
    status: null,
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

  // Carregar moedas disponíveis
  const loadCurrencies = useCallback(async (): Promise<DepositCurrency[]> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const currencies = await getDepositCurrencies() as DepositCurrency[];
      setState(prev => ({ ...prev, currencies, step: 'currencies', isLoading: false }));
      return currencies;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar moedas';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
        step: 'error'
      }));
      throw error;
    }
  }, []);

  // Criar cotação de depósito
  const createQuote = useCallback(async (params: DepositParams): Promise<FiatDepositQuote | null> => {
    if (!walletAddress) {
      throw new Error('Carteira não conectada');
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const quote = await createDepositQuote({
        paymentMethodToSend: 'PIX',
        amountToSendInFiatCurrency: params.amount,
        sendFiatCurrency: params.sendFiatCurrency,
        receiveCryptoCurrency: params.receiveCryptoCurrency,
        individualId: params.individualId,
        chainId: params.chainId,
        walletAddress: walletAddress,
      }) as FiatDepositQuote;
      
      setState(prev => ({ ...prev, quote, step: 'quote', isLoading: false }));
      return quote;
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
  }, [walletAddress]);

  // Criar ordem de depósito
  const createOrder = useCallback(async (quoteId: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const order = await createDepositOrder({
        quoteId,
      }) as FiatDepositOrder;
      
      setState(prev => ({ ...prev, order, step: 'order', isLoading: false }));
      return order;
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
  }, []);

  // Obter detalhes PIX
  const getPixDetails = useCallback(async (orderId: string): Promise<PixDepositDetails | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const pixDetails = await getDepositPixDetails(orderId) as PixDepositDetails;
      setState(prev => ({ ...prev, pixDetails, step: 'pix', isLoading: false }));
      return pixDetails;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao obter detalhes PIX';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
        step: 'error'
      }));
      throw error;
    }
  }, []);

  // Verificar status do depósito
  const checkDepositStatus = useCallback(async (orderId: string): Promise<DepositStatus | null> => {
    try {
      const status = await getDepositStatus(orderId) as DepositStatus;
      setState(prev => ({ ...prev, status }));
      return status;
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      return null;
    }
  }, []);

  // Fluxo completo de depósito
  const createDeposit = useCallback(async (params: DepositParams) => {
    try {
      // 1. Criar cotação
      const quote = await createQuote(params);
      if (!quote) return null;

      // 2. Criar ordem
      const order = await createOrder(quote.quoteId);
      if (!order) return null;

      // 3. Obter detalhes PIX
      const pixDetails = await getPixDetails(order.orderId);
      
      setState(prev => ({ ...prev, step: 'completed' }));
      
      return { quote, order, pixDetails };
    } catch (error) {
      console.error('Erro no fluxo de depósito:', error);
      throw error;
    }
  }, [createQuote, createOrder, getPixDetails]);

  // Reset do estado
  const reset = useCallback(() => {
    setState({
      currencies: [],
      quote: null,
      order: null,
      pixDetails: null,
      status: null,
      isLoading: false,
      error: null,
      step: 'idle'
    });
  }, []);

  return {
    ...state,
    canDeposit,
    loadCurrencies,
    createQuote,
    createOrder,
    getPixDetails,
    checkDepositStatus,
    createDeposit,
    reset
  };
}
