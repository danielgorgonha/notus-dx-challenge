/**
 * Types - Exports centralizados
 * Organizado por funcionalidade para facilitar importações
 */

// 🌐 Blockchain
export type {
  Chain,
  TokenInfo,
  NFTCollectionInfo,
  NFTInfo,
  ChainListResponse,
  TokenListResponse,
} from './blockchain';

// 🔐 Smart Wallets
export type {
  DeployedChain,
  WalletResponse,
  TransactionInfo,
  PortfolioResponse,
  WalletHistoryResponse,
  WalletAddressResponse,
  WalletListResponse,
  WalletPortfolioResponse,
  DepositRequest,
  MetadataUpdateRequest,
  TransactionMetadataUpdateRequest,
} from './wallet';

// 🆔 KYC
export type {
  KYCStatus,
  KYCStage,
  KYCSessionStatus,
  DocumentCategory,
  DocumentCountry,
  Nationality,
  KYCStage1Data,
  KYCStage2Data,
  ActiveKYCSession,
  KYCSessionHistory,
  KYCLimits,
  WalletKYCMetadata,
  CreateKYCSessionData,
  KYCSessionResponse,
  DocumentUploadData,
  UploadStatus,
  KYCError,
  KYCResult,
} from './kyc';

// 💰 Fiat Operations
export type {
  FiatDepositQuote,
  FiatDepositOrder,
  FiatWithdrawQuote,
  FiatWithdrawOrder,
  FiatDepositRequest,
  FiatDepositOrderRequest,
  FiatWithdrawRequest,
  FiatWithdrawOrderRequest,
} from './fiat';

// 🔄 Swaps
export type {
  SwapRequest,
  SwapQuote,
  SwapOrder,
  SwapExecutionRequest,
  SwapStatus,
  SwapHistoryItem,
} from './swap';

// 💸 Transfers
export type {
  TransferRequest,
  TransferQuote,
  TransferOrder,
  TransferExecutionRequest,
  TransferStatus,
  TransferHistoryItem,
} from './transfer';

// 🏊 Liquidity
export type {
  LiquidityPool,
  CreateLiquidityRequest,
  ChangeLiquidityRequest,
  CollectFeesRequest,
  GetAmountsRequest,
  LiquidityAmountsResponse,
  HistoricalDataRequest,
  HistoricalDataResponse,
  LiquidityStatus,
  LiquidityHistoryItem,
} from './liquidity';

// ⚙️ User Operations
export type {
  BatchOperationRequest,
  CustomOperationRequest,
  ExecuteUserOperationRequest,
  UserOperationResponse,
  UserOperationStatus,
  UserOperationDetails,
  OperationType,
  OperationData,
} from './execute';

// 🔐 Auth
export type {
  PrivyUser,
  AuthUser,
  AuthResult,
  AuthContextType,
} from './auth';

// ============================================================================
// LEGACY EXPORTS (para compatibilidade)
// ============================================================================

// Re-export para manter compatibilidade com código existente
export type {
  // App-specific types
  User,
  AppState,
  TransferForm,
  SwapForm,
  LiquidityForm,
  KYCForm,
  CreateStandardIndividualSessionRequest,
  CreateStandardIndividualSessionResponse,
  KYCVerificationSession,
  DocumentUpload,
  APIResponse,
  APIError,
  Route,
  NavigationItem,
} from './legacy';

// ============================================================================
// CONSTANTS
// ============================================================================

// KYC Configuration
export { KYC_LIMITS_CONFIG, KYC_STATUS_COLORS, KYC_SESSION_STATUS_COLORS } from './kyc';