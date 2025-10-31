/**
 * Transfer Server Actions (Refactored)
 * Usa Use Cases da Clean Architecture
 */

'use server';

import { createTransferService } from '@/server/services';
import { CreateTransferQuoteUseCase } from '@/server/use-cases/transfer';
import type { CreateTransferQuoteParams, TransferQuote } from '@/shared/types/transfer.types';

const transferService = createTransferService();

/**
 * Cria uma cotação de transferência de tokens
 */
export async function createTransferQuote(params: CreateTransferQuoteParams): Promise<TransferQuote> {
  try {
    const useCase = new CreateTransferQuoteUseCase(transferService);
    return await useCase.execute(params);
  } catch (error) {
    console.error('Error creating transfer quote:', error);
    throw error;
  }
}

