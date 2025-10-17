/**
 * Pool Calculations Utilities
 * Baseado no script test-specific-pools.sh e test-get-pool-by-id.sh
 * Funções para cálculos de métricas de pools de liquidez
 */

export interface PoolMetrics {
  apr: number;
  tvl: number;
  volume24h: number;
  fees24h: number;
  composition: {
    token0: { symbol: string; percentage: number };
    token1: { symbol: string; percentage: number };
  };
  formatted: {
    apr: string;
    tvl: string;
    volume24h: string;
    fees24h: string;
    composition: string;
  };
}

export interface PoolData {
  id: string;
  address: string;
  chain: { id: number; name: string };
  provider: { name: string; logoUrl?: string };
  fee: number;
  totalValueLockedUSD: string | number;
  tokens: Array<{
    symbol: string;
    name: string;
    logo?: string;
    address: string;
    decimals: number;
    poolShareInPercentage: number;
  }>;
  stats?: {
    rangeInDays: number;
    feesInUSD: string | number;
    volumeInUSD: string | number;
    transactionsCount: number;
  };
}

/**
 * Calcula APR baseado nos dados da pool
 * APR = (Fees * 365) / (TVL * Days) * 100
 */
export function calculateAPR(
  feesUSD: number | string,
  tvlUSD: number | string,
  days: number = 30
): number {
  const fees = typeof feesUSD === 'string' ? parseFloat(feesUSD) : feesUSD;
  const tvl = typeof tvlUSD === 'string' ? parseFloat(tvlUSD) : tvlUSD;
  
  if (!tvl || tvl === 0 || !fees || fees === 0) {
    return 0;
  }
  
  // APR = (Fees * 365) / (TVL * Days) * 100
  const apr = (fees * 365) / (tvl * days) * 100;
  
  return Math.max(0, apr);
}

/**
 * Formata valores monetários
 */
export function formatCurrency(value: number | string): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue) || numValue < 0) {
    return '$0.00';
  }
  
  // Formatação baseada no valor
  if (numValue >= 1000000) {
    return `$${(numValue / 1000000).toFixed(1)}M`;
  }
  if (numValue >= 1000) {
    return `$${(numValue / 1000).toFixed(1)}K`;
  }
  if (numValue >= 1) {
    return `$${numValue.toFixed(2)}`;
  }
  if (numValue >= 0.01) {
    return `$${numValue.toFixed(4)}`;
  }
  if (numValue >= 0.0001) {
    return `$${numValue.toFixed(6)}`;
  }
  if (numValue > 0) {
    return `$${numValue.toFixed(8)}`;
  }
  return '$0.00';
}

/**
 * Calcula composição da pool baseada nos dados reais da API
 */
export function calculatePoolComposition(tokens: PoolData['tokens']): {
  token0: { symbol: string; percentage: number };
  token1: { symbol: string; percentage: number };
} {
  if (!tokens || tokens.length < 2) {
    return {
      token0: { symbol: 'TOKEN1', percentage: 50 },
      token1: { symbol: 'TOKEN2', percentage: 50 }
    };
  }
  
  const token0 = tokens[0];
  const token1 = tokens[1];
  
  return {
    token0: { 
      symbol: token0.symbol?.toUpperCase() || 'TOKEN1', 
      percentage: token0.poolShareInPercentage || 50 
    },
    token1: { 
      symbol: token1.symbol?.toUpperCase() || 'TOKEN2', 
      percentage: token1.poolShareInPercentage || 50 
    }
  };
}

/**
 * Valida se a pool tem dados mínimos necessários
 */
export function isValidPool(pool: any): boolean {
  return !!(
    pool &&
    pool.id &&
    pool.address &&
    pool.totalValueLockedUSD &&
    pool.tokens &&
    Array.isArray(pool.tokens) &&
    pool.tokens.length >= 2
  );
}

/**
 * Retorna a configuração padrão da API
 */
export function getDefaultApiConfig() {
  return {
    take: 10,
    offset: 0,
    chainIds: 137, // Polygon
    filterWhitelist: false,
    rangeInDays: 30,
    ids: (process.env.NOTUS_POOL_IDS || '')
      .split(',')
      .map((id) => id.trim())
      .filter((id) => id.length > 0)
  };
}

/**
 * Processa métricas da pool
 * Calcula valores de 24h dividindo os valores do período pelo número de dias
 */
export function processPoolMetrics(pool: PoolData): PoolMetrics {
  // Extrair valores numéricos
  const tvl = typeof pool.totalValueLockedUSD === 'string' 
    ? parseFloat(pool.totalValueLockedUSD) 
    : pool.totalValueLockedUSD;
    
  const feesTotal = pool.stats?.feesInUSD 
    ? (typeof pool.stats.feesInUSD === 'string' 
        ? parseFloat(pool.stats.feesInUSD) 
        : pool.stats.feesInUSD)
    : 0;
    
  const volumeTotal = pool.stats?.volumeInUSD 
    ? (typeof pool.stats.volumeInUSD === 'string' 
        ? parseFloat(pool.stats.volumeInUSD) 
        : pool.stats.volumeInUSD)
    : 0;
  
  const rangeInDays = pool.stats?.rangeInDays || 30;
  
  // Calcular valores de 24h (média diária)
  // Seguindo a lógica do script: fees_24h = fees_total / range_days
  const fees24h = feesTotal / rangeInDays;
  const volume24h = volumeTotal / rangeInDays;
  
  // Calcular APR usando os dados totais do período
  const apr = calculateAPR(feesTotal, tvl, rangeInDays);
  
  // Calcular composição
  const composition = calculatePoolComposition(pool.tokens);
  
  return {
    apr,
    tvl,
    volume24h,
    fees24h,
    composition,
    formatted: {
      apr: `${apr.toFixed(2)}% a.a.`,
      tvl: formatCurrency(tvl),
      volume24h: formatCurrency(volume24h),
      fees24h: formatCurrency(fees24h),
      composition: `${composition.token0.symbol.toLowerCase()} (${composition.token0.percentage.toFixed(2)}%) / ${composition.token1.symbol.toLowerCase()} (${composition.token1.percentage.toFixed(2)}%)`
    }
  };
}

/**
 * Ordena pools por critério específico
 * Baseado na lógica de ordenação do script
 */
export function sortPools(
  pools: PoolMetrics[],
  sortBy: 'apr' | 'tvl' | 'fees' | 'volume',
  order: 'asc' | 'desc' = 'desc'
): PoolMetrics[] {
  return [...pools].sort((a, b) => {
    let valueA: number;
    let valueB: number;
    
    switch (sortBy) {
      case 'apr':
        valueA = a.apr;
        valueB = b.apr;
        break;
      case 'tvl':
        valueA = a.tvl;
        valueB = b.tvl;
        break;
      case 'fees':
        valueA = a.fees24h;
        valueB = b.fees24h;
        break;
      case 'volume':
        valueA = a.volume24h;
        valueB = b.volume24h;
        break;
      default:
        return 0;
    }
    
    return order === 'desc' ? valueB - valueA : valueA - valueB;
  });
}

/**
 * Formata percentual
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}

/**
 * Calcula valor em USD baseado no preço e quantidade
 */
export function calculateValueInUSD(amount: number, priceUSD: number): number {
  return amount * priceUSD;
}

/**
 * Formata número grande para exibição
 */
export function formatNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(2)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(2)}K`;
  }
  return value.toFixed(2);
}

/**
 * Extrai ID da chain de um pool ID
 * Ex: "137-0x..." retorna 137
 */
export function extractChainId(poolId: string): number | null {
  const match = poolId.match(/^(\d+)-/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Extrai endereço do contrato de um pool ID
 * Ex: "137-0xabc..." retorna "0xabc..."
 */
export function extractContractAddress(poolId: string): string | null {
  const match = poolId.match(/^[\d]+-(.+)$/);
  return match ? match[1] : null;
}

/**
 * Valida se um endereço Ethereum é válido
 */
export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Trunca endereço para exibição
 * Ex: "0x1234...5678"
 */
export function truncateAddress(address: string, startChars = 6, endChars = 4): string {
  if (!address || address.length <= startChars + endChars) {
    return address;
  }
  return `${address.substring(0, startChars)}...${address.substring(address.length - endChars)}`;
}
