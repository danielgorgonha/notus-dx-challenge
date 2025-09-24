/**
 * Funções específicas para Stage 2 do KYC
 * Cria sessão KYC completa com documentos e liveness
 */

import { KYCStage1Data, KYCSessionResponse, KYCResult } from '@/types/kyc';
import { createKYCSession, getKYCSessionStatus, processKYCSession } from './session';
import { updateWalletMetadata, getWalletData } from '@/lib/wallet';

/**
 * Cria sessão KYC completa para Stage 2
 * Usa dados da Stage 1 + documentos + liveness
 */
export async function createStage2KYCSession(
  walletAddress: string,
  stage1Data: KYCStage1Data
): Promise<KYCResult<KYCSessionResponse>> {
  try {
    // Criar sessão KYC na API Notus
    const sessionResult = await createKYCSession({
      stage: 'STAGE_2',
      stage1Data,
      livenessRequired: true
    });

    if (!sessionResult.success) {
      return sessionResult;
    }

    const sessionResponse = sessionResult.data!;

    // Salvar sessão ativa na wallet metadata
    const currentWallet = await getWalletData(walletAddress);
    const currentMetadata = currentWallet.metadata || {};

    const updatedMetadata = {
      ...currentMetadata,
      kyc: {
        ...currentMetadata.kyc,
        kycStatus: "IN_PROGRESS",
        activeKYCSession: {
          sessionId: sessionResponse.session.id,
          stage: "STAGE_2",
          createdAt: sessionResponse.session.createdAt,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutos
          status: sessionResponse.session.status,
          stage1Data,
          stage2Data: {
            documentType: stage1Data.documentCategory,
            documentCountry: stage1Data.documentCountry,
            livenessVerified: false,
            documentUploaded: false
          }
        }
      }
    };

    await updateWalletMetadata(walletAddress, updatedMetadata);

    return {
      success: true,
      data: sessionResponse
    };
  } catch (error) {
    console.error('Erro ao criar sessão Stage 2:', error);
    return {
      success: false,
      error: {
        code: 'CREATE_STAGE2_ERROR',
        message: error instanceof Error ? error.message : 'Erro ao criar sessão da Etapa 2'
      }
    };
  }
}

/**
 * Processa verificação KYC e finaliza Stage 2
 */
export async function processStage2Verification(
  walletAddress: string,
  sessionId: string
): Promise<KYCResult<void>> {
  try {
    // Processar verificação na API
    const processResult = await processKYCSession(sessionId);
    if (!processResult.success) {
      return processResult;
    }

    // Aguardar processamento
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Verificar status final
    const statusResult = await getKYCSessionStatus(sessionId);
    if (!statusResult.success) {
      return statusResult;
    }

    const sessionData = statusResult.data!;
    
    // Se completou, finalizar na wallet
    if (sessionData.session.status === 'COMPLETED') {
      const currentWallet = await getWalletData(walletAddress);
      const currentMetadata = currentWallet.metadata || {};
      const activeSession = currentMetadata.kyc?.activeKYCSession;

      if (activeSession) {
        // Mover para histórico e atualizar status
        const updatedMetadata = {
          ...currentMetadata,
          kyc: {
            ...currentMetadata.kyc,
            kycStatus: "COMPLETED",
            kycLimits: {
              currentLimit: 50000.00,
              maxLimit: 50000.00,
              currency: "BRL",
              stage: "2",
              stageDescription: "Etapa 2 completada - Documentação + Liveness"
            },
            activeKYCSession: null,
            kycSessions: [
              ...(currentMetadata.kyc?.kycSessions || []),
              {
                sessionId: activeSession.sessionId,
                stage: "STAGE_2",
                status: "COMPLETED",
                completedAt: new Date().toISOString(),
                individualId: sessionData.session.individualId,
                stage1Data: activeSession.stage1Data,
                stage2Data: activeSession.stage2Data
              }
            ],
            userData: {
              stage1Data: activeSession.stage1Data,
              stage2Data: activeSession.stage2Data,
              individualId: sessionData.session.individualId!,
              completedAt: new Date().toISOString()
            }
          }
        };

        await updateWalletMetadata(walletAddress, updatedMetadata);
      }
    }

    return {
      success: true
    };
  } catch (error) {
    console.error('Erro ao processar verificação Stage 2:', error);
    return {
      success: false,
      error: {
        code: 'PROCESS_STAGE2_ERROR',
        message: error instanceof Error ? error.message : 'Erro ao processar verificação da Etapa 2'
      }
    };
  }
}

/**
 * Verifica se Stage 2 está completo
 */
export async function isStage2Completed(walletAddress: string): Promise<boolean> {
  try {
    const wallet = await getWalletData(walletAddress);
    const kycData = wallet.metadata?.kyc;
    
    return kycData?.kycStatus === "COMPLETED" && !!kycData?.userData?.individualId;
  } catch (error) {
    console.error('Erro ao verificar Stage 2:', error);
    return false;
  }
}
