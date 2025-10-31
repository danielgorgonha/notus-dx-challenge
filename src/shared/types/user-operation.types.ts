/**
 * Shared User Operation Types
 */

export interface ExecuteUserOperationParams {
  userOperationHash: string;
}

export interface ExecuteUserOperationResponse {
  success: boolean;
  transactionHash?: string;
  status?: string;
  [key: string]: unknown;
}

export interface UserOperationStatus {
  status: 'pending' | 'completed' | 'failed';
  transactionHash?: string;
  [key: string]: unknown;
}

