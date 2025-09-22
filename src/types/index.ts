// Re-export all types from API
export type {
  Token,
  Transaction,
  Portfolio,
  SwapQuote,
  LiquidityPool,
} from '@/lib/api/notus'

// Additional app-specific types
export interface User {
  id: string
  email?: string
  walletAddress: string
  smartWalletAddress?: string
  kycStatus?: 'pending' | 'approved' | 'rejected'
  createdAt: Date
}

export interface AppState {
  isLoading: boolean
  error: string | null
  currentRoute: string
}

export interface TransferForm {
  to: string
  token: string
  amount: string
}

export interface SwapForm {
  fromToken: string
  toToken: string
  amount: string
  slippage: string
}

export interface LiquidityForm {
  poolAddress: string
  tokenA: string
  tokenB: string
  amountA: string
  amountB: string
}

export interface KYCForm {
  firstName: string
  lastName: string
  email: string
  phone: string
  country: string
  documentType: string
  documentNumber: string
}

// API Response types
export interface APIResponse<T> {
  data: T
  success: boolean
  message?: string
}

export interface APIError {
  code: string
  message: string
  details?: any
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
  | '/kyc'

export interface NavigationItem {
  label: string
  href: Route
  icon: string
  description: string
}
