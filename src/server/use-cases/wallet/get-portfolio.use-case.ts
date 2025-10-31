/**
 * Get Portfolio Use Case
 * Caso de uso: Obter portfolio de uma wallet
 */

import { WalletService } from '../../services/wallet.service';
import type { Portfolio } from '@/shared/types/wallet.types';

export interface GetPortfolioParams {
  walletAddress: string;
}

export class GetPortfolioUseCase {
  constructor(private walletService: WalletService) {}

  /**
   * Executa o caso de uso de obtenção de portfolio
   */
  async execute(params: GetPortfolioParams): Promise<Portfolio> {
    // Validações
    if (!params.walletAddress) {
      throw new Error('Wallet address is required');
    }

    // Verificar se wallet existe (opcional, pode ser validado no serviço)
    const portfolio = await this.walletService.getPortfolio(params.walletAddress);

    return portfolio;
  }
}

