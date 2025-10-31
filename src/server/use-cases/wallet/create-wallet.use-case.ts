/**
 * Create Wallet Use Case
 * Caso de uso: Criar/Registrar uma nova smart wallet
 */

import { WalletService } from '../../services/wallet.service';
import type { RegisterWalletParams, Wallet } from '@/shared/types/wallet.types';

export class CreateWalletUseCase {
  constructor(private walletService: WalletService) {}

  /**
   * Executa o caso de uso de criação de wallet
   */
  async execute(params: RegisterWalletParams): Promise<Wallet> {
    // Validações de entrada
    if (!params.externallyOwnedAccount) {
      throw new Error('Externally owned account is required');
    }

    // Verificar se wallet já existe
    const existingWallet = await this.walletService.getWalletByEOA({
      externallyOwnedAccount: params.externallyOwnedAccount,
    });

    if (existingWallet?.registeredAt) {
      throw new Error('Wallet already registered');
    }

    // Registrar wallet
    return this.walletService.registerWallet(params);
  }
}

