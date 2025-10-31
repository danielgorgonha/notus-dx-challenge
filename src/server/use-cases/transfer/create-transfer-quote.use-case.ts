/**
 * Create Transfer Quote Use Case
 * Caso de uso: Criar cotação de transferência
 */

import { TransferService } from '../../services/transfer.service';
import type { CreateTransferQuoteParams, TransferQuote } from '@/shared/types/transfer.types';

export class CreateTransferQuoteUseCase {
  constructor(private transferService: TransferService) {}

  /**
   * Executa o caso de uso de criação de cotação de transferência
   */
  async execute(params: CreateTransferQuoteParams): Promise<TransferQuote> {
    // Validações adicionais no use case
    if (!params.walletAddress) {
      throw new Error('Wallet address is required');
    }

    // Verificar se endereços são válidos (formato básico)
    const addressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!addressRegex.test(params.toAddress)) {
      throw new Error('Invalid recipient address format');
    }

    return this.transferService.createQuote(params);
  }
}

