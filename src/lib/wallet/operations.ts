/**
 * Operações da wallet
 * Centraliza operações como registro, portfolio, histórico, etc.
 */

import { notusAPI } from '../api/client';

// Tipos para operações da wallet
export interface NotusWallet {
  walletAddress: string;
  accountAbstraction: string;
  factory: string;
  implementation: string;
  deployedChains: number[];
  salt: string;
  registeredAt: string | null;
  metadata?: {
    name?: string;
    description?: string;
  };
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
  totalBalanceUSD: string;
  tokens: Token[];
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  token: string;
  timestamp: number;
  type: 'transfer' | 'swap' | 'liquidity';
}

export interface WalletHistory {
  transactions: Transaction[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Registra uma nova smart wallet
 */
export async function registerSmartWallet(
  walletAddress: string, 
  metadata?: any
): Promise<NotusWallet> {
  return notusAPI.post<NotusWallet>('/wallets/register', {
    externallyOwnedAccount: walletAddress,
    factory: '0x7a1dbab750f12a90eb1b60d2ae3ad17d4d81effe', // Factory address padrão
    salt: '0',
    metadata,
  });
}

/**
 * Busca dados de uma smart wallet
 */
export async function getSmartWallet(walletAddress: string): Promise<NotusWallet> {
  return notusAPI.get<NotusWallet>(
    `/wallets/address?externallyOwnedAccount=${walletAddress}&factory=0x7a1dbab750f12a90eb1b60d2ae3ad17d4d81effe`
  );
}

/**
 * Busca portfolio da wallet
 */
export async function getSmartWalletPortfolio(walletAddress: string): Promise<Portfolio> {
  return notusAPI.get<Portfolio>(`/wallets/${walletAddress}/portfolio`);
}

/**
 * Busca histórico de transações da wallet
 */
export async function getSmartWalletHistory(
  walletAddress: string,
  take = 20,
  lastId?: string
): Promise<WalletHistory> {
  const params = new URLSearchParams({
    take: take.toString(),
    ...(lastId && { lastId }),
  });
  
  return notusAPI.get<WalletHistory>(`/wallets/${walletAddress}/history?${params}`);
}

/**
 * Cria transação de depósito
 */
export async function createDepositTransaction(
  walletAddress: string,
  amount: string,
  token: string,
  chainId: number,
  fromAddress: string
): Promise<{ from: string; to: string; value: string; data: string; estimateGasCost: string }> {
  return notusAPI.post<{ from: string; to: string; value: string; data: string; estimateGasCost: string }>(
    `/wallets/${walletAddress}/deposit`,
    {
      amount,
      chainId,
      token,
      fromAddress,
    }
  );
}

/**
 * Busca todas as wallets do projeto
 */
export async function getSmartWalletsByProject(): Promise<NotusWallet[]> {
  return notusAPI.get<NotusWallet[]>('/wallets');
}

/**
 * Atualiza metadados de uma transação
 */
export async function updateTransactionMetadata(
  walletAddress: string,
  transactionId: string,
  metadata: any
): Promise<{ success: boolean }> {
  return notusAPI.patch<{ success: boolean }>(
    `/wallets/${walletAddress}/transactions/${transactionId}/metadata`,
    { metadata }
  );
}
