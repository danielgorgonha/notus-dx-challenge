import { NextRequest, NextResponse } from 'next/server';
import { blockchainActions } from '@/lib/actions';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('perPage') || '20');

    const response = await blockchainActions.listChains(page, perPage);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error listing chains:', error);
    return NextResponse.json(
      { error: 'Failed to list chains' },
      { status: 500 }
    );
  }
}
