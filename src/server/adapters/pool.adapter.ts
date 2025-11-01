/**
 * Pool Adapter
 * Adaptador para operações de liquidity pools
 */

import { notusAPI, NotusAPIError } from '@/lib/api/client';
import type {
  Pool,
  PoolListParams,
  CreateLiquidityParams,
  ChangeLiquidityParams,
} from '@/shared/types/pool.types';

export class PoolAdapter {
  /**
   * Lista pools de liquidez
   */
  async listPools(params?: PoolListParams): Promise<Pool[]> {
    try {
      
      const response = await notusAPI.get('liquidity/pools', {
        searchParams: params,
      }).json<any>();

        type: typeof response,
        isArray: Array.isArray(response),
        hasPools: !!response.pools,
        hasData: !!response.data,
        keys: Object.keys(response || {})
      });

      // A API pode retornar em diferentes formatos:
      // 1. Array direto: [pool1, pool2, ...]
      // 2. Objeto com propriedade pools: { pools: [...] }
      // 3. Objeto com propriedade data: { data: [...] }
      // 4. Objeto com ambos: { pools: [...], data: [...] }
      
      if (Array.isArray(response)) {
        return response;
      }
      
      const pools = response.pools || response.data || [];
      
      if (Array.isArray(pools)) {
        return pools;
      }
      
      console.warn('⚠️ Formato de resposta inesperado, retornando array vazio');
      return [];
    } catch (error) {
      console.error('❌ PoolAdapter.listPools - Erro:', error);
      if (error instanceof NotusAPIError) {
        throw error;
      }
      throw new NotusAPIError(
        'Failed to list pools',
        500,
        undefined,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Obtém detalhes de um pool
   */
  async getPool(poolId: string, rangeInDays: number = 365): Promise<Pool> {
    try {
      return await notusAPI.get(`liquidity/pools/${poolId}`, {
        searchParams: { rangeInDays },
      }).json<Pool>();
    } catch (error) {
      if (error instanceof NotusAPIError) {
        throw error;
      }
      throw new NotusAPIError(
        'Failed to get pool',
        500,
        undefined,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Cria liquidez em um pool
   */
  async createLiquidity(params: CreateLiquidityParams): Promise<unknown> {
    try {
      return await notusAPI.post('liquidity/create', {
        json: params,
      }).json();
    } catch (error) {
      if (error instanceof NotusAPIError) {
        throw error;
      }
      throw new NotusAPIError(
        'Failed to create liquidity',
        500,
        undefined,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Altera liquidez (adiciona/remove)
   */
  async changeLiquidity(params: ChangeLiquidityParams): Promise<unknown> {
    try {
      return await notusAPI.post('liquidity/change', {
        json: params,
      }).json();
    } catch (error) {
      if (error instanceof NotusAPIError) {
        throw error;
      }
      throw new NotusAPIError(
        'Failed to change liquidity',
        500,
        undefined,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Obtém dados históricos do pool
   */
  async getHistoricalData(poolId: string, days?: number): Promise<unknown> {
    try {
      return await notusAPI.get(`liquidity/pools/${poolId}/historical-data`, {
        searchParams: days ? { days } : undefined,
      }).json();
    } catch (error) {
      if (error instanceof NotusAPIError) {
        throw error;
      }
      throw new NotusAPIError(
        'Failed to get historical data',
        500,
        undefined,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }
}

