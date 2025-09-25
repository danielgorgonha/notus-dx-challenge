/**
 * 🌐 Blockchain Types
 * Tipos para chains e tokens suportados
 */

// Chain info
export interface Chain {
  id: number;
  name: string;
  logo: string;
}

// Token info
export interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logo: string;
  chain: Chain;
  balance?: string;
  balanceFormatted?: string;
  balanceUsd?: string;
  priceUsd?: string;
}

// NFT Collection info
export interface NFTCollectionInfo {
  name: string;
  symbol: string;
  logo: string;
}

// NFT info
export interface NFTInfo {
  address: string;
  collection: NFTCollectionInfo;
  tokenId: string;
  name: string;
  description: string;
  image: string;
  amount: string;
  chain: Chain;
}

// API Response wrappers
export interface ChainListResponse {
  chains: Chain[];
  total: number;
  page: number;
  perPage: number;
}

export interface TokenListResponse {
  tokens: TokenInfo[];
  total: number;
  page: number;
  perPage: number;
}
