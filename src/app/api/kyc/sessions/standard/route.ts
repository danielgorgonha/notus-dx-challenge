import { NextRequest, NextResponse } from 'next/server';
import { notusAPI } from '@/lib/api/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Fazer a chamada para a Notus API usando o cliente do servidor
    const response = await notusAPI.post('kyc/individual-verification-sessions/standard', {
      json: body,
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating KYC session:', error);
    return NextResponse.json(
      { error: 'Failed to create KYC session' },
      { status: 500 }
    );
  }
}
