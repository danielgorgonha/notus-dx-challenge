/**
 * Fiat Server Actions (Refactored)
 * Usa Use Cases da Clean Architecture
 */

'use server';

import { createFiatService } from '@/server/services';
import {
  CreateDepositQuoteUseCase,
  CreateDepositOrderUseCase,
} from '@/server/use-cases/fiat';
import type {
  CreateDepositQuoteParams,
  DepositQuote,
  CreateDepositOrderParams,
  DepositOrder,
} from '@/shared/types/fiat.types';

const fiatService = createFiatService();

/**
 * Lista moedas disponíveis para depósito
 */
export async function getDepositCurrencies() {
  try {
    return await fiatService.getDepositCurrencies();
  } catch (error) {
    console.error('Error getting deposit currencies:', error);
    throw error;
  }
}

/**
 * Cria quote para depósito fiat
 */
export async function createDepositQuote(params: CreateDepositQuoteParams): Promise<DepositQuote> {
  try {
    const useCase = new CreateDepositQuoteUseCase(fiatService);
    return await useCase.execute(params);
  } catch (error) {
    console.error('Error creating deposit quote:', error);
    throw error;
  }
}

/**
 * Cria ordem de depósito fiat
 */
export async function createDepositOrder(params: CreateDepositOrderParams): Promise<DepositOrder> {
  try {
    const useCase = new CreateDepositOrderUseCase(fiatService);
    return await useCase.execute(params);
  } catch (error) {
    console.error('Error creating deposit order:', error);
    throw error;
  }
}

/**
 * Obtém detalhes PIX para depósito
 */
export async function getDepositPixDetails(orderId: string) {
  try {
    return await fiatService.getDepositPixDetails(orderId);
  } catch (error) {
    console.error('Error getting PIX details:', error);
    throw error;
  }
}

/**
 * Verifica status do depósito
 */
export async function getDepositStatus(orderId: string) {
  try {
    return await fiatService.getDepositStatus(orderId);
  } catch (error) {
    console.error('Error getting deposit status:', error);
    throw error;
  }
}

