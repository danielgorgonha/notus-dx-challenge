/**
 * Módulo Wallet - Exportações centralizadas
 */

// Metadados
export {
  getWalletData,
  updateWalletMetadata,
  initializeWalletKYC,
  updateWalletKYCStatus,
  addActiveKYCSession,
  finalizeKYCSession,
  updateActiveKYCSessionStatus,
  getWalletKYCMetadata,
  isWalletKYCCompleted,
  getWalletKYCLimit,
  getWalletKYCStage
} from './metadata';

// Operações
export {
  registerSmartWallet,
  getSmartWallet,
  getSmartWalletPortfolio,
  getSmartWalletHistory,
  createDepositTransaction,
  getSmartWalletsByProject,
  updateTransactionMetadata
} from './operations';

// Tipos
export type {
  NotusWallet,
  Token,
  Portfolio,
  Transaction,
  WalletHistory
} from './operations';
