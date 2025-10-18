// Create Liquidity Types

export interface CreateLiquidityRequest {
  liquidityProvider?: string;
  walletAddress: string;
  toAddress: string;
  chainId: number;
  transactionFeePercent?: number;
  payGasFeeToken: string;
  gasFeePaymentMethod: 'ADD_TO_AMOUNT' | 'DEDUCT_FROM_AMOUNT';
  token0: string;
  token1: string;
  poolFeePercent: number;
  token0Amount: string;
  token1Amount: string;
  minPrice: number;
  maxPrice: number;
  slippage?: number;
  metadata?: Record<string, any>;
}

export interface CreateLiquidityResponse {
  operation: {
    liquidityProvider: string;
    walletAddress: string;
    toAddress: string;
    chainId: number;
    transactionFeePercent: number;
    payGasFeeToken: string;
    gasFeePaymentMethod: string;
    token0: string;
    token1: string;
    poolFeePercent: number;
    token0Amount: string;
    token1Amount: string;
    minPrice: number;
    maxPrice: number;
    slippage: number;
    metadata: Record<string, any>;
  };
}

export interface CreateLiquidityError {
  statusCode: number;
  id: string;
  message: string;
}

// Error types
export type CreateLiquidityErrorType = 
  | 'NOT_AUTHORIZED_TOKENS'
  | 'UNAVAILABLE_COMPUTE_UNITS'
  | 'ACCOUNT_ABSTRACTION_ADDRESS_NOT_REGISTERED_WITH_PROJECT';
