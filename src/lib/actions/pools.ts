/**
 * Pools Server Actions
 * Usa Use Cases da Clean Architecture
 */

'use server';

import { createPoolService } from '@/server/services';
import { ListPoolsUseCase } from '@/server/use-cases/pool';
import { processPoolMetrics, isValidPool, getDefaultApiConfig } from '@/lib/utils/pool-calculations';

/**
 * Lista pools de liquidez
 */
export async function listPools() {
  try {
    const config = getDefaultApiConfig();
    
    if (!config.ids || config.ids.length === 0) {
      return { pools: [], total: 0 };
    }
    
    const poolService = createPoolService();
    const listPoolsUseCase = new ListPoolsUseCase(poolService);
    
    const responseData = await listPoolsUseCase.execute({
      take: config.take,
      offset: config.offset,
      chainIds: config.chainIds.toString(),
      filterWhitelist: config.filterWhitelist,
      rangeInDays: config.rangeInDays,
      ids: config.ids.join(',')
    });
    
    if (!responseData || !responseData.pools) {
      return { pools: [], total: 0 };
    }
    
    const pools = responseData.pools;
    
    const processedPools = pools
      .filter(isValidPool)
      .map((pool: any) => {
        const metrics = processPoolMetrics(pool);
        return {
          id: pool.id,
          address: pool.address,
          chain: pool.chain,
          provider: pool.provider,
          fee: pool.fee,
          tokenPair: `${pool.tokens[0]?.symbol || 'TOKEN1'}/${pool.tokens[1]?.symbol || 'TOKEN2'}`,
          tokens: pool.tokens,
          metrics,
          totalValueLockedUSD: pool.totalValueLockedUSD,
          stats: pool.stats
        };
      });
    
    return {
      pools: processedPools,
      total: processedPools.length,
      config: {
        requestedIds: config.ids,
        foundPools: processedPools.map((p: any) => p.id)
      }
    };
  } catch (error) {
    console.error('Error listing pools:', error);
    throw error;
  }
}

