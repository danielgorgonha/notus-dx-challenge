/**
 * KYC Service
 * Serviço de domínio para operações de verificação de identidade
 */

import { KYCAdapter, type CreateKYCSessionParams } from '../adapters/kyc.adapter';
import type { KYCSessionResponse } from '@/types/kyc';

export class KYCService {
  constructor(private adapter: KYCAdapter) {}

  /**
   * Cria sessão KYC Standard
   */
  async createStandardSession(params: CreateKYCSessionParams): Promise<KYCSessionResponse> {
    // Validações
    if (!params.firstName || params.firstName.trim().length === 0) {
      throw new Error('First name is required');
    }

    if (!params.lastName || params.lastName.trim().length === 0) {
      throw new Error('Last name is required');
    }

    if (!params.birthDate) {
      throw new Error('Birth date is required');
    }

    // Validar formato de data (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(params.birthDate)) {
      throw new Error('Birth date must be in YYYY-MM-DD format');
    }

    if (!params.documentCategory) {
      throw new Error('Document category is required');
    }

    if (!params.documentCountry) {
      throw new Error('Document country is required');
    }

    if (!params.documentId || params.documentId.trim().length === 0) {
      throw new Error('Document ID is required');
    }

    if (!params.nationality) {
      throw new Error('Nationality is required');
    }

    return this.adapter.createStandardSession(params);
  }

  /**
   * Obtém resultado da sessão KYC
   */
  async getSessionResult(sessionId: string): Promise<KYCSessionResponse> {
    if (!sessionId || sessionId.trim().length === 0) {
      throw new Error('Session ID is required');
    }

    return this.adapter.getSessionResult(sessionId);
  }

  /**
   * Processa sessão KYC (finaliza verificação)
   */
  async processSession(sessionId: string): Promise<void> {
    if (!sessionId || sessionId.trim().length === 0) {
      throw new Error('Session ID is required');
    }

    return this.adapter.processSession(sessionId);
  }
}

export function createKYCService(): KYCService {
  const adapter = new KYCAdapter();
  return new KYCService(adapter);
}

