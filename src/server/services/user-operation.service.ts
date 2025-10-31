/**
 * User Operation Service
 * Serviço de domínio para execução de operações de usuário
 */

import { NotusAPIAdapter } from '../adapters/notus-api.adapter';
import type {
  ExecuteUserOperationParams,
  ExecuteUserOperationResponse,
  UserOperationStatus,
} from '@/shared/types/user-operation.types';

export class UserOperationService {
  constructor(private adapter: NotusAPIAdapter) {}

  /**
   * Executa uma User Operation
   */
  async execute(params: ExecuteUserOperationParams & {
    signature: string;
    authorization?: string;
  }): Promise<ExecuteUserOperationResponse> {
    // Validações
    if (!params.userOperationHash) {
      throw new Error('User operation hash is required');
    }

    if (!params.signature) {
      throw new Error('Signature is required');
    }

    const response = await this.adapter.executeUserOperation({
      userOperationHash: params.userOperationHash,
      signature: params.signature,
      authorization: params.authorization,
    });

    return response as ExecuteUserOperationResponse;
  }

  /**
   * Obtém status de uma User Operation
   */
  async getStatus(userOperationHash: string): Promise<UserOperationStatus> {
    if (!userOperationHash) {
      throw new Error('User operation hash is required');
    }

    const response = await this.adapter.getUserOperationStatus(userOperationHash);
    return response as UserOperationStatus;
  }
}

export function createUserOperationService(): UserOperationService {
  const adapter = new NotusAPIAdapter();
  return new UserOperationService(adapter);
}

