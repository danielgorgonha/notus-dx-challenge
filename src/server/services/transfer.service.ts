/**
 * Transfer Service
 * Serviço de domínio para operações de transferência
 */

import { NotusAPIAdapter } from '../adapters/notus-api.adapter';
import type { CreateTransferQuoteParams, TransferQuote } from '@/shared/types/transfer.types';

export class TransferService {
  constructor(private adapter: NotusAPIAdapter) {}

  /**
   * Cria cotação de transferência
   */
  async createQuote(params: CreateTransferQuoteParams): Promise<TransferQuote> {
    // Validações
    if (!params.walletAddress) {
      throw new Error('Wallet address is required');
    }

    if (!params.toAddress) {
      throw new Error('To address is required');
    }

    if (!params.amount || parseFloat(params.amount) <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    if (!params.token) {
      throw new Error('Token address is required');
    }

    if (!params.chainId) {
      throw new Error('Chain ID is required');
    }

    const response = await this.adapter.createTransferQuote(params);
    return response as TransferQuote;
  }
}

export function createTransferService(): TransferService {
  const adapter = new NotusAPIAdapter();
  return new TransferService(adapter);
}

