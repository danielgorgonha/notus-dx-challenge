/**
 * 🆔 KYC Actions
 * Endpoints para verificação de identidade
 * Baseado no Postman collection oficial da Notus API
 */

'use server';

import { notusAPI } from '../api/client';
import type { KYCSessionResponse } from '@/types/kyc';
import { walletActions } from './wallet';

/**
 * Cria sessão KYC Standard Individual - Passo 3 do fluxo
 * POST /kyc/individual-verification-sessions/standard
 */
export async function createStandardSession(params: {
  firstName: string;
  lastName: string;
  birthDate: string;
  documentCategory: string;
  documentCountry: string;
  documentId: string;
  nationality: string;
  livenessRequired?: boolean;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
}) {
  try {
    console.log('🚀 Criando sessão KYC com dados:', params);
    
    const response = await notusAPI.post("kyc/individual-verification-sessions/standard", {
      json: params,
    }).json();
    
    console.log('✅ Sessão KYC criada:', response);
    return response;
  } catch (error) {
    console.error('❌ Erro ao criar sessão KYC:', error);
    throw error;
  }
}

/**
 * Obtém resultado da sessão KYC
 * GET /kyc/individual-verification-sessions/standard/{session_id}
 */
export async function getSessionResult(sessionId: string) {
  try {
    return await notusAPI.get(`kyc/individual-verification-sessions/standard/${sessionId}`).json();
  } catch (error) {
    console.error('Error getting KYC session result:', error);
    throw error;
  }
}

/**
 * Salva sessionId e individualId na metadata da wallet - Passo 3 do fluxo
 */
export async function saveKYCSessionId(sessionId: string, individualId: string | null, kycData: any, walletAddress: string) {
  try {
    console.log('💾 Salvando sessionId e individualId na metadata:', { sessionId, individualId });
    
    const updatedKycData = {
      ...kycData,
      sessionId,
      individualId,
      kycLevel: 1, // Manter como Level 1 até validação real
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };
    
    await walletActions.updateMetadata(walletAddress, { kycData: JSON.stringify(updatedKycData) });
    
    console.log('✅ SessionId e individualId salvos na metadata');
    return updatedKycData;
  } catch (error) {
    console.error('❌ Erro ao salvar sessionId e individualId:', error);
    throw error;
  }
}

/**
 * Processa sessão KYC (finaliza verificação) - Passo 5 do fluxo
 * POST /kyc/individual-verification-sessions/standard/{session_id}/process
 */
export async function processSession(sessionId: string) {
  try {
    console.log('⚡ Processando sessão KYC:', sessionId);
    
    const response = await notusAPI.post(`kyc/individual-verification-sessions/standard/${sessionId}/process`);
    
    // Status 204 (No Content) é esperado para este endpoint
    if (response.status === 204) {
      console.log('✅ Sessão KYC processada com sucesso (204 No Content)');
      return { success: true, status: 204 };
    }
    
    // Se houver conteúdo, tentar fazer parse
    const responseData = await response.json();
    console.log('✅ Sessão KYC processada:', responseData);
    return responseData;
  } catch (error) {
    console.error('❌ Erro ao processar sessão KYC:', error);
    throw error;
  }
}
