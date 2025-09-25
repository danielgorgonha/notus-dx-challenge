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
    page?: number;
    perPage?: number;
    chainId?: number;
    token0?: string;
    token1?: string;
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
    poolId: string;
    amount0: string;
    amount1: string;
    walletAddress: string;
    chainId: number;
    slippageTolerance?: number;
  }) =>
    notusAPI.post("liquidity/create", {
      json: params,
    }).json(),

  /**
   * Altera liquidez em um pool (adiciona/remove)
   */
  changeLiquidity: (params: {
    poolId: string;
    liquidityAmount: string;
    walletAddress: string;
    chainId: number;
    slippageTolerance?: number;
  }) =>
    notusAPI.post("liquidity/change", {
      json: params,
    }).json(),

  /**
   * Coleta taxas de liquidez
   */
  collectFees: (params: {
    poolId: string;
    walletAddress: string;
    chainId: number;
  }) =>
    notusAPI.post("liquidity/collect", {
      json: params,
    }).json(),

  /**
   * Obtém quantidades de liquidez
   */
  getAmounts: (params: {
    poolId: string;
    walletAddress: string;
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
