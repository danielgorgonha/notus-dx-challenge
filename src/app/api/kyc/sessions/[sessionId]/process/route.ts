import { NextRequest, NextResponse } from 'next/server';
import { notusAPI } from '@/lib/api/client';

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;
    
    // Fazer a chamada para a Notus API usando o cliente do servidor
    const response = await notusAPI.post(`kyc/individual-verification-sessions/${sessionId}/process`);

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error processing KYC session:', error);
    return NextResponse.json(
      { error: 'Failed to process KYC session' },
      { status: 500 }
    );
  }
}
