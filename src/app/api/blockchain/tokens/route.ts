import { NextRequest, NextResponse } from 'next/server';
import { listTokens } from '@/lib/actions/blockchain';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('perPage') || '20');

    const response = await listTokens(page, perPage);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error listing tokens:', error);
    return NextResponse.json(
      { error: 'Failed to list tokens' },
      { status: 500 }
    );
  }
}
