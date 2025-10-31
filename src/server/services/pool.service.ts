/**
 * Pool Service
 * Serviço de domínio para operações de liquidity pools
 */

import { PoolAdapter } from '../adapters/pool.adapter';
import type {
  Pool,
  PoolListParams,
  CreateLiquidityParams,
  ChangeLiquidityParams,
} from '@/shared/types/pool.types';

export class PoolService {
  constructor(private adapter: PoolAdapter) {}

  /**
   * Lista pools de liquidez
   */
  async listPools(params?: PoolListParams): Promise<Pool[]> {
    // Validações de paginação
    if (params?.take && (params.take < 1 || params.take > 100)) {
      throw new Error('Take must be between 1 and 100');
    }

    if (params?.offset && params.offset < 0) {
      throw new Error('Offset must be greater than or equal to 0');
    }

    return this.adapter.listPools(params);
  }

  /**
   * Obtém detalhes de um pool
   */
  async getPool(poolId: string, rangeInDays: number = 365): Promise<Pool> {
    if (!poolId) {
      throw new Error('Pool ID is required');
    }

    if (rangeInDays < 1 || rangeInDays > 365) {
      throw new Error('Range in days must be between 1 and 365');
    }

    return this.adapter.getPool(poolId, rangeInDays);
  }

  /**
   * Cria liquidez em um pool
   */
  async createLiquidity(params: CreateLiquidityParams): Promise<unknown> {
    // Validações
    if (!params.walletAddress) {
      throw new Error('Wallet address is required');
    }

    if (!params.token0 || !params.token1) {
      throw new Error('Both tokens are required');
    }

    if (params.token0 === params.token1) {
      throw new Error('Tokens must be different');
    }

    if (!params.token0Amount || parseFloat(params.token0Amount) <= 0) {
      throw new Error('Token 0 amount must be greater than 0');
    }

    if (!params.token1Amount || parseFloat(params.token1Amount) <= 0) {
      throw new Error('Token 1 amount must be greater than 0');
    }

    if (params.minPrice >= params.maxPrice) {
      throw new Error('Min price must be less than max price');
    }

    if (params.slippage && (params.slippage < 0 || params.slippage > 100)) {
      throw new Error('Slippage must be between 0 and 100');
    }

    return this.adapter.createLiquidity(params);
  }

  /**
   * Altera liquidez (adiciona/remove)
   */
  async changeLiquidity(params: ChangeLiquidityParams): Promise<unknown> {
    // Validações
    if (!params.walletAddress) {
      throw new Error('Wallet address is required');
    }

    if (!params.tokenId) {
      throw new Error('Token ID is required');
    }

    if (!params.change.token0Amount || !params.change.token1Amount) {
      throw new Error('Both token amounts are required');
    }

    return this.adapter.changeLiquidity(params);
  }

  /**
   * Obtém dados históricos do pool
   */
  async getHistoricalData(poolId: string, days?: number): Promise<unknown> {
    if (!poolId) {
      throw new Error('Pool ID is required');
    }

    if (days && (days < 1 || days > 365)) {
      throw new Error('Days must be between 1 and 365');
    }

    return this.adapter.getHistoricalData(poolId, days);
  }
}

export function createPoolService(): PoolService {
  const adapter = new PoolAdapter();
  return new PoolService(adapter);
}

