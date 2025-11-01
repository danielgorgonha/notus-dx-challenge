/**
 * Pool Metrics Component
 * Exibe métricas: Tarifa, TVL, Tarifas 24h
 */

"use client";

interface PoolMetricsProps {
  pool: any;
}

export function PoolMetrics({ pool }: PoolMetricsProps) {
  const fee = pool?.fee || 0;
  const tvl = parseFloat(pool?.totalValueLockedUSD || pool?.tvl || '0');
  const fees24h = parseFloat(pool?.stats?.feesInUSD || '0');

  const formatValue = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)} M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)} K`;
    return value.toFixed(2);
  };

  return (
    <div className="px-4 lg:px-6">
      <div className="flex gap-3">
        {/* Tarifa */}
        <div className="flex-1 bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="text-slate-400 text-sm mb-1">{fee}% Tarifa</div>
          <div className="text-white font-bold text-lg">{fee}%</div>
        </div>

        {/* TVL */}
        <div className="flex-1 bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="text-slate-400 text-sm mb-1">
            {tvl >= 1000000 ? `${(tvl / 1000000).toFixed(1)} M` : `${(tvl / 1000).toFixed(1)} K`} TVL
          </div>
          <div className="text-white font-bold text-lg">
            {tvl >= 1000000 ? `${(tvl / 1000000).toFixed(1)} M` : `${(tvl / 1000).toFixed(1)} K`}
          </div>
        </div>

        {/* Tarifas 24h */}
        <div className="flex-1 bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="text-slate-400 text-sm mb-1">${formatValue(fees24h)} Tarifas (24h)</div>
          <div className="text-white font-bold text-lg">
            ${formatValue(fees24h)}
          </div>
        </div>
      </div>
    </div>
  );
}

