import { NextRequest, NextResponse } from 'next/server';
import { notusAPI } from '@/lib/api/client';
import { processPoolMetrics, isValidPool, getDefaultApiConfig } from '@/lib/utils/pool-calculations';

/**
 * API Route: GET /api/liquidity/pools/[id]
 * Busca detalhes de uma pool específica por ID
 * Baseado no script test-get-pool-by-id.sh
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: poolId } = await params;
    
    if (!poolId) {
      return NextResponse.json(
        { error: 'ID da pool é obrigatório' },
        { status: 400 }
      );
    }
    
    // Obter rangeInDays da query (padrão: 30)
    const { searchParams } = new URL(request.url);
    const rangeInDays = searchParams.get('rangeInDays') || '30';
    
    // Fazer requisição para a API da Notus
    const url = `liquidity/pools/${poolId}?rangeInDays=${rangeInDays}`;
    
    const response = await notusAPI.get(url);
    
    const responseData = await response.json() as any;
    
    if (!responseData || !responseData.pool) {
      return NextResponse.json(
        { error: 'Pool não encontrada' },
        { status: 404 }
      );
    }
    
    const pool = responseData.pool;
    
    // Validar pool
    if (!isValidPool(pool)) {
      console.error('❌ [API] Dados da pool inválidos');
      return NextResponse.json(
        { error: 'Dados da pool inválidos' },
        { status: 400 }
      );
    }
    
    // Processar pool (mesma lógica da API de lista)
    const metrics = processPoolMetrics(pool);
    const processedPool = {
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
    
      id: processedPool.id,
      hasMetrics: !!processedPool.metrics
    });
    
    return NextResponse.json({
      pool: processedPool,
      success: true
    });
    
  } catch (error) {
    console.error('❌ [API] Erro ao buscar pool:', error);
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}