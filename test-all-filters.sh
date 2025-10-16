#!/bin/bash

# Script para testar TODOS os filtros possíveis da API Notus
# Baseado na documentação oficial

API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmZGY5NzNlNS0zNTIzLTQwNzctOTAzZC1iYWNmYzBkMGMyZGQiLCJhcGlLZXlHZW5lcmF0ZWRBdCI6IjIwMjUtMTAtMTNUMTc6NDY6NTguMjU1WiIsIm9yZ2FuaXphdGlvbklkIjoiNmQ0YmQwZjYtMmVlNS00MWYwLTkxMjAtYmQwY2M0OGRmODEzIn0.7YvbiK9Tos-RqcDDsZnl9h_3V5B7KrISN4C0RSPCe1s"
BASE_URL="https://api.notus.team/api/v1"

echo "🔍 Testando TODOS os filtros da API Notus - Pools de Liquidez"
echo "=============================================================="

# 1. Teste básico - sem filtros
echo "📊 1. Teste Básico (sem filtros):"
curl -s -X GET "${BASE_URL}/liquidity/pools?take=5&offset=0" \
  -H "accept: application/json" \
  -H "x-api-key: ${API_KEY}" \
  -o test_basic.json

echo "✅ Resposta básica salva em test_basic.json"
jq '.pools[] | {id, totalValueLockedUSD, volumeInUSD: .stats.volumeInUSD, feesInUSD: .stats.feesInUSD}' test_basic.json | head -3

echo ""

# 2. Teste com diferentes chains
echo "📊 2. Teste com diferentes Chains:"

# Ethereum (1)
echo "  🔗 Ethereum (Chain ID: 1):"
curl -s -X GET "${BASE_URL}/liquidity/pools?take=5&offset=0&chainIds=1" \
  -H "accept: application/json" \
  -H "x-api-key: ${API_KEY}" \
  -o test_ethereum.json

# Arbitrum (42161)
echo "  🔗 Arbitrum (Chain ID: 42161):"
curl -s -X GET "${BASE_URL}/liquidity/pools?take=5&offset=0&chainIds=42161" \
  -H "accept: application/json" \
  -H "x-api-key: ${API_KEY}" \
  -o test_arbitrum.json

# Avalanche (43114)
echo "  🔗 Avalanche (Chain ID: 43114):"
curl -s -X GET "${BASE_URL}/liquidity/pools?take=5&offset=0&chainIds=43114" \
  -H "accept: application/json" \
  -H "x-api-key: ${API_KEY}" \
  -o test_avalanche.json

# Base (8453)
echo "  🔗 Base (Chain ID: 8453):"
curl -s -X GET "${BASE_URL}/liquidity/pools?take=5&offset=0&chainIds=8453" \
  -H "accept: application/json" \
  -H "x-api-key: ${API_KEY}" \
  -o test_base.json

# BNB Smart Chain (56)
echo "  🔗 BNB Smart Chain (Chain ID: 56):"
curl -s -X GET "${BASE_URL}/liquidity/pools?take=5&offset=0&chainIds=56" \
  -H "accept: application/json" \
  -H "x-api-key: ${API_KEY}" \
  -o test_bnb.json

# Gnosis (100)
echo "  🔗 Gnosis (Chain ID: 100):"
curl -s -X GET "${BASE_URL}/liquidity/pools?take=5&offset=0&chainIds=100" \
  -H "accept: application/json" \
  -H "x-api-key: ${API_KEY}" \
  -o test_gnosis.json

# OP Mainnet (10)
echo "  🔗 OP Mainnet (Chain ID: 10):"
curl -s -X GET "${BASE_URL}/liquidity/pools?take=5&offset=0&chainIds=10" \
  -H "accept: application/json" \
  -H "x-api-key: ${API_KEY}" \
  -o test_op.json

echo ""

# 3. Teste com diferentes rangeInDays
echo "📊 3. Teste com diferentes rangeInDays:"

for days in 1 7 14 30 60 90 180 365; do
  echo "  📅 Range: ${days} dias"
  curl -s -X GET "${BASE_URL}/liquidity/pools?take=3&offset=0&rangeInDays=${days}" \
    -H "accept: application/json" \
    -H "x-api-key: ${API_KEY}" \
    -o "test_range_${days}d.json"
done

echo ""

# 4. Teste com filterWhitelist
echo "📊 4. Teste com filterWhitelist:"

echo "  ✅ filterWhitelist=true:"
curl -s -X GET "${BASE_URL}/liquidity/pools?take=5&offset=0&filterWhitelist=true" \
  -H "accept: application/json" \
  -H "x-api-key: ${API_KEY}" \
  -o test_whitelist_true.json

echo "  ❌ filterWhitelist=false:"
curl -s -X GET "${BASE_URL}/liquidity/pools?take=5&offset=0&filterWhitelist=false" \
  -H "accept: application/json" \
  -H "x-api-key: ${API_KEY}" \
  -o test_whitelist_false.json

echo ""

# 5. Teste com tokens específicos
echo "📊 5. Teste com tokens específicos:"

# WBTC
echo "  🪙 WBTC (0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f):"
curl -s -X GET "${BASE_URL}/liquidity/pools?take=5&offset=0&tokensAddresses=0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f" \
  -H "accept: application/json" \
  -H "x-api-key: ${API_KEY}" \
  -o test_wbtc.json

# USDC
echo "  🪙 USDC (0xa0b86a33e6c0b4b4b4b4b4b4b4b4b4b4b4b4b4b4):"
curl -s -X GET "${BASE_URL}/liquidity/pools?take=5&offset=0&tokensAddresses=0xa0b86a33e6c0b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4" \
  -H "accept: application/json" \
  -H "x-api-key: ${API_KEY}" \
  -o test_usdc.json

# WETH
echo "  🪙 WETH (0x82af49447d8a07e3bd95bd0d56f35241523fbab1):"
curl -s -X GET "${BASE_URL}/liquidity/pools?take=5&offset=0&tokensAddresses=0x82af49447d8a07e3bd95bd0d56f35241523fbab1" \
  -H "accept: application/json" \
  -H "x-api-key: ${API_KEY}" \
  -o test_weth.json

echo ""

# 6. Teste com múltiplas chains
echo "📊 6. Teste com múltiplas chains:"
curl -s -X GET "${BASE_URL}/liquidity/pools?take=10&offset=0&chainIds=1,137,42161" \
  -H "accept: application/json" \
  -H "x-api-key: ${API_KEY}" \
  -o test_multiple_chains.json

echo ""

# 7. Teste com múltiplos tokens
echo "📊 7. Teste com múltiplos tokens:"
curl -s -X GET "${BASE_URL}/liquidity/pools?take=10&offset=0&tokensAddresses=0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f,0x82af49447d8a07e3bd95bd0d56f35241523fbab1" \
  -H "accept: application/json" \
  -H "x-api-key: ${API_KEY}" \
  -o test_multiple_tokens.json

echo ""

# 8. Teste com IDs específicos
echo "📊 8. Teste com IDs específicos:"
curl -s -X GET "${BASE_URL}/liquidity/pools?take=10&offset=0&ids=137-0xb8ab220a0f3a1e162d991481dac35874057c7a87" \
  -H "accept: application/json" \
  -H "x-api-key: ${API_KEY}" \
  -o test_specific_ids.json

echo ""

# 9. Teste com paginação
echo "📊 9. Teste com paginação:"
for offset in 0 10 20 30 40; do
  echo "  📄 Offset: ${offset}"
  curl -s -X GET "${BASE_URL}/liquidity/pools?take=10&offset=${offset}" \
    -H "accept: application/json" \
    -H "x-api-key: ${API_KEY}" \
    -o "test_pagination_${offset}.json"
done

echo ""

# 10. Análise dos resultados
echo "📊 10. Análise dos Resultados:"
echo "=============================="

echo "🔍 Pools com Volume > 0:"
find . -name "test_*.json" -exec jq -r '.pools[]? | select(.stats.volumeInUSD > 0) | {id, totalValueLockedUSD, volumeInUSD: .stats.volumeInUSD, feesInUSD: .stats.feesInUSD, chain: .chain.name}' {} \; | head -10

echo ""
echo "🔍 Pools com Fees > 0:"
find . -name "test_*.json" -exec jq -r '.pools[]? | select(.stats.feesInUSD > 0) | {id, totalValueLockedUSD, volumeInUSD: .stats.volumeInUSD, feesInUSD: .stats.feesInUSD, chain: .chain.name}' {} \; | head -10

echo ""
echo "🔍 Pools com TVL > 1000:"
find . -name "test_*.json" -exec jq -r '.pools[]? | select(.totalValueLockedUSD > 1000) | {id, totalValueLockedUSD, volumeInUSD: .stats.volumeInUSD, feesInUSD: .stats.feesInUSD, chain: .chain.name}' {} \; | head -10

echo ""
echo "🎉 Teste completo! Verifique os arquivos test_*.json para resultados detalhados."
echo "📁 Arquivos gerados:"
ls -la test_*.json | wc -l
echo "arquivos de teste criados"
