import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const filterByChainId = searchParams.get('filterByChainId');
    const filterWhitelist = searchParams.get('filterWhitelist');
    const page = searchParams.get('page') || '1';
    const perPage = searchParams.get('perPage') || '100';


    // Construir URL da API da Notus
    const notusApiUrl = new URL('https://api.notus.team/api/v1/crypto/tokens');
    notusApiUrl.searchParams.set('search', search || '');
    notusApiUrl.searchParams.set('filterByChainId', filterByChainId || '137');
    notusApiUrl.searchParams.set('filterWhitelist', filterWhitelist || 'false');
    notusApiUrl.searchParams.set('page', page);
    notusApiUrl.searchParams.set('perPage', perPage);


    // Fazer requisição para a API da Notus
    const response = await fetch(notusApiUrl.toString(), {
      method: 'GET',
      headers: {
        'x-api-key': process.env.NOTUS_API_KEY || '',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('❌ Erro na API da Notus:', response.status, response.statusText);
      throw new Error(`API da Notus retornou erro: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data);

  } catch (error) {
    console.error('❌ Erro ao buscar tokens na API da Notus:', error);
    return NextResponse.json(
      { 
        error: 'Erro ao buscar tokens na API da Notus',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
