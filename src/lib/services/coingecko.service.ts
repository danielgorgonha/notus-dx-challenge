/**
 * CoinGecko Service
 * Serviço para buscar dados de preços e mercado de criptomoedas da CoinGecko API
 */

'use server';

interface CoinGeckoMarketData {
  price?: number;
  priceChange24h?: number;
  volume24h?: number;
}

/**
 * Mapeamento de símbolos para IDs do CoinGecko
 * Baseado nos tokens mais comuns que aparecem na Polygon
 */
const SYMBOL_TO_COINGECKO_ID: Record<string, string> = {
  'BTC': 'bitcoin',
  'WBTC': 'wrapped-bitcoin',
  'ETH': 'ethereum',
  'WETH': 'weth',
  'USDT': 'tether',
  'USDC': 'usd-coin',
  'BNB': 'binancecoin',
  'SOL': 'solana',
  'XRP': 'ripple',
  'DOGE': 'dogecoin',
  'POL': 'matic-network',
  'MATIC': 'matic-network',
  'LINK': 'chainlink',
  'AAVE': 'aave',
  'UNI': 'uniswap',
  'CRV': 'curve-dao-token',
  'MKR': 'maker',
  'SUSHI': 'sushi',
  'COMP': 'compound-governance-token',
  'YFI': 'yearn-finance',
  'SNX': 'havven',
  'BAL': 'balancer',
  '1INCH': '1inch',
  'BAT': 'basic-attention-token',
  'MANA': 'decentraland',
  'SAND': 'the-sandbox',
  'GRT': 'the-graph',
  'KNC': 'kyber-network-crystal',
  'REQ': 'request-network',
  'CVC': 'civic',
  'CTSI': 'cartesi',
  'TRU': 'truefi',
  'RPL': 'rocket-pool',
  'AXL': 'axelar',
  'ZRO': 'layerzero',
  'FXS': 'frax-share',
  'FRXETH': 'frax-ether',
  'SFRXETH': 'staked-frax-ether',
  'CBETH': 'coinbase-wrapped-staked-eth',
  'RETH': 'rocket-pool-eth',
  'PAXG': 'pax-gold',
  'RENDER': 'render-token',
  'NEXO': 'nexo',
  'BONK': 'bonk',
  'OUSG': 'origin-dollar-governance',
  'LDO': 'lido-dao-token',
  'TBTC': 'tbtc',
  'FRXETH': 'frax-ether',
  'SFXETH': 'staked-frax-ether',
  'USD+': 'overnight-usd',
  'USDM': 'mountain-protocol-usd',
  'ACX': 'across-protocol',
  'GNS': 'gains-network',
  'WPOL': 'wrapped-polygon',
  'ELON': 'dogelon-mars',
  'AUTO': 'auto',
  'LUSD': 'liquity-usd',
  'ADS': 'adshares',
  'BIM': 'bim',
  'ALI': 'artificial-liquid-intelligence-token',
  'C98': 'coin98',
  'OLAS': 'autonolas',
  'TRUMATIC': 'tru-staked-matic',
  'DEFI': 'defiway',
  'POKT': 'pocket-network',
  'SDEX': 'smardex',
  'PWR': 'gamebitcoin-power',
  'NCT': 'polyswarm',
  'IXT': 'planet-ix',
  'DODO': 'dodo',
  'ULT': 'shardus',
};

/**
 * Enriquece tokens com dados de mercado do CoinGecko
 * Busca apenas price, priceChange24h e volume24h (marketCap já vem da Notus)
 */
export async function enrichTokensWithCoinGeckoData(
  tokens: Array<{
    symbol: string;
    name: string;
    marketCap?: number;
  }>
): Promise<Map<string, CoinGeckoMarketData>> {
  const enrichedMap = new Map<string, CoinGeckoMarketData>();

  // Agrupar tokens por CoinGecko ID
  const coinGeckoIds = new Set<string>();
  const symbolToCoinGeckoId = new Map<string, string>();

  tokens.forEach((token) => {
    const symbol = token.symbol?.toUpperCase() || '';
    const coinGeckoId = SYMBOL_TO_COINGECKO_ID[symbol];
    if (coinGeckoId) {
      coinGeckoIds.add(coinGeckoId);
      symbolToCoinGeckoId.set(symbol, coinGeckoId);
    }
  });

  if (coinGeckoIds.size === 0) {
    return enrichedMap;
  }

  // Buscar em batch (limite da CoinGecko: ~250 IDs por request)
  const idsArray = Array.from(coinGeckoIds);
  const batchSize = 50;
  const batches: string[][] = [];

  for (let i = 0; i < idsArray.length; i += batchSize) {
    batches.push(idsArray.slice(i, i + batchSize));
  }

  // Processar batches em paralelo com limite de concorrência
  const maxConcurrent = 2; // Limitar para evitar rate limit
  for (let i = 0; i < batches.length; i += maxConcurrent) {
    const concurrentBatches = batches.slice(i, i + maxConcurrent);
    await Promise.all(
      concurrentBatches.map(async (batch) => {
        try {
          const ids = batch.join(',');
          const response = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_market_cap=false&include_24hr_change=true&include_24hr_vol=true`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
              next: { revalidate: 60 }, // Cache por 60 segundos
            }
          );

          if (!response.ok) {
            console.warn(`⚠️ CoinGecko batch request failed:`, response.status);
            return;
          }

          const data = await response.json();

          // Mapear de volta para símbolos
          batch.forEach((coinGeckoId) => {
            const coinData = data[coinGeckoId];
            if (coinData) {
              // Encontrar o símbolo correspondente
              const symbol = Array.from(symbolToCoinGeckoId.entries()).find(
                ([, id]) => id === coinGeckoId
              )?.[0];

              if (symbol) {
                enrichedMap.set(symbol, {
                  price: coinData.usd || undefined,
                  priceChange24h: coinData.usd_24h_change || undefined,
                  volume24h: coinData.usd_24h_vol || undefined,
                });
              }
            }
          });
        } catch (error) {
          console.error('❌ Erro ao processar batch do CoinGecko:', error);
        }
      })
    );

    // Pequeno delay entre batches para evitar rate limit
    if (i + maxConcurrent < batches.length) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  return enrichedMap;
}

