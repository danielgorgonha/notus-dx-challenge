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
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`)
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

  // KYC (if available)
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
