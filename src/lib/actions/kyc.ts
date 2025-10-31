/**
 * KYC Server Actions (Refactored)
 * Usa Use Cases da Clean Architecture
 */

'use server';

import { createKYCService } from '@/server/services';
import {
  CreateKYCSessionUseCase,
  ProcessKYCSessionUseCase,
} from '@/server/use-cases/kyc';
import type { CreateKYCSessionParams } from '@/server/adapters';
import type { KYCSessionResponse } from '@/types/kyc';

const kycService = createKYCService();

/**
 * Cria sessão KYC Standard Individual
 */
export async function createStandardSession(params: CreateKYCSessionParams): Promise<KYCSessionResponse> {
  try {
    const useCase = new CreateKYCSessionUseCase(kycService);
    return await useCase.execute(params);
  } catch (error) {
    console.error('Error creating KYC session:', error);
    throw error;
  }
}

/**
 * Obtém resultado da sessão KYC
 */
export async function getSessionResult(sessionId: string): Promise<KYCSessionResponse> {
  try {
    return await kycService.getSessionResult(sessionId);
  } catch (error) {
    console.error('Error getting KYC session result:', error);
    throw error;
  }
}

/**
 * Processa sessão KYC (finaliza verificação)
 */
export async function processSession(sessionId: string): Promise<void> {
  try {
    const useCase = new ProcessKYCSessionUseCase(kycService);
    return await useCase.execute({ sessionId });
  } catch (error) {
    console.error('Error processing KYC session:', error);
    throw error;
  }
}

