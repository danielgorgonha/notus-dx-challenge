/**
 * 🔄 Swap Actions
 * Endpoints para operações de swap de tokens
 */

'use server';

import { notusAPI } from '../api/client';

interface SwapParams {
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

interface SwapQuote {
  swap: {
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
  };
}

/**
 * Cria uma cotação de swap de tokens
 */
export async function createSwapQuote(params: SwapParams): Promise<SwapQuote> {
  try {
    console.log('🔄 Criando cotação de swap:', params);
    
    const response = await notusAPI.post("crypto/swap", {
      json: {
        amountIn: params.amountIn,
        chainIdIn: params.chainIdIn,
        chainIdOut: params.chainIdOut,
        tokenIn: params.tokenIn,
        tokenOut: params.tokenOut,
        walletAddress: params.walletAddress,
        toAddress: params.toAddress || params.walletAddress,
        routeProfile: params.routeProfile || 'QUICKEST_QUOTE',
        gasFeePaymentMethod: params.gasFeePaymentMethod || 'ADD_TO_AMOUNT',
        payGasFeeToken: params.payGasFeeToken,
        slippage: params.slippage || 0.5,
        transactionFeePercent: params.transactionFeePercent || 0,
        metadata: params.metadata || {}
      },
    }).json<SwapQuote>();

    console.log('✅ Cotação de swap criada:', response);
    return response;
  } catch (error) {
    console.error('❌ Erro ao criar cotação de swap:', error);
    throw error;
  }
}
