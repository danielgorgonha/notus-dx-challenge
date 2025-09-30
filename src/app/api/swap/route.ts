import { NextRequest, NextResponse } from 'next/server';
import { swapActions } from '@/lib/actions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await swapActions.createSwap(body);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error creating swap:', error);
    return NextResponse.json(
      { error: 'Failed to create swap' },
      { status: 500 }
    );
  }
}
