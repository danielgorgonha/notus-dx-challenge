import { NextRequest, NextResponse } from 'next/server';
import { liquidityActions } from '@/lib/actions/liquidity';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const params = {
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined,
      perPage: searchParams.get('perPage') ? parseInt(searchParams.get('perPage')!) : undefined,
      chainId: searchParams.get('chainId') ? parseInt(searchParams.get('chainId')!) : undefined,
      token0: searchParams.get('token0') || undefined,
      token1: searchParams.get('token1') || undefined,
    };

    const response = await liquidityActions.listPools(params);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error listing liquidity pools:', error);
    return NextResponse.json(
      { error: 'Failed to list liquidity pools' },
      { status: 500 }
    );
  }
}
