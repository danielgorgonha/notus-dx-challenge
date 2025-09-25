/**
 * 💰 Fiat Operations Types
 * Tipos para operações de depósito e saque fiat
 */

// Fiat Deposit Quote
export interface FiatDepositQuote {
  quoteId: string;
  amountToSendInFiatCurrency: string;
  amountToReceiveInCryptoCurrency: string;
  expiresAt: string;
  paymentMethodToSend: string;
  receiveCryptoCurrency: string;
  exchangeRate: string;
  fees: string;
  totalAmount: string;
}

// Fiat Deposit Order
export interface FiatDepositOrder {
  orderId: string;
  quoteId: string;
  status: string;
  paymentInstructions: {
    pixKey: string;
    amount: string;
    expiresAt: string;
  };
}

// Fiat Withdraw Quote
export interface FiatWithdrawQuote {
  quoteId: string;
  amountToSendInCryptoCurrency: string;
  amountToReceiveInFiatCurrency: string;
  estimatedGasFeeInCryptoCurrency: string;
  transactionFeeInCryptoCurrency: string;
  expiresAt: string;
}

// Fiat Withdraw Order
export interface FiatWithdrawOrder {
  userOperationHash: string;
  orderId: string;
  amountToSendInCryptoCurrency: string;
  amountToReceiveInFiatCurrency: string;
  transactionFeeAmountInCryptoCurrency: string;
  estimatedGasFeeAmountInCryptoCurrency: string;
}

// Fiat Deposit Request
export interface FiatDepositRequest {
  amount: string;
  currency: string;
  paymentMethod: string;
  country?: string;
}

// Fiat Deposit Order Request
export interface FiatDepositOrderRequest {
  quoteId: string;
  paymentDetails: Record<string, unknown>;
}

// Fiat Withdraw Request
export interface FiatWithdrawRequest {
  amount: string;
  currency: string;
  paymentMethod: string;
  country?: string;
}

// Fiat Withdraw Order Request
export interface FiatWithdrawOrderRequest {
  quoteId: string;
  paymentDetails: Record<string, unknown>;
}
