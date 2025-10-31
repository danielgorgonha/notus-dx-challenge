/**
 * Swap Server Actions (Refactored)
 * Usa Use Cases da Clean Architecture
 */

'use server';

import { createSwapService } from '@/server/services';
import { CreateSwapQuoteUseCase } from '@/server/use-cases/swap';
import type { CreateSwapQuoteParams, SwapQuote } from '@/shared/types/swap.types';

const swapService = createSwapService();

/**
 * Cria uma cotação de swap de tokens
 */
export async function createSwapQuote(params: CreateSwapQuoteParams): Promise<SwapQuote> {
  try {
    const useCase = new CreateSwapQuoteUseCase(swapService);
    return await useCase.execute(params);
  } catch (error) {
    console.error('Error creating swap quote:', error);
    throw error;
  }
}

