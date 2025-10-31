/**
 * Notus API Adapter
 * Adaptador para comunicação com a API Notus
 * Camada mais externa - conhece detalhes de implementação da API
 */

import { notusAPI, NotusAPIError } from '@/lib/api/client';
import type {
  Wallet,
  Portfolio,
  WalletHistory,
  Transaction,
  RegisterWalletParams,
  GetWalletParams,
  GetHistoryParams,
  UpdateMetadataParams,
} from '@/shared/types/wallet.types';
import { FACTORY_ADDRESS, DEFAULT_SALT } from '@/shared/constants/wallet.constants';

export class NotusAPIAdapter {
  /**
   * Registra uma nova smart wallet
   */
  async registerWallet(params: RegisterWalletParams): Promise<Wallet> {
    try {
      const response = await notusAPI.post('wallets/register', {
        json: {
          factory: FACTORY_ADDRESS,
          salt: DEFAULT_SALT,
          ...params,
        },
      }).json<{ wallet: Wallet }>();

      return response.wallet;
    } catch (error) {
      if (error instanceof NotusAPIError) {
        throw error;
      }
      throw new NotusAPIError(
        'Failed to register wallet',
        500,
        undefined,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Busca endereço da smart wallet
   */
  async getWalletAddress(params: GetWalletParams): Promise<Wallet> {
    try {
      const response = await notusAPI.get('wallets/address', {
        searchParams: {
          factory: FACTORY_ADDRESS,
          salt: DEFAULT_SALT,
          ...params,
        },
      }).json<{ wallet: Wallet }>();

      return response.wallet;
    } catch (error) {
      if (error instanceof NotusAPIError) {
        throw error;
      }
      throw new NotusAPIError(
        'Failed to get wallet address',
        500,
        undefined,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Obtém portfolio da wallet
   */
  async getPortfolio(walletAddress: string): Promise<Portfolio> {
    try {
      const response = await notusAPI.get(`wallets/${walletAddress}/portfolio`).json<{
        tokens: Portfolio['tokens'];
      }>();

      // Calcular totalValueUSD
      const totalValueUSD = response.tokens.reduce((sum, token) => {
        return sum + parseFloat(token.balanceUSD || '0');
      }, 0).toFixed(2);

      return {
        tokens: response.tokens,
        totalValueUSD,
      };
    } catch (error) {
      if (error instanceof NotusAPIError) {
        throw error;
      }
      throw new NotusAPIError(
        'Failed to get portfolio',
        500,
        undefined,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Obtém histórico de transações
   */
  async getHistory(params: GetHistoryParams): Promise<WalletHistory> {
    try {
      const { walletAddress, ...queryParams } = params;
      const response = await notusAPI.get(`wallets/${walletAddress}/history`, {
        searchParams: queryParams,
      }).json<{
        transactions: Transaction[];
        nextLastId?: string | null;
      }>();

      return {
        transactions: response.transactions,
        total: response.transactions.length,
        limit: queryParams.take,
        nextLastId: response.nextLastId || null,
      };
    } catch (error) {
      if (error instanceof NotusAPIError) {
        throw error;
      }
      throw new NotusAPIError(
        'Failed to get history',
        500,
        undefined,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Atualiza metadados da wallet
   */
  async updateMetadata(params: UpdateMetadataParams): Promise<void> {
    try {
      await notusAPI.patch(`wallets/${params.walletAddress}/metadata`, {
        json: { metadata: params.metadata },
      });
    } catch (error) {
      if (error instanceof NotusAPIError) {
        throw error;
      }
      throw new NotusAPIError(
        'Failed to update metadata',
        500,
        undefined,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }
}

