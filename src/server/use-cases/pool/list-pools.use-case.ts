/**
 * List Pools Use Case
 * Caso de uso: Listar pools de liquidez
 */

import { PoolService } from '../../services/pool.service';
import type { Pool, PoolListParams } from '@/shared/types/pool.types';

export class ListPoolsUseCase {
  constructor(private poolService: PoolService) {}

  /**
   * Executa o caso de uso de listagem de pools
   */
  async execute(params?: PoolListParams): Promise<Pool[]> {
    return this.poolService.listPools(params);
  }
}

