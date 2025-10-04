import { NextRequest, NextResponse } from 'next/server';
import { walletActions } from '@/lib/actions/wallet';

export async function POST(
  request: NextRequest,
  { params }: { params: { walletAddress: string } }
) {
  try {
    const { walletAddress } = params;
    const body = await request.json();
    const response = await walletActions.createDeposit(walletAddress, body);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error creating deposit:', error);
    return NextResponse.json(
      { error: 'Failed to create deposit' },
      { status: 500 }
    );
  }
}
