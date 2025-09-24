/**
 * Gerenciador de metadados da wallet
 * Centraliza operações de metadados incluindo integração com KYC
 */

import { notusAPI } from '../api/client';
import { WalletKYCMetadata, KYC_LIMITS_CONFIG } from '@/types/kyc';

/**
 * Busca dados completos da wallet incluindo metadados
 */
export async function getWalletData(walletAddress: string) {
  try {
    const response = await notusAPI.get<{ wallet: any }>(
      `/wallets/address?walletAddress=${walletAddress}`
    );
    return response.wallet;
  } catch (error) {
    console.error('Erro ao buscar dados da wallet:', error);
    throw error;
  }
}

/**
 * Atualiza metadados da wallet
 */
export async function updateWalletMetadata(
  walletAddress: string, 
  metadata: Partial<WalletKYCMetadata>
) {
  try {
    const response = await notusAPI.patch<any>(
      `/wallets/${walletAddress}/metadata`,
      { metadata }
    );
    return response;
  } catch (error) {
    console.error('Erro ao atualizar metadados da wallet:', error);
    throw error;
  }
}

/**
 * Inicializa metadados KYC para uma nova wallet
 */
export async function initializeWalletKYC(walletAddress: string) {
  const initialMetadata: WalletKYCMetadata = {
    kycStatus: "NOT_STARTED",
    kycSessions: [],
    kycLimits: {
      ...KYC_LIMITS_CONFIG.STAGE_0,
      currency: "BRL"
    }
  };

  return await updateWalletMetadata(walletAddress, initialMetadata);
}

/**
 * Atualiza status KYC da wallet
 */
export async function updateWalletKYCStatus(
  walletAddress: string,
  status: WalletKYCMetadata['kycStatus'],
  stage?: '0' | '1' | '2'
) {
  const currentWallet = await getWalletData(walletAddress);
  const currentMetadata = currentWallet.metadata?.kyc || {};

  const updatedMetadata: Partial<WalletKYCMetadata> = {
    ...currentMetadata,
    kycStatus: status,
    kycLimits: stage ? KYC_LIMITS_CONFIG[`STAGE_${stage}` as keyof typeof KYC_LIMITS_CONFIG] : currentMetadata.kycLimits
  };

  return await updateWalletMetadata(walletAddress, updatedMetadata);
}

/**
 * Adiciona nova sessão KYC ativa à wallet
 */
export async function addActiveKYCSession(
  walletAddress: string,
  sessionData: WalletKYCMetadata['activeKYCSession']
) {
  const currentWallet = await getWalletData(walletAddress);
  const currentMetadata = currentWallet.metadata?.kyc || {};

  const updatedMetadata: Partial<WalletKYCMetadata> = {
    ...currentMetadata,
    kycStatus: "IN_PROGRESS",
    activeKYCSession: sessionData
  };

  return await updateWalletMetadata(walletAddress, updatedMetadata);
}

/**
 * Finaliza sessão KYC e move para histórico
 */
export async function finalizeKYCSession(
  walletAddress: string,
  sessionId: string,
  status: "COMPLETED" | "FAILED",
  individualId?: string,
  stage1Data?: any,
  stage2Data?: any
) {
  const currentWallet = await getWalletData(walletAddress);
  const currentMetadata = currentWallet.metadata?.kyc || {};

  // Remove sessão ativa
  const { activeKYCSession, ...restMetadata } = currentMetadata;

  // Adiciona ao histórico
  const newSessionHistory = {
    sessionId,
    stage: activeKYCSession?.stage || "STAGE_1",
    status,
    completedAt: new Date().toISOString(),
    individualId,
    stage1Data,
    stage2Data
  };

  const updatedMetadata: Partial<WalletKYCMetadata> = {
    ...restMetadata,
    kycSessions: [...(currentMetadata.kycSessions || []), newSessionHistory],
    kycStatus: status === "COMPLETED" ? "COMPLETED" : "FAILED",
    kycLimits: status === "COMPLETED" ? 
      (activeKYCSession?.stage === "STAGE_2" ? 
        { ...KYC_LIMITS_CONFIG.STAGE_2, currency: "BRL" } : 
        { ...KYC_LIMITS_CONFIG.STAGE_1, currency: "BRL" }) :
      currentMetadata.kycLimits
  };

  // Se completou, adiciona dados do usuário
  if (status === "COMPLETED" && individualId) {
    updatedMetadata.userData = {
      stage1Data,
      stage2Data,
      individualId,
      completedAt: new Date().toISOString()
    };
  }

  return await updateWalletMetadata(walletAddress, updatedMetadata);
}

/**
 * Atualiza status de uma sessão KYC ativa
 */
export async function updateActiveKYCSessionStatus(
  walletAddress: string,
  sessionId: string,
  newStatus: NonNullable<WalletKYCMetadata['activeKYCSession']>['status']
) {
  const currentWallet = await getWalletData(walletAddress);
  const currentMetadata = currentWallet.metadata?.kyc || {};

  if (!currentMetadata.activeKYCSession || currentMetadata.activeKYCSession.sessionId !== sessionId) {
    throw new Error('Sessão KYC não encontrada ou não está ativa');
  }

  const updatedMetadata: Partial<WalletKYCMetadata> = {
    ...currentMetadata,
    activeKYCSession: currentMetadata.activeKYCSession ? {
      ...currentMetadata.activeKYCSession,
      status: newStatus
    } : undefined
  };

  return await updateWalletMetadata(walletAddress, updatedMetadata);
}

/**
 * Busca metadados KYC de uma wallet
 */
export async function getWalletKYCMetadata(walletAddress: string): Promise<WalletKYCMetadata | null> {
  try {
    const wallet = await getWalletData(walletAddress);
    return wallet.metadata?.kyc || null;
  } catch (error) {
    console.error('Erro ao buscar metadados KYC:', error);
    return null;
  }
}

/**
 * Verifica se uma wallet tem KYC completo
 */
export async function isWalletKYCCompleted(walletAddress: string): Promise<boolean> {
  const metadata = await getWalletKYCMetadata(walletAddress);
  return metadata?.kycStatus === "COMPLETED" && !!metadata?.userData?.individualId;
}

/**
 * Obtém o limite atual da wallet baseado no KYC
 */
export async function getWalletKYCLimit(walletAddress: string): Promise<number> {
  const metadata = await getWalletKYCMetadata(walletAddress);
  return metadata?.kycLimits?.currentLimit || 0;
}

/**
 * Obtém a etapa atual do KYC
 */
export async function getWalletKYCStage(walletAddress: string): Promise<'0' | '1' | '2'> {
  const metadata = await getWalletKYCMetadata(walletAddress);
  return metadata?.kycLimits?.stage || '0';
}
