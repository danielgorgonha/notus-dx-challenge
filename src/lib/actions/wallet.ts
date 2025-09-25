/**
 * 🔐 Smart Wallets Actions
 * Endpoints para gerenciamento de smart wallets
 * Baseado no Postman collection oficial da Notus API
 */

import { notusAPI } from '../api/client';
import type {
  WalletAddressResponse,
  WalletListResponse,
  WalletPortfolioResponse,
  WalletHistoryResponse,
  WalletResponse
} from '@/types/wallet';

// Factory address para smart wallets
export const FACTORY_ADDRESS = "0x7a1dbab750f12a90eb1b60d2ae3ad17d4d81effe";

export const walletActions = {
  /**
   * Registra uma nova smart wallet
   * POST /wallets/register
   */
  register: (params: {
    externallyOwnedAccount: string;
    factory?: string;
    salt?: string;
    metadata?: Record<string, unknown>;
  }) =>
    notusAPI.post("wallets/register", {
      json: {
        factory: FACTORY_ADDRESS,
        salt: "0",
        ...params,
      },
    }).json<WalletAddressResponse>(),

  /**
   * Busca endereço da smart wallet
   * GET /wallets/address
   */
  getAddress: (params: {
    externallyOwnedAccount: string;
    factory?: string;
    salt?: string;
    eip7702?: boolean;
  }) =>
    notusAPI.get("wallets/address", {
      searchParams: {
        factory: FACTORY_ADDRESS,
        salt: "0",
        ...params,
      },
    }).json<WalletAddressResponse>(),

  /**
   * Lista smart wallets do projeto
   * GET /wallets
   */
  listWallets: (page: number = 1, perPage: number = 20) =>
    notusAPI.get("wallets", {
      searchParams: { page, perPage },
    }).json<WalletListResponse>(),

  /**
   * Obtém portfolio da smart wallet
   * GET /wallets/{walletAddress}/portfolio
   */
  getPortfolio: (walletAddress: string) =>
    notusAPI.get(`wallets/${walletAddress}/portfolio`).json<WalletPortfolioResponse>(),

  /**
   * Obtém histórico de transações da smart wallet
   * GET /wallets/{walletAddress}/history
   */
  getHistory: (walletAddress: string, params?: {
    take?: number;
    lastId?: string;
    type?: string;
    status?: string;
    chains?: string;
    createdAt?: string;
  }) =>
    notusAPI.get(`wallets/${walletAddress}/history`, {
      searchParams: params,
    }).json<WalletHistoryResponse>(),

  /**
   * Cria transação de depósito
   * POST /wallets/{walletAddress}/deposit
   */
  createDeposit: (walletAddress: string, params: {
    amount: string;
    chainId: number;
    token: string;
    fromAddress: string;
  }) =>
    notusAPI.post(`wallets/${walletAddress}/deposit`, {
      json: params,
    }).json(),

  /**
   * Atualiza metadados da wallet
   * PATCH /wallets/{walletAddress}/metadata
   */
  updateMetadata: (walletAddress: string, metadata: Record<string, unknown>) =>
    notusAPI.patch(`wallets/${walletAddress}/metadata`, {
      json: { metadata },
    }).json(),

  /**
   * Atualiza metadados de transação
   * PATCH /wallets/transactions/{transactionId}/metadata
   */
  updateTransactionMetadata: (transactionId: string, metadata: Record<string, unknown>) =>
    notusAPI.patch(`wallets/transactions/${transactionId}/metadata`, {
      json: { metadata },
    }).json(),
};