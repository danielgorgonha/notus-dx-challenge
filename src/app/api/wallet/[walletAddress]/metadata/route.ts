import { NextRequest, NextResponse } from 'next/server';
import { createWalletService } from '@/server/services';
import { UpdateMetadataUseCase } from '@/server/use-cases/wallet';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ walletAddress: string }> }
) {
  try {
    const { walletAddress } = await params;
    const body = await request.json();
    
    const walletService = createWalletService();
    const useCase = new UpdateMetadataUseCase(walletService);
    await useCase.execute({ walletAddress, metadata: body });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating wallet metadata:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to update wallet metadata' 
      },
      { status: 500 }
    );
  }
}
