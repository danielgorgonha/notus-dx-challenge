import { NextRequest, NextResponse } from 'next/server';
import { liquidityActions } from '@/lib/actions/liquidity';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await liquidityActions.changeLiquidity(body);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error changing liquidity:', error);
    return NextResponse.json(
      { error: 'Failed to change liquidity' },
      { status: 500 }
    );
  }
}
