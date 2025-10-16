/**
 * 🏊 Liquidity Pools Actions
 * Endpoints para operações de liquidez
 */

import { notusAPI } from '../api/client';

export const liquidityActions = {
  /**
   * Lista pools de liquidez
   */
  listPools: (params?: {
    take?: number;
    offset?: number;
    chainIds?: string;
    tokensAddresses?: string;
    filterWhitelist?: boolean;
    rangeInDays?: number;
    ids?: string;
  }) =>
    notusAPI.get("liquidity/pools", {
      searchParams: params,
    }).json(),

  /**
   * Obtém detalhes de um pool específico
   */
  getPool: (poolId: string) =>
    notusAPI.get(`liquidity/pools/${poolId}`).json(),

  /**
   * Cria liquidez em um pool
   */
  createLiquidity: (params: {
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
    metadata?: object;
  }) =>
    notusAPI.post("liquidity/create", {
      json: params,
    }).json(),

  /**
   * Altera liquidez em um pool (adiciona/remove)
   */
  changeLiquidity: (params: {
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
    metadata?: object;
  }) =>
    notusAPI.post("liquidity/change", {
      json: params,
    }).json(),

  /**
   * Coleta taxas de liquidez
   */
  collectFees: (params: {
    chainId: number;
    nftId: string;
    walletAddress: string;
    payGasFeeToken: string;
    liquidityProvider?: string;
    metadata?: object;
  }) =>
    notusAPI.post("liquidity/collect", {
      json: params,
    }).json(),

  /**
   * Obtém quantidades de liquidez
   */
  getAmounts: (params: {
    liquidityProvider?: string;
    chainId: number;
    token0: string;
    token1: string;
    poolFeePercent: number;
    token0MaxAmount?: string;
    token1MaxAmount?: string;
    minPrice: number;
    maxPrice: number;
    payGasFeeToken: string;
    gasFeePaymentMethod: string;
  }) =>
    notusAPI.get("liquidity/amounts", {
      searchParams: params,
    }).json(),

  /**
   * Obtém dados históricos do pool
   * GET /liquidity/pools/{pool_id}/historical-data
   */
  getHistoricalData: (poolId: string, params?: {
    days?: number;
  }) =>
    notusAPI.get(`liquidity/pools/${poolId}/historical-data`, {
      searchParams: params,
    }).json(),
};
