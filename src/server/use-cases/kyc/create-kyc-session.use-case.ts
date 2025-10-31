/**
 * Create KYC Session Use Case
 * Caso de uso: Criar sessão KYC
 */

import { KYCService } from '../../services/kyc.service';
import type { CreateKYCSessionParams } from '../../adapters';
import type { KYCSessionResponse } from '@/types/kyc';

export class CreateKYCSessionUseCase {
  constructor(private kycService: KYCService) {}

  /**
   * Executa o caso de uso de criação de sessão KYC
   */
  async execute(params: CreateKYCSessionParams): Promise<KYCSessionResponse> {
    // Validações adicionais
    if (!params.firstName || params.firstName.trim().length < 2) {
      throw new Error('First name must be at least 2 characters');
    }

    if (!params.lastName || params.lastName.trim().length < 2) {
      throw new Error('Last name must be at least 2 characters');
    }

    // Validar idade mínima (18 anos)
    const birthDate = new Date(params.birthDate);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (age < 18 || (age === 18 && monthDiff < 0)) {
      throw new Error('Must be at least 18 years old');
    }

    return this.kycService.createStandardSession(params);
  }
}

