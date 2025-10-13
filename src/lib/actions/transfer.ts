/**
 * 💸 Transfer Actions
 * Endpoints para operações de transferência
 */

'use server';

import { notusAPI } from '../api/client';

interface TransferParams {
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

interface TransferQuote {
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

/**
 * Cria uma cotação de transferência de tokens
 */
export async function createTransferQuote(params: TransferParams): Promise<TransferQuote> {
  try {
    console.log('💸 Criando cotação de transferência:', params);
    
    const response = await notusAPI.post("crypto/transfer", {
      json: {
        amount: params.amount,
        chainId: params.chainId,
        gasFeePaymentMethod: params.gasFeePaymentMethod || 'ADD_TO_AMOUNT',
        payGasFeeToken: params.payGasFeeToken,
        token: params.token,
        walletAddress: params.walletAddress,
        toAddress: params.toAddress,
        transactionFeePercent: params.transactionFeePercent || 0,
        metadata: params.metadata || {}
      },
    }).json<TransferQuote>();

    console.log('✅ Cotação de transferência criada:', response);
    return response;
  } catch (error) {
    console.error('❌ Erro ao criar cotação de transferência:', error);
    throw error;
  }
}
