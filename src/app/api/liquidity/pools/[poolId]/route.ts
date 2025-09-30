import { NextRequest, NextResponse } from 'next/server';
import { liquidityActions } from '@/lib/actions';

export async function GET(
  request: NextRequest,
  { params }: { params: { poolId: string } }
) {
  try {
    const { poolId } = params;
    const response = await liquidityActions.getPool(poolId);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching pool details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pool details' },
      { status: 500 }
    );
  }
}
