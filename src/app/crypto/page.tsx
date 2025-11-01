/**
 * Crypto Market Page - Server Component
 * Tela de mercado de criptomoedas
 */

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { listTokens } from "@/lib/actions/blockchain";
import { enrichTokensWithCoinGeckoData } from "@/lib/services/coingecko.service";
import { AppLayout } from "@/components/layout/app-layout";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { CryptoClient } from "@/components/crypto/crypto-client";

export default async function CryptoPage() {
  // Autenticação no servidor
  const user = await auth();
  
  if (!user || !user.wallet?.address) {
    redirect("/");
  }

  // Buscar lista de tokens ordenados por marketCap - apenas Polygon (chainId: 137)
  let tokensData;
  try {
    // A API Notus tem limite máximo de 100 tokens por página
    tokensData = await listTokens({
      page: 1,
      perPage: 100, // Máximo permitido pela API
      orderBy: 'marketCap',
      orderDir: 'desc',
      filterWhitelist: false,
      filterByChainId: 137, // Polygon
    });
    console.log('📊 CryptoPage - Tokens recebidos:', {
      total: tokensData?.total,
      tokensLength: tokensData?.tokens?.length,
    });

    // Enriquecer tokens com dados do CoinGecko (price, priceChange24h, volume24h)
    if (tokensData?.tokens && tokensData.tokens.length > 0) {
      try {
        const enrichedMap = await enrichTokensWithCoinGeckoData(tokensData.tokens);
        
        // Mesclar dados enriquecidos nos tokens
        tokensData.tokens = tokensData.tokens.map((token) => {
          const symbol = token.symbol?.toUpperCase() || '';
          const enriched = enrichedMap.get(symbol);
          
          return {
            ...token,
            price: enriched?.price,
            priceUsd: enriched?.price,
            priceChange24h: enriched?.priceChange24h,
            change24h: enriched?.priceChange24h,
            volume24h: enriched?.volume24h,
          };
        });
        
        console.log('✅ Tokens enriquecidos com dados do CoinGecko');
      } catch (error) {
        console.error('⚠️ Erro ao enriquecer tokens com CoinGecko (continuando sem dados):', error);
        // Continuar sem dados do CoinGecko se houver erro
      }
    }
  } catch (error) {
    console.error('❌ Erro ao buscar tokens:', error);
    tokensData = { tokens: [], total: 0 };
  }

  return (
    <ProtectedRoute>
      <AppLayout 
        title="Criptomoedas"
        description="Mercado de criptomoedas"
        showHeader={false}
      >
        <CryptoClient initialTokens={tokensData?.tokens || []} total={tokensData?.total || 0} />
      </AppLayout>
    </ProtectedRoute>
  );
}

