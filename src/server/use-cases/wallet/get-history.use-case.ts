/**
 * Get History Use Case
 * Caso de uso: Obter histórico de transações de uma wallet
 */

import { WalletService } from '../../services/wallet.service';
import type { WalletHistory, GetHistoryParams } from '@/shared/types/wallet.types';

export interface GetHistoryUseCaseParams extends GetHistoryParams {
  walletAddress: string;
  take?: number;
  lastId?: string;
  type?: string;
  status?: string;
  chains?: string;
  createdAt?: string;
}

export class GetHistoryUseCase {
  constructor(private walletService: WalletService) {}

  /**
   * Executa o caso de uso de obtenção de histórico
   */
  async execute(params: GetHistoryUseCaseParams): Promise<WalletHistory> {
    // Validações
    if (!params.walletAddress) {
      throw new Error('Wallet address is required');
    }

    // Validação de paginação
    const take = params.take || 10;
    if (take < 1 || take > 100) {
      throw new Error('Take must be between 1 and 100');
    }

    return this.walletService.getHistory({
      walletAddress: params.walletAddress,
      take,
      lastId: params.lastId,
      type: params.type,
      status: params.status,
      chains: params.chains,
      createdAt: params.createdAt,
    });
  }
}

