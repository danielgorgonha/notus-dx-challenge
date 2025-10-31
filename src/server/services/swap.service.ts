/**
 * Swap Service
 * Serviço de domínio para operações de swap
 */

import { NotusAPIAdapter } from '../adapters/notus-api.adapter';
import type { CreateSwapQuoteParams, SwapQuote } from '@/shared/types/swap.types';

export class SwapService {
  constructor(private adapter: NotusAPIAdapter) {}

  /**
   * Cria cotação de swap
   */
  async createQuote(params: CreateSwapQuoteParams): Promise<SwapQuote> {
    // Validações
    if (!params.walletAddress) {
      throw new Error('Wallet address is required');
    }

    if (!params.amountIn || parseFloat(params.amountIn) <= 0) {
      throw new Error('Amount in must be greater than 0');
    }

    if (!params.tokenIn) {
      throw new Error('Token in address is required');
    }

    if (!params.tokenOut) {
      throw new Error('Token out address is required');
    }

    if (params.tokenIn === params.tokenOut) {
      throw new Error('Token in and token out must be different');
    }

    if (!params.chainIdIn) {
      throw new Error('Chain ID in is required');
    }

    if (!params.chainIdOut) {
      throw new Error('Chain ID out is required');
    }

    // Validar slippage
    if (params.slippage && (params.slippage < 0 || params.slippage > 100)) {
      throw new Error('Slippage must be between 0 and 100');
    }

    const response = await this.adapter.createSwapQuote(params);
    return response as SwapQuote;
  }
}

export function createSwapService(): SwapService {
  const adapter = new NotusAPIAdapter();
  return new SwapService(adapter);
}

