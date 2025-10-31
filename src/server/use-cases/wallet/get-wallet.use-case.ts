/**
 * Get Wallet Use Case
 * Caso de uso: Obter dados de uma wallet pelo EOA
 */

import { WalletService } from '../../services/wallet.service';
import type { Wallet, GetWalletParams } from '@/shared/types/wallet.types';

export class GetWalletUseCase {
  constructor(private walletService: WalletService) {}

  /**
   * Executa o caso de uso de obtenção de wallet
   */
  async execute(params: GetWalletParams): Promise<Wallet | null> {
    // Validações
    if (!params.externallyOwnedAccount) {
      throw new Error('Externally owned account is required');
    }

    return this.walletService.getWalletByEOA(params);
  }
}

