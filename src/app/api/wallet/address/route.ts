import { NextRequest, NextResponse } from 'next/server';
import { createWalletService } from '@/server/services';
import { GetWalletUseCase } from '@/server/use-cases/wallet';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const externallyOwnedAccount = searchParams.get('externallyOwnedAccount');
    const factory = searchParams.get('factory') || '0x7a1dbab750f12a90eb1b60d2ae3ad17d4d81effe';
    const salt = searchParams.get('salt') || '0';

    if (!externallyOwnedAccount) {
      return NextResponse.json(
        { error: 'externallyOwnedAccount is required' },
        { status: 400 }
      );
    }

    const walletService = createWalletService();
    const useCase = new GetWalletUseCase(walletService);
    const wallet = await useCase.execute({
      externallyOwnedAccount,
      factory,
      salt,
    });

    return NextResponse.json({ wallet });
  } catch (error) {
    console.error('Error fetching wallet address:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to fetch wallet address' 
      },
      { status: 500 }
    );
  }
}
