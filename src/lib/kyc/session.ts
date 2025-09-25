/**
 * Gerenciador de sessões KYC
 * Funções essenciais para integração com a API Notus
 * Baseado no Postman collection oficial
 */

import { kycActions } from '../actions/kyc';
import {
  CreateKYCSessionData,
  KYCSessionResponse,
  KYCResult,
} from '@/types/kyc';

/**
 * Cria uma nova sessão KYC na API Notus
 * POST /kyc/individual-verification-sessions/standard
 */
export async function createKYCSession(
  data: CreateKYCSessionData
): Promise<KYCResult<KYCSessionResponse>> {
  try {
    // Validar dados obrigatórios
    if (!data.stage1Data) {
      return {
        success: false,
        error: {
          code: 'MISSING_STAGE1_DATA',
          message: 'Dados da Etapa 1 são obrigatórios'
        }
      };
    }

    // Preparar payload para a API
    const payload = {
      firstName: data.stage1Data.firstName,
      lastName: data.stage1Data.lastName,
      birthDate: data.stage1Data.birthDate,
      documentCategory: data.stage1Data.documentCategory,
      documentCountry: data.stage1Data.documentCountry,
      documentId: data.stage1Data.documentId,
      nationality: data.stage1Data.nationality,
      livenessRequired: data.livenessRequired || false,
      email: data.stage1Data.email,
      address: data.stage1Data.address,
      city: data.stage1Data.city,
      state: data.stage1Data.state,
      postalCode: data.stage1Data.postalCode
    };

    // Criar sessão na API Notus
    const sessionResponse = await kycActions.createStandardSession(payload);

    return {
      success: true,
      data: sessionResponse as KYCSessionResponse
    };
  } catch (error) {
    console.error('Erro ao criar sessão KYC:', error);
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Erro de rede'
      }
    };
  }
}

/**
 * Consulta o status de uma sessão KYC
 * GET /kyc/individual-verification-sessions/standard/{session_id}
 */
export async function getKYCSessionStatus(sessionId: string): Promise<KYCResult<any>> {
  try {
    const sessionData = await kycActions.getSessionResult(sessionId);

    return {
      success: true,
      data: sessionData
    };
  } catch (error) {
    console.error('Erro ao consultar status da sessão KYC:', error);
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Erro de rede'
      }
    };
  }
}

/**
 * Processa uma sessão KYC (inicia a verificação)
 * POST /kyc/individual-verification-sessions/standard/{session_id}/process
 */
export async function processKYCSession(sessionId: string): Promise<KYCResult<void>> {
  try {
    await kycActions.processSession(sessionId);

    return {
      success: true
    };
  } catch (error) {
    console.error('Erro ao processar sessão KYC:', error);
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Erro de rede'
      }
    };
  }
}