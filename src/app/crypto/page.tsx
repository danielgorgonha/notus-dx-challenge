/**
 * Crypto Market Page - Server Component
 * Tela de mercado de criptomoedas
 */

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { listTokens } from "@/lib/actions/blockchain";
import { AppLayout } from "@/components/layout/app-layout";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { CryptoClient } from "@/components/crypto/crypto-client";

export default async function CryptoPage() {
  // Autenticação no servidor
  const user = await auth();
  
  if (!user || !user.wallet?.address) {
    redirect("/");
  }

  // Buscar lista de tokens ordenados por marketCap
  let tokensData;
  try {
    // A API Notus tem limite máximo de 100 tokens por página
    tokensData = await listTokens({
      page: 1,
      perPage: 100, // Máximo permitido pela API
      orderBy: 'marketCap',
      orderDir: 'desc',
      filterWhitelist: false,
    });
    console.log('📊 CryptoPage - Tokens recebidos:', {
      total: tokensData?.total,
      tokensLength: tokensData?.tokens?.length,
    });
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

