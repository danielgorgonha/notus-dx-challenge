import { NextRequest, NextResponse } from 'next/server';

// TODO: Implement withdrawal order functionality
// This endpoint is not yet implemented in the new architecture
export async function POST(request: NextRequest) {
  try {
    // const body = await request.json();
    // TODO: Implement createWithdrawalOrder use case and service
    return NextResponse.json(
      { error: 'Withdrawal order functionality not yet implemented' },
      { status: 501 }
    );
  } catch (error) {
    console.error('Error creating withdrawal order:', error);
    return NextResponse.json(
      { error: 'Failed to create withdrawal order' },
      { status: 500 }
    );
  }
}
