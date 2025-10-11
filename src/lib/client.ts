/**
 * Constantes do cliente para configuração de chains suportadas
 */

export const SUPPORTED_CHAINS = {
  POLYGON: 137,
  ETHEREUM: 1,
  ARBITRUM: 42161,
  OPTIMISM: 10,
  BASE: 8453,
} as const;

export const CHAIN_NAMES = {
  [SUPPORTED_CHAINS.POLYGON]: 'Polygon',
  [SUPPORTED_CHAINS.ETHEREUM]: 'Ethereum',
  [SUPPORTED_CHAINS.ARBITRUM]: 'Arbitrum',
  [SUPPORTED_CHAINS.OPTIMISM]: 'Optimism',
  [SUPPORTED_CHAINS.BASE]: 'Base',
} as const;

export const CHAIN_RPC_URLS = {
  [SUPPORTED_CHAINS.POLYGON]: 'https://polygon-rpc.com',
  [SUPPORTED_CHAINS.ETHEREUM]: 'https://mainnet.infura.io/v3/',
  [SUPPORTED_CHAINS.ARBITRUM]: 'https://arb1.arbitrum.io/rpc',
  [SUPPORTED_CHAINS.OPTIMISM]: 'https://mainnet.optimism.io',
  [SUPPORTED_CHAINS.BASE]: 'https://mainnet.base.org',
} as const;

export type SupportedChainId = typeof SUPPORTED_CHAINS[keyof typeof SUPPORTED_CHAINS];
