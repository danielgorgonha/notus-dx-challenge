#!/bin/bash

# Test Create Liquidity Pool Script
# Tests the POST /api/v1/liquidity/create endpoint

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# API Configuration
API_BASE="https://api.notus.team/api/v1"
API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmZGY5NzNlNS0zNTIzLTQwNzctOTAzZC1iYWNmYzBkMGMyZGQiLCJhcGlLZXlHZW5lcmF0ZWRBdCI6IjIwMjUtMTAtMTNUMTc6NDY6NTguMjU1WiIsIm9yZ2FuaXphdGlvbklkIjoiNmQ0YmQwZjYtMmVlNS00MWYwLTkxMjAtYmQwY2M0OGRmODEzIn0.7YvbiK9Tos-RqcDDsZnl9h_3V5B7KrISN4C0RSPCe1s"

echo -e "${BLUE}🚀 Testing Create Liquidity Pool Endpoint${NC}"
echo "================================================"

# Test data - USDC.E/LINK pool on Polygon
WALLET_ADDRESS="0x29275940040857bf0ffe8d875622c85aaaec5c0a"
TO_ADDRESS="0x29275940040857bf0ffe8d875622c85aaaec5c0a"
CHAIN_ID=137
PAY_GAS_FEE_TOKEN="0x2791bca1f2de4661ed88a30c99a7a9449aa84174" # USDC.E
GAS_FEE_PAYMENT_METHOD="ADD_TO_AMOUNT"
TOKEN0="0x2791bca1f2de4661ed88a30c99a7a9449aa84174" # USDC.E
TOKEN1="0x53e0bca35ec356bd5dddfebbd1fc0fd03fabad39" # LINK
POOL_FEE_PERCENT=0.3
TOKEN0_AMOUNT="1.0"
TOKEN1_AMOUNT="16.0"
MIN_PRICE="15.0"
MAX_PRICE="17.0"
SLIPPAGE=1.0

echo -e "${YELLOW}📊 Test Parameters:${NC}"
echo "Wallet Address: $WALLET_ADDRESS"
echo "Chain ID: $CHAIN_ID (Polygon)"
echo "Token 0: $TOKEN0 (USDC.E)"
echo "Token 1: $TOKEN1 (LINK)"
echo "Token 0 Amount: $TOKEN0_AMOUNT"
echo "Token 1 Amount: $TOKEN1_AMOUNT"
echo "Min Price: $MIN_PRICE"
echo "Max Price: $MAX_PRICE"
echo ""

# Create JSON payload
JSON_PAYLOAD=$(cat <<EOF
{
  "walletAddress": "$WALLET_ADDRESS",
  "toAddress": "$TO_ADDRESS",
  "chainId": $CHAIN_ID,
  "payGasFeeToken": "$PAY_GAS_FEE_TOKEN",
  "gasFeePaymentMethod": "$GAS_FEE_PAYMENT_METHOD",
  "token0": "$TOKEN0",
  "token1": "$TOKEN1",
  "poolFeePercent": $POOL_FEE_PERCENT,
  "token0Amount": "$TOKEN0_AMOUNT",
  "token1Amount": "$TOKEN1_AMOUNT",
  "minPrice": $MIN_PRICE,
  "maxPrice": $MAX_PRICE,
  "slippage": $SLIPPAGE,
  "liquidityProvider": "UNISWAP_V3",
  "transactionFeePercent": 2.5
}
EOF
)

echo -e "${BLUE}📤 Sending request to create liquidity...${NC}"

# Make the API call
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/liquidity/create" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d "$JSON_PAYLOAD")

# Extract HTTP status code
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | head -n -1)

echo -e "${BLUE}📡 Response Status: $HTTP_CODE${NC}"

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ Success! Liquidity creation request processed${NC}"
    echo ""
    echo -e "${YELLOW}📋 Response Details:${NC}"
    echo "$RESPONSE_BODY" | jq '.' 2>/dev/null || echo "$RESPONSE_BODY"
    
    # Extract key information
    if command -v jq &> /dev/null; then
        echo ""
        echo -e "${YELLOW}🔍 Key Information:${NC}"
        echo "Liquidity Provider: $(echo "$RESPONSE_BODY" | jq -r '.operation.liquidityProvider // "N/A"')"
        echo "Chain ID: $(echo "$RESPONSE_BODY" | jq -r '.operation.chainId // "N/A"')"
        echo "Wallet Address: $(echo "$RESPONSE_BODY" | jq -r '.operation.walletAddress // "N/A"')"
        echo "Token 0 Amount: $(echo "$RESPONSE_BODY" | jq -r '.operation.token0Amount // "N/A"')"
        echo "Token 1 Amount: $(echo "$RESPONSE_BODY" | jq -r '.operation.token1Amount // "N/A"')"
        echo "Min Price: $(echo "$RESPONSE_BODY" | jq -r '.operation.minPrice // "N/A"')"
        echo "Max Price: $(echo "$RESPONSE_BODY" | jq -r '.operation.maxPrice // "N/A"')"
        echo "Slippage: $(echo "$RESPONSE_BODY" | jq -r '.operation.slippage // "N/A"')"
    fi
    
elif [ "$HTTP_CODE" -eq 400 ]; then
    echo -e "${RED}❌ Bad Request (400)${NC}"
    echo "$RESPONSE_BODY" | jq '.' 2>/dev/null || echo "$RESPONSE_BODY"
    
elif [ "$HTTP_CODE" -eq 403 ]; then
    echo -e "${RED}❌ Forbidden (403)${NC}"
    echo "$RESPONSE_BODY" | jq '.' 2>/dev/null || echo "$RESPONSE_BODY"
    
elif [ "$HTTP_CODE" -eq 404 ]; then
    echo -e "${RED}❌ Not Found (404)${NC}"
    echo "$RESPONSE_BODY" | jq '.' 2>/dev/null || echo "$RESPONSE_BODY"
    
else
    echo -e "${RED}❌ Error: HTTP $HTTP_CODE${NC}"
    echo "$RESPONSE_BODY" | jq '.' 2>/dev/null || echo "$RESPONSE_BODY"
fi

echo ""
echo -e "${BLUE}🏁 Test completed${NC}"
