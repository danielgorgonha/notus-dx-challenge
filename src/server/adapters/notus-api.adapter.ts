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

  /**
   * Cria cotação de transferência
   */
  async createTransferQuote(params: {
    amount: string;
    chainId: number;
    gasFeePaymentMethod: 'ADD_TO_AMOUNT' | 'DEDUCT_FROM_AMOUNT';
    payGasFeeToken: string;
    token: string;
    walletAddress: string;
    toAddress: string;
    transactionFeePercent?: number;
    metadata?: Record<string, string>;
  }): Promise<unknown> {
    try {
      return await notusAPI.post('crypto/transfer', {
        json: {
          amount: params.amount,
          chainId: params.chainId,
          gasFeePaymentMethod: params.gasFeePaymentMethod || 'ADD_TO_AMOUNT',
          payGasFeeToken: params.payGasFeeToken,
          token: params.token,
          walletAddress: params.walletAddress,
          toAddress: params.toAddress,
          transactionFeePercent: params.transactionFeePercent || 0,
          metadata: params.metadata || {},
        },
      }).json();
    } catch (error) {
      if (error instanceof NotusAPIError) {
        throw error;
      }
      throw new NotusAPIError(
        'Failed to create transfer quote',
        500,
        undefined,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Cria cotação de swap
   */
  async createSwapQuote(params: {
    amountIn: string;
    chainIdIn: number;
    chainIdOut: number;
    tokenIn: string;
    tokenOut: string;
    walletAddress: string;
    toAddress?: string;
    routeProfile?: 'QUICKEST_QUOTE' | 'FASTEST_BRIDGE' | 'BEST_OUTPUT';
    gasFeePaymentMethod?: 'ADD_TO_AMOUNT' | 'DEDUCT_FROM_AMOUNT';
    payGasFeeToken?: string;
    slippage?: number;
    transactionFeePercent?: number;
    metadata?: Record<string, string>;
  }): Promise<unknown> {
    try {
      return await notusAPI.post('crypto/swap', {
        json: {
          amountIn: params.amountIn,
          chainIdIn: params.chainIdIn,
          chainIdOut: params.chainIdOut,
          tokenIn: params.tokenIn,
          tokenOut: params.tokenOut,
          walletAddress: params.walletAddress,
          toAddress: params.toAddress || params.walletAddress,
          routeProfile: params.routeProfile || 'QUICKEST_QUOTE',
          gasFeePaymentMethod: params.gasFeePaymentMethod || 'ADD_TO_AMOUNT',
          payGasFeeToken: params.payGasFeeToken,
          slippage: params.slippage || 0.5,
          transactionFeePercent: params.transactionFeePercent || 0,
          metadata: params.metadata || {},
        },
      }).json();
    } catch (error) {
      if (error instanceof NotusAPIError) {
        throw error;
      }
      throw new NotusAPIError(
        'Failed to create swap quote',
        500,
        undefined,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Executa User Operation
   */
  async executeUserOperation(params: {
    userOperationHash: string;
    signature: string;
    authorization?: string;
  }): Promise<unknown> {
    try {
      return await notusAPI.post('crypto/execute-user-op', {
        json: {
          userOperationHash: params.userOperationHash,
          signature: params.signature,
          authorization: params.authorization,
        },
      }).json();
    } catch (error) {
      if (error instanceof NotusAPIError) {
        throw error;
      }
      throw new NotusAPIError(
        'Failed to execute user operation',
        500,
        undefined,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Obtém status de User Operation
   */
  async getUserOperationStatus(userOperationHash: string): Promise<unknown> {
    try {
      return await notusAPI.get(`crypto/user-operation/${userOperationHash}`).json();
    } catch (error) {
      if (error instanceof NotusAPIError) {
        throw error;
      }
      throw new NotusAPIError(
        'Failed to get user operation status',
        500,
        undefined,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }
}

