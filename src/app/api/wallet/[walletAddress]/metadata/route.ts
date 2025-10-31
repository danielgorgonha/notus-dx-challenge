import { NextRequest, NextResponse } from 'next/server';
import { walletActions } from '@/lib/actions/wallet-compat';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ walletAddress: string }> }
) {
  try {
    const { walletAddress } = await params;
    const body = await request.json();
    const response = await walletActions.updateMetadata(walletAddress, body);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating wallet metadata:', error);
    return NextResponse.json(
      { error: 'Failed to update wallet metadata' },
      { status: 500 }
    );
  }
}
