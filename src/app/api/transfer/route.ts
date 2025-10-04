import { NextRequest, NextResponse } from 'next/server';
import { transferActions } from '@/lib/actions/transfer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await transferActions.createTransfer(body);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error creating transfer:', error);
    return NextResponse.json(
      { error: 'Failed to create transfer' },
      { status: 500 }
    );
  }
}
