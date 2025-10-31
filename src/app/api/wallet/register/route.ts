import { NextRequest, NextResponse } from 'next/server';
import { createWalletService } from '@/server/services';
import { CreateWalletUseCase } from '@/server/use-cases/wallet';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const walletService = createWalletService();
    const useCase = new CreateWalletUseCase(walletService);
    const response = await useCase.execute(body);
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error registering wallet:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to register wallet' 
      },
      { status: 500 }
    );
  }
}
