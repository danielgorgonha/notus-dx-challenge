#!/bin/bash

# Teste - Obter Pool por ID - API Notus
# Script para testar endpoint específico de pool individual

# Configurações
BASE_URL="https://api.notus.team/api/v1"
API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmZGY5NzNlNS0zNTIzLTQwNzctOTAzZC1iYWNmYzBkMGMyZGQiLCJhcGlLZXlHZW5lcmF0ZWRBdCI6IjIwMjUtMTAtMTNUMTc6NDY6NTguMjU1WiIsIm9yZ2FuaXphdGlvbklkIjoiNmQ0YmQwZjYtMmVlNS00MWYwLTkxMjAtYmQwY2M0OGRmODEzIn0.7YvbiK9Tos-RqcDDsZnl9h_3V5B7KrISN4C0RSPCe1s"

# Pool IDs para teste (5 pools específicas)
POOL_IDS=(
    "137-0x94ab9e4553ffb839431e37cc79ba8905f45bfbea"  # USDC.E/LINK
    "137-0xbb98b3d2b18aef63a3178023a920971cf5f29be4"  # WETH/USDT
    "137-0x4ccd010148379ea531d6c587cfdd60180196f9b1"  # WETH/USDT
    "137-0xa4d8c89f0c20efbe54cba9e7e7a7e509056228d9"  # WETH/USDT
    "137-0x9b08288c3be4f62bbf8d1c20ac9c5e6f9467d8b7"  # WPOL/USDT
)

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Função para calcular APR
calculate_apr() {
    local fees_usd="$1"
    local tvl_usd="$2"
    local days="$3"
    
    if [ "$tvl_usd" != "0" ] && [ "$tvl_usd" != "null" ] && [ "$fees_usd" != "null" ]; then
        local apr=$(echo "scale=2; ($fees_usd * 365) / ($tvl_usd * $days) * 100" | bc 2>/dev/null || echo "0")
        echo "$apr"
    else
        echo "0"
    fi
}

# Função para formatar valores
format_currency() {
    local value="$1"
    if [ "$value" != "null" ] && [ "$value" != "0" ]; then
        printf "%.2f" "$value" 2>/dev/null || echo "0"
    else
        echo "0"
    fi
}

# Função para testar uma pool específica
test_pool_by_id() {
    local pool_id="$1"
    local range_days="${2:-30}"
    
    echo -e "${YELLOW}🏊‍♂️ TESTANDO POOL: $pool_id${NC}"
    echo -e "${BLUE}Range: ${range_days} dias${NC}"
    echo -e "${BLUE}========================================${NC}"
    
    # Construir URL
    local url="${BASE_URL}/liquidity/pools/${pool_id}?rangeInDays=${range_days}"
    
    # Fazer requisição
    local response=$(curl -s -w "\n%{http_code}" -X GET "$url" \
        -H "x-api-key: $API_KEY" \
        -H "Content-Type: application/json")
    
    # Separar body e status code
    local body=$(echo "$response" | head -n -1)
    local http_code=$(echo "$response" | tail -n 1)
    
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}Status: $http_code (OK)${NC}"
        
        # Extrair dados da pool
        local pool_data=$(echo "$body" | jq '.pool' 2>/dev/null)
        
        if [ "$pool_data" != "null" ] && [ "$pool_data" != "" ]; then
            # Dados básicos
            local address=$(echo "$pool_data" | jq -r '.address // "N/A"')
            local chain_name=$(echo "$pool_data" | jq -r '.chain.name // "N/A"')
            local chain_id=$(echo "$pool_data" | jq -r '.chain.id // "N/A"')
            local provider_name=$(echo "$pool_data" | jq -r '.provider.name // "N/A"')
            local fee=$(echo "$pool_data" | jq -r '.fee // "N/A"')
            local tvl_usd=$(echo "$pool_data" | jq -r '.totalValueLockedUSD // "0"')
            
            # Estatísticas
            local range_days_actual=$(echo "$pool_data" | jq -r '.stats.rangeInDays // "0"')
            local fees_usd=$(echo "$pool_data" | jq -r '.stats.feesInUSD // "0"')
            local volume_usd=$(echo "$pool_data" | jq -r '.stats.volumeInUSD // "0"')
            local transactions=$(echo "$pool_data" | jq -r '.stats.transactionsCount // "0"')
            
            # Tokens
            local token1_name=$(echo "$pool_data" | jq -r '.tokens[0].name // "N/A"')
            local token1_symbol=$(echo "$pool_data" | jq -r '.tokens[0].symbol // "N/A"')
            local token1_address=$(echo "$pool_data" | jq -r '.tokens[0].address // "N/A"')
            local token1_share=$(echo "$pool_data" | jq -r '.tokens[0].poolShareInPercentage // "0"')
            local token1_logo=$(echo "$pool_data" | jq -r '.tokens[0].logo // "N/A"')
            
            local token2_name=$(echo "$pool_data" | jq -r '.tokens[1].name // "N/A"')
            local token2_symbol=$(echo "$pool_data" | jq -r '.tokens[1].symbol // "N/A"')
            local token2_address=$(echo "$pool_data" | jq -r '.tokens[1].address // "N/A"')
            local token2_share=$(echo "$pool_data" | jq -r '.tokens[1].poolShareInPercentage // "0"')
            local token2_logo=$(echo "$pool_data" | jq -r '.tokens[1].logo // "N/A"')
            
            # Calcular APR
            local apr=$(calculate_apr "$fees_usd" "$tvl_usd" "$range_days_actual")
            
            # Formatar valores
            local tvl_formatted=$(format_currency "$tvl_usd")
            local fees_formatted=$(format_currency "$fees_usd")
            local volume_formatted=$(format_currency "$volume_usd")
            
            # Calcular fees e volume de 24h
            local fees_24h=$(echo "scale=2; $fees_usd / $range_days_actual" | bc 2>/dev/null || echo "0")
            local volume_24h=$(echo "scale=2; $volume_usd / $range_days_actual" | bc 2>/dev/null || echo "0")
            
            echo -e "\n${GREEN}📊 DADOS DA POOL:${NC}"
            echo -e "${BLUE}├─ ID: $pool_id${NC}"
            echo -e "${BLUE}├─ Endereço: $address${NC}"
            echo -e "${BLUE}├─ Chain: $chain_name (ID: $chain_id)${NC}"
            echo -e "${BLUE}├─ Protocolo: $provider_name${NC}"
            echo -e "${BLUE}├─ Taxa: ${fee}%${NC}"
            echo -e "${BLUE}├─ TVL: \$${tvl_formatted}${NC}"
            echo -e "${BLUE}├─ APR: ${apr}% a.a.${NC}"
            echo -e "${BLUE}├─ Fees (${range_days_actual}d): \$${fees_formatted}${NC}"
            echo -e "${BLUE}├─ Fees (24h): \$$(printf "%.2f" $fees_24h)${NC}"
            echo -e "${BLUE}├─ Volume (${range_days_actual}d): \$${volume_formatted}${NC}"
            echo -e "${BLUE}├─ Volume (24h): \$$(printf "%.2f" $volume_24h)${NC}"
            echo -e "${BLUE}├─ Transações: $transactions${NC}"
            
            echo -e "\n${GREEN}🪙 TOKENS:${NC}"
            echo -e "${BLUE}├─ Token 1: $token1_symbol ($token1_name)${NC}"
            echo -e "${BLUE}│  ├─ Endereço: $token1_address${NC}"
            echo -e "${BLUE}│  ├─ Participação: ${token1_share}%${NC}"
            echo -e "${BLUE}│  └─ Logo: $token1_logo${NC}"
            echo -e "${BLUE}└─ Token 2: $token2_symbol ($token2_name)${NC}"
            echo -e "${BLUE}   ├─ Endereço: $token2_address${NC}"
            echo -e "${BLUE}   ├─ Participação: ${token2_share}%${NC}"
            echo -e "${BLUE}   └─ Logo: $token2_logo${NC}"
            
            echo -e "\n${GREEN}📈 COMPOSIÇÃO DA POOL:${NC}"
            echo -e "${BLUE}├─ $token1_symbol: ${token1_share}%${NC}"
            echo -e "${BLUE}└─ $token2_symbol: ${token2_share}%${NC}"
            
            echo -e "\n${GREEN}🔗 LINKS ÚTEIS:${NC}"
            echo -e "${BLUE}├─ Pool no PolygonScan: https://polygonscan.com/address/$address${NC}"
            echo -e "${BLUE}├─ Token 1: https://polygonscan.com/token/$token1_address${NC}"
            echo -e "${BLUE}└─ Token 2: https://polygonscan.com/token/$token2_address${NC}"
            
        else
            echo -e "${RED}❌ Dados da pool não encontrados${NC}"
        fi
        
    else
        echo -e "${RED}Status: $http_code (ERRO)${NC}"
        echo -e "${RED}Resposta: $body${NC}"
    fi
    
    echo -e "\n${BLUE}========================================${NC}\n"
}

# Função para testar múltiplas pools
test_multiple_pools() {
    local range_days="${1:-30}"
    
    echo -e "${YELLOW}🧪 TESTANDO MÚLTIPLAS POOLS (Range: ${range_days} dias)${NC}"
    echo -e "${BLUE}========================================${NC}"
    
    for pool_id in "${POOL_IDS[@]}"; do
        test_pool_by_id "$pool_id" "$range_days"
    done
}

# Função para comparar com dados da imagem
compare_with_image_data() {
    echo -e "${PURPLE}🖼️ COMPARAÇÃO COM DADOS DA IMAGEM${NC}"
    echo -e "${BLUE}========================================${NC}"
    
    echo -e "${CYAN}Dados esperados da imagem (USDC.E/LINK):${NC}"
    echo -e "${BLUE}├─ TVL: \$478.9K${NC}"
    echo -e "${BLUE}├─ Volume (24h): \$369.7K${NC}"
    echo -e "${BLUE}├─ Tarifas (24h): \$1.1K${NC}"
    echo -e "${BLUE}├─ APR: 84.52% a.a.${NC}"
    echo -e "${BLUE}├─ Composição: USDC.E (17.37%) / LINK (82.63%)${NC}"
    echo -e "${BLUE}├─ Taxa: 0.30%${NC}"
    echo -e "${BLUE}├─ Protocolo: UNISWAP V3${NC}"
    echo -e "${BLUE}└─ Rede: Polygon${NC}"
    
    echo -e "\n${CYAN}Testando pool USDC.E/LINK para verificar correspondência...${NC}"
    test_pool_by_id "137-0x94ab9e4553ffb839431e37cc79ba8905f45bfbea" 30
}

# Main execution
echo -e "${GREEN}🚀 TESTE - OBTER POOL POR ID${NC}"
echo -e "${GREEN}Data: $(date)${NC}"

# Teste 1: Pool única com diferentes ranges
echo -e "\n${YELLOW}=== TESTE 1: Pool única com diferentes ranges ===${NC}"
test_pool_by_id "137-0x94ab9e4553ffb839431e37cc79ba8905f45bfbea" 30
test_pool_by_id "137-0x94ab9e4553ffb839431e37cc79ba8905f45bfbea" 365

# Teste 2: Múltiplas pools
echo -e "\n${YELLOW}=== TESTE 2: Múltiplas pools ===${NC}"
test_multiple_pools 30

# Teste 3: Comparação com dados da imagem
echo -e "\n${YELLOW}=== TESTE 3: Comparação com dados da imagem ===${NC}"
compare_with_image_data

echo -e "\n${GREEN}✅ TESTES CONCLUÍDOS${NC}"
echo -e "${GREEN}Data: $(date)${NC}"
