/**
 * 🔄 Swap Actions
 * Endpoints para operações de swap de tokens
 */

import { notusAPI } from '../api/client';

export const swapActions = {
  /**
   * Cria operação de swap
   */
  createSwap: (params: {
    amount: string;
    fromToken: string;
    toToken: string;
    walletAddress: string;
    chainId: number;
    slippageTolerance?: number;
    gasFeePaymentMethod?: string;
    payGasFeeToken?: string;
  }) =>
    notusAPI.post("crypto/swap", {
      json: params,
    }).json(),
};
