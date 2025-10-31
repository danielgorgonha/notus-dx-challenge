import { NextRequest, NextResponse } from 'next/server';
import { walletActions } from '@/lib/actions/wallet-compat';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ walletAddress: string }> }
) {
  try {
    const { walletAddress } = await params;
    const response = await walletActions.getPortfolio(walletAddress);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching wallet portfolio:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wallet portfolio' },
      { status: 500 }
    );
  }
}
