/**
 * ⚙️ User Operations Actions
 * Endpoints para operações de usuário (UserOperations)
 */

import { notusAPI } from '../api/client';

export const userOperationActions = {
  /**
   * Cria operação em lote
   */
  createBatchOperation: (params: {
    operations: Array<{
      type: string;
      data: Record<string, unknown>;
    }>;
    walletAddress: string;
    chainId: number;
  }) =>
    notusAPI.post("crypto/batch-operations", {
      json: params,
    }).json(),

  /**
   * Cria operação customizada
   */
  createCustomOperation: (params: {
    to: string;
    data: string;
    value: string;
    walletAddress: string;
    chainId: number;
  }) =>
    notusAPI.post("crypto/custom-user-operation", {
      json: params,
    }).json(),

  /**
   * Executa UserOperation
   */
  executeUserOp: (params: {
    quoteId: string;
    signature: string;
  }) =>
    notusAPI.post("crypto/execute-user-op", {
      json: params,
    }).json(),

  /**
   * Obtém status de UserOperation
   */
  getUserOperation: (userOperationHash: string) =>
    notusAPI.get(`crypto/user-operation/${userOperationHash}`).json(),
};

// ============================================================================
// SERVER ACTIONS (para uso em Server Components)
// ============================================================================

export async function executeUserOperation({
  quoteId,
  signature,
}: {
  quoteId: string;
  signature: string;
}) {
  try {
    const data = await userOperationActions.executeUserOp({
      quoteId,
      signature,
    });
    return { success: true, data };
  } catch (error: unknown) {
    console.error("Error executing user operation:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to execute user operation" };
  }
}
