/**
 * Execute User Operation Use Case
 * Caso de uso: Executar uma User Operation (swap, transfer, etc)
 */

import { UserOperationService } from '../../services/user-operation.service';
import type { ExecuteUserOperationResponse } from '@/shared/types/user-operation.types';

export interface ExecuteUserOperationUseCaseParams {
  userOperationHash: string;
  signature: string;
  authorization?: string;
}

export class ExecuteUserOperationUseCase {
  constructor(private userOperationService: UserOperationService) {}

  /**
   * Executa o caso de uso de execução de User Operation
   */
  async execute(params: ExecuteUserOperationUseCaseParams): Promise<ExecuteUserOperationResponse> {
    // Validações
    if (!params.userOperationHash) {
      throw new Error('User operation hash is required');
    }

    if (!params.signature) {
      throw new Error('Signature is required');
    }

    // Validar formato do hash (formato básico)
    if (params.userOperationHash.length < 10) {
      throw new Error('Invalid user operation hash format');
    }

    return this.userOperationService.execute(params);
  }
}

