/**
 * Process KYC Session Use Case
 * Caso de uso: Processar sessão KYC (finalizar verificação)
 */

import { KYCService } from '../../services/kyc.service';

export interface ProcessKYCSessionParams {
  sessionId: string;
}

export class ProcessKYCSessionUseCase {
  constructor(private kycService: KYCService) {}

  /**
   * Executa o caso de uso de processamento de sessão KYC
   */
  async execute(params: ProcessKYCSessionParams): Promise<void> {
    if (!params.sessionId) {
      throw new Error('Session ID is required');
    }

    // Verificar se sessão existe antes de processar
    await this.kycService.getSessionResult(params.sessionId);

    return this.kycService.processSession(params.sessionId);
  }
}

