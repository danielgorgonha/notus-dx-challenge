#!/bin/bash

# Script para encontrar uma pool ativa com dados reais
API_URL="https://api.notus.team/api/v1"
API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmZGY5NzNlNS0zNTIzLTQwNzctOTAzZC1iYWNmYzBkMGMyZGQiLCJhcGlLZXlHZW5lcmF0ZWRBdCI6IjIwMjUtMTAtMTNUMTc6NDY6NTguMjU1WiIsIm9yZ2FuaXphdGlvbklkIjoiNmQ0YmQwZjYtMmVlNS00MWYwLTkxMjAtYmQwY2M0OGRmODEzIn0.7YvbiK9Tos-RqcDDsZnl9h_3V5B7KrISN4C0RSPCe1s"

echo "🔍 Buscando pools ativas com dados reais..."
echo "=============================================="

# Buscar mais pools para encontrar uma com dados
echo "📊 Listando pools com mais dados..."
POOLS_RESPONSE=$(curl -s -X GET "${API_URL}/liquidity/pools?take=20&offset=0&chainIds=137&filterWhitelist=false&rangeInDays=30" \
  -H "x-api-key: ${API_KEY}")

if [ $? -eq 0 ]; then
  echo "$POOLS_RESPONSE" > all_pools.json
  echo "✅ Lista de pools salva em all_pools.json"
  
  # Encontrar uma pool com TVL > 0
  echo ""
  echo "🔍 Procurando pool com TVL > 0..."
  
  # Usar jq para encontrar pools com TVL > 0
  ACTIVE_POOL=$(echo "$POOLS_RESPONSE" | jq -r '.pools[] | select(.totalValueLockedUSD != "0" and .totalValueLockedUSD != "0.0" and (.totalValueLockedUSD | tonumber) > 0) | .id' | head -1)
  
  if [ -n "$ACTIVE_POOL" ] && [ "$ACTIVE_POOL" != "null" ]; then
    echo "✅ Pool ativa encontrada: $ACTIVE_POOL"
    
    # Buscar detalhes da pool ativa
    echo ""
    echo "📋 Obtendo detalhes da pool ativa: $ACTIVE_POOL"
    POOL_DETAILS_RESPONSE=$(curl -s -X GET "${API_URL}/liquidity/pools/${ACTIVE_POOL}?rangeInDays=30" \
      -H "x-api-key: ${API_KEY}")
    
    if [ $? -eq 0 ]; then
      echo "$POOL_DETAILS_RESPONSE" > active_pool_details.json
      echo "✅ Detalhes da pool ativa salvos em active_pool_details.json"
      
      # Mostrar estrutura da resposta
      echo ""
      echo "📊 Estrutura da resposta da pool ativa:"
      echo "$POOL_DETAILS_RESPONSE" | jq '.' 2>/dev/null || echo "❌ Erro ao processar JSON"
      
      # Mostrar TVL e stats
      echo ""
      echo "💰 Dados financeiros da pool:"
      echo "TVL: $(echo "$POOL_DETAILS_RESPONSE" | jq -r '.pool.totalValueLockedUSD')"
      echo "Volume 24h: $(echo "$POOL_DETAILS_RESPONSE" | jq -r '.pool.stats.volumeInUSD')"
      echo "Fees 24h: $(echo "$POOL_DETAILS_RESPONSE" | jq -r '.pool.stats.feesInUSD')"
      echo "Fee: $(echo "$POOL_DETAILS_RESPONSE" | jq -r '.pool.fee')%"
      
    else
      echo "❌ Erro ao buscar detalhes da pool ativa"
    fi
  else
    echo "❌ Nenhuma pool ativa encontrada com TVL > 0"
    echo "📋 Listando todas as pools para análise:"
    echo "$POOLS_RESPONSE" | jq -r '.pools[] | "\(.id): TVL=\(.totalValueLockedUSD), Volume=\(.stats.volumeInUSD), Fees=\(.stats.feesInUSD)"' | head -10
  fi
else
  echo "❌ Erro ao listar pools"
fi

echo ""
echo "🎉 Busca concluída!"
echo "📁 Arquivos salvos:"
echo "   - all_pools.json (todas as pools)"
echo "   - active_pool_details.json (pool ativa, se encontrada)"
