/**
 * Shared Transfer Types
 */

export interface TransferQuote {
  transfer: {
    userOperationHash: string;
    walletAddress: string;
    token: string;
    amountToSend: string;
    amountToSendUSD: string;
    amountToBeReceived: string;
    amountToBeReceivedUSD: string;
    chain: number;
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
    toAddress: string;
    expiresAt: number;
  };
}

export interface CreateTransferQuoteParams {
  amount: string;
  chainId: number;
  gasFeePaymentMethod: 'ADD_TO_AMOUNT' | 'DEDUCT_FROM_AMOUNT';
  payGasFeeToken: string;
  token: string;
  walletAddress: string;
  toAddress: string;
  transactionFeePercent?: number;
  metadata?: Record<string, string>;
}

