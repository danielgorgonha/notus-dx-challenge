/**
 * 💸 Transfer Types
 * Tipos para operações de transferência
 */

// Transfer Request
export interface TransferRequest {
  amount: string;
  chainId: number;
  gasFeePaymentMethod: string;
  payGasFeeToken: string;
  token: string;
  walletAddress: string;
  toAddress: string;
  transactionFeePercent?: number;
}

// Transfer Quote
export interface TransferQuote {
  quoteId: string;
  fromAddress: string;
  toAddress: string;
  token: string;
  amount: string;
  gasFee: string;
  totalAmount: string;
  expiresAt: string;
}

// Transfer Order
export interface TransferOrder {
  orderId: string;
  quoteId: string;
  status: string;
  userOperationHash?: string;
  transactionHash?: string;
  fromAddress: string;
  toAddress: string;
  token: string;
  amount: string;
  gasFee: string;
  createdAt: string;
  completedAt?: string;
}

// Transfer Execution Request
export interface TransferExecutionRequest {
  quoteId: string;
  signature: string;
}

// Transfer Status
export type TransferStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'EXPIRED';

// Transfer History Item
export interface TransferHistoryItem {
  id: string;
  fromAddress: string;
  toAddress: string;
  token: string;
  amount: string;
  status: TransferStatus;
  createdAt: string;
  completedAt?: string;
  transactionHash?: string;
}
