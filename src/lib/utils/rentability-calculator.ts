/**
 * 🏊 Calculadora de Rentabilidade para Pools de Liquidez
 * Baseada em dados históricos reais da API da Notus
 */

export interface RentabilityCalculation {
  apr: number;
  totalFees: number;
  totalVolume: number;
  averageTvl: number;
  daysWithData: number;
  calculationMethod: 'historical' | 'estimated' | 'fallback';
}

/**
 * Calcula rentabilidade baseada em dados históricos reais da API da Notus
 * Endpoint 3: GET /liquidity/pools/{id}/historical-data
 */
export function calculateRentabilityFromHistoricalData(
  historicalData: any[],
  currentTvl: number,
  rangeInDays: number = 30
): RentabilityCalculation {
  console.log(`🔍 Calculando rentabilidade com ${historicalData.length} dias de dados históricos da API Notus`);
  
  let totalFees = 0;
  let totalVolume = 0;
  let totalTvl = 0;
  let daysWithData = 0;
  
  // Processar dados históricos da API da Notus
  historicalData.forEach((day: any) => {
    const fees = parseFloat(day.feesInUSD) || 0;
    const volume = parseFloat(day.volumeInUSD) || 0;
    const tvl = parseFloat(day.totalValueLockedInUSD) || 0;
    
    if (fees > 0 || volume > 0) {
      totalFees += fees;
      totalVolume += volume;
      totalTvl += tvl;
      daysWithData++;
    }
  });
  
  // Calcular TVL médio
  const averageTvl = daysWithData > 0 ? totalTvl / daysWithData : currentTvl;
  
  // Calcular APR baseado nos dados históricos reais da API da Notus
  let apr = 0;
  if (averageTvl > 0 && totalFees > 0) {
    // APR = (Total de fees no período / TVL médio) * (365 / dias com dados) * 100
    const periodDays = Math.min(daysWithData, rangeInDays);
    const dailyFees = totalFees / periodDays;
    const annualFees = dailyFees * 365;
    apr = (annualFees / averageTvl) * 100;
  }
  
  console.log(`💰 Rentabilidade calculada com dados históricos da API Notus:`, {
    totalFees,
    totalVolume,
    averageTvl,
    daysWithData,
    apr: apr.toFixed(2),
    method: 'historical',
    source: 'Notus API - historical-data endpoint'
  });
  
  return {
    apr: parseFloat(apr.toFixed(2)),
    totalFees,
    totalVolume,
    averageTvl,
    daysWithData,
    calculationMethod: 'historical'
  };
}

/**
 * Calcula rentabilidade baseada em dados de 30 dias (stats)
 */
export function calculateRentabilityFromStats(
  stats: any,
  currentTvl: number,
  rangeInDays: number = 30
): RentabilityCalculation {
  console.log('📊 Calculando rentabilidade com dados de stats');
  
  const historicalFees = parseFloat(stats?.feesInUSD) || 0;
  const historicalVolume = parseFloat(stats?.volumeInUSD) || 0;
  
  let apr = 0;
  
  if (currentTvl > 0 && historicalFees > 0) {
    // Assumir que os dados são do período especificado
    const dailyFees = historicalFees / rangeInDays;
    const annualFees = dailyFees * 365;
    apr = (annualFees / currentTvl) * 100;
  }
  
  console.log(`💰 Rentabilidade calculada com stats:`, {
    historicalFees,
    historicalVolume,
    currentTvl,
    apr: apr.toFixed(2),
    method: 'estimated'
  });
  
  return {
    apr: parseFloat(apr.toFixed(2)),
    totalFees: historicalFees,
    totalVolume: historicalVolume,
    averageTvl: currentTvl,
    daysWithData: rangeInDays,
    calculationMethod: 'estimated'
  };
}

/**
 * Calcula rentabilidade baseada em dados de 24h (fallback)
 */
export function calculateRentabilityFrom24h(
  volume24h: number,
  fee: number,
  currentTvl: number
): RentabilityCalculation {
  console.log('📊 Calculando rentabilidade com dados de 24h (fallback)');
  
  let apr = 0;
  
  if (currentTvl > 0 && volume24h > 0) {
    const dailyFees = volume24h * (fee / 100);
    const annualFees = dailyFees * 365;
    apr = (annualFees / currentTvl) * 100;
  }
  
  console.log(`💰 Rentabilidade calculada com 24h:`, {
    volume24h,
    fee,
    currentTvl,
    apr: apr.toFixed(2),
    method: 'fallback'
  });
  
  return {
    apr: parseFloat(apr.toFixed(2)),
    totalFees: volume24h * (fee / 100),
    totalVolume: volume24h,
    averageTvl: currentTvl,
    daysWithData: 1,
    calculationMethod: 'fallback'
  };
}

/**
 * Função principal para calcular rentabilidade
 * Tenta usar dados históricos, depois stats, depois 24h
 */
export function calculatePoolRentability(
  pool: any,
  historicalData?: any[]
): RentabilityCalculation {
  const tvl = parseFloat(pool.totalValueLockedUSD) || 0;
  const stats = pool.stats;
  const fee = parseFloat(pool.fee) || 0;
  
  console.log('🔍 Calculando rentabilidade do pool:', {
    poolId: pool.id,
    tvl,
    hasHistoricalData: !!historicalData?.length,
    hasStats: !!stats?.feesInUSD,
    fee
  });
  
  // 1. Tentar usar dados históricos completos (melhor opção)
  if (historicalData && historicalData.length > 0) {
    return calculateRentabilityFromHistoricalData(historicalData, tvl);
  }
  
  // 2. Tentar usar dados de stats (30 dias)
  if (stats?.feesInUSD && parseFloat(stats.feesInUSD) > 0) {
    return calculateRentabilityFromStats(stats, tvl);
  }
  
  // 3. Fallback para dados de 24h
  const volume24h = parseFloat(stats?.volumeInUSD) || 0;
  return calculateRentabilityFrom24h(volume24h, fee, tvl);
}
