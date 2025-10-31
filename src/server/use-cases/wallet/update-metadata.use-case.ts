/**
 * Update Metadata Use Case
 * Caso de uso: Atualizar metadados de uma wallet
 */

import { WalletService } from '../../services/wallet.service';
import type { UpdateMetadataParams } from '@/shared/types/wallet.types';

export class UpdateMetadataUseCase {
  constructor(private walletService: WalletService) {}

  /**
   * Executa o caso de uso de atualização de metadata
   */
  async execute(params: UpdateMetadataParams): Promise<void> {
    // Validações
    if (!params.walletAddress) {
      throw new Error('Wallet address is required');
    }

    if (!params.metadata || Object.keys(params.metadata).length === 0) {
      throw new Error('Metadata is required and cannot be empty');
    }

    await this.walletService.updateMetadata(params);
  }
}

