/**
 * Actions da API Notus - Exports centralizados
 * Organizado por funcionalidade para facilitar importações
 */

// 🌐 Blockchain
export { blockchainActions } from './blockchain';

// 🔐 Smart Wallets
export { walletActions, FACTORY_ADDRESS } from './wallet';

// 🆔 KYC
export { kycActions } from './kyc';

// 💰 Fiat Operations
export { fiatActions } from './fiat';

// 🔄 Swaps
export { swapActions } from './swap';

// 💸 Transfers
export { transferActions, getTransferQuote } from './transfer';

// 🏊 Liquidity Pools
export { liquidityActions } from './liquidity';

// ⚙️ User Operations
export { userOperationActions, executeUserOperation } from './execute';

// ============================================================================
// LEGACY EXPORTS (para compatibilidade)
// ============================================================================

// Re-export para manter compatibilidade com código existente
export { walletActions as walletEndpoints } from './wallet';
export { kycActions as kycEndpoints } from './kyc';
export { fiatActions as fiatEndpoints } from './fiat';
export { transferActions as transferEndpoints } from './transfer';
export { userOperationActions as userOperationEndpoints } from './execute';
