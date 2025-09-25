/**
 * 🔄 Swap Types
 * Tipos para operações de swap
 */

// Swap Request
export interface SwapRequest {
  amount: string;
  fromToken: string;
  toToken: string;
  walletAddress: string;
  chainId: number;
  slippageTolerance?: number;
  gasFeePaymentMethod?: string;
  payGasFeeToken?: string;
}

// Swap Quote
export interface SwapQuote {
  quoteId: string;
  fromToken: string;
  toToken: string;
  amountIn: string;
  amountOut: string;
  priceImpact: string;
  gasFee: string;
  slippageTolerance: number;
  expiresAt: string;
}

// Swap Order
export interface SwapOrder {
  orderId: string;
  quoteId: string;
  status: string;
  userOperationHash?: string;
  transactionHash?: string;
  fromToken: string;
  toToken: string;
  amountIn: string;
  amountOut: string;
  gasFee: string;
  createdAt: string;
  completedAt?: string;
}

// Swap Execution Request
export interface SwapExecutionRequest {
  quoteId: string;
  signature: string;
}

// Swap Status
export type SwapStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'EXPIRED';

// Swap History Item
export interface SwapHistoryItem {
  id: string;
  fromToken: string;
  toToken: string;
  amountIn: string;
  amountOut: string;
  status: SwapStatus;
  createdAt: string;
  completedAt?: string;
  transactionHash?: string;
}
