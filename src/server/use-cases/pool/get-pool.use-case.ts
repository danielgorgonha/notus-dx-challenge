/**
 * Get Pool Use Case
 * Caso de uso: Obter detalhes de um pool
 */

import { PoolService } from '../../services/pool.service';
import type { Pool } from '@/shared/types/pool.types';

export interface GetPoolParams {
  poolId: string;
  rangeInDays?: number;
}

export class GetPoolUseCase {
  constructor(private poolService: PoolService) {}

  /**
   * Executa o caso de uso de obtenção de pool
   */
  async execute(params: GetPoolParams): Promise<Pool> {
    return this.poolService.getPool(params.poolId, params.rangeInDays);
  }
}

