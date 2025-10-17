import { NextRequest, NextResponse } from 'next/server';
import { notusAPI } from '@/lib/api/client';
import { processPoolMetrics, isValidPool, getDefaultApiConfig } from '@/lib/utils/pool-calculations';

/**
 * API Route: GET /api/pools
 * Lista pools específicas configuradas nas variáveis de ambiente
 * Baseado no script test-specific-pools.sh
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🚀 [API] Buscando pools específicas...');
    
    // Obter configuração padrão
    const config = getDefaultApiConfig();
    console.log('📊 [API] Configuração:', config);
    
    if (!config.ids || config.ids.length === 0) {
      return NextResponse.json(
        { error: 'Nenhuma pool configurada nas variáveis de ambiente' },
        { status: 400 }
      );
    }
    
    // Construir parâmetros da query
    const params = new URLSearchParams();
    params.append('take', config.take.toString());
    params.append('offset', config.offset.toString());
    params.append('chainIds', config.chainIds.toString());
    params.append('filterWhitelist', config.filterWhitelist.toString());
    params.append('rangeInDays', config.rangeInDays.toString());
    
    // Adicionar IDs das pools
    config.ids.forEach(id => {
      params.append('ids', id);
    });
    
    const url = `liquidity/pools?${params.toString()}`;
    console.log('🔗 [API] URL da requisição:', url);
    
    // Fazer requisição para a API da Notus
    const response = await notusAPI.get(url);
    console.log('✅ [API] Resposta recebida:', response.status);
    
    const responseData = await response.json() as any;
    
    if (!responseData || !responseData.pools) {
      return NextResponse.json(
        { error: 'Dados de pools não encontrados na resposta' },
        { status: 404 }
      );
    }
    
    const pools = responseData.pools;
    console.log(`📊 [API] ${pools.length} pools encontradas`);
    
    // Processar cada pool
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
          // Dados originais para compatibilidade
          totalValueLockedUSD: pool.totalValueLockedUSD,
          stats: pool.stats
        };
      });
    
    console.log(`✅ [API] ${processedPools.length} pools processadas`);
    
    return NextResponse.json({
      pools: processedPools,
      total: processedPools.length,
      config: {
        requestedIds: config.ids,
        foundPools: processedPools.map((p: any) => p.id)
      }
    });
    
  } catch (error) {
    console.error('❌ [API] Erro ao buscar pools:', error);
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
