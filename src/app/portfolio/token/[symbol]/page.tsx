/**
 * Token Detail Page - Server Component
 * Tela de detalhes de um token específico
 */

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { getWalletAddress, getPortfolio } from "@/lib/actions/dashboard";
import { getTokenBySymbol } from "@/lib/actions/token";
import { enrichTokensWithCoinGeckoData } from "@/lib/services/coingecko.service";
import { AppLayout } from "@/components/layout/app-layout";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { TokenDetailClient } from "@/components/token/token-detail-client";

interface TokenDetailPageProps {
  params: Promise<{ symbol: string }>;
}

export const dynamic = 'force-dynamic';

export default async function TokenDetailPage({ params }: TokenDetailPageProps) {
  // Autenticação no servidor
  const user = await auth();
  
  if (!user || !user.wallet?.address) {
    redirect("/");
  }

  const { symbol } = await params;
  const externallyOwnedAccount = user.wallet.address;
  
  // Buscar wallet address primeiro para obter accountAbstraction
  const walletData = await getWalletAddress({ externallyOwnedAccount });
  const wallet = walletData.wallet;
  const accountAbstractionAddress = wallet?.accountAbstraction || user.accountAbstractionAddress;

  // Buscar dados no servidor
  const [portfolio, tokenInfo] = await Promise.all([
    getPortfolio(accountAbstractionAddress || '').catch((error) => {
      console.error('❌ Erro ao buscar portfolio:', error);
      return { tokens: [], totalValueUSD: '0' };
    }),
    getTokenBySymbol(symbol).catch((error) => {
      console.error('❌ Erro ao buscar token:', error);
      return null;
    }),
  ]);

  // Encontrar o token no portfolio
  const tokenInPortfolio = portfolio?.tokens?.find((t: any) => 
    t.symbol?.toUpperCase() === symbol.toUpperCase()
  );

  // Combinar dados do portfolio com informações do token
  let tokenData = tokenInPortfolio || tokenInfo;
  
  if (!tokenData) {
    redirect("/portfolio");
  }

  // Enriquecer token com dados do CoinGecko (price, priceChange24h, volume24h)
  try {
    const enrichedMap = await enrichTokensWithCoinGeckoData([tokenData]);
    const symbol = tokenData.symbol?.toUpperCase() || '';
    const enriched = enrichedMap.get(symbol);
    
    if (enriched) {
      tokenData = {
        ...tokenData,
        price: enriched.price,
        priceUsd: enriched.price,
        priceChange24h: enriched.priceChange24h,
        change24h: enriched.priceChange24h,
        volume24h: enriched.volume24h,
      };
    }
  } catch (error) {
    console.error('⚠️ Erro ao enriquecer token com CoinGecko (continuando sem dados):', error);
    // Continuar sem dados do CoinGecko se houver erro
  }

  return (
    <ProtectedRoute>
      <AppLayout 
        title={`${symbol} - Detalhes`}
        description={`Informações detalhadas do token ${symbol}`}
        showHeader={false}
      >
        <TokenDetailClient
          token={tokenData}
          tokenInfo={tokenInfo}
          walletAddress={accountAbstractionAddress || ''}
          mode="portfolio"
        />
      </AppLayout>
    </ProtectedRoute>
  );
}

