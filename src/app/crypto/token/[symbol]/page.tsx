/**
 * Crypto Token Detail Page - Server Component
 * Tela de detalhes de um token específico acessado via menu Cripto
 */

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { getWalletAddress, getPortfolio } from "@/lib/actions/dashboard";
import { getTokenBySymbol } from "@/lib/actions/token";
import { AppLayout } from "@/components/layout/app-layout";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { TokenDetailClient } from "@/components/token/token-detail-client";

interface CryptoTokenDetailPageProps {
  params: Promise<{ symbol: string }>;
}

export default async function CryptoTokenDetailPage({ params }: CryptoTokenDetailPageProps) {
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

  // Encontrar o token no portfolio (se existir)
  const tokenInPortfolio = portfolio?.tokens?.find((t: any) => 
    t.symbol?.toUpperCase() === symbol.toUpperCase()
  );

  // Combinar dados do portfolio com informações do token
  const tokenData = tokenInPortfolio || tokenInfo;
  
  if (!tokenData) {
    redirect("/crypto");
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
          mode="crypto"
        />
      </AppLayout>
    </ProtectedRoute>
  );
}

