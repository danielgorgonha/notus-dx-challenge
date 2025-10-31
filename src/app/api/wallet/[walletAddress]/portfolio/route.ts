import { NextRequest, NextResponse } from 'next/server';
import { createWalletService } from '@/server/services';
import { GetPortfolioUseCase } from '@/server/use-cases/wallet';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ walletAddress: string }> }
) {
  try {
    const { walletAddress } = await params;
    
    const walletService = createWalletService();
    const useCase = new GetPortfolioUseCase(walletService);
    const response = await useCase.execute({ walletAddress });
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching wallet portfolio:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to fetch wallet portfolio' 
      },
      { status: 500 }
    );
  }
}
