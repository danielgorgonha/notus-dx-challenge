#!/bin/bash

# Script para testar todos os endpoints da API Notus
# Configuração das variáveis de ambiente
API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmZGY5NzNlNS0zNTIzLTQwNzctOTAzZC1iYWNmYzBkMGMyZGQiLCJhcGlLZXlHZW5lcmF0ZWRBdCI6IjIwMjUtMTAtMTNUMTc6NDY6NTguMjU1WiIsIm9yZ2FuaXphdGlvbklkIjoiNmQ0YmQwZjYtMmVlNS00MWYwLTkxMjAtYmQwY2M0OGRmODEzIn0.7YvbiK9Tos-RqcDDsZnl9h_3V5B7KrISN4C0RSPCe1s"
BASE_URL="https://api.notus.team/api/v1"
WALLET_ADDRESS="0x6e397ddf51d9f15dbe0414538e7529f51f2e5464"
CHAIN_ID=137  # Polygon
TO_ADDRESS="0x1337133713371337133713371337133713371337"

echo "🚀 Testando APIs da Notus..."
echo "=================================="

# 1. Listar Pools de Liquidez
echo "📊 1. Listando Pools de Liquidez..."
curl -X GET "${BASE_URL}/liquidity/pools?take=10&offset=0&chainIds=${CHAIN_ID}&filterWhitelist=false&rangeInDays=30" \
  -H "x-api-key: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n" \
  -s | jq '.' > pools_response.json

echo "✅ Resposta salva em pools_response.json"
echo ""

# 2. Obter Pool Específico
echo "🔍 2. Obtendo Pool Específico..."
POOL_ID="137-0x4CcD010148379ea531D6C587CfDd60180196F9b1"
curl -X GET "${BASE_URL}/liquidity/pools/${POOL_ID}?rangeInDays=30" \
  -H "x-api-key: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n" \
  -s | jq '.' > pool_details_response.json

echo "✅ Resposta salva em pool_details_response.json"
echo ""

# 3. Dados Históricos do Pool
echo "📈 3. Obtendo Dados Históricos do Pool..."
curl -X GET "${BASE_URL}/liquidity/pools/${POOL_ID}/historical-data?rangeInDays=30&groupByInterval=DAILY" \
  -H "x-api-key: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n" \
  -s | jq '.' > pool_historical_response.json

echo "✅ Resposta salva em pool_historical_response.json"
echo ""

# 4. Obter Quantidades de Liquidez
echo "💰 4. Obtendo Quantidades de Liquidez..."
TOKEN0="0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f"
TOKEN1="0xaf88d065e77c8cc2239327c5edb3a432268e5831"
PAY_GAS_TOKEN="0x82af49447d8a07e3bd95bd0d56f35241523fbab1"

curl -X GET "${BASE_URL}/liquidity/amounts?liquidityProvider=UNISWAP_V3&chainId=${CHAIN_ID}&token0=${TOKEN0}&token1=${TOKEN1}&poolFeePercent=1&token0MaxAmount=26.2345&token1MaxAmount=1823.2&minPrice=83475.12&maxPrice=102300.5&payGasFeeToken=${PAY_GAS_TOKEN}&gasFeePaymentMethod=ADD_TO_AMOUNT" \
  -H "x-api-key: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n" \
  -s | jq '.' > amounts_response.json

echo "✅ Resposta salva em amounts_response.json"
echo ""

# 5. Criar Liquidez
echo "➕ 5. Criando Liquidez..."
curl -X POST "${BASE_URL}/liquidity/create" \
  -H "x-api-key: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{
    \"walletAddress\": \"${WALLET_ADDRESS}\",
    \"toAddress\": \"${TO_ADDRESS}\",
    \"chainId\": ${CHAIN_ID},
    \"payGasFeeToken\": \"${PAY_GAS_TOKEN}\",
    \"gasFeePaymentMethod\": \"ADD_TO_AMOUNT\",
    \"token0\": \"${TOKEN0}\",
    \"token1\": \"${TOKEN1}\",
    \"poolFeePercent\": 1,
    \"token0Amount\": \"26.2345\",
    \"token1Amount\": \"1823.2\",
    \"minPrice\": 83475.12,
    \"maxPrice\": 102300.5
  }" \
  -w "\nStatus: %{http_code}\n" \
  -s | jq '.' > create_liquidity_response.json

echo "✅ Resposta salva em create_liquidity_response.json"
echo ""

# 6. Alterar Liquidez
echo "🔄 6. Alterando Liquidez..."
curl -X POST "${BASE_URL}/liquidity/change" \
  -H "x-api-key: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{
    \"walletAddress\": \"${WALLET_ADDRESS}\",
    \"chainId\": ${CHAIN_ID},
    \"payGasFeeToken\": \"${PAY_GAS_TOKEN}\",
    \"gasFeePaymentMethod\": \"ADD_TO_AMOUNT\",
    \"tokenId\": \"2375619234\",
    \"change\": {
      \"token0\": \"${TOKEN0}\",
      \"token1\": \"${TOKEN1}\",
      \"token0Amount\": \"26.2345\",
      \"token1Amount\": \"1823.2\"
    }
  }" \
  -w "\nStatus: %{http_code}\n" \
  -s | jq '.' > change_liquidity_response.json

echo "✅ Resposta salva em change_liquidity_response.json"
echo ""

# 7. Coletar Taxas
echo "💸 7. Coletando Taxas..."
curl -X POST "${BASE_URL}/liquidity/collect" \
  -H "x-api-key: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{
    \"chainId\": ${CHAIN_ID},
    \"nftId\": \"2375619234\",
    \"walletAddress\": \"${WALLET_ADDRESS}\",
    \"payGasFeeToken\": \"${PAY_GAS_TOKEN}\"
  }" \
  -w "\nStatus: %{http_code}\n" \
  -s | jq '.' > collect_fees_response.json

echo "✅ Resposta salva em collect_fees_response.json"
echo ""

echo "🎉 Todos os testes concluídos!"
echo "📁 Arquivos de resposta salvos:"
echo "   - pools_response.json"
echo "   - pool_details_response.json"
echo "   - pool_historical_response.json"
echo "   - amounts_response.json"
echo "   - create_liquidity_response.json"
echo "   - change_liquidity_response.json"
echo "   - collect_fees_response.json"
