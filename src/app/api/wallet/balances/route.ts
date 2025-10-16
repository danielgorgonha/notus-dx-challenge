import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const chainId = searchParams.get('chainId') || '137';

    console.log('💰 Buscando saldos da smart wallet na API da Notus:', { address, chainId });

    if (!address) {
      return NextResponse.json(
        { error: 'Endereço da wallet é obrigatório' },
        { status: 400 }
      );
    }

    // Construir URL da API da Notus para saldos da wallet
    const notusApiUrl = new URL('https://api.notus.team/api/v1/wallet/balances');
    notusApiUrl.searchParams.set('address', address);
    notusApiUrl.searchParams.set('chainId', chainId);

    console.log('🌐 URL da API Notus para saldos:', notusApiUrl.toString());

    // Fazer requisição para a API da Notus
    const response = await fetch(notusApiUrl.toString(), {
      method: 'GET',
      headers: {
        'x-api-key': process.env.NOTUS_API_KEY || '',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('❌ Erro na API da Notus para saldos:', response.status, response.statusText);
      throw new Error(`API da Notus retornou erro: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Saldos da API Notus:', data);

    return NextResponse.json(data);

  } catch (error) {
    console.error('❌ Erro ao buscar saldos na API da Notus:', error);
    return NextResponse.json(
      { 
        error: 'Erro ao buscar saldos na API da Notus',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
