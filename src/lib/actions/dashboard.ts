/**
 * Dashboard Server Actions (Refactored)
 * Usa Use Cases da Clean Architecture
 */

'use server';

import { createWalletService } from '@/server/services';
import {
  GetWalletUseCase,
  GetPortfolioUseCase,
  GetHistoryUseCase,
} from '@/server/use-cases/wallet';
import type { GetWalletParams } from '@/shared/types/wallet.types';

const walletService = createWalletService();

/**
 * Busca endereço da smart wallet
 */
export async function getWalletAddress(params: { externallyOwnedAccount: string }) {
  try {
    const useCase = new GetWalletUseCase(walletService);
    const wallet = await useCase.execute({ externallyOwnedAccount: params.externallyOwnedAccount });
    return { wallet };
  } catch (error) {
    console.error('Error fetching wallet address:', error);
    throw error;
  }
}

/**
 * Busca portfolio da wallet
 */
export async function getPortfolio(walletAddress: string) {
  try {
    const useCase = new GetPortfolioUseCase(walletService);
    return await useCase.execute({ walletAddress });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    throw error;
  }
}

/**
 * Busca histórico de transações
 */
export async function getHistory(walletAddress: string, params?: { take?: number }) {
  try {
    const useCase = new GetHistoryUseCase(walletService);
    return await useCase.execute({
      walletAddress,
      take: params?.take,
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    throw error;
  }
}

/**
 * Registra uma nova smart wallet
 */
export async function registerWallet(params: {
  externallyOwnedAccount: string;
  factory: string;
  salt: string;
}) {
  try {
    const { CreateWalletUseCase } = await import('@/server/use-cases/wallet');
    const useCase = new CreateWalletUseCase(walletService);
    return await useCase.execute({
      externallyOwnedAccount: params.externallyOwnedAccount,
      factory: params.factory,
      salt: params.salt,
    });
  } catch (error) {
    console.error('Error registering wallet:', error);
    throw error;
  }
}

