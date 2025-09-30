import { NextRequest, NextResponse } from 'next/server';
import { walletActions } from '@/lib/actions';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { walletAddress: string } }
) {
  try {
    const { walletAddress } = params;
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
