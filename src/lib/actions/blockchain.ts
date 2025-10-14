/**
 * 🌐 Blockchain Actions
 * Endpoints para consultar chains e tokens suportados
 */

'use server';

import { notusAPI } from '../api/client';

interface Chain {
  id: number;
  name: string;
  symbol: string;
  rpcUrl: string;
  blockExplorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  isTestnet: boolean;
}

interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  chainId: number;
  logoUrl?: string;
  price?: number;
  isNative: boolean;
}

interface ChainsResponse {
  chains: Chain[];
  total: number;
  page: number;
  perPage: number;
}

interface TokensResponse {
  tokens: Token[];
  total: number;
  page: number;
  perPage: number;
}

/**
 * Lista todas as chains suportadas
 */
export async function listChains(page: number = 1, perPage: number = 50): Promise<ChainsResponse> {
  try {
    
    const response = await notusAPI.get("crypto/chains", {
      searchParams: { page, perPage },
    }).json<ChainsResponse>();

    return response;
  } catch (error) {
    console.error('❌ Erro ao listar chains:', error);
    throw error;
  }
}

/**
 * Lista todos os tokens suportados
 */
export async function listTokens(
  page: number = 1, 
  perPage: number = 100,
  projectId: string = 'fdf973e5-3523-4077-903d-bacfc0d0c2dd',
  filterWhitelist: boolean = false,
  orderBy: 'marketCap' | 'chainId' = 'marketCap',
  orderDir: 'asc' | 'desc' = 'desc'
): Promise<TokensResponse> {
  try {
    
    const response = await notusAPI.get("crypto/tokens", {
      searchParams: { 
        page, 
        perPage,
        projectId,
        filterWhitelist,
        orderBy,
        orderDir
      },
    }).json<TokensResponse>();

    return response;
  } catch (error) {
    console.error('❌ Erro ao listar tokens:', error);
    throw error;
  }
}

/**
 * Lista tokens por chain específica
 */
export async function listTokensByChain(
  chainId: number, 
  page: number = 1, 
  perPage: number = 100,
  projectId: string = 'fdf973e5-3523-4077-903d-bacfc0d0c2dd',
  filterWhitelist: boolean = true,
  orderBy: 'marketCap' | 'chainId' = 'marketCap',
  orderDir: 'asc' | 'desc' = 'desc'
): Promise<TokensResponse> {
  try {
    
    const response = await notusAPI.get("crypto/tokens", {
      searchParams: { 
        chainId, 
        page, 
        perPage,
        projectId,
        filterWhitelist,
        orderBy,
        orderDir
      },
    }).json<TokensResponse>();

    return response;
  } catch (error) {
    console.error(`❌ Erro ao listar tokens para chain ${chainId}:`, error);
    throw error;
  }
}
