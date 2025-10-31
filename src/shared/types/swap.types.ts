/**
 * Shared Swap Types
 */

export interface SwapQuoteItem {
  userOperationHash: string;
  walletAddress: string;
  tokenIn: string;
  amountIn: string;
  tokenOut: string;
  chainIn: number;
  chainOut: number;
  minAmountOut: string;
  estimatedExecutionTime: string;
  estimatedGasFees: {
    payGasFeeToken: string;
    maxGasFeeToken: string;
    gasFeeTokenAmount: string;
    gasFeeTokenAmountUSD: string;
    maxGasFeeNative: string;
  };
  estimatedCollectedFee: {
    collectedFeeToken: string;
    collectedFee: string;
    collectedFeePercent: string;
    notusCollectedFee: string;
    notusCollectedFeePercent: string;
  };
  amountInUSD: string;
  amountOutUSD: string;
  tokenInPrice: string;
  swapProvider: string;
  expiresAt: number;
}

export interface SwapQuote {
  quotes: SwapQuoteItem[];
  swap?: SwapQuoteItem; // Compatibilidade com estrutura antiga
}

export interface CreateSwapQuoteParams {
  amountIn: string;
  chainIdIn: number;
  chainIdOut: number;
  tokenIn: string;
  tokenOut: string;
  walletAddress: string;
  toAddress?: string;
  routeProfile?: 'QUICKEST_QUOTE' | 'FASTEST_BRIDGE' | 'BEST_OUTPUT';
  gasFeePaymentMethod?: 'ADD_TO_AMOUNT' | 'DEDUCT_FROM_AMOUNT';
  payGasFeeToken?: string;
  slippage?: number;
  transactionFeePercent?: number;
  metadata?: Record<string, string>;
}

