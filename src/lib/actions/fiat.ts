/**
 * 💰 Fiat Operations Actions
 * Endpoints para operações fiat (depósitos e saques)
 */

import { notusAPI } from '../api/client';

export const fiatActions = {
  /**
   * Cria quote para depósito fiat
   */
  createDepositQuote: (params: {
    amount: string;
    currency: string;
    paymentMethod: string;
    country?: string;
  }) =>
    notusAPI.post("fiat/deposit/quote", {
      json: params,
    }).json(),

  /**
   * Cria ordem de depósito fiat
   */
  createDepositOrder: (params: {
    quoteId: string;
    paymentDetails: Record<string, unknown>;
  }) =>
    notusAPI.post("fiat/deposit", {
      json: params,
    }).json(),

  /**
   * Cria quote para saque fiat
   */
  createWithdrawalQuote: (params: {
    amount: string;
    currency: string;
    paymentMethod: string;
    country?: string;
  }) =>
    notusAPI.post("fiat/withdraw/quote", {
      json: params,
    }).json(),

  /**
   * Cria ordem de saque fiat
   */
  createWithdrawalOrder: (params: {
    quoteId: string;
    paymentDetails: Record<string, unknown>;
  }) =>
    notusAPI.post("fiat/withdraw", {
      json: params,
    }).json(),
};
