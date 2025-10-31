/**
 * Create Liquidity Use Case
 * Caso de uso: Criar liquidez em um pool
 */

import { PoolService } from '../../services/pool.service';
import type { CreateLiquidityParams } from '@/shared/types/pool.types';

export class CreateLiquidityUseCase {
  constructor(private poolService: PoolService) {}

  /**
   * Executa o caso de uso de criação de liquidez
   */
  async execute(params: CreateLiquidityParams): Promise<unknown> {
    // Validações adicionais
    if (!params.walletAddress) {
      throw new Error('Wallet address is required');
    }

    // Verificar se os valores são positivos
    const token0Amount = parseFloat(params.token0Amount);
    const token1Amount = parseFloat(params.token1Amount);

    if (token0Amount <= 0 || token1Amount <= 0) {
      throw new Error('Both token amounts must be greater than 0');
    }

    return this.poolService.createLiquidity(params);
  }
}

