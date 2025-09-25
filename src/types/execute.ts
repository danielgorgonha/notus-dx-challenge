/**
 * ⚙️ User Operations Types
 * Tipos para execução de operações de usuário
 */

// Batch Operation Request
export interface BatchOperationRequest {
  operations: Array<{
    type: string;
    data: Record<string, unknown>;
  }>;
  walletAddress: string;
  chainId: number;
}

// Custom Operation Request
export interface CustomOperationRequest {
  to: string;
  data: string;
  value: string;
  walletAddress: string;
  chainId: number;
}

// Execute User Operation Request
export interface ExecuteUserOperationRequest {
  quoteId: string;
  signature: string;
}

// User Operation Response
export interface UserOperationResponse {
  userOperationHash: string;
  status: string;
  transactionHash?: string;
  createdAt: string;
  completedAt?: string;
  gasUsed?: string;
  gasPrice?: string;
}

// User Operation Status
export type UserOperationStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'EXPIRED';

// User Operation Details
export interface UserOperationDetails {
  hash: string;
  status: UserOperationStatus;
  from: string;
  to: string;
  value: string;
  data: string;
  gasLimit: string;
  gasPrice: string;
  nonce: string;
  chainId: number;
  createdAt: string;
  completedAt?: string;
  transactionHash?: string;
  gasUsed?: string;
  effectiveGasPrice?: string;
}

// Operation Type
export type OperationType = 'TRANSFER' | 'SWAP' | 'LIQUIDITY' | 'BATCH' | 'CUSTOM';

// Operation Data
export interface OperationData {
  type: OperationType;
  data: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}
