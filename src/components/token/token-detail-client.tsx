/**
 * Token Detail Client Component
 * Gerencia estado e interatividade da tela de detalhes do token
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { TokenDetailHeader } from "./token-detail-header";
import { TokenInfo } from "./token-info";
import { TokenPriceChart } from "./token-price-chart";
import { TokenPerformance } from "./token-performance";
import { TokenBalance } from "./token-balance";
import { TokenActionButtons } from "./token-action-buttons";
import { TokenDetails } from "./token-details";
import { TokenInfoModal } from "./token-info-modal";
import { TokenFooterButtons } from "./token-footer-buttons";

interface TokenDetailClientProps {
  token: any;
  tokenInfo: any;
  walletAddress: string;
  mode?: 'portfolio' | 'crypto';
}

export function TokenDetailClient({
  token,
  tokenInfo,
  walletAddress,
  mode = 'portfolio',
}: TokenDetailClientProps) {
  const router = useRouter();
  const [showBalance, setShowBalance] = useState(true);
  const [currency, setCurrency] = useState<'USD' | 'BRL'>('USD');
  const [selectedPeriod, setSelectedPeriod] = useState<'1D' | '7D' | '1M' | '3M' | '1A' | 'ALL'>('7D');
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Dados combinados do token
  const tokenData = {
    ...tokenInfo,
    ...token,
    symbol: token?.symbol || tokenInfo?.symbol || '',
    name: token?.name || tokenInfo?.name || '',
    balance: token?.balance || '0',
    balanceUSD: token?.balanceUSD || token?.balanceUsd || '0',
    decimals: token?.decimals || tokenInfo?.decimals || 18,
  };

  // Verificar se é BRZ ou USDC para mostrar modal
  const isStablecoin = tokenData.symbol?.toUpperCase() === 'BRZ' || tokenData.symbol?.toUpperCase() === 'USDC';

  // Verificar se deve mostrar o modal automaticamente
  useEffect(() => {
    if (isStablecoin && typeof window !== 'undefined') {
      const hasSeenModal = localStorage.getItem(`token-info-modal-${tokenData.symbol?.toUpperCase()}`);
      if (!hasSeenModal) {
        setShowInfoModal(true);
      }
    }
  }, [isStablecoin, tokenData.symbol]);

  return (
    <>
      <div className={cn(
        "space-y-6",
        mode === 'portfolio' ? "pb-24 lg:pb-6" : "pb-20 lg:pb-6"
      )}>
        {/* Header */}
        <TokenDetailHeader
          onBack={() => router.back()}
          showBalance={showBalance}
          onToggleBalance={setShowBalance}
          currency={currency}
          onCurrencyChange={setCurrency}
        />

        {/* Informações do Token */}
        <TokenInfo token={tokenData} />

        {/* Preço e Gráfico */}
        <TokenPriceChart
          token={tokenData}
          period={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
        />

        {/* Performance Metrics */}
        <TokenPerformance token={tokenData} />

        {/* Saldo */}
        <TokenBalance
          token={tokenData}
          showBalance={showBalance}
          currency={currency}
        />

        {/* Botões de Ação */}
        <TokenActionButtons token={tokenData} mode={mode} />

        {/* Detalhes do Token */}
        <TokenDetails token={tokenData} />
      </div>

      {/* Botões de Rodapé (apenas para portfolio) */}
      {mode === 'portfolio' && <TokenFooterButtons token={tokenData} />}

      {/* Modal Informativo */}
      {isStablecoin && (
        <TokenInfoModal
          isOpen={showInfoModal}
          onClose={() => setShowInfoModal(false)}
          tokenSymbol={tokenData.symbol?.toUpperCase() || ''}
        />
      )}
    </>
  );
}

