/**
 * Wallet Actions Compatibility Layer
 * Arquivo de compatibilidade para código que ainda usa walletActions
 * Este arquivo NÃO tem 'use server' para permitir exportar objetos
 */

import {
  registerWallet,
  getWalletAddress,
  updateWalletMetadata,
  updateMetadata,
} from './wallet';
import { getPortfolio, getHistory } from './dashboard';

/**
 * Objeto de compatibilidade para código antigo
 * Use as funções individuais diretamente quando possível
 */
export const walletActions = {
  register: registerWallet,
  getAddress: getWalletAddress,
  updateMetadata,
  getPortfolio,
  getHistory,
  listWallets: async () => {
    throw new Error('listWallets not implemented in new architecture');
  },
  createDeposit: async () => {
    throw new Error('createDeposit not implemented in new architecture');
  },
  updateTransactionMetadata: async () => {
    throw new Error('updateTransactionMetadata not implemented in new architecture');
  },
};

