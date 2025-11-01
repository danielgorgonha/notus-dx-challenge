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
  orderDir = 'desc',
  search,
  filterByChainId
}: {
  page?: number;
  perPage?: number;
  filterWhitelist?: boolean;
  orderBy?: 'marketCap' | 'chainId';
  orderDir?: 'asc' | 'desc';
  search?: string;
  filterByChainId?: number;
} = {}): Promise<TokensResponse> {
  try {
    const searchParams: Record<string, string | number | boolean> = {
      page, 
      perPage,
      filterWhitelist,
      orderBy,
      orderDir
    };

    // Adicionar projectId apenas se estiver definido
    const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || process.env.NOTUS_PROJECT_ID;
    if (projectId) {
      searchParams.projectId = projectId;
    }

    // Adicionar search se fornecido
    if (search) {
      searchParams.search = search;
    }

    // Adicionar filterByChainId se fornecido
    if (filterByChainId) {
      searchParams.filterByChainId = filterByChainId;
    }
    
    const response = await notusAPI.get("crypto/tokens", {
      searchParams,
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
    // Construir parâmetros conforme a API Notus espera
    const searchParams: Record<string, string | number> = {
      filterByChainId: String(chainId), 
      page: String(page), 
      perPage: String(perPage),
      filterWhitelist: String(filterWhitelist),
      orderBy: String(orderBy),
      orderDir: String(orderDir)
    };

    // Adicionar projectId apenas se estiver definido
    const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || process.env.NOTUS_PROJECT_ID;
    if (projectId) {
      searchParams.projectId = projectId;
    }

    const response = await notusAPI.get("crypto/tokens", {
      searchParams,
    }).json<TokensResponse>();

    return response;
  } catch (error) {
    throw error;
  }
}
