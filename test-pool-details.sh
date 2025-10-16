#!/bin/bash

# Script para testar APIs da Notus - Versão melhorada
# Primeiro lista pools, depois pega detalhes de uma pool específica

API_URL="https://api.notus.team/api/v1"
API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmZGY5NzNlNS0zNTIzLTQwNzctOTAzZC1iYWNmYzBkMGMyZGQiLCJhcGlLZXlHZW5lcmF0ZWRBdCI6IjIwMjUtMTAtMTNUMTc6NDY6NTguMjU1WiIsIm9yZ2FuaXphdGlvbklkIjoiNmQ0YmQwZjYtMmVlNS00MWYwLTkxMjAtYmQwY2M0OGRmODEzIn0.7YvbiK9Tos-RqcDDsZnl9h_3V5B7KrISN4C0RSPCe1s"

echo "🚀 Testando APIs da Notus - Versão Melhorada..."
echo "=============================================="

# 1. Listar pools primeiro
echo "📊 1. Listando Pools de Liquidez..."
POOLS_RESPONSE=$(curl -s -X GET "${API_URL}/liquidity/pools?take=5&offset=0&chainIds=137&filterWhitelist=false&rangeInDays=30" \
  -H "x-api-key: ${API_KEY}")

if [ $? -eq 0 ]; then
  echo "$POOLS_RESPONSE" > pools_list.json
  echo "✅ Lista de pools salva em pools_list.json"
  
  # Extrair o primeiro ID da lista
  FIRST_POOL_ID=$(echo "$POOLS_RESPONSE" | jq -r '.pools[0].id' 2>/dev/null)
  
  if [ "$FIRST_POOL_ID" != "null" ] && [ -n "$FIRST_POOL_ID" ]; then
    echo "🔍 Pool ID encontrado: $FIRST_POOL_ID"
    
    # 2. Buscar detalhes da pool específica
    echo ""
    echo "📋 2. Obtendo Detalhes da Pool: $FIRST_POOL_ID"
    POOL_DETAILS_RESPONSE=$(curl -s -X GET "${API_URL}/liquidity/pools/${FIRST_POOL_ID}?rangeInDays=30" \
      -H "x-api-key: ${API_KEY}")
    
    if [ $? -eq 0 ]; then
      echo "$POOL_DETAILS_RESPONSE" > pool_details.json
      echo "✅ Detalhes da pool salvos em pool_details.json"
      
      # Mostrar estrutura da resposta
      echo ""
      echo "📊 Estrutura da resposta:"
      echo "$POOL_DETAILS_RESPONSE" | jq '.' 2>/dev/null || echo "❌ Erro ao processar JSON"
      
    else
      echo "❌ Erro ao buscar detalhes da pool"
    fi
  else
    echo "❌ Nenhum pool encontrado na lista"
  fi
else
  echo "❌ Erro ao listar pools"
fi

echo ""
echo "🎉 Teste concluído!"
echo "📁 Arquivos salvos:"
echo "   - pools_list.json (lista de pools)"
echo "   - pool_details.json (detalhes da primeira pool)"
