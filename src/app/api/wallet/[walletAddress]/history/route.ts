import { NextRequest, NextResponse } from 'next/server';
import { walletActions } from '@/lib/actions';

export async function GET(
  request: NextRequest,
  { params }: { params: { walletAddress: string } }
) {
  try {
    const { walletAddress } = params;
    const { searchParams } = new URL(request.url);
    
    const queryParams = {
      take: searchParams.get('take') ? parseInt(searchParams.get('take')!) : undefined,
      lastId: searchParams.get('lastId') || undefined,
      type: searchParams.get('type') || undefined,
      status: searchParams.get('status') || undefined,
      chains: searchParams.get('chains') || undefined,
      createdAt: searchParams.get('createdAt') || undefined,
    };

    const response = await walletActions.getHistory(walletAddress, queryParams);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching wallet history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wallet history' },
      { status: 500 }
    );
  }
}
