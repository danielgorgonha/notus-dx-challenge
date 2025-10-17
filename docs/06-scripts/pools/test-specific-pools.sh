#!/bin/bash

# Teste de Pools Específicas - API Notus
# Script para testar pools individuais e analisar resultados

# Configurações
BASE_URL="https://api.notus.team/api/v1"
API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmZGY5NzNlNS0zNTIzLTQwNzctOTAzZC1iYWNmYzBkMGMyZGQiLCJhcGlLZXlHZW5lcmF0ZWRBdCI6IjIwMjUtMTAtMTNUMTc6NDY6NTguMjU1WiIsIm9yZ2FuaXphdGlvbklkIjoiNmQ0YmQwZjYtMmVlNS00MWYwLTkxMjAtYmQwY2M0OGRmODEzIn0.7YvbiK9Tos-RqcDDsZnl9h_3V5B7KrISN4C0RSPCe1s"

# Pool IDs
POOL_ID="137-0x94ab9e4553ffb839431e37cc79ba8905f45bfbea"
POOL_ID2="137-0xbb98b3d2b18aef63a3178023a920971cf5f29be4"
POOL_ID3="137-0x4ccd010148379ea531d6c587cfdd60180196f9b1"
POOL_ID4="137-0xa4d8c89f0c20efbe54cba9e7e7a7e509056228d9"
POOL_ID5="137-0x9b08288c3be4f62bbf8d1c20ac9c5e6f9467d8b7"

# Parâmetros
TAKE=10
OFFSET=0
CHAIN_IDS=137
FILTER_WHITELIST=false


# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Função para classificar pools
sort_pools() {
    local sort_by="$1"
    local order="$2"
    local pools_data="$3"
    
    case "$sort_by" in
        "rentabilidade")
            if [ "$order" = "desc" ]; then
                echo "$pools_data" | jq -r 'sort_by(.apr | tonumber) | reverse | .[]'
            else
                echo "$pools_data" | jq -r 'sort_by(.apr | tonumber) | .[]'
            fi
            ;;
        "tvl")
            if [ "$order" = "desc" ]; then
                echo "$pools_data" | jq -r 'sort_by(.totalValueLockedUSD | tonumber) | reverse | .[]'
            else
                echo "$pools_data" | jq -r 'sort_by(.totalValueLockedUSD | tonumber) | .[]'
            fi
            ;;
        "tarifa")
            if [ "$order" = "desc" ]; then
                echo "$pools_data" | jq -r 'sort_by(.fee | tonumber) | reverse | .[]'
            else
                echo "$pools_data" | jq -r 'sort_by(.fee | tonumber) | .[]'
            fi
            ;;
        "volume")
            if [ "$order" = "desc" ]; then
                echo "$pools_data" | jq -r 'sort_by(.volume24h | tonumber) | reverse | .[]'
            else
                echo "$pools_data" | jq -r 'sort_by(.volume24h | tonumber) | .[]'
            fi
            ;;
        *)
            echo "$pools_data" | jq -r '.[]'
            ;;
    esac
}

# Função para fazer requisição e analisar resultado
test_pool() {
    local test_name="$1"
    local url="$2"
    local description="$3"
    local sort_by="${4:-none}"
    local sort_order="${5:-desc}"
    
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${YELLOW}Teste: $test_name${NC}"
    echo -e "${BLUE}Descrição: $description${NC}"
    echo -e "${BLUE}URL: $url${NC}"
    if [ "$sort_by" != "none" ]; then
        echo -e "${BLUE}Ordenação: $sort_by ($sort_order)${NC}"
    fi
    echo -e "${BLUE}========================================${NC}"
    
    # Fazer requisição
    response=$(curl -s -w "\n%{http_code}" -H "x-api-key: $API_KEY" "$url")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    # Verificar status
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}Status: $http_code (OK)${NC}"
        
        # Analisar resposta
        pools_count=$(echo "$body" | jq '.pools | length' 2>/dev/null || echo "0")
        echo -e "${GREEN}Pools encontradas: $pools_count${NC}"
        
        if [ "$pools_count" -gt 0 ]; then
            # Preparar dados para classificação
            pools_data=$(echo "$body" | jq '.pools | map({
                id: .id,
                address: .address,
                chain: .chain.name,
                fee: .fee,
                totalValueLockedUSD: .totalValueLockedUSD,
                tokens: .tokens,
                stats: .stats,
                apr: (if .stats.feesInUSD != null and .totalValueLockedUSD != null and .stats.rangeInDays != null then
                    ((.stats.feesInUSD | tonumber) * 365) / ((.totalValueLockedUSD | tonumber) * (.stats.rangeInDays | tonumber)) * 100
                else 0 end),
                volume24h: (if .stats.volumeInUSD != null and .stats.rangeInDays != null then
                    (.stats.volumeInUSD | tonumber) / (.stats.rangeInDays | tonumber)
                else 0 end)
            })')
            
            echo -e "\n${YELLOW}📊 MÉTRICAS DAS POOLS (como nas imagens):${NC}"
            
            # Processar cada pool diretamente do JSON original
            for i in $(seq 0 $((pools_count-1))); do
                pool=$(echo "$body" | jq ".pools[$i]" 2>/dev/null)
                if [ "$pool" != "null" ] && [ "$pool" != "" ] && [ "$pool" != "{}" ]; then
                    # Extrair dados básicos
                    pool_id=$(echo "$pool" | jq -r '.id' 2>/dev/null || echo "N/A")
                    address=$(echo "$pool" | jq -r '.address' 2>/dev/null || echo "N/A")
                    chain=$(echo "$pool" | jq -r '.chain.name' 2>/dev/null || echo "N/A")
                    fee=$(echo "$pool" | jq -r '.fee' 2>/dev/null || echo "0")
                    tvl=$(echo "$pool" | jq -r '.totalValueLockedUSD' 2>/dev/null || echo "0")
                    
                    # Extrair estatísticas
                    fees_usd=$(echo "$pool" | jq -r '.stats.feesInUSD' 2>/dev/null || echo "0")
                    volume_usd=$(echo "$pool" | jq -r '.stats.volumeInUSD' 2>/dev/null || echo "0")
                    transactions=$(echo "$pool" | jq -r '.stats.transactionsCount' 2>/dev/null || echo "0")
                    range_days=$(echo "$pool" | jq -r '.stats.rangeInDays' 2>/dev/null || echo "30")
                    
                    # Extrair tokens
                    token1=$(echo "$pool" | jq -r '.tokens[0].symbol' 2>/dev/null || echo "N/A")
                    token2=$(echo "$pool" | jq -r '.tokens[1].symbol' 2>/dev/null || echo "N/A")
                    token1_share=$(echo "$pool" | jq -r '.tokens[0].poolShareInPercentage' 2>/dev/null || echo "0")
                    token2_share=$(echo "$pool" | jq -r '.tokens[1].poolShareInPercentage' 2>/dev/null || echo "0")
                    
                    # Calcular métricas
                    tvl_formatted=$(format_currency "$tvl")
                    fees_formatted=$(format_currency "$fees_usd")
                    volume_formatted=$(format_currency "$volume_usd")
                    
                    # Calcular APR
                    apr=$(calculate_apr "$fees_usd" "$tvl" "$range_days")
                    
                    # Calcular fees 24h (aproximado)
                    fees_24h=$(echo "scale=2; $fees_usd / $range_days" | bc 2>/dev/null || echo "0")
                    volume_24h=$(echo "scale=2; $volume_usd / $range_days" | bc 2>/dev/null || echo "0")
                    
                    # Só mostrar se tem dados válidos
                    if [ "$pool_id" != "N/A" ] && [ "$pool_id" != "null" ]; then
                        echo -e "\n${GREEN}🏊‍♂️ POOL: $pool_id${NC}"
                        echo -e "${BLUE}├─ Par: $token1/$token2${NC}"
                        echo -e "${BLUE}├─ Chain: $chain${NC}"
                        echo -e "${BLUE}├─ Fee: ${fee}%${NC}"
                        echo -e "${BLUE}├─ TVL: \$${tvl_formatted}${NC}"
                        echo -e "${BLUE}├─ Rent. estimada: ${apr}% a.a.${NC}"
                        echo -e "${BLUE}├─ Fees (${range_days}d): \$${fees_formatted}${NC}"
                        echo -e "${BLUE}├─ Fees (24h): \$$(printf "%.2f" $fees_24h)${NC}"
                        echo -e "${BLUE}├─ Volume (${range_days}d): \$${volume_formatted}${NC}"
                        echo -e "${BLUE}├─ Volume (24h): \$$(printf "%.2f" $volume_24h)${NC}"
                        echo -e "${BLUE}├─ Transações: $transactions${NC}"
                        echo -e "${BLUE}├─ Composição: $token1 (${token1_share}%) / $token2 (${token2_share}%)${NC}"
                        echo -e "${BLUE}└─ Endereço: $address${NC}"
                    fi
                fi
            done
            
            # Resumo geral
            echo -e "\n${YELLOW}📈 RESUMO GERAL:${NC}"
            total_tvl=$(echo "$body" | jq '[.pools[].totalValueLockedUSD | tonumber] | add' 2>/dev/null || echo "0")
            total_fees=$(echo "$body" | jq '[.pools[].stats.feesInUSD | tonumber] | add' 2>/dev/null || echo "0")
            total_volume=$(echo "$body" | jq '[.pools[].stats.volumeInUSD | tonumber] | add' 2>/dev/null || echo "0")
            
            echo -e "${GREEN}├─ TVL Total: \$$(printf "%.2f" $total_tvl)${NC}"
            echo -e "${GREEN}├─ Fees Total: \$$(printf "%.2f" $total_fees)${NC}"
            echo -e "${GREEN}└─ Volume Total: \$$(printf "%.2f" $total_volume)${NC}"
            
        else
            echo -e "${RED}Nenhuma pool encontrada${NC}"
        fi
        
    else
        echo -e "${RED}Status: $http_code (ERRO)${NC}"
        echo -e "${RED}Resposta: $body${NC}"
    fi
}

# Função para testar diferentes ranges
test_range() {
    local range_days="$1"
    local test_name="range_${range_days}d"
    local url="${BASE_URL}/liquidity/pools?ids=${POOL_ID}&chainIds=${CHAIN_IDS}&rangeInDays=${range_days}"
    local description="Pool única com ${range_days} dias de histórico"
    local sort_by="${2:-none}"
    local sort_order="${3:-desc}"
    
    test_pool "$test_name" "$url" "$description" "$sort_by" "$sort_order"
}

# Função para testar múltiplas pools
test_multiple_pools() {
    local pool_ids="$1"
    local test_name="$2"
    local description="$3"
    local sort_by="${4:-none}"
    local sort_order="${5:-desc}"
    local url="${BASE_URL}/liquidity/pools?ids=${pool_ids}&chainIds=${CHAIN_IDS}&rangeInDays=365"
    
    test_pool "$test_name" "$url" "$description" "$sort_by" "$sort_order"
}

echo -e "${GREEN}Iniciando testes do endpoint /liquidity/pools${NC}"
echo -e "${GREEN}Data: $(date)${NC}"

# Teste 1: Pool única com diferentes ranges
echo -e "\n${YELLOW}=== TESTE 1: Pool única com diferentes ranges ===${NC}"
test_range 30
test_range 60
test_range 90
test_range 180
test_range 365

# Teste 2: Múltiplas pools
echo -e "\n${YELLOW}=== TESTE 2: Múltiplas pools ===${NC}"
test_multiple_pools "${POOL_ID}&ids=${POOL_ID2}&ids=${POOL_ID3}" "multiple_3" "3 pools simultaneamente"
test_multiple_pools "${POOL_ID}&ids=${POOL_ID2}&ids=${POOL_ID3}&ids=${POOL_ID4}&ids=${POOL_ID5}" "multiple_5" "5 pools simultaneamente"

# Teste 3: Pool com whitelist
echo -e "\n${YELLOW}=== TESTE 3: Pool com whitelist ===${NC}"
url="${BASE_URL}/liquidity/pools?ids=${POOL_ID}&chainIds=${CHAIN_IDS}&filterWhitelist=true&rangeInDays=365"
test_pool "whitelist_true" "$url" "Pool com whitelist ativo"

url="${BASE_URL}/liquidity/pools?ids=${POOL_ID}&chainIds=${CHAIN_IDS}&filterWhitelist=false&rangeInDays=365"
test_pool "whitelist_false" "$url" "Pool sem filtro de whitelist"

# Teste 4: Todas as 5 pools (como nas imagens)
echo -e "\n${YELLOW}=== TESTE 4: TODAS AS 5 POOLS ===${NC}"
test_multiple_pools "${POOL_ID}&ids=${POOL_ID2}&ids=${POOL_ID3}&ids=${POOL_ID4}&ids=${POOL_ID5}" "all_5_pools" "5 pools específicas (como nas imagens)"

echo -e "\n${GREEN}=== TESTES CONCLUÍDOS ===${NC}"
echo -e "${GREEN}Data: $(date)${NC}"
