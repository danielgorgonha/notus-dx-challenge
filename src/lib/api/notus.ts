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

// Notus API Client
class NotusAPI {
  private baseURL: string
  private apiKey: string

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_NOTUS_API_URL || 'https://api.notus.team'
    this.apiKey = process.env.NOTUS_API_KEY || ''
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Portfolio & History
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
