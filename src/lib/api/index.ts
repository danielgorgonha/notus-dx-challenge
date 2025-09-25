/**
 * API Notus - Exports centralizados
 * Facilita importações e mantém organização
 */

// Cliente base
export { notusAPI, NotusAPIError } from './client';

// Actions organizadas por funcionalidade
export {
  // 🌐 Blockchain
  blockchainActions,
  
  // 🔐 Smart Wallets
  walletActions,
  
  // 🆔 KYC
  kycActions,
  
  // 💰 Fiat Operations
  fiatActions,
  
  // 🔄 Swaps
  swapActions,
  
  // 💸 Transfers
  transferActions,
  
  // 🏊 Liquidity Pools
  liquidityActions,
  
  // ⚙️ User Operations
  userOperationActions,
  
  // Constantes
  FACTORY_ADDRESS,
} from '../actions';

// Re-export para compatibilidade
export { notusAPI as default } from './client';
