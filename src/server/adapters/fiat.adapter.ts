/**
 * Fiat Adapter
 * Adaptador para operações fiat (depósitos e saques)
 */

import { notusAPI, NotusAPIError } from '@/lib/api/client';
import type {
  DepositCurrency,
  DepositQuote,
  DepositOrder,
  PixDetails,
  CreateDepositQuoteParams,
  CreateDepositOrderParams,
} from '@/shared/types/fiat.types';

export class FiatAdapter {
  /**
   * Lista moedas disponíveis para depósito
   */
  async getDepositCurrencies(): Promise<DepositCurrency[]> {
    try {
      const response = await notusAPI.get('fiat/deposit/currencies').json<{
        currencies?: DepositCurrency[];
        data?: DepositCurrency[];
      }>();
      return response.currencies || response.data || [];
    } catch (error) {
      if (error instanceof NotusAPIError) {
        throw error;
      }
      throw new NotusAPIError(
        'Failed to get deposit currencies',
        500,
        undefined,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Cria quote para depósito fiat
   */
  async createDepositQuote(params: CreateDepositQuoteParams): Promise<DepositQuote> {
    try {
      return await notusAPI.post('fiat/deposit/quote', {
        json: params,
      }).json<DepositQuote>();
    } catch (error) {
      if (error instanceof NotusAPIError) {
        throw error;
      }
      throw new NotusAPIError(
        'Failed to create deposit quote',
        500,
        undefined,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Cria ordem de depósito fiat
   */
  async createDepositOrder(params: CreateDepositOrderParams): Promise<DepositOrder> {
    try {
      return await notusAPI.post('fiat/deposit', {
        json: params,
      }).json<DepositOrder>();
    } catch (error) {
      if (error instanceof NotusAPIError) {
        throw error;
      }
      throw new NotusAPIError(
        'Failed to create deposit order',
        500,
        undefined,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Obtém detalhes PIX para depósito
   */
  async getDepositPixDetails(orderId: string): Promise<PixDetails> {
    try {
      return await notusAPI.get(`fiat/deposit/${orderId}/pix-details`).json<PixDetails>();
    } catch (error) {
      if (error instanceof NotusAPIError) {
        throw error;
      }
      throw new NotusAPIError(
        'Failed to get PIX details',
        500,
        undefined,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Verifica status do depósito
   */
  async getDepositStatus(orderId: string): Promise<unknown> {
    try {
      return await notusAPI.get(`fiat/deposit/${orderId}/status`).json();
    } catch (error) {
      if (error instanceof NotusAPIError) {
        throw error;
      }
      throw new NotusAPIError(
        'Failed to get deposit status',
        500,
        undefined,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }
}

