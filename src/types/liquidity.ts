/**
 * 🏊 Liquidity Types
 * Tipos para operações de liquidez
 */

// Liquidity Pool
export interface LiquidityPool {
  id: string;
  address: string;
  token0: {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    logo: string;
  };
  token1: {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    logo: string;
  };
  chainId: number;
  fee: number;
  liquidity: string;
  volume24h: string;
  tvl: string;
  apr: string;
  createdAt: string;
}

// Create Liquidity Request
export interface CreateLiquidityRequest {
  poolId: string;
  amount0: string;
  amount1: string;
  walletAddress: string;
  chainId: number;
  slippageTolerance?: number;
}

// Change Liquidity Request
export interface ChangeLiquidityRequest {
  poolId: string;
  liquidityAmount: string;
  walletAddress: string;
  chainId: number;
  slippageTolerance?: number;
}

// Collect Fees Request
export interface CollectFeesRequest {
  poolId: string;
  walletAddress: string;
  chainId: number;
}

// Get Amounts Request
export interface GetAmountsRequest {
  poolId: string;
  walletAddress: string;
}

// Liquidity Amounts Response
export interface LiquidityAmountsResponse {
  token0Amount: string;
  token1Amount: string;
  liquidityTokens: string;
  share: string;
}

// Historical Data Request
export interface HistoricalDataRequest {
  days?: number;
}

// Historical Data Response
export interface HistoricalDataResponse {
  data: Array<{
    date: string;
    tvl: string;
    volume: string;
    fees: string;
    apr: string;
  }>;
}

// Liquidity Operation Status
export type LiquidityStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'EXPIRED';

// Liquidity History Item
export interface LiquidityHistoryItem {
  id: string;
  poolId: string;
  type: 'ADD' | 'REMOVE' | 'COLLECT';
  token0Amount: string;
  token1Amount: string;
  status: LiquidityStatus;
  createdAt: string;
  completedAt?: string;
  transactionHash?: string;
}
