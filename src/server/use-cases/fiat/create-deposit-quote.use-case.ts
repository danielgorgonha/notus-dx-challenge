/**
 * Create Deposit Quote Use Case
 * Caso de uso: Criar cotação de depósito fiat
 */

import { FiatService } from '../../services/fiat.service';
import type { CreateDepositQuoteParams, DepositQuote } from '@/shared/types/fiat.types';

export class CreateDepositQuoteUseCase {
  constructor(private fiatService: FiatService) {}

  /**
   * Executa o caso de uso de criação de cotação de depósito
   */
  async execute(params: CreateDepositQuoteParams): Promise<DepositQuote> {
    // Validações adicionais
    if (!params.individualId) {
      throw new Error('Individual ID is required (KYC Level 2 must be completed)');
    }

    // Validar valor mínimo (exemplo: R$ 10,00)
    const minAmount = 10;
    const amount = parseFloat(params.amountToSendInFiatCurrency);

    if (amount < minAmount) {
      throw new Error(`Minimum deposit amount is ${minAmount}`);
    }

    // Validar valor máximo (exemplo: R$ 50.000,00)
    const maxAmount = 50000;
    if (amount > maxAmount) {
      throw new Error(`Maximum deposit amount is ${maxAmount}`);
    }

    return this.fiatService.createDepositQuote(params);
  }
}

