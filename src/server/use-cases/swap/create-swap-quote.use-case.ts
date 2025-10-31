/**
 * Create Swap Quote Use Case
 * Caso de uso: Criar cotação de swap
 */

import { SwapService } from '../../services/swap.service';
import type { CreateSwapQuoteParams, SwapQuote } from '@/shared/types/swap.types';

export class CreateSwapQuoteUseCase {
  constructor(private swapService: SwapService) {}

  /**
   * Executa o caso de uso de criação de cotação de swap
   */
  async execute(params: CreateSwapQuoteParams): Promise<SwapQuote> {
    // Validações adicionais no use case
    if (!params.walletAddress) {
      throw new Error('Wallet address is required');
    }

    // Verificar se tokens são diferentes
    if (params.tokenIn.toLowerCase() === params.tokenOut.toLowerCase()) {
      throw new Error('Cannot swap the same token');
    }

    // Verificar se chains são válidas
    if (params.chainIdIn === params.chainIdOut && params.tokenIn !== params.tokenOut) {
      // Mesma chain, tokens devem ser diferentes
      if (params.tokenIn.toLowerCase() === params.tokenOut.toLowerCase()) {
        throw new Error('Cannot swap the same token on the same chain');
      }
    }

    return this.swapService.createQuote(params);
  }
}

