/**
 * Shared Fiat Types
 */

export interface DepositCurrency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  [key: string]: unknown;
}

export interface DepositQuote {
  quoteId: string;
  amountToSend: string;
  amountToReceive: string;
  exchangeRate: string;
  fees: string;
  expiresAt: number;
  [key: string]: unknown;
}

export interface DepositOrder {
  orderId: string;
  status: string;
  [key: string]: unknown;
}

export interface PixDetails {
  pixKey: string;
  qrCode: string;
  amount: string;
  expiresAt: number;
  [key: string]: unknown;
}

export interface CreateDepositQuoteParams {
  paymentMethodToSend: string;
  amountToSendInFiatCurrency: string;
  sendFiatCurrency: string;
  receiveCryptoCurrency: string;
  individualId: string;
  chainId: number;
  walletAddress: string;
}

export interface CreateDepositOrderParams {
  quoteId: string;
}

