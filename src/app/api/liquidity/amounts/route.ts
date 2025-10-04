import { NextRequest, NextResponse } from 'next/server';
import { liquidityActions } from '@/lib/actions/liquidity';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const params = {
      poolId: searchParams.get('poolId') || '',
      walletAddress: searchParams.get('walletAddress') || '',
    };

    const response = await liquidityActions.getAmounts(params);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching liquidity amounts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch liquidity amounts' },
      { status: 500 }
    );
  }
}
