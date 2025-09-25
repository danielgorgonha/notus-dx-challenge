/**
 * 🔐 Smart Wallet Types
 * Tipos para gerenciamento de smart wallets
 */

import type { Chain, TokenInfo, NFTInfo } from './blockchain';

// Deployed chain info
export interface DeployedChain {
  chain: Chain;
  deployed: boolean;
}

// Wallet response
export interface WalletResponse {
  metadata?: Record<string, unknown>;
  walletAddress: string;
  accountAbstraction: string; // DEPRECATED - Use walletAddress instead
  externallyOwnedAccount: string;
  factory: string;
  implementation: string;
  eip7702: boolean;
  deployed: DeployedChain[];
  salt: number;
  registeredAt: string | null;
}

// Transaction info
export interface TransactionInfo {
  id: string;
  hash: string;
  type: string;
  status: string;
  amount: string;
  token: string;
  from: string;
  to: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

// Portfolio response
export interface PortfolioResponse {
  tokens: TokenInfo[];
  nfts: NFTInfo[];
  portfolio: TokenInfo[]; // DEPRECATED - use tokens instead
}

// Wallet history response
export interface WalletHistoryResponse {
  nextLastId: string | null;
  transactions: TransactionInfo[];
}

// API Response wrappers
export interface WalletAddressResponse {
  wallet: WalletResponse;
}

export interface WalletListResponse {
  wallets: WalletResponse[];
}

export type WalletPortfolioResponse = PortfolioResponse;

// Deposit request
export interface DepositRequest {
  amount: string;
  chainId: number;
  token: string;
  fromAddress: string;
}

// Metadata update request
export interface MetadataUpdateRequest {
  metadata: Record<string, unknown>;
}

// Transaction metadata update request
export interface TransactionMetadataUpdateRequest {
  metadata: Record<string, unknown>;
}
