import { NextRequest, NextResponse } from 'next/server';
import { notusAPI } from '@/lib/api/client';

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;
    
    // Fazer a chamada para a Notus API usando o cliente do servidor
    const response = await notusAPI.get(`kyc/individual-verification-sessions/${sessionId}/result`);

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error getting KYC session result:', error);
    return NextResponse.json(
      { error: 'Failed to get KYC session result' },
      { status: 500 }
    );
  }
}
