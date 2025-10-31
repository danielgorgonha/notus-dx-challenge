/**
 * Create Deposit Order Use Case
 * Caso de uso: Criar ordem de depósito fiat
 */

import { FiatService } from '../../services/fiat.service';
import type { CreateDepositOrderParams, DepositOrder } from '@/shared/types/fiat.types';

export class CreateDepositOrderUseCase {
  constructor(private fiatService: FiatService) {}

  /**
   * Executa o caso de uso de criação de ordem de depósito
   */
  async execute(params: CreateDepositOrderParams): Promise<DepositOrder> {
    if (!params.quoteId) {
      throw new Error('Quote ID is required');
    }

    return this.fiatService.createDepositOrder(params);
  }
}

