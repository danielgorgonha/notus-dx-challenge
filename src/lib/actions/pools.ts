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
    
    const poolService = createPoolService();
    const listPoolsUseCase = new ListPoolsUseCase(poolService);
    
    // Preparar parâmetros de busca
    const params: any = {
      take: config.take || 50,
      offset: config.offset || 0,
      chainIds: config.chainIds?.toString(),
      filterWhitelist: config.filterWhitelist || false,
      rangeInDays: config.rangeInDays || 30,
    };
    
    // Adicionar IDs apenas se configurados
    if (config.ids && config.ids.length > 0) {
      params.ids = config.ids.join(',');
    }
    
    
    const responseData = await listPoolsUseCase.execute(params);
    
      isArray: Array.isArray(responseData),
      length: Array.isArray(responseData) ? responseData.length : 'not array',
      firstItem: Array.isArray(responseData) && responseData.length > 0 ? responseData[0] : null
    });
    
    // Se a resposta for um array direto, usar ele
    // Se for um objeto com propriedade pools, usar pools
    const pools = Array.isArray(responseData) 
      ? responseData 
      : (responseData?.pools || responseData?.data || []);
    
    if (!pools || pools.length === 0) {
      console.warn('⚠️ Nenhum pool retornado da API');
      return { pools: [], total: 0 };
    }
    
    
    const processedPools = pools
      .filter((pool: any) => {
        const valid = isValidPool(pool);
        if (!valid) {
          console.warn('⚠️ Pool inválido ignorado:', pool?.id || 'unknown');
        }
        return valid;
      })
      .map((pool: any) => {
        try {
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
        } catch (error) {
          console.error('❌ Erro ao processar pool:', pool?.id, error);
          return null;
        }
      })
      .filter((pool: any) => pool !== null);
    
    
    return {
      pools: processedPools,
      total: processedPools.length,
      config: {
        requestedIds: config.ids || [],
        foundPools: processedPools.map((p: any) => p.id)
      }
    };
  } catch (error) {
    console.error('❌ Error listing pools:', error);
    // Retornar array vazio em caso de erro ao invés de lançar exceção
    // para que a página não quebre completamente
    return { pools: [], total: 0, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

