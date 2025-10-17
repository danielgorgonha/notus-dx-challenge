import { NextRequest, NextResponse } from 'next/server';
import { notusAPI } from '@/lib/api/client';
import { processPoolMetrics, isValidPool } from '@/lib/utils/pool-calculations';

/**
 * API Route: GET /api/pools/[id]
 * Busca detalhes de uma pool específica
 * Baseado no script test-specific-pools.sh
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const poolId = params.id;
    console.log('🚀 [API] Buscando detalhes da pool:', poolId);
    
    if (!poolId) {
      return NextResponse.json(
        { error: 'ID da pool é obrigatório' },
        { status: 400 }
      );
    }
    
    // Fazer requisição para a API da Notus
    const response = await notusAPI.get(`liquidity/pools/${poolId}`);
    console.log('✅ [API] Resposta recebida:', response.status);
    
    const responseData = await response.json();
    
    if (!responseData || !responseData.pool) {
      return NextResponse.json(
        { error: 'Pool não encontrada' },
        { status: 404 }
      );
    }
    
    const pool = responseData.pool;
    console.log('📊 [API] Dados da pool:', pool.id);
    
    // Validar pool
    if (!isValidPool(pool)) {
      return NextResponse.json(
        { error: 'Dados da pool inválidos' },
        { status: 400 }
      );
    }
    
    // Processar métricas da pool
    const metrics = processPoolMetrics(pool);
    console.log('📊 [API] Métricas calculadas:', {
      apr: metrics.formatted.apr,
      tvl: metrics.formatted.tvl,
      volume24h: metrics.formatted.volume24h,
      composition: metrics.formatted.composition
    });
    
    // Retornar dados processados
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
