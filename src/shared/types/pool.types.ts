/**
 * Shared Pool Types
 */

export interface Pool {
  id: string;
  token0: string;
  token1: string;
  fee: number;
  chainId: number;
  liquidity?: string;
  tvl?: string;
  apr?: string;
  volume24h?: string;
  [key: string]: unknown;
}

export interface PoolListParams {
  take?: number;
  offset?: number;
  chainIds?: string;
  tokensAddresses?: string;
  filterWhitelist?: boolean;
  rangeInDays?: number;
  ids?: string;
}

export interface CreateLiquidityParams {
  walletAddress: string;
  toAddress: string;
  chainId: number;
  payGasFeeToken: string;
  gasFeePaymentMethod: string;
  token0: string;
  token1: string;
  poolFeePercent: number;
  token0Amount: string;
  token1Amount: string;
  minPrice: number;
  maxPrice: number;
  slippage?: number;
  liquidityProvider?: string;
  transactionFeePercent?: number;
  metadata?: Record<string, unknown>;
}

export interface ChangeLiquidityParams {
  walletAddress: string;
  chainId: number;
  payGasFeeToken: string;
  gasFeePaymentMethod: string;
  tokenId: string;
  change: {
    token0: string;
    token1: string;
    token0Amount: string;
    token1Amount: string;
  };
  slippage?: number;
  liquidityProvider?: string;
  transactionFeePercent?: number;
  metadata?: Record<string, unknown>;
}

