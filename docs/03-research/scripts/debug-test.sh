#!/bin/bash

# Script de debug para testar o fluxo KYC

set -e

# Configurações
API_BASE="https://api.notus.team/api/v1"
API_KEY="${NOTUS_API_KEY}"

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }
info() { echo -e "${YELLOW}ℹ️  $1${NC}"; }

# Dados de teste
FIRST_NAME="João"
LAST_NAME="Silva Santos"
BIRTH_DATE="1990-03-15"
DOCUMENT_CATEGORY="PASSPORT"
DOCUMENT_COUNTRY="BRAZIL"
DOCUMENT_ID="12345678901"
NATIONALITY="BRAZILIAN"
EMAIL="joao.silva@teste.com"
ADDRESS="Rua das Flores, 123, Apto 45"
CITY="São Paulo"
STATE="SP"
POSTAL_CODE="01234-567"
WALLET_ADDRESS="0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"

echo "🚀 TESTE DE DEBUG - FLUXO KYC"
echo "=============================="
echo ""

# ETAPA 1: Criar Sessão KYC
log "ETAPA 1: Criando sessão KYC..."

kyc_data="{
    \"firstName\": \"$FIRST_NAME\",
    \"lastName\": \"$LAST_NAME\",
    \"birthDate\": \"$BIRTH_DATE\",
    \"documentCategory\": \"$DOCUMENT_CATEGORY\",
    \"documentCountry\": \"$DOCUMENT_COUNTRY\",
    \"documentId\": \"$DOCUMENT_ID\",
    \"nationality\": \"$NATIONALITY\",
    \"livenessRequired\": false,
    \"email\": \"$EMAIL\",
    \"address\": \"$ADDRESS\",
    \"city\": \"$CITY\",
    \"state\": \"$STATE\",
    \"postalCode\": \"$POSTAL_CODE\"
}"

response=$(curl -s -X POST "$API_BASE/kyc/individual-verification-sessions/standard" \
    -H "Content-Type: application/json" \
    -H "x-api-key: $API_KEY" \
    -d "$kyc_data")

echo "Resposta: $response"

SESSION_ID=$(echo "$response" | jq -r '.session.id')
echo "SessionId: $SESSION_ID"

if [ "$SESSION_ID" != "null" ] && [ -n "$SESSION_ID" ]; then
    success "Sessão KYC criada: $SESSION_ID"
    
    # ETAPA 2: Verificar Status
    log "ETAPA 2: Verificando status da sessão..."
    
    status_response=$(curl -s -X GET "$API_BASE/kyc/individual-verification-sessions/standard/$SESSION_ID" \
        -H "x-api-key: $API_KEY")
    
    echo "Status response: $status_response"
    
    SESSION_STATUS=$(echo "$status_response" | jq -r '.session.status')
    echo "Status: $SESSION_STATUS"
    
    if [ "$SESSION_STATUS" != "null" ]; then
        success "Status da sessão: $SESSION_STATUS"
        
        # ETAPA 3: Processar Verificação
        log "ETAPA 3: Processando verificação KYC..."
        
        process_response=$(curl -s -X POST "$API_BASE/kyc/individual-verification-sessions/standard/$SESSION_ID/process" \
            -H "x-api-key: $API_KEY")
        
        echo "Process response: '$process_response'"
        echo "Process response length: ${#process_response}"
        
        if [ ${#process_response} -eq 0 ]; then
            success "Verificação processada (resposta vazia esperada)"
        else
            info "Resposta do processamento: $process_response"
        fi
        
        # Aguardar processamento
        log "Aguardando processamento (5 segundos)..."
        sleep 5
        
        # ETAPA 4: Verificar Status Final
        log "ETAPA 4: Verificando status final..."
        
        final_response=$(curl -s -X GET "$API_BASE/kyc/individual-verification-sessions/standard/$SESSION_ID" \
            -H "x-api-key: $API_KEY")
        
        echo "Final response: $final_response"
        
        FINAL_STATUS=$(echo "$final_response" | jq -r '.session.status')
        INDIVIDUAL_ID=$(echo "$final_response" | jq -r '.session.individualId')
        
        echo "Final status: $FINAL_STATUS"
        echo "Individual ID: $INDIVIDUAL_ID"
        
        if [ "$FINAL_STATUS" != "null" ]; then
            success "Status final: $FINAL_STATUS"
            
            if [ "$INDIVIDUAL_ID" != "null" ] && [ -n "$INDIVIDUAL_ID" ]; then
                success "Individual ID: $INDIVIDUAL_ID"
                
                # ETAPA 5: Teste de On-Ramp
                log "ETAPA 5: Testando on-ramp (depósito fiat)..."
                
                deposit_quote_data="{
                    \"paymentMethodToSend\": \"PIX\",
                    \"receiveCryptoCurrency\": \"USDC\",
                    \"amountToSendInFiatCurrency\": 100,
                    \"individualId\": \"$INDIVIDUAL_ID\",
                    \"walletAddress\": \"$WALLET_ADDRESS\",
                    \"chainId\": 137
                }"
                
                quote_response=$(curl -s -X POST "$API_BASE/fiat/deposit/quote" \
                    -H "Content-Type: application/json" \
                    -H "x-api-key: $API_KEY" \
                    -d "$deposit_quote_data")
                
                echo "Quote response: $quote_response"
                
                QUOTE_ID=$(echo "$quote_response" | jq -r '.depositQuote.quoteId')
                echo "Quote ID: $QUOTE_ID"
                
                if [ "$QUOTE_ID" != "null" ] && [ -n "$QUOTE_ID" ]; then
                    success "Quote de depósito criado: $QUOTE_ID"
                    
                    # Criar ordem de depósito
                    log "Criando ordem de depósito..."
                    
                    order_data="{\"quoteId\": \"$QUOTE_ID\"}"
                    order_response=$(curl -s -X POST "$API_BASE/fiat/deposit" \
                        -H "Content-Type: application/json" \
                        -H "x-api-key: $API_KEY" \
                        -d "$order_data")
                    
                    echo "Order response: $order_response"
                    
                    ORDER_ID=$(echo "$order_response" | jq -r '.depositOrder.orderId')
                    PIX_KEY=$(echo "$order_response" | jq -r '.depositOrder.paymentMethodToSendDetails.pixKey')
                    
                    echo "Order ID: $ORDER_ID"
                    echo "PIX Key: $PIX_KEY"
                    
                    if [ "$ORDER_ID" != "null" ] && [ -n "$ORDER_ID" ]; then
                        success "Ordem de depósito criada: $ORDER_ID"
                        
                        echo ""
                        success "🎉 TODOS OS TESTES PASSARAM COM SUCESSO!"
                        echo ""
                        echo "📋 RESUMO:"
                        echo "  ✅ Session ID: $SESSION_ID"
                        echo "  ✅ Status final: $FINAL_STATUS"
                        echo "  ✅ Individual ID: $INDIVIDUAL_ID"
                        echo "  ✅ Quote ID: $QUOTE_ID"
                        echo "  ✅ Order ID: $ORDER_ID"
                    else
                        error "Falha ao criar ordem de depósito"
                    fi
                else
                    error "Não foi possível extrair quoteId"
                fi
            else
                info "Individual ID não disponível - KYC pode não estar completo"
            fi
        else
            error "Falha ao verificar status final"
        fi
    else
        error "Falha ao verificar status da sessão"
    fi
else
    error "Não foi possível extrair sessionId"
fi

echo ""
log "Teste finalizado!"
