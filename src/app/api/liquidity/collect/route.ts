import { NextRequest, NextResponse } from 'next/server';
import { liquidityActions } from '@/lib/actions/liquidity';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await liquidityActions.collectFees(body);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error collecting fees:', error);
    return NextResponse.json(
      { error: 'Failed to collect fees' },
      { status: 500 }
    );
  }
}
