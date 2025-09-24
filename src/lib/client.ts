/**
 * Client-side library exports
 * This file exports only client-safe functions
 */

// API Client
export { notusAPI, NotusAPIError } from './api/client';

// KYC
export * from './kyc';

// Wallet
export * from './wallet';

// Client-side Auth only
export {
  getClientAuthUser,
  registerWalletClient,
  getWalletClient,
} from './auth/client';

// Shared types
export type { AuthUser, AuthResult, PrivyUser, AuthContextType } from '@/types/auth';

// Utils
export * from './utils';

// Stores
export * from './stores';

// Constants
export const SUPPORTED_CHAINS = {
  ETHEREUM: 1,
  POLYGON: 137,
  ARBITRUM: 42161,
  BASE: 8453,
  BSC: 56,
  AVALANCHE: 43114,
  OPTIMISM: 10,
  GNOSIS: 100,
} as const;
