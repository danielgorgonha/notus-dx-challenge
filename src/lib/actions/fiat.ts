/**
 * 💰 Fiat Operations Actions
 * Endpoints para operações fiat (depósitos e saques)
 */

import { notusAPI } from '../api/client';

export const fiatActions = {
  /**
   * Lista moedas disponíveis para depósito
   * GET /fiat/deposit/currencies
   */
  getDepositCurrencies: () =>
    notusAPI.get("fiat/deposit/currencies").json(),

  /**
   * Cria quote para depósito fiat
   * POST /fiat/deposit/quote
   */
  createDepositQuote: (params: {
    paymentMethodToSend: string;
    amountToSendInFiatCurrency: string;
    sendFiatCurrency: string;
    receiveCryptoCurrency: string;
    individualId: string;
    chainId: number;
    walletAddress: string;
  }) =>
    notusAPI.post("fiat/deposit/quote", {
      json: params,
    }).json(),

  /**
   * Cria ordem de depósito fiat
   * POST /fiat/deposit
   */
  createDepositOrder: (params: {
    quoteId: string;
  }) =>
    notusAPI.post("fiat/deposit", {
      json: params,
    }).json(),

  /**
   * Obtém detalhes PIX para depósito
   * GET /fiat/deposit/{orderId}/pix-details
   */
  getDepositPixDetails: (orderId: string) =>
    notusAPI.get(`fiat/deposit/${orderId}/pix-details`).json(),

  /**
   * Verifica status do depósito
   * GET /fiat/deposit/{orderId}/status
   */
  getDepositStatus: (orderId: string) =>
    notusAPI.get(`fiat/deposit/${orderId}/status`).json(),

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
