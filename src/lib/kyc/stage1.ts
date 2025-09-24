/**
 * Funções específicas para Stage 1 do KYC
 * Salva dados do formulário na wallet metadata (sem criar sessão KYC)
 */

import { KYCStage1Data, KYCResult } from '@/types/kyc';
import { updateWalletMetadata, getWalletData } from '@/lib/wallet';
import { validateStage1Data } from './validation';

/**
 * Salva dados da Etapa 1 na wallet metadata
 * NÃO cria sessão KYC - apenas armazena os dados
 */
export async function saveStage1DataToWallet(
  walletAddress: string,
  stage1Data: KYCStage1Data
): Promise<KYCResult<void>> {
  try {
    // Validar dados
    const validation = validateStage1Data(stage1Data);
    if (!validation.success) {
      return validation;
    }

    // Buscar dados atuais da wallet
    const currentWallet = await getWalletData(walletAddress);
    const currentMetadata = currentWallet.metadata || {};

    // Preparar metadados atualizados
    const updatedMetadata = {
      ...currentMetadata,
      kyc: {
        ...currentMetadata.kyc,
        kycStatus: "STAGE_1_COMPLETED",
        stage1FormData: {
          ...stage1Data,
          completedAt: new Date().toISOString()
        },
        kycLimits: {
          currentLimit: 2000.00,
          maxLimit: 50000.00,
          currency: "BRL",
          stage: "1",
          stageDescription: "Etapa 1 completada - Dados pessoais"
        },
        activeKYCSession: null // Stage 1 não cria sessão KYC
      }
    };

    // Atualizar metadados da wallet
    await updateWalletMetadata(walletAddress, updatedMetadata);

    return {
      success: true
    };
  } catch (error) {
    console.error('Erro ao salvar dados Stage 1:', error);
    return {
      success: false,
      error: {
        code: 'SAVE_STAGE1_ERROR',
        message: error instanceof Error ? error.message : 'Erro ao salvar dados da Etapa 1'
      }
    };
  }
}

/**
 * Verifica se Stage 1 está completo
 */
export async function isStage1Completed(walletAddress: string): Promise<boolean> {
  try {
    const wallet = await getWalletData(walletAddress);
    const kycData = wallet.metadata?.kyc;
    
    return kycData?.kycStatus === "STAGE_1_COMPLETED" && !!kycData?.stage1FormData;
  } catch (error) {
    console.error('Erro ao verificar Stage 1:', error);
    return false;
  }
}

/**
 * Obtém dados da Stage 1 salvos na wallet
 */
export async function getStage1DataFromWallet(walletAddress: string): Promise<KYCStage1Data | null> {
  try {
    const wallet = await getWalletData(walletAddress);
    const kycData = wallet.metadata?.kyc;
    
    return kycData?.stage1FormData || null;
  } catch (error) {
    console.error('Erro ao buscar dados Stage 1:', error);
    return null;
  }
}
