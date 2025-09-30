import { NextRequest, NextResponse } from 'next/server';
import { walletActions } from '@/lib/actions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await walletActions.register(body);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error registering wallet:', error);
    return NextResponse.json(
      { error: 'Failed to register wallet' },
      { status: 500 }
    );
  }
}
