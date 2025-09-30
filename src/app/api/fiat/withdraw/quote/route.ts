import { NextRequest, NextResponse } from 'next/server';
import { fiatActions } from '@/lib/actions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await fiatActions.createWithdrawalQuote(body);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error creating withdrawal quote:', error);
    return NextResponse.json(
      { error: 'Failed to create withdrawal quote' },
      { status: 500 }
    );
  }
}
