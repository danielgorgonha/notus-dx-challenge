#!/bin/bash

# 🔄 Teste de todas as requests da página de swap
# Execute este script para testar todas as APIs da página de swap

echo "=== TESTANDO REQUESTS DA PÁGINA DE SWAP ==="
echo ""

# Variáveis de ambiente
API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmZGY5NzNlNS0zNTIzLTQwNzctOTAzZC1iYWNmYzBkMGMyZGQiLCJhcGlLZXlHZW5lcmF0ZWRBdCI6IjIwMjUtMTAtMTNUMTc6NDY6NTguMjU1WiIsIm9yZ2FuaXphdGlvbklkIjoiNmQ0YmQwZjYtMmVlNS00MWYwLTkxMjAtYmQwY2M0OGRmODEzIn0.7YvbiK9Tos-RqcDDsZnl9h_3V5B7KrISN4C0RSPCe1s"
PROJECT_ID="fdf973e5-3523-4077-903d-bacfc0d0c2dd"
BASE_URL="https://api.notus.team/api/v1"

echo "1. 📋 LISTAR TOKENS (TokenSelector)"
echo "GET /crypto/tokens"
curl -X GET "${BASE_URL}/crypto/tokens?filterByChainId=137&page=1&perPage=100&projectId=${PROJECT_ID}&filterWhitelist=false&orderBy=marketCap&orderDir=desc" \
  -H "x-api-key: ${API_KEY}" \
  -H "Accept: application/json" \
  --connect-timeout 30 \
  --max-time 60 \
  -s | jq '.tokens[0:3] | .[] | {symbol: .symbol, name: .name, chainId: .chain.id, price: .price}'
echo ""

echo "2. 💼 BUSCAR PORTFOLIO (TokenSelector)"
echo "GET /wallets/{address}/portfolio"
WALLET_ADDRESS="0x29275940040857bf0ffe8d875622c85aaaec5c0a"
curl -X GET "${BASE_URL}/wallets/${WALLET_ADDRESS}/portfolio" \
  -H "x-api-key: ${API_KEY}" \
  -H "Accept: application/json" \
  --connect-timeout 30 \
  --max-time 60 \
  -s | jq '.tokens[0:3] | .[] | {symbol: .symbol, balance: .balance, chainId: .chain.id}'
echo ""

echo "3. 🏦 BUSCAR ENDEREÇO DA SMART WALLET"
echo "GET /wallets/address"
curl -X GET "${BASE_URL}/wallets/address?factory=0x7a1dbab750f12a90eb1b60d2ae3ad17d4d81effe&salt=0&externallyOwnedAccount=0x7092C791436f7047956c42ABbD2aC67dedD7C511" \
  -H "x-api-key: ${API_KEY}" \
  -H "Accept: application/json" \
  --connect-timeout 30 \
  --max-time 60 \
  -s | jq '.'
echo ""

echo "4. 🔄 CRIAR COTAÇÃO DE SWAP (1 BRZ → USDC)"
echo "POST /crypto/swap"
echo "💰 Convertendo 1 BRZ para USDC na Polygon"
echo ""

# A API espera amountIn como string decimal, não em wei
# Usando 1 BRZ (formato decimal)
BRZ_AMOUNT="1"
BRZ_ADDRESS="0x4ed141110f6eeeaba9a1df36d8c26f684d2475dc"
USDC_ADDRESS="0x3c499c542cef5e3811e1192ce70d8cc03d5c3359"

curl -X POST "${BASE_URL}/crypto/swap" \
  -H "x-api-key: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  --connect-timeout 30 \
  --max-time 60 \
  -d "{
    \"amountIn\": \"${BRZ_AMOUNT}\",
    \"chainIdIn\": 137,
    \"chainIdOut\": 137,
    \"tokenIn\": \"${BRZ_ADDRESS}\",
    \"tokenOut\": \"${USDC_ADDRESS}\",
    \"walletAddress\": \"0x29275940040857bf0ffe8d875622c85aaaec5c0a\",
    \"toAddress\": \"0x29275940040857bf0ffe8d875622c85aaaec5c0a\",
    \"routeProfile\": \"QUICKEST_QUOTE\",
    \"gasFeePaymentMethod\": \"ADD_TO_AMOUNT\",
    \"payGasFeeToken\": \"${BRZ_ADDRESS}\",
    \"slippage\": 0.5,
    \"transactionFeePercent\": 0,
    \"metadata\": {}
  }" \
  -s | jq '.'
echo ""

echo "5. ⚡ EXECUTAR USER OPERATION"
echo "POST /crypto/execute-user-op"
echo "⚠️  ATENÇÃO: Esta request requer uma assinatura válida!"
echo "Para testar, você precisa:"
echo "   1. Criar uma cotação primeiro (request #4)"
echo "   2. Assinar a userOperationHash com a carteira"
echo "   3. Usar a assinatura nesta request"
echo ""
echo "Exemplo de estrutura:"
echo '{
  "userOperationHash": "0x...",
  "signature": "0x...",
  "authorization": "optional"
}'
echo ""

echo "6. 📊 BUSCAR STATUS DE USER OPERATION"
echo "GET /crypto/user-operation/{userOperationHash}"
echo "⚠️  ATENÇÃO: Substitua {userOperationHash} pelo hash real"
echo "Exemplo:"
echo "curl -X GET \"${BASE_URL}/crypto/user-operation/0x...\" \\"
echo "  -H \"x-api-key: ${API_KEY}\" \\"
echo "  -H \"Accept: application/json\""
echo ""

echo "=== RESUMO DAS REQUESTS ==="
echo "1. GET  /crypto/tokens                    - Listar tokens disponíveis"
echo "2. GET  /wallets/{address}/portfolio      - Buscar portfolio do usuário"
echo "3. GET  /wallets/address                  - Buscar endereço da smart wallet"
echo "4. POST /crypto/swap                      - Criar cotação de swap"
echo "5. POST /crypto/execute-user-op           - Executar swap (requer assinatura)"
echo "6. GET  /crypto/user-operation/{hash}     - Buscar status da operação"
echo ""
echo "✅ Execute este script para testar todas as APIs!"
