/**
 * Gerenciador de sessões KYC
 * Centraliza a lógica de criação, consulta e processamento de sessões
 */

import { notusAPI } from '../api/client';
import { 
  CreateKYCSessionData, 
  KYCSessionResponse, 
  KYCResult,
  KYCStage1Data,
  DocumentUploadData
} from '@/types/kyc';

/**
 * Cria uma nova sessão KYC na API Notus
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
    const sessionResponse = await notusAPI.post<KYCSessionResponse>(
      '/kyc/individual-verification-sessions/standard',
      payload
    );

    return {
      success: true,
      data: sessionResponse
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
 */
export async function getKYCSessionStatus(sessionId: string): Promise<KYCResult<any>> {
  try {
    const sessionData = await notusAPI.get<any>(
      `/kyc/individual-verification-sessions/standard/${sessionId}`
    );

    return {
      success: true,
      data: sessionData
    };
  } catch (error) {
    console.error('Erro ao consultar status da sessão:', error);
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
 */
export async function processKYCSession(sessionId: string): Promise<KYCResult<void>> {
  try {
    await notusAPI.post<void>(
      `/kyc/individual-verification-sessions/standard/${sessionId}/process`
    );

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

/**
 * Upload de documento para S3
 */
export async function uploadDocumentToS3(uploadData: DocumentUploadData): Promise<KYCResult<void>> {
  try {
    // Criar FormData para upload S3
    const formData = new FormData();
    
    // Adicionar campos obrigatórios do S3
    Object.entries(uploadData.fields).forEach(([key, value]) => {
      formData.append(key, value);
    });
    
    // Adicionar o arquivo
    formData.append('file', uploadData.file);

    // Upload para S3
    const uploadResponse = await fetch(uploadData.uploadUrl, {
      method: 'POST',
      body: formData
    });

    if (!uploadResponse.ok) {
      return {
        success: false,
        error: {
          code: 'UPLOAD_ERROR',
          message: `Erro no upload: ${uploadResponse.statusText}`
        }
      };
    }

    return {
      success: true
    };
  } catch (error) {
    console.error('Erro no upload do documento:', error);
    return {
      success: false,
      error: {
        code: 'UPLOAD_ERROR',
        message: error instanceof Error ? error.message : 'Erro no upload'
      }
    };
  }
}
