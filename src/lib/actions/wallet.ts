/**
 * Wallet Server Actions (Refactored)
 * Usa Use Cases da Clean Architecture
 */

'use server';

import { createWalletService } from '@/server/services';
import {
  CreateWalletUseCase,
  GetWalletUseCase,
  UpdateMetadataUseCase,
} from '@/server/use-cases/wallet';
import type {
  RegisterWalletParams,
  GetWalletParams,
  UpdateMetadataParams,
  Wallet,
} from '@/shared/types/wallet.types';

const walletService = createWalletService();

/**
 * Registra uma nova smart wallet
 */
export async function registerWallet(params: RegisterWalletParams): Promise<Wallet> {
  try {
    const useCase = new CreateWalletUseCase(walletService);
    return await useCase.execute(params);
  } catch (error) {
    console.error('Error registering wallet:', error);
    throw error;
  }
}

/**
 * Busca endereço da smart wallet
 */
export async function getWalletAddress(params: GetWalletParams): Promise<{ wallet: Wallet }> {
  try {
    const useCase = new GetWalletUseCase(walletService);
    const wallet = await useCase.execute(params);
    return { wallet: wallet! }; // Retorna mesmo formato antigo
  } catch (error) {
    console.error('Error fetching wallet address:', error);
    throw error;
  }
}

/**
 * Atualiza metadados da wallet
 */
export async function updateWalletMetadata(params: UpdateMetadataParams): Promise<void> {
  try {
    const useCase = new UpdateMetadataUseCase(walletService);
    return await useCase.execute(params);
  } catch (error) {
    console.error('Error updating wallet metadata:', error);
    throw error;
  }
}

// Manter compatibilidade com código antigo
export const walletActions = {
  register: registerWallet,
  getAddress: getWalletAddress,
  updateMetadata: (walletAddress: string, metadata: Record<string, unknown>) =>
    updateWalletMetadata({ walletAddress, metadata }),
  // Manter métodos antigos que ainda são usados
  getPortfolio: (walletAddress: string) => {
    // Redireciona para dashboard actions
    return import('./dashboard').then(m => m.getPortfolio(walletAddress));
  },
  getHistory: (walletAddress: string, params?: { take?: number }) => {
    // Redireciona para dashboard actions
    return import('./dashboard').then(m => m.getHistory(walletAddress, params));
  },
  listWallets: () => {
    throw new Error('listWallets not implemented in new architecture');
  },
  createDeposit: () => {
    throw new Error('createDeposit not implemented in new architecture');
  },
  updateTransactionMetadata: () => {
    throw new Error('updateTransactionMetadata not implemented in new architecture');
  },
};

