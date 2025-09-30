import { NextRequest, NextResponse } from 'next/server';
import { liquidityActions } from '@/lib/actions';

export async function GET(
  request: NextRequest,
  { params }: { params: { poolId: string } }
) {
  try {
    const { poolId } = params;
    const { searchParams } = new URL(request.url);
    const days = searchParams.get('days') ? parseInt(searchParams.get('days')!) : undefined;

    const response = await liquidityActions.getHistoricalData(poolId, { days });
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching pool historical data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pool historical data' },
      { status: 500 }
    );
  }
}
