/**
 * KYC Adapter
 * Adaptador para operações de verificação de identidade
 */

import { notusAPI, NotusAPIError } from '@/lib/api/client';
import type { KYCSessionResponse } from '@/types/kyc';

export interface CreateKYCSessionParams {
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
}

export class KYCAdapter {
  /**
   * Cria sessão KYC Standard
   */
  async createStandardSession(params: CreateKYCSessionParams): Promise<KYCSessionResponse> {
    try {
      return await notusAPI.post('kyc/individual-verification-sessions/standard', {
        json: params,
      }).json<KYCSessionResponse>();
    } catch (error) {
      if (error instanceof NotusAPIError) {
        throw error;
      }
      throw new NotusAPIError(
        'Failed to create KYC session',
        500,
        undefined,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Obtém resultado da sessão KYC
   */
  async getSessionResult(sessionId: string): Promise<KYCSessionResponse> {
    try {
      return await notusAPI.get(`kyc/individual-verification-sessions/standard/${sessionId}`).json<KYCSessionResponse>();
    } catch (error) {
      if (error instanceof NotusAPIError) {
        throw error;
      }
      throw new NotusAPIError(
        'Failed to get KYC session result',
        500,
        undefined,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Processa sessão KYC (finaliza verificação)
   */
  async processSession(sessionId: string): Promise<void> {
    try {
      const response = await notusAPI.post(`kyc/individual-verification-sessions/standard/${sessionId}/process`);
      // Status 204 (No Content) é esperado
      if (response.status !== 204) {
        throw new NotusAPIError(
          `Unexpected status code: ${response.status}`,
          response.status
        );
      }
    } catch (error) {
      if (error instanceof NotusAPIError) {
        throw error;
      }
      throw new NotusAPIError(
        'Failed to process KYC session',
        500,
        undefined,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }
}

