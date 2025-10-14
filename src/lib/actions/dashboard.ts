/**
 * Dashboard Server Actions
 * Operações do dashboard que precisam ser executadas no servidor
 */

'use server';

import { walletActions } from './wallet';
import { listTokens } from './blockchain';

/**
 * Busca portfolio da wallet
 */
export async function getPortfolio(walletAddress: string) {
  try {
    return await walletActions.getPortfolio(walletAddress);
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
    return await walletActions.getHistory(walletAddress, params);
  } catch (error) {
    console.error('Error fetching history:', error);
    throw error;
  }
}

/**
 * Lista tokens suportados
 */
export async function listSupportedTokens({ page = 1, perPage = 50 }: { page?: number; perPage?: number } = {}) {
  try {
    return await listTokens({ page, perPage });
  } catch (error) {
    console.error('Error listing tokens:', error);
    throw error;
  }
}

/**
 * Busca endereço da smart wallet
 */
export async function getWalletAddress(params: { externallyOwnedAccount: string }) {
  try {
    return await walletActions.getAddress(params);
  } catch (error) {
    console.error('Error fetching wallet address:', error);
    throw error;
  }
}

/**
 * Registra uma nova smart wallet
 */
export async function registerWallet(params: { externallyOwnedAccount: string; factory: string; salt: string }) {
  try {
    return await walletActions.register(params);
  } catch (error) {
    console.error('Error registering wallet:', error);
    throw error;
  }
}

/**
 * Atualiza metadata da wallet
 */
export async function updateWalletMetadata(walletAddress: string, metadata: Record<string, any>) {
  try {
    return await walletActions.updateMetadata(walletAddress, metadata);
  } catch (error) {
    console.error('Error updating wallet metadata:', error);
    throw error;
  }
}

