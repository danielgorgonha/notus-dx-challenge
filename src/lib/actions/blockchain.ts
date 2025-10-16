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
  logo?: string;
  logoUrl?: string;
  price?: number;
  isNative: boolean;
  chain?: {
    id: number;
    name: string;
    logo: string;
  };
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
export async function listChains({ 
  page = 1, 
  perPage = 50 
}: {
  page?: number;
  perPage?: number;
} = {}): Promise<ChainsResponse> {
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
export async function listTokens({
  page = 1, 
  perPage = 100,
  filterWhitelist = false,
  orderBy = 'marketCap',
  orderDir = 'desc'
}: {
  page?: number;
  perPage?: number;
  filterWhitelist?: boolean;
  orderBy?: 'marketCap' | 'chainId';
  orderDir?: 'asc' | 'desc';
} = {}): Promise<TokensResponse> {
  try {
    
    const response = await notusAPI.get("crypto/tokens", {
      searchParams: { 
        page, 
        perPage,
        projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
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
export async function listTokensByChain({
  chainId,
  page = 1, 
  perPage = 100,
  filterWhitelist = false,
  orderBy = 'marketCap',
  orderDir = 'desc'
}: {
  chainId: number;
  page?: number;
  perPage?: number;
  filterWhitelist?: boolean;
  orderBy?: 'marketCap' | 'chainId';
  orderDir?: 'asc' | 'desc';
}): Promise<TokensResponse> {
  try {
    const response = await notusAPI.get("crypto/tokens", {
      searchParams: { 
        filterByChainId: chainId, 
        page, 
        perPage,
        projectId: process.env.NOTUS_PROJECT_ID,
        filterWhitelist,
        orderBy,
        orderDir
      },
    }).json<TokensResponse>();

    return response;
  } catch (error) {
    throw error;
  }
}
