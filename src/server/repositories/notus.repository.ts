/**
 * Notus Repository
 * Repositório abstrato para acesso a dados da API Notus
 * Camada de abstração entre serviços e adapter
 */

import { NotusAPIAdapter } from '../adapters/notus-api.adapter';
import type {
  Wallet,
  Portfolio,
  WalletHistory,
  RegisterWalletParams,
  GetWalletParams,
  GetHistoryParams,
  UpdateMetadataParams,
} from '@/shared/types/wallet.types';

export interface INotusRepository {
  registerWallet(params: RegisterWalletParams): Promise<Wallet>;
  getWalletAddress(params: GetWalletParams): Promise<Wallet>;
  getPortfolio(walletAddress: string): Promise<Portfolio>;
  getHistory(params: GetHistoryParams): Promise<WalletHistory>;
  updateMetadata(params: UpdateMetadataParams): Promise<void>;
}

export class NotusRepository implements INotusRepository {
  constructor(private adapter: NotusAPIAdapter) {}

  async registerWallet(params: RegisterWalletParams): Promise<Wallet> {
    return this.adapter.registerWallet(params);
  }

  async getWalletAddress(params: GetWalletParams): Promise<Wallet> {
    return this.adapter.getWalletAddress(params);
  }

  async getPortfolio(walletAddress: string): Promise<Portfolio> {
    return this.adapter.getPortfolio(walletAddress);
  }

  async getHistory(params: GetHistoryParams): Promise<WalletHistory> {
    return this.adapter.getHistory(params);
  }

  async updateMetadata(params: UpdateMetadataParams): Promise<void> {
    return this.adapter.updateMetadata(params);
  }
}

