/**
 * ⚙️ User Operation Actions
 * Endpoints para execução de operações de usuário
 */

'use server';

import { notusAPI } from '../api/client';

interface ExecuteUserOpParams {
  userOperationHash: string;
  signature: string;
  authorization?: string;
}

interface ExecuteUserOpResponse {
  userOperationHash: string;
  userOpHash: string;
  estimatedExecutionTime: string;
}

/**
 * Executa uma User Operation (swap, transfer, etc)
 */
export async function executeUserOperation(params: ExecuteUserOpParams): Promise<ExecuteUserOpResponse> {
  try {
    console.log('⚙️ Executando User Operation:', params.userOperationHash);
    
    const response = await notusAPI.post("crypto/execute-user-op", {
      json: {
        userOperationHash: params.userOperationHash,
        signature: params.signature,
        authorization: params.authorization
      },
    }).json<ExecuteUserOpResponse>();

    console.log('✅ User Operation executada:', response);
    return response;
  } catch (error) {
    console.error('❌ Erro ao executar User Operation:', error);
    throw error;
  }
}

interface GetUserOpParams {
  userOperationHash: string;
}

interface UserOperationStatus {
  userOperation: {
    id: string;
    status: string;
    transactionHash?: string;
    createdAt: string;
    executedAt?: string;
  };
}

/**
 * Busca o status de uma User Operation
 */
export async function getUserOperation(params: GetUserOpParams): Promise<UserOperationStatus> {
  try {
    console.log('🔍 Buscando status da User Operation:', params.userOperationHash);
    
    const response = await notusAPI.get(`crypto/user-operation/${params.userOperationHash}`).json<UserOperationStatus>();

    console.log('✅ Status da User Operation:', response);
    return response;
  } catch (error) {
    console.error('❌ Erro ao buscar User Operation:', error);
    throw error;
  }
}

