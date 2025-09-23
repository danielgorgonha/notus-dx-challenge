import { z } from 'zod'

// Notus API Types
export const TokenSchema = z.object({
  address: z.string(),
  symbol: z.string(),
  name: z.string(),
  decimals: z.number(),
  balance: z.string(),
  balanceUSD: z.string(),
})

export const TransactionSchema = z.object({
  hash: z.string(),
  from: z.string(),
  to: z.string(),
  value: z.string(),
  token: z.string(),
  timestamp: z.number(),
  type: z.enum(['transfer', 'swap', 'liquidity']),
})

export const PortfolioSchema = z.object({
  totalBalanceUSD: z.string(),
  tokens: z.array(TokenSchema),
})

export const SwapQuoteSchema = z.object({
  fromToken: z.string(),
  toToken: z.string(),
  fromAmount: z.string(),
  toAmount: z.string(),
  priceImpact: z.string(),
  slippage: z.string(),
  gasEstimate: z.string(),
})

export const LiquidityPoolSchema = z.object({
  address: z.string(),
  name: z.string(),
  tokens: z.array(TokenSchema),
  tvl: z.string(),
  apr: z.string(),
  fee: z.string(),
})

export type Token = z.infer<typeof TokenSchema>
export type Transaction = z.infer<typeof TransactionSchema>
export type Portfolio = z.infer<typeof PortfolioSchema>
export type SwapQuote = z.infer<typeof SwapQuoteSchema>
export type LiquidityPool = z.infer<typeof LiquidityPoolSchema>

// Smart Wallet specific types
export interface NotusWallet {
  walletAddress: string;
  accountAbstraction: string;
  factory: string;
  implementation: string;
  deployedChains: number[];
  salt: string;
  registeredAt: string | null;
  metadata?: {
    name?: string;
    description?: string;
  };
}

// Supported chains
export const SUPPORTED_CHAINS = {
  ARBITRUM_ONE: 42161,
  AVALANCHE: 43114,
  BASE: 8453,
  BNB_SMART_CHAIN: 56,
  ETHEREUM: 1,
  GNOSIS: 100,
  OP_MAINNET: 10,
  POLYGON: 137,
} as const;

export type SupportedChain = typeof SUPPORTED_CHAINS[keyof typeof SUPPORTED_CHAINS];

export interface NotusWalletHistory {
  transactions: Transaction[];
  total: number;
  page: number;
  limit: number;
}

// Fiat Operations Types
export interface FiatDepositQuote {
  quoteId: string;
  amountToSendInFiatCurrency: string;
  amountToReceiveInCryptoCurrency: string;
  expiresAt: string;
  paymentMethodToSend: string;
  receiveCryptoCurrency: string;
}

export interface FiatDepositOrder {
  orderId: string;
  expiresAt: string;
  paymentMethodToSendDetails: {
    type: string;
    pixKey: string;
    qrCode: string; // base64
  };
}

export interface FiatWithdrawQuote {
  quoteId: string;
  amountToSendInCryptoCurrency: string;
  amountToReceiveInFiatCurrency: string;
  estimatedGasFeeInCryptoCurrency: string;
  transactionFeeInCryptoCurrency: string;
  expiresAt: string;
}

export interface FiatWithdrawOrder {
  userOperationHash: string;
  orderId: string;
  amountToSendInCryptoCurrency: string;
  amountToReceiveInFiatCurrency: string;
  transactionFeeAmountInCryptoCurrency: string;
  estimatedGasFeeAmountInCryptoCurrency: string;
}

// KYC Types
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

// Notus API Client
class NotusAPI {
  private baseURL: string
  private apiKey: string

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_NOTUS_API_URL || 'https://api.notus.team/api/v1'
    this.apiKey = process.env.NEXT_PUBLIC_NOTUS_API_KEY || ''
    
    console.log('🔧 Notus API Config:', {
      baseURL: this.baseURL,
      hasApiKey: !!this.apiKey,
      apiKeyLength: this.apiKey?.length || 0
    })
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    console.log('🔍 Notus API Request:', {
      url,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': `${this.apiKey?.slice(0, 20)}...`,
      },
      body: options.body
    })
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        ...options.headers,
      },
    })

    console.log('📡 Notus API Response:', {
      status: response.status,
      statusText: response.statusText,
      url: response.url
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Notus API Error:', errorText)
      
      // Parse error response para extrair informações específicas
      let errorMessage = `API Error: ${response.status} ${response.statusText}`;
      let errorId = null;
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
        errorId = errorData.id || null;
        
        // Log específico para erros conhecidos
        if (errorId === 'INDIVIDUAL_NOT_FOUND') {
          console.warn('🔍 Individual não encontrado - será criado automaticamente');
        }
      } catch (parseError) {
        // Se não conseguir fazer parse, usa o texto original
        errorMessage += ` - ${errorText}`;
      }
      
      const error = new Error(errorMessage);
      (error as any).status = response.status;
      (error as any).errorId = errorId;
      (error as any).originalResponse = errorText;
      
      throw error;
    }

    return response.json()
  }

  // Smart Wallet endpoints
  async registerSmartWallet(walletAddress: string, metadata?: any): Promise<NotusWallet> {
    return this.request<NotusWallet>('/wallets/register', {
      method: 'POST',
      body: JSON.stringify({
        externallyOwnedAccount: walletAddress,
        factory: '0x7a1dbab750f12a90eb1b60d2ae3ad17d4d81effe', // Factory address from example
        salt: '0',
        metadata,
      }),
    });
  }

  async getSmartWallet(walletAddress: string): Promise<NotusWallet> {
    return this.request<NotusWallet>(`/wallets/address?externallyOwnedAccount=${walletAddress}&factory=0x7a1dbab750f12a90eb1b60d2ae3ad17d4d81effe`);
  }

  async getSmartWalletPortfolio(walletAddress: string): Promise<Portfolio> {
    return this.request<Portfolio>(`/wallets/${walletAddress}/portfolio`);
  }

  async getSmartWalletHistory(
    walletAddress: string,
    take = 20,
    lastId?: string
  ): Promise<NotusWalletHistory> {
    const params = new URLSearchParams({
      take: take.toString(),
      ...(lastId && { lastId }),
    });
    return this.request<NotusWalletHistory>(`/wallets/${walletAddress}/history?${params}`);
  }

  async createDepositTransaction(
    walletAddress: string,
    amount: string,
    token: string,
    chainId: number,
    fromAddress: string
  ): Promise<{ from: string; to: string; value: string; data: string; estimateGasCost: string }> {
    return this.request<{ from: string; to: string; value: string; data: string; estimateGasCost: string }>(`/wallets/${walletAddress}/deposit`, {
      method: 'POST',
      body: JSON.stringify({
        amount,
        chainId,
        token,
        fromAddress,
      }),
    });
  }

  async updateWalletMetadata(
    walletAddress: string,
    metadata: any
  ): Promise<NotusWallet> {
    return this.request<NotusWallet>(`/wallets/${walletAddress}/metadata`, {
      method: 'PATCH',
      body: JSON.stringify({ metadata }),
    });
  }

  // Get all smart wallets by project
  async getSmartWalletsByProject(): Promise<NotusWallet[]> {
    return this.request<NotusWallet[]>('/wallets');
  }

  // Update transaction metadata
  async updateTransactionMetadata(
    walletAddress: string,
    transactionId: string,
    metadata: any
  ): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/wallets/${walletAddress}/transactions/${transactionId}/metadata`, {
      method: 'PATCH',
      body: JSON.stringify({ metadata }),
    });
  }

  // Portfolio & History (legacy methods)
  async getPortfolio(walletAddress: string): Promise<Portfolio> {
    return this.request<Portfolio>(`/portfolio/${walletAddress}`)
  }

  async getHistory(walletAddress: string, limit = 50): Promise<Transaction[]> {
    return this.request<Transaction[]>(`/history/${walletAddress}?limit=${limit}`)
  }

  // Transfers
  async getTransferQuote(params: {
    from: string
    to: string
    token: string
    amount: string
  }): Promise<SwapQuote> {
    return this.request<SwapQuote>('/transfer/quote', {
      method: 'POST',
      body: JSON.stringify(params),
    })
  }

  async executeTransfer(params: {
    from: string
    to: string
    token: string
    amount: string
    signature: string
  }): Promise<{ hash: string }> {
    return this.request<{ hash: string }>('/transfer/execute', {
      method: 'POST',
      body: JSON.stringify(params),
    })
  }

  // Swaps
  async getSwapQuote(params: {
    fromToken: string
    toToken: string
    amount: string
    slippage?: string
  }): Promise<SwapQuote> {
    return this.request<SwapQuote>('/swap/quote', {
      method: 'POST',
      body: JSON.stringify(params),
    })
  }

  async executeSwap(params: {
    fromToken: string
    toToken: string
    amount: string
    signature: string
  }): Promise<{ hash: string }> {
    return this.request<{ hash: string }>('/swap/execute', {
      method: 'POST',
      body: JSON.stringify(params),
    })
  }

  // Liquidity Pools
  async getLiquidityPools(): Promise<LiquidityPool[]> {
    return this.request<LiquidityPool[]>('/liquidity/pools')
  }

  async addLiquidity(params: {
    poolAddress: string
    tokenA: string
    tokenB: string
    amountA: string
    amountB: string
    signature: string
  }): Promise<{ hash: string }> {
    return this.request<{ hash: string }>('/liquidity/add', {
      method: 'POST',
      body: JSON.stringify(params),
    })
  }

  async removeLiquidity(params: {
    poolAddress: string
    lpTokenAmount: string
    signature: string
  }): Promise<{ hash: string }> {
    return this.request<{ hash: string }>('/liquidity/remove', {
      method: 'POST',
      body: JSON.stringify(params),
    })
  }

  // Fiat Operations - ON-RAMP (Depósito)
  async createFiatDepositQuote(params: {
    paymentMethodToSend: string; // "PIX"
    receiveCryptoCurrency: string; // "USDC" ou "BRZ"
    amountToSendInFiatCurrency: string; // "100.00"
    individualId: string;
    walletAddress: string;
    chainId: number;
  }): Promise<FiatDepositQuote> {
    return this.request<FiatDepositQuote>('/fiat/deposit/quote', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async createFiatDepositOrder(params: {
    quoteId: string;
    individualId: string;
    walletAddress: string;
    chainId: number;
  }): Promise<FiatDepositOrder> {
    return this.request<FiatDepositOrder>('/fiat/deposit', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Fiat Operations - OFF-RAMP (Saque)
  async createFiatWithdrawQuote(params: {
    individualId: string;
    amountToSendInCryptoCurrency: string;
    cryptoCurrencyToSend: string; // "USDC" ou "BRZ"
    paymentMethodToReceiveDetails: {
      type: string; // "PIX"
      pixKey: string;
    };
    chainId: number;
  }): Promise<FiatWithdrawQuote> {
    return this.request<FiatWithdrawQuote>('/fiat/withdraw/quote', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async createFiatWithdrawOrder(params: {
    quoteId: string;
    individualId: string;
    walletAddress: string;
    chainId: number;
  }): Promise<FiatWithdrawOrder> {
    return this.request<FiatWithdrawOrder>('/fiat/withdraw', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Execute User Operation (obrigatório para OFF-RAMP)
  async executeUserOperation(params: {
    userOperationHash: string;
    signature: string;
  }): Promise<{ hash: string }> {
    return this.request<{ hash: string }>('/crypto/execute-user-op', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // KYC Operations - API Real da Notus
  async createStandardIndividualSession(params: CreateStandardIndividualSessionRequest): Promise<CreateStandardIndividualSessionResponse> {
    return this.request<CreateStandardIndividualSessionResponse>('/kyc/individual-verification-sessions/standard', {
      method: 'POST',
      body: JSON.stringify({
        ...params,
        livenessRequired: false, // Por padrão, não requer liveness
      }),
    });
  }

  async getKYCVerificationSession(sessionId: string): Promise<{ session: KYCVerificationSession }> {
    return this.request<{ session: KYCVerificationSession }>(`/kyc/individual-verification-sessions/standard/${sessionId}`);
  }

  async processKYCVerificationSession(sessionId: string): Promise<{ status: string }> {
    return this.request<{ status: string }>(`/kyc/individual-verification-sessions/standard/${sessionId}/process`, {
      method: 'POST',
    });
  }

  // Upload de documento para S3
  async uploadDocumentToS3(uploadData: DocumentUpload, file: File): Promise<void> {
    const formData = new FormData();
    
    // Adicionar campos obrigatórios do S3
    Object.entries(uploadData.fields).forEach(([key, value]) => {
      formData.append(key, value);
    });
    
    // Adicionar o arquivo
    formData.append('file', file);
    
    const response = await fetch(uploadData.url, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao fazer upload do documento: ${response.statusText}`);
    }
  }

  // Legacy KYC methods (mantidos para compatibilidade)
  async submitKYC(params: {
    walletAddress: string
    personalInfo: any
  }): Promise<{ status: string }> {
    return this.request<{ status: string }>('/kyc/submit', {
      method: 'POST',
      body: JSON.stringify(params),
    })
  }

  async getKYCStatus(walletAddress: string): Promise<{ status: string }> {
    return this.request<{ status: string }>(`/kyc/status/${walletAddress}`)
  }
}

export const notusAPI = new NotusAPI()
