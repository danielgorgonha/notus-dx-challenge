/**
 * 💸 Transfer Actions
 * Endpoints para operações de transferência
 */

import { notusAPI } from '../api/client';

export const transferActions = {
  /**
   * Cria operação de transferência
   */
  createTransfer: (params: {
    amount: string;
    chainId: number;
    gasFeePaymentMethod: string;
    payGasFeeToken: string;
    token: string;
    walletAddress: string;
    toAddress: string;
    transactionFeePercent?: number;
  }) =>
    notusAPI.post("crypto/transfer", {
      json: params,
    }).json(),
};

// ============================================================================
// SERVER ACTIONS (para uso em Server Components)
// ============================================================================

export async function getTransferQuote({
  eoa,
  smartWalletAddress,
  toAddress,
  token,
  amount,
  chainId = 137, // Example: Polygon
}: {
  eoa: string;
  smartWalletAddress: string;
  toAddress: string;
  token: string;
  amount: string;
  chainId?: number;
}) {
  try {
    const response = await transferActions.createTransfer({
      amount: String(amount),
      chainId: Number(chainId),
      gasFeePaymentMethod: "ADD_TO_AMOUNT",
      payGasFeeToken: token,
      token,
      walletAddress: smartWalletAddress,
      toAddress,
      transactionFeePercent: 0,
    });
    return { success: true, data: response };
  } catch (error: unknown) {
    console.error("Error getting transfer quote:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to get transfer quote" };
  }
}
