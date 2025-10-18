import { NextRequest, NextResponse } from 'next/server';

const NOTUS_API_BASE = 'https://api.notus.team/api/v1';
const API_KEY = process.env.NOTUS_API_KEY;

if (!API_KEY) {
  throw new Error('NOTUS_API_KEY environment variable is required');
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 [CREATE-LIQUIDITY] Recebendo requisição de criação de liquidez');
    
    const body = await request.json();
    console.log('📊 [CREATE-LIQUIDITY] Dados recebidos:', {
      walletAddress: body.walletAddress,
      chainId: body.chainId,
      token0: body.token0,
      token1: body.token1,
      token0Amount: body.token0Amount,
      token1Amount: body.token1Amount,
      minPrice: body.minPrice,
      maxPrice: body.maxPrice
    });

    // Validar parâmetros obrigatórios
    const requiredFields = [
      'walletAddress', 'toAddress', 'chainId', 'payGasFeeToken', 
      'gasFeePaymentMethod', 'token0', 'token1', 'poolFeePercent',
      'token0Amount', 'token1Amount', 'minPrice', 'maxPrice'
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        console.error(`❌ [CREATE-LIQUIDITY] Campo obrigatório ausente: ${field}`);
        return NextResponse.json(
          { error: `Campo obrigatório ausente: ${field}` },
          { status: 400 }
        );
      }
    }

    // Fazer requisição para API Notus
    const notusResponse = await fetch(`${NOTUS_API_BASE}/liquidity/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify(body),
    });

    console.log(`📡 [CREATE-LIQUIDITY] Resposta da API Notus: ${notusResponse.status}`);

    if (!notusResponse.ok) {
      const errorData = await notusResponse.json();
      console.error('❌ [CREATE-LIQUIDITY] Erro da API Notus:', errorData);
      
      return NextResponse.json(
        { 
          error: 'Erro na API Notus',
          details: errorData,
          status: notusResponse.status 
        },
        { status: notusResponse.status }
      );
    }

    const responseData = await notusResponse.json();
    console.log('✅ [CREATE-LIQUIDITY] Liquidez criada com sucesso:', {
      operation: responseData.operation?.liquidityProvider,
      chainId: responseData.operation?.chainId,
      walletAddress: responseData.operation?.walletAddress
    });

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('❌ [CREATE-LIQUIDITY] Erro interno:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}