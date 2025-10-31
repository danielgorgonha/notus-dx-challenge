import { NextRequest, NextResponse } from 'next/server';
import { createPoolService } from '@/server/services';
import { ListPoolsUseCase } from '@/server/use-cases/pool';
import { processPoolMetrics, isValidPool, getDefaultApiConfig } from '@/lib/utils/pool-calculations';
import type { PoolListParams } from '@/shared/types/pool.types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Se houver configuração padrão de pools (variáveis de ambiente)
    const defaultConfig = getDefaultApiConfig();
    
    // Se não houver parâmetros na query, usar configuração padrão
    const useDefaultConfig = searchParams.toString() === '';
    
    if (useDefaultConfig && defaultConfig.ids && defaultConfig.ids.length > 0) {
      // Usar configuração padrão
      const params: PoolListParams = {
        take: defaultConfig.take,
        offset: defaultConfig.offset,
        chainIds: defaultConfig.chainIds.toString(),
        filterWhitelist: defaultConfig.filterWhitelist,
        rangeInDays: defaultConfig.rangeInDays,
        ids: defaultConfig.ids.join(','),
      };

      const poolService = createPoolService();
      const useCase = new ListPoolsUseCase(poolService);
      const pools = await useCase.execute(params);
      
      // Processar pools
      const processedPools = (pools as any[])
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

      return NextResponse.json({
        pools: processedPools,
        total: processedPools.length,
        config: {
          requestedIds: defaultConfig.ids,
          foundPools: processedPools.map((p: any) => p.id)
        }
      });
    }
    
    // Caso contrário, usar parâmetros da query
    const params: PoolListParams = {
      take: searchParams.get('take') ? parseInt(searchParams.get('take')!) : undefined,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
      chainIds: searchParams.get('chainIds') || undefined,
      tokensAddresses: searchParams.get('tokensAddresses') || undefined,
      filterWhitelist: searchParams.get('filterWhitelist') === 'true',
      rangeInDays: searchParams.get('rangeInDays') ? parseInt(searchParams.get('rangeInDays')!) : undefined,
      ids: searchParams.get('ids') || undefined,
    };

    const poolService = createPoolService();
    const useCase = new ListPoolsUseCase(poolService);
    const pools = await useCase.execute(params);
    
    return NextResponse.json({ pools });
    
  } catch (error) {
    console.error('Error fetching pools:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to fetch pools' 
      },
      { status: 500 }
    );
  }
}
