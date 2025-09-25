/**
 * 🆔 KYC Actions
 * Endpoints para verificação de identidade
 * Baseado no Postman collection oficial da Notus API
 */

import { notusAPI } from '../api/client';

export const kycActions = {
  /**
   * Cria sessão KYC Standard Individual
   * POST /kyc/individual-verification-sessions/standard
   */
  createStandardSession: (params: {
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
  }) =>
    notusAPI.post("kyc/individual-verification-sessions/standard", {
      json: params,
    }).json(),

  /**
   * Obtém resultado da sessão KYC
   * GET /kyc/individual-verification-sessions/standard/{session_id}
   */
  getSessionResult: (sessionId: string) =>
    notusAPI.get(`kyc/individual-verification-sessions/standard/${sessionId}`).json(),

  /**
   * Processa sessão KYC (finaliza verificação)
   * POST /kyc/individual-verification-sessions/standard/{session_id}/process
   */
  processSession: (sessionId: string) =>
    notusAPI.post(`kyc/individual-verification-sessions/standard/${sessionId}/process`).json(),
};
