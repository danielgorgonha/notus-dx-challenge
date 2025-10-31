import { NextRequest, NextResponse } from 'next/server';
import { walletActions } from '@/lib/actions/wallet-compat';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('perPage') || '20');

    const response = await walletActions.listWallets(page, perPage);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error listing wallets:', error);
    return NextResponse.json(
      { error: 'Failed to list wallets' },
      { status: 500 }
    );
  }
}
