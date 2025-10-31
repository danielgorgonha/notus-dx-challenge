/**
 * Fiat Service
 * Serviço de domínio para operações fiat
 */

import { FiatAdapter } from '../adapters/fiat.adapter';
import type {
  DepositCurrency,
  DepositQuote,
  DepositOrder,
  PixDetails,
  CreateDepositQuoteParams,
  CreateDepositOrderParams,
} from '@/shared/types/fiat.types';

export class FiatService {
  constructor(private adapter: FiatAdapter) {}

  /**
   * Lista moedas disponíveis para depósito
   */
  async getDepositCurrencies(): Promise<DepositCurrency[]> {
    return this.adapter.getDepositCurrencies();
  }

  /**
   * Cria quote para depósito fiat
   */
  async createDepositQuote(params: CreateDepositQuoteParams): Promise<DepositQuote> {
    // Validações
    if (!params.walletAddress) {
      throw new Error('Wallet address is required');
    }

    if (!params.individualId) {
      throw new Error('Individual ID is required (KYC Level 2 required)');
    }

    if (!params.amountToSendInFiatCurrency || parseFloat(params.amountToSendInFiatCurrency) <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    if (!params.sendFiatCurrency) {
      throw new Error('Send fiat currency is required');
    }

    if (!params.receiveCryptoCurrency) {
      throw new Error('Receive crypto currency is required');
    }

    if (!params.paymentMethodToSend) {
      throw new Error('Payment method is required');
    }

    if (!params.chainId) {
      throw new Error('Chain ID is required');
    }

    return this.adapter.createDepositQuote(params);
  }

  /**
   * Cria ordem de depósito fiat
   */
  async createDepositOrder(params: CreateDepositOrderParams): Promise<DepositOrder> {
    if (!params.quoteId) {
      throw new Error('Quote ID is required');
    }

    return this.adapter.createDepositOrder(params);
  }

  /**
   * Obtém detalhes PIX para depósito
   */
  async getDepositPixDetails(orderId: string): Promise<PixDetails> {
    if (!orderId) {
      throw new Error('Order ID is required');
    }

    return this.adapter.getDepositPixDetails(orderId);
  }

  /**
   * Verifica status do depósito
   */
  async getDepositStatus(orderId: string): Promise<unknown> {
    if (!orderId) {
      throw new Error('Order ID is required');
    }

    return this.adapter.getDepositStatus(orderId);
  }
}

export function createFiatService(): FiatService {
  const adapter = new FiatAdapter();
  return new FiatService(adapter);
}

