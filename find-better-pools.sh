#!/bin/bash

# Script para encontrar pools com dados mais significativos
API_URL="https://api.notus.team/api/v1"
API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmZGY5NzNlNS0zNTIzLTQwNzctOTAzZC1iYWNmYzBkMGMyZGQiLCJhcGlLZXlHZW5lcmF0ZWRBdCI6IjIwMjUtMTAtMTNUMTc6NDY6NTguMjU1WiIsIm9yZ2FuaXphdGlvbklkIjoiNmQ0YmQwZjYtMmVlNS00MWYwLTkxMjAtYmQwY2M0OGRmODEzIn0.7YvbiK9Tos-RqcDDsZnl9h_3V5B7KrISN4C0RSPCe1s"

echo "🔍 Buscando pools com dados mais significativos..."
echo "=================================================="

# Buscar pools sem filtro de chain para encontrar mais opções
echo "📊 Listando pools de todas as chains..."
ALL_POOLS_RESPONSE=$(curl -s -X GET "${API_URL}/liquidity/pools?take=50&offset=0&filterWhitelist=false&rangeInDays=30" \
  -H "x-api-key: ${API_KEY}")

if [ $? -eq 0 ]; then
  echo "$ALL_POOLS_RESPONSE" > all_chains_pools.json
  echo "✅ Lista de pools de todas as chains salva em all_chains_pools.json"
  
  echo ""
  echo "📋 Top 10 pools por TVL:"
  echo "$ALL_POOLS_RESPONSE" | jq -r '.pools[] | "\(.id): TVL=\(.totalValueLockedUSD), Volume=\(.stats.volumeInUSD), Fees=\(.stats.feesInUSD), Chain=\(.chain.name)"' | head -10
  
  echo ""
  echo "🔍 Procurando pool com maior TVL..."
  
  # Encontrar a pool com maior TVL
  BEST_POOL=$(echo "$ALL_POOLS_RESPONSE" | jq -r '.pools[] | select(.totalValueLockedUSD != "0" and .totalValueLockedUSD != "0.0") | .id' | head -1)
  
  if [ -n "$BEST_POOL" ] && [ "$BEST_POOL" != "null" ]; then
    echo "✅ Melhor pool encontrada: $BEST_POOL"
    
    # Buscar detalhes da melhor pool
    echo ""
    echo "📋 Obtendo detalhes da melhor pool: $BEST_POOL"
    POOL_DETAILS_RESPONSE=$(curl -s -X GET "${API_URL}/liquidity/pools/${BEST_POOL}?rangeInDays=30" \
      -H "x-api-key: ${API_KEY}")
    
    if [ $? -eq 0 ]; then
      echo "$POOL_DETAILS_RESPONSE" > best_pool_details.json
      echo "✅ Detalhes da melhor pool salvos em best_pool_details.json"
      
      # Mostrar dados financeiros
      echo ""
      echo "💰 Dados financeiros da melhor pool:"
      echo "TVL: $(echo "$POOL_DETAILS_RESPONSE" | jq -r '.pool.totalValueLockedUSD')"
      echo "Volume 24h: $(echo "$POOL_DETAILS_RESPONSE" | jq -r '.pool.stats.volumeInUSD')"
      echo "Fees 24h: $(echo "$POOL_DETAILS_RESPONSE" | jq -r '.pool.stats.feesInUSD')"
      echo "Fee: $(echo "$POOL_DETAILS_RESPONSE" | jq -r '.pool.fee')%"
      echo "Chain: $(echo "$POOL_DETAILS_RESPONSE" | jq -r '.pool.chain.name')"
      echo "Provider: $(echo "$POOL_DETAILS_RESPONSE" | jq -r '.pool.provider.name')"
      
      # Mostrar tokens
      echo ""
      echo "🪙 Tokens da pool:"
      echo "$POOL_DETAILS_RESPONSE" | jq -r '.pool.tokens[] | "\(.symbol): \(.poolShareInPercentage)%"'
      
    else
      echo "❌ Erro ao buscar detalhes da melhor pool"
    fi
  else
    echo "❌ Nenhuma pool com dados significativos encontrada"
  fi
else
  echo "❌ Erro ao listar pools"
fi

echo ""
echo "🎉 Busca concluída!"
echo "📁 Arquivos salvos:"
echo "   - all_chains_pools.json (pools de todas as chains)"
echo "   - best_pool_details.json (melhor pool, se encontrada)"
