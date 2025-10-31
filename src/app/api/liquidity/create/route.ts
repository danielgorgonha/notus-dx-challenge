import { NextRequest, NextResponse } from 'next/server';
import { createPoolService } from '@/server/services';
import { CreateLiquidityUseCase } from '@/server/use-cases/pool';
import type { CreateLiquidityParams } from '@/shared/types/pool.types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as CreateLiquidityParams;
    
    // Validações básicas
    const requiredFields = [
      'walletAddress', 'toAddress', 'chainId', 'payGasFeeToken', 
      'gasFeePaymentMethod', 'token0', 'token1', 'poolFeePercent',
      'token0Amount', 'token1Amount', 'minPrice', 'maxPrice'
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Campo obrigatório ausente: ${field}` },
          { status: 400 }
        );
      }
    }

    const poolService = createPoolService();
    const useCase = new CreateLiquidityUseCase(poolService);
    const response = await useCase.execute(body);
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error creating liquidity:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to create liquidity' 
      },
      { status: 500 }
    );
  }
}
