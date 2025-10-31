/**
 * Shared Wallet Types
 * Types compartilhados entre camadas da Clean Architecture
 */

export interface Wallet {
  walletAddress: string;
  accountAbstraction: string;
  externallyOwnedAccount: string;
  factory: string;
  implementation: string;
  salt: string;
  registeredAt: string | null;
  metadata?: Record<string, unknown>;
  deployedChains?: number[];
}

export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  balance: string;
  balanceUSD: string;
}

export interface Portfolio {
  tokens: Token[];
  totalValueUSD: string;
}

export interface Transaction {
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

export interface WalletHistory {
  transactions: Transaction[];
  total: number;
  page?: number;
  limit?: number;
  nextLastId?: string | null;
}

export interface RegisterWalletParams {
  externallyOwnedAccount: string;
  factory?: string;
  salt?: string;
  metadata?: Record<string, unknown>;
}

export interface GetWalletParams {
  externallyOwnedAccount: string;
  factory?: string;
  salt?: string;
  eip7702?: boolean;
}

export interface GetHistoryParams {
  walletAddress: string;
  take?: number;
  lastId?: string;
  type?: string;
  status?: string;
  chains?: string;
  createdAt?: string;
}

export interface UpdateMetadataParams {
  walletAddress: string;
  metadata: Record<string, unknown>;
}

