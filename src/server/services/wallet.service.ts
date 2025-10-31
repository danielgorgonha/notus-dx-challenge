/**
 * Wallet Service
 * Serviço de domínio para operações de wallet
 * Contém lógica de negócio relacionada a wallets
 */

import { NotusAPIAdapter } from '../adapters/notus-api.adapter';
import { NotusRepository, type INotusRepository } from '../repositories/notus.repository';
import type {
  Wallet,
  Portfolio,
  WalletHistory,
  RegisterWalletParams,
  GetWalletParams,
  GetHistoryParams,
  UpdateMetadataParams,
} from '@/shared/types/wallet.types';

export class WalletService {
  constructor(private repository: INotusRepository) {}

  /**
   * Registra uma nova wallet
   */
  async registerWallet(params: RegisterWalletParams): Promise<Wallet> {
    // Validação de entrada
    if (!params.externallyOwnedAccount) {
      throw new Error('Externally owned account is required');
    }

    return this.repository.registerWallet(params);
  }

  /**
   * Busca wallet por endereço EOA
   */
  async getWalletByEOA(params: GetWalletParams): Promise<Wallet | null> {
    try {
      return await this.repository.getWalletAddress(params);
    } catch (error) {
      // Se wallet não encontrada, retorna null em vez de lançar erro
      if (error instanceof Error && error.message.includes('not found')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Obtém portfolio da wallet
   */
  async getPortfolio(walletAddress: string): Promise<Portfolio> {
    if (!walletAddress) {
      throw new Error('Wallet address is required');
    }

    return this.repository.getPortfolio(walletAddress);
  }

  /**
   * Obtém histórico de transações
   */
  async getHistory(params: GetHistoryParams): Promise<WalletHistory> {
    if (!params.walletAddress) {
      throw new Error('Wallet address is required');
    }

    // Validações de paginação
    if (params.take && (params.take < 1 || params.take > 100)) {
      throw new Error('Take must be between 1 and 100');
    }

    return this.repository.getHistory(params);
  }

  /**
   * Atualiza metadados da wallet
   */
  async updateMetadata(params: UpdateMetadataParams): Promise<void> {
    if (!params.walletAddress) {
      throw new Error('Wallet address is required');
    }

    if (!params.metadata || Object.keys(params.metadata).length === 0) {
      throw new Error('Metadata is required');
    }

    return this.repository.updateMetadata(params);
  }

  /**
   * Verifica se wallet está registrada
   */
  async isWalletRegistered(eoaAddress: string): Promise<boolean> {
    try {
      const wallet = await this.getWalletByEOA({ externallyOwnedAccount: eoaAddress });
      return wallet?.registeredAt !== null && wallet?.registeredAt !== undefined;
    } catch {
      return false;
    }
  }
}

// Factory function para criar instância com dependências
export function createWalletService(): WalletService {
  const adapter = new NotusAPIAdapter();
  const repository = new NotusRepository(adapter);
  return new WalletService(repository);
}

