import { NextRequest, NextResponse } from 'next/server';

// TODO: Implement withdrawal quote functionality
// This endpoint is not yet implemented in the new architecture
export async function POST(request: NextRequest) {
  try {
    // const body = await request.json();
    // TODO: Implement createWithdrawalQuote use case and service
    return NextResponse.json(
      { error: 'Withdrawal quote functionality not yet implemented' },
      { status: 501 }
    );
  } catch (error) {
    console.error('Error creating withdrawal quote:', error);
    return NextResponse.json(
      { error: 'Failed to create withdrawal quote' },
      { status: 500 }
    );
  }
}
