/**
 * 💰 Fiat Operations Types
 * Tipos para operações de depósito e saque fiat
 */

// Moedas disponíveis para depósito
export interface DepositCurrency {
  code: string;
  name: string;
  symbol: string;
  icon: string;
  available: boolean;
  minAmount: string;
  maxAmount: string;
}

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
  estimatedTime: string;
  provider: string;
  operation: string;
}

// Fiat Deposit Order
export interface FiatDepositOrder {
  orderId: string;
  quoteId: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'EXPIRED';
  paymentInstructions: {
    pixKey: string;
    amount: string;
    expiresAt: string;
  };
}

// Detalhes PIX para depósito
export interface PixDepositDetails {
  orderId: string;
  qrCodeUrl: string;
  pixCopyPaste: string;
  amount: string;
  expiresAt: string;
  validFor: string; // "04:57" format
  paymentInstructions: {
    pixKey: string;
    amount: string;
    expiresAt: string;
  };
}

// Status do depósito
export interface DepositStatus {
  orderId: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'EXPIRED';
  amount: string;
  receivedAmount: string;
  transactionHash?: string;
  completedAt?: string;
  errorMessage?: string;
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
