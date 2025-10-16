/**
 * 🏊 Hook para buscar dados históricos de pools da API da Notus
 * Endpoint 3: GET /liquidity/pools/{id}/historical-data
 */

import { useQuery } from '@tanstack/react-query';
import { liquidityActions } from '@/lib/actions/liquidity';

interface HistoricalDataItem {
  timestamp: string;
  volumeInUSD: string;
  feesInUSD: string;
  totalValueLockedInUSD: string;
  transactionsCount: number;
}

interface HistoricalDataResponse {
  statistics: {
    rangeInDays: number;
    groupByInterval: string;
    poolId: string;
    items: HistoricalDataItem[];
  };
}

interface ProcessedHistoricalData {
  totalFees: number;
  totalVolume: number;
  averageTvl: number;
  daysWithData: number;
  apr: number;
  dailyData: Array<{
    date: string;
    fees: number;
    volume: number;
    tvl: number;
  }>;
}

export function usePoolHistoricalData(poolId: string, rangeInDays: number = 365) {
  return useQuery<ProcessedHistoricalData | undefined>({
    queryKey: ['pool-historical-data', poolId, rangeInDays],
    queryFn: async () => {
      if (!poolId) {
        console.log('⚠️ PoolId não fornecido, retornando dados vazios');
        return {
          totalFees: 0,
          totalVolume: 0,
          averageTvl: 0,
          daysWithData: 0,
          apr: 0,
          dailyData: []
        };
      }
      console.log(`🔍 Buscando dados históricos para pool ${poolId} - ${rangeInDays} dias`);
      
      try {
        // Endpoint 3: GET /liquidity/pools/{id}/historical-data
        const response = await liquidityActions.getHistoricalData(poolId, { days: rangeInDays });
        console.log('📊 Dados históricos recebidos:', response);
        
        if (!(response as any)?.statistics?.items) {
          console.log('⚠️ Nenhum dado histórico encontrado');
          return {
            totalFees: 0,
            totalVolume: 0,
            averageTvl: 0,
            daysWithData: 0,
            apr: 0,
            dailyData: []
          };
        }
        
        const historicalData = (response as any).statistics.items;
        console.log(`📈 Processando ${historicalData.length} dias de dados históricos`);
        
        // Processar dados históricos
        let totalFees = 0;
        let totalVolume = 0;
        let totalTvl = 0;
        let daysWithData = 0;
        
        const dailyData = historicalData.map((day: HistoricalDataItem) => {
          const fees = parseFloat(day.feesInUSD) || 0;
          const volume = parseFloat(day.volumeInUSD) || 0;
          const tvl = parseFloat(day.totalValueLockedInUSD) || 0;
          
          if (fees > 0 || volume > 0) {
            totalFees += fees;
            totalVolume += volume;
            totalTvl += tvl;
            daysWithData++;
          }
          
          return {
            date: new Date(parseInt(day.timestamp)).toISOString().split('T')[0],
            fees,
            volume,
            tvl
          };
        });
        
        // Calcular TVL médio
        const averageTvl = daysWithData > 0 ? totalTvl / daysWithData : 0;
        
        // Calcular APR baseado nos dados históricos reais
        let apr = 0;
        if (averageTvl > 0 && totalFees > 0) {
          // APR = (Total de fees no período / TVL médio) * (365 / dias com dados) * 100
          const periodDays = Math.min(daysWithData, rangeInDays);
          const dailyFees = totalFees / periodDays;
          const annualFees = dailyFees * 365;
          apr = (annualFees / averageTvl) * 100;
        }
        
        console.log(`💰 Dados históricos processados:`, {
          totalFees,
          totalVolume,
          averageTvl,
          daysWithData,
          apr: apr.toFixed(2)
        });
        
        return {
          totalFees,
          totalVolume,
          averageTvl,
          daysWithData,
          apr: parseFloat(apr.toFixed(2)),
          dailyData
        };
        
      } catch (error) {
        console.error('❌ Erro ao buscar dados históricos:', error);
        return {
          totalFees: 0,
          totalVolume: 0,
          averageTvl: 0,
          daysWithData: 0,
          apr: 0,
          dailyData: []
        };
      }
    },
    enabled: !!poolId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
}
