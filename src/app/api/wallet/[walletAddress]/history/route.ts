import { NextRequest, NextResponse } from 'next/server';
import { createWalletService } from '@/server/services';
import { GetHistoryUseCase } from '@/server/use-cases/wallet';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ walletAddress: string }> }
) {
  try {
    const { walletAddress } = await params;
    const { searchParams } = new URL(request.url);
    
    const queryParams = {
      take: searchParams.get('take') ? parseInt(searchParams.get('take')!) : undefined,
      lastId: searchParams.get('lastId') || undefined,
      type: searchParams.get('type') || undefined,
      status: searchParams.get('status') || undefined,
      chains: searchParams.get('chains') || undefined,
      createdAt: searchParams.get('createdAt') || undefined,
    };

    const walletService = createWalletService();
    const useCase = new GetHistoryUseCase(walletService);
    const response = await useCase.execute({
      walletAddress,
      ...queryParams,
    });
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching wallet history:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to fetch wallet history' 
      },
      { status: 500 }
    );
  }
}
