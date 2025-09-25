/**
 * Legacy Types
 * Tipos legados para compatibilidade com código existente
 */

// App-specific types
export interface User {
  id: string;
  email?: string;
  walletAddress: string;
  smartWalletAddress?: string;
  kycStatus?: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

export interface AppState {
  isLoading: boolean;
  error: string | null;
  currentRoute: string;
}

export interface TransferForm {
  to: string;
  token: string;
  amount: string;
}

export interface SwapForm {
  fromToken: string;
  toToken: string;
  amount: string;
  slippage: string;
}

export interface LiquidityForm {
  poolAddress: string;
  tokenA: string;
  tokenB: string;
  amountA: string;
  amountB: string;
}

export interface KYCForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  documentType: string;
  documentNumber: string;
}

// KYC Types from Notus API (legacy)
export interface CreateStandardIndividualSessionRequest {
  firstName: string;
  lastName: string;
  birthDate: string; // Format: "DD/MM/YYYY"
  documentId: string; // CPF/CNPJ (only digits)
  documentCategory: "IDENTITY_CARD" | "PASSPORT" | "DRIVERS_LICENSE";
  documentCountry: "US" | "BRAZIL";
  livenessRequired?: boolean;
}

export interface CreateStandardIndividualSessionResponse {
  session: {
    id: string;
    firstName: string;
    lastName: string;
    birthDate: string;
    document: {
      id: string;
      type: string | null;
      category: string;
    };
    status: "PENDING" | "VERIFYING" | "COMPLETED" | "FAILED" | "EXPIRED";
    livenessRequired: boolean;
    createdAt: string;
    updatedAt: string | null;
    individualId?: string; // Present when status is COMPLETED
  };
  frontDocumentUpload: DocumentUpload;
  backDocumentUpload: DocumentUpload | null;
}

export interface KYCVerificationSession {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  document: {
    id: string;
    type: string | null;
    category: string;
  };
  status: "PENDING" | "VERIFYING" | "COMPLETED" | "FAILED" | "EXPIRED";
  livenessRequired: boolean;
  createdAt: string;
  updatedAt: string | null;
  individualId?: string; // Present when status is COMPLETED
}

export interface DocumentUpload {
  url: string;
  fields: {
    bucket: string;
    "X-Amz-Algorithm": string;
    "X-Amz-Credential": string;
    "X-Amz-Date": string;
    key: string;
    Policy: string;
    "X-Amz-Signature": string;
  };
}

// API Response types
export interface APIResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface APIError {
  code: string;
  message: string;
  details?: unknown;
}

// Navigation types
export type Route = 
  | '/'
  | '/dashboard'
  | '/transfers'
  | '/swaps'
  | '/liquidity'
  | '/portfolio'
  | '/history'
  | '/kyc';

export interface NavigationItem {
  label: string;
  href: Route;
  icon: string;
  description: string;
}
