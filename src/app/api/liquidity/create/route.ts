import { NextRequest, NextResponse } from 'next/server';
import { liquidityActions } from '@/lib/actions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await liquidityActions.createLiquidity(body);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error creating liquidity:', error);
    return NextResponse.json(
      { error: 'Failed to create liquidity' },
      { status: 500 }
    );
  }
}
