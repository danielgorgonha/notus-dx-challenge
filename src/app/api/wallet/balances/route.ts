import { NextRequest, NextResponse } from 'next/server';
import { createWalletService } from '@/server/services';
import { GetPortfolioUseCase } from '@/server/use-cases/wallet';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const chainId = searchParams.get('chainId') || '137';

    if (!address) {
      return NextResponse.json(
        { error: 'Endereço da wallet é obrigatório' },
        { status: 400 }
      );
    }

    // TODO: Remover hardcode quando implementarmos seleção de wallet
    const realWalletAddress = '0x29275940040857bf0ffe8d875622c85aaaec5c0a';

    const walletService = createWalletService();
    const useCase = new GetPortfolioUseCase(walletService);
    const portfolio = await useCase.execute({ walletAddress: realWalletAddress });

    // Processar saldos dos tokens
    const balances: Record<string, number> = {};
    
    if (portfolio.tokens && Array.isArray(portfolio.tokens)) {
      portfolio.tokens.forEach((token: any) => {
        const symbol = token.symbol?.toUpperCase();
        if (symbol === 'USDC' || symbol === 'USDC.E' || symbol === 'BRZ') {
          const balance = parseFloat(token.balanceFormatted || '0');
          balances[symbol] = balance;
        }
      });
    }

    return NextResponse.json({
      balances,
      wallet: realWalletAddress,
      chainId: parseInt(chainId),
      timestamp: new Date().toISOString(),
      portfolio
    });

  } catch (error) {
    console.error('Error fetching wallet balances:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to fetch wallet balances'
      },
      { status: 500 }
    );
  }
}
