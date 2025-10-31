import { NextRequest, NextResponse } from 'next/server';
import { createTransferService } from '@/server/services';
import { CreateTransferQuoteUseCase } from '@/server/use-cases/transfer';
import type { CreateTransferQuoteParams } from '@/shared/types/transfer.types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as CreateTransferQuoteParams;
    
    const transferService = createTransferService();
    const useCase = new CreateTransferQuoteUseCase(transferService);
    const response = await useCase.execute(body);
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error creating transfer quote:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to create transfer quote' 
      },
      { status: 500 }
    );
  }
}
