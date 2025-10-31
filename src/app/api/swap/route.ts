import { NextRequest, NextResponse } from 'next/server';
import { createSwapService } from '@/server/services';
import { CreateSwapQuoteUseCase } from '@/server/use-cases/swap';
import type { CreateSwapQuoteParams } from '@/shared/types/swap.types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as CreateSwapQuoteParams;
    
    const swapService = createSwapService();
    const useCase = new CreateSwapQuoteUseCase(swapService);
    const response = await useCase.execute(body);
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error creating swap quote:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to create swap quote' 
      },
      { status: 500 }
    );
  }
}
