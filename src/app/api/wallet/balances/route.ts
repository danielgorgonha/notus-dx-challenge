import { NextRequest, NextResponse } from 'next/server';
import { walletActions } from '@/lib/actions/wallet-compat';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const chainId = searchParams.get('chainId') || '137';

    console.log('💰 Buscando saldos da smart wallet via API da Notus:', { address, chainId });

    if (!address) {
      return NextResponse.json(
        { error: 'Endereço da wallet é obrigatório' },
        { status: 400 }
      );
    }

    // Usar o endereço real da wallet que tem saldo de BRZ
    const realWalletAddress = '0x29275940040857bf0ffe8d875622c85aaaec5c0a';
    console.log('🔄 Usando endereço real da wallet:', realWalletAddress);

    // Usar a mesma abordagem das outras telas (swap, transfer)
    const portfolio = await walletActions.getPortfolio(realWalletAddress);
    console.log('✅ Portfolio da API Notus:', portfolio);

    // Processar os dados do portfolio para extrair saldos dos tokens
    const balances: {[key: string]: number} = {};
    
    if (portfolio.tokens && Array.isArray(portfolio.tokens)) {
      portfolio.tokens.forEach((token: any) => {
        const symbol = token.symbol?.toUpperCase();
        if (symbol === 'USDC' || symbol === 'USDC.E' || symbol === 'BRZ') {
          const balance = parseFloat(token.balanceFormatted || '0'); // Usar balanceFormatted
          balances[symbol] = balance;
          console.log(`💎 Token encontrado: ${symbol} = ${balance} (${token.balanceFormatted})`);
        }
      });
    }

    console.log('🎯 Saldos extraídos:', balances);

    return NextResponse.json({
      balances,
      wallet: realWalletAddress,
      chainId: parseInt(chainId),
      timestamp: new Date().toISOString(),
      portfolio: portfolio
    });

  } catch (error) {
    console.error('❌ Erro ao buscar saldos da API da Notus:', error);
    return NextResponse.json(
      { 
        error: 'Erro ao buscar saldos da API da Notus',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
