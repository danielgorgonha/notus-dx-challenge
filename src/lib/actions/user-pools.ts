/**
 * User Pools Server Actions
 * Busca pools de liquidez do usuário baseado no histórico de transações
 */

'use server';

import { getHistory } from './dashboard';
import { createPoolService } from '@/server/services';
import { GetPoolUseCase } from '@/server/use-cases/pool';

/**
 * Busca pools de liquidez do usuário
 * Extrai poolIds do histórico de transações e busca detalhes dos pools
 */
export async function getUserPools(walletAddress: string) {
  try {
    // Buscar histórico completo para identificar pools (máximo 100 conforme validação)
    const history = await getHistory(walletAddress, { take: 100 });
    
    // Extrair poolIds únicos das transações de liquidez
    const poolIds = new Set<string>();
    
    (history?.transactions || []).forEach((tx: any) => {
      // Verificar se é transação de liquidez
      if (
        tx.type?.toLowerCase() === 'liquidity' || 
        tx.type?.toLowerCase() === 'invest' ||
        tx.metadata?.type === 'liquidity'
      ) {
        // Tentar extrair poolId de diferentes lugares
        let poolId = 
          tx.metadata?.poolId || 
          tx.metadata?.pool_id || 
          tx.metadata?.poolAddress ||
          tx.metadata?.pool_address ||
          tx.metadata?.liquidityProvider;
        
        // Se não encontrar direto, tentar no operation (se existir)
        if (!poolId && tx.metadata?.operation) {
          poolId = 
            tx.metadata.operation.poolId ||
            tx.metadata.operation.pool_id ||
            tx.metadata.operation.liquidityProvider;
        }
        
        // Se ainda não encontrou, tentar construir do chainId e address
        if (!poolId && tx.metadata?.chainId && tx.metadata?.poolAddress) {
          poolId = `${tx.metadata.chainId}-${tx.metadata.poolAddress}`;
        }
        
        if (poolId) {
          poolIds.add(poolId);
        }
      }
    });

    console.log('🏊 Pools identificados do histórico:', Array.from(poolIds));

    if (poolIds.size === 0) {
      return { pools: [], total: 0 };
    }

    // Buscar detalhes de cada pool
    const poolService = createPoolService();
    const getPoolUseCase = new GetPoolUseCase(poolService);
    
    const poolsData = await Promise.allSettled(
      Array.from(poolIds).map(async (poolId) => {
        try {
          const pool = await getPoolUseCase.execute({ poolId, rangeInDays: 30 });
          
          // A resposta pode vir em formato { pool: {...} } ou direto
          const poolData = (pool as any).pool || pool;
          
          return {
            id: poolData.id || poolId,
            address: poolData.address,
            chain: poolData.chain,
            provider: poolData.provider,
            fee: poolData.fee,
            tokens: poolData.tokens,
            totalValueLockedUSD: poolData.totalValueLockedUSD || poolData.tvl || '0',
            stats: poolData.stats,
          };
        } catch (error) {
          console.error(`❌ Erro ao buscar pool ${poolId}:`, error);
          return null;
        }
      })
    );

    // Filtrar pools válidos
    const validPools = poolsData
      .filter((result) => result.status === 'fulfilled' && result.value)
      .map((result) => (result as PromiseFulfilledResult<any>).value);

    console.log(`✅ ${validPools.length} pools do usuário encontrados`);

    return {
      pools: validPools,
      total: validPools.length,
    };
  } catch (error) {
    console.error('❌ Erro ao buscar pools do usuário:', error);
    return { pools: [], total: 0 };
  }
}

