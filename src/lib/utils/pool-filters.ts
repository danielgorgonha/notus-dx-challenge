/**
 * 🔍 Filtros para Pools de Liquidez da API da Notus
 */

export interface PoolFilters {
  // Paginação
  take?: number;
  offset?: number;
  
  // Chains
  chainIds?: string;
  
  // Tokens
  tokensAddresses?: string;
  ids?: string;
  
  // Dados
  rangeInDays?: number;
  filterWhitelist?: boolean;
}

export interface PoolFilterOptions {
  // Filtros de atividade
  minTvl?: number;
  minFees?: number;
  minVolume?: number;
  
  // Filtros de tokens populares
  popularTokens?: boolean;
  
  // Filtros de chains
  mainChains?: boolean;
  
  // Filtros de período
  recentActivity?: boolean;
}

/**
 * Configurações de filtros predefinidos
 */
export const FILTER_PRESETS = {
  // Buscar pools com alta atividade
  HIGH_ACTIVITY: {
    take: 50,
    chainIds: "137", // Apenas Polygon
    rangeInDays: 365, // 1 ano completo para dados históricos
    filterWhitelist: false
  },
  
  // Buscar pools populares (tokens conhecidos)
  POPULAR_TOKENS: {
    take: 100,
    chainIds: "137", // Apenas Polygon
    tokensAddresses: [
      "0x2791bca1f2de4661ed88a30c99a7a9449aa84174", // USDC (Polygon)
      "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619", // WETH (Polygon)
      "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063", // DAI (Polygon)
      "0xc2132d05d31c914a87c6611c10748aeb04b58e8f"  // USDT (Polygon)
    ].join(','),
    rangeInDays: 365, // 1 ano completo
    filterWhitelist: false
  },
  
  // Buscar pools de Polygon (mais ativos)
  POLYGON_ACTIVE: {
    take: 100,
    chainIds: "137", // Apenas Polygon
    rangeInDays: 365, // 1 ano completo
    filterWhitelist: false
  },
  
  // Buscar pools de Ethereum (mais líquidos)
  ETHEREUM_MAINNET: {
    take: 50,
    chainIds: "1", // Apenas Ethereum
    rangeInDays: 365, // 1 ano completo
    filterWhitelist: false
  },
  
  // Buscar todos os pools (sem filtros)
  ALL_POOLS: {
    take: 100,
    chainIds: "137", // Apenas Polygon
    rangeInDays: 365,
    filterWhitelist: false
  }
};

/**
 * Aplica filtros de atividade aos pools retornados
 */
export function filterActivePools(pools: any[], options: PoolFilterOptions = {}) {
  const {
    minTvl = 0.01,
    minFees = 0,
    minVolume = 0,
    popularTokens = false,
    recentActivity = false
  } = options;
  
  return pools.filter(pool => {
    const tvl = parseFloat(pool.totalValueLockedUSD) || 0;
    const fees = parseFloat(pool.stats?.feesInUSD) || 0;
    const volume = parseFloat(pool.stats?.volumeInUSD) || 0;
    
    // Filtros básicos de atividade
    const hasActivity = tvl >= minTvl || fees >= minFees || volume >= minVolume;
    
    if (!hasActivity) return false;
    
    // Filtro de tokens populares
    if (popularTokens) {
      const popularSymbols = ['USDC', 'USDT', 'DAI', 'WETH', 'WBTC', 'ETH', 'BTC'];
      const hasPopularToken = pool.tokens?.some((token: any) => 
        popularSymbols.some(symbol => 
          token.symbol?.toUpperCase().includes(symbol)
        )
      );
      if (!hasPopularToken) return false;
    }
    
    // Filtro de atividade recente
    if (recentActivity) {
      const transactions = pool.stats?.transactionsCount || 0;
      if (transactions === 0) return false;
    }
    
    return true;
  });
}

/**
 * Ordena pools por critério de atividade
 */
export function sortPoolsByActivity(pools: any[], sortBy: 'tvl' | 'fees' | 'volume' | 'activity' = 'activity') {
  return [...pools].sort((a, b) => {
    switch (sortBy) {
      case 'tvl':
        return parseFloat(b.totalValueLockedUSD) - parseFloat(a.totalValueLockedUSD);
      
      case 'fees':
        return parseFloat(b.stats?.feesInUSD || '0') - parseFloat(a.stats?.feesInUSD || '0');
      
      case 'volume':
        return parseFloat(b.stats?.volumeInUSD || '0') - parseFloat(a.stats?.volumeInUSD || '0');
      
      case 'activity':
      default:
        // Combinar TVL + Fees + Volume para score de atividade
        const scoreA = parseFloat(a.totalValueLockedUSD) + 
                      parseFloat(a.stats?.feesInUSD || '0') + 
                      parseFloat(a.stats?.volumeInUSD || '0');
        const scoreB = parseFloat(b.totalValueLockedUSD) + 
                      parseFloat(b.stats?.feesInUSD || '0') + 
                      parseFloat(b.stats?.volumeInUSD || '0');
        return scoreB - scoreA;
    }
  });
}

/**
 * Gera configuração de filtros baseada na estratégia
 */
export function getFilterConfig(strategy: 'high_activity' | 'popular_tokens' | 'all_chains' | 'polygon_only' = 'high_activity') {
  switch (strategy) {
    case 'high_activity':
      return FILTER_PRESETS.HIGH_ACTIVITY;
    case 'popular_tokens':
      return FILTER_PRESETS.POPULAR_TOKENS;
    case 'polygon_only':
      return FILTER_PRESETS.POLYGON_ACTIVE;
    case 'all_chains':
    default:
      return FILTER_PRESETS.ALL_POOLS;
  }
}
