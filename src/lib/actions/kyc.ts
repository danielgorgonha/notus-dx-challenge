/**
 * 🆔 KYC Actions
 * Endpoints para verificação de identidade
 * Baseado no Postman collection oficial da Notus API
 */

'use server';

import { notusAPI } from '../api/client';
import type { KYCSessionResponse } from '@/types/kyc';

/**
 * Cria sessão KYC Standard Individual
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
    return await notusAPI.post("kyc/individual-verification-sessions/standard", {
      json: params,
    }).json();
  } catch (error) {
    console.error('Error creating KYC session:', error);
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
 * Processa sessão KYC (finaliza verificação)
 * POST /kyc/individual-verification-sessions/standard/{session_id}/process
 */
export async function processSession(sessionId: string) {
  try {
    return await notusAPI.post(`kyc/individual-verification-sessions/standard/${sessionId}/process`).json();
  } catch (error) {
    console.error('Error processing KYC session:', error);
    throw error;
  }
}
