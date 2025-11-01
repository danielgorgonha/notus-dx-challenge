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
    // Construir parâmetros base conforme documentação da API Notus
    const searchParams: Record<string, string | number | boolean> = {
      page, 
      perPage: Math.min(perPage, 100), // Limitar ao máximo da API (100)
      orderBy,
      orderDir,
      filterWhitelist: String(filterWhitelist) as any, // API espera string "true" ou "false"
    };

    // Adicionar projectId apenas se estiver definido e não vazio
    const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || process.env.NOTUS_PROJECT_ID;
    if (projectId && projectId.trim()) {
      searchParams.projectId = projectId.trim();
    }

    // Adicionar search se fornecido e não vazio
    if (search && search.trim()) {
      searchParams.search = search.trim();
    }

    // Adicionar filterByChainId se fornecido
    if (filterByChainId) {
      searchParams.filterByChainId = filterByChainId;
    }

    console.log('📤 listTokens - Parâmetros enviados:', searchParams);
    console.log('📤 listTokens - URL completa será:', `crypto/tokens?${new URLSearchParams(Object.entries(searchParams).map(([k, v]) => [k, String(v)])).toString()}`);
    
    const response = await notusAPI.get("crypto/tokens", {
      searchParams,
    }).json<TokensResponse>();

    console.log('📥 listTokens - Resposta recebida:', {
      total: response.total,
      tokensCount: response.tokens?.length
    });

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
    // Construir parâmetros - ky converte automaticamente para query string
    const searchParams: Record<string, string | number | boolean | undefined> = {
      filterByChainId: chainId, 
      page, 
      perPage: Math.min(perPage, 100), // Limitar ao máximo da API (100)
      orderBy,
      orderDir
    };

    // Adicionar projectId apenas se estiver definido
    const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || process.env.NOTUS_PROJECT_ID;
    if (projectId && projectId.trim()) {
      searchParams.projectId = projectId;
    }

    // Adicionar filterWhitelist apenas se fornecido
    if (filterWhitelist !== undefined) {
      searchParams.filterWhitelist = filterWhitelist;
    }

    const response = await notusAPI.get("crypto/tokens", {
      searchParams,
    }).json<TokensResponse>();

    return response;
  } catch (error) {
    throw error;
  }
}
