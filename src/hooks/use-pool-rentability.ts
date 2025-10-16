/**
 * 🏊 Hook para calcular rentabilidade de pools baseada em dados históricos
 */

import { useQuery } from '@tanstack/react-query';
import { liquidityActions } from '@/lib/actions/liquidity';

interface RentabilityData {
  apr: number;
  totalFees: number;
  totalVolume: number;
  averageTvl: number;
  daysWithData: number;
}

export function usePoolRentability(poolId: string, rangeInDays: number = 365) {
  return useQuery<RentabilityData>({
    queryKey: ['pool-rentability', poolId, rangeInDays],
    queryFn: async () => {
      console.log(`🔍 Calculando rentabilidade para pool ${poolId} com ${rangeInDays} dias`);
      
      try {
        // Buscar dados históricos do pool
        const historicalResponse = await liquidityActions.getHistoricalData(poolId, { days: rangeInDays });
        console.log('📊 Dados históricos recebidos:', historicalResponse);
        
        if (!historicalResponse?.statistics?.items) {
          console.log('⚠️ Nenhum dado histórico encontrado');
          return {
            apr: 0,
            totalFees: 0,
            totalVolume: 0,
            averageTvl: 0,
            daysWithData: 0
          };
        }
        
        const historicalData = historicalResponse.statistics.items;
        console.log(`📈 Processando ${historicalData.length} dias de dados históricos`);
        
        // Calcular totais dos dados históricos
        let totalFees = 0;
        let totalVolume = 0;
        let totalTvl = 0;
        let daysWithData = 0;
        
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
        const averageTvl = daysWithData > 0 ? totalTvl / daysWithData : 0;
        
        // Calcular APR baseado nos dados históricos reais
        let apr = 0;
        if (averageTvl > 0 && totalFees > 0) {
          // APR = (Total de fees no período / TVL médio) * (365 / dias com dados) * 100
          const periodDays = Math.min(daysWithData, rangeInDays);
          const annualizedFees = (totalFees / periodDays) * 365;
          apr = (annualizedFees / averageTvl) * 100;
        }
        
        console.log(`💰 Cálculos de rentabilidade:`, {
          totalFees,
          totalVolume,
          averageTvl,
          daysWithData,
          apr: apr.toFixed(2)
        });
        
        return {
          apr: parseFloat(apr.toFixed(2)),
          totalFees,
          totalVolume,
          averageTvl,
          daysWithData
        };
        
      } catch (error) {
        console.error('❌ Erro ao calcular rentabilidade:', error);
        return {
          apr: 0,
          totalFees: 0,
          totalVolume: 0,
          averageTvl: 0,
          daysWithData: 0
        };
      }
    },
    enabled: !!poolId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
  });
}
