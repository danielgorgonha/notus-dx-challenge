import { NextRequest, NextResponse } from 'next/server';
import { notusAPI } from '@/lib/api/client';

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

    // Fazer a chamada para a Notus API usando o cliente do servidor
    const response = await notusAPI.get('wallets/address', {
      searchParams: {
        factory,
        salt,
        externallyOwnedAccount,
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching wallet address:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wallet address' },
      { status: 500 }
    );
  }
}
