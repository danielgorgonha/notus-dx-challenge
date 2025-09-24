#!/bin/bash

# Script simples para testar APENAS a Etapa 1 do KYC

set -e

# Configurações
API_BASE="https://api.notus.team/api/v1"
API_KEY="${NOTUS_API_KEY}"

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

log() { echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }
info() { echo -e "${CYAN}ℹ️  $1${NC}"; }
step() { echo -e "${PURPLE}🔸 $1${NC}"; }

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

echo "🧪 TESTE SIMPLES - ETAPA 1 KYC"
echo "==============================="
echo ""

# ETAPA 1: Criar Sessão KYC
step "ETAPA 1: Criando sessão KYC (apenas dados pessoais)..."

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

log "Enviando dados para API..."

response=$(curl -s -X POST "$API_BASE/kyc/individual-verification-sessions/standard" \
    -H "Content-Type: application/json" \
    -H "x-api-key: $API_KEY" \
    -d "$kyc_data")

echo "Resposta: $response"

SESSION_ID=$(echo "$response" | jq -r '.session.id')
echo "SessionId: $SESSION_ID"

if [ "$SESSION_ID" != "null" ] && [ -n "$SESSION_ID" ]; then
    success "Sessão KYC criada: $SESSION_ID"
    
    # Extrair informações da sessão
    SESSION_STATUS=$(echo "$response" | jq -r '.session.status')
    SESSION_CREATED=$(echo "$response" | jq -r '.session.createdAt')
    LIVENESS_REQUIRED=$(echo "$response" | jq -r '.session.livenessRequired')
    
    info "Status inicial: $SESSION_STATUS"
    info "Criada em: $SESSION_CREATED"
    info "Liveness necessário: $LIVENESS_REQUIRED"
    
    # Extrair URLs de upload
    FRONT_DOC_URL=$(echo "$response" | jq -r '.frontDocumentUpload.url')
    BACK_DOC_URL=$(echo "$response" | jq -r '.backDocumentUpload.url')
    
    if [ "$FRONT_DOC_URL" != "null" ]; then
        info "Front Document URL: ${FRONT_DOC_URL:0:50}..."
    fi
    
    if [ "$BACK_DOC_URL" != "null" ]; then
        info "Back Document URL: ${BACK_DOC_URL:0:50}..."
    fi
    
    # ETAPA 2: Verificar Status
    step "ETAPA 2: Verificando status da sessão..."
    
    log "Consultando status da sessão..."
    
    status_response=$(curl -s -X GET "$API_BASE/kyc/individual-verification-sessions/standard/$SESSION_ID" \
        -H "x-api-key: $API_KEY")
    
    echo "Status response: $status_response"
    
    SESSION_STATUS=$(echo "$status_response" | jq -r '.session.status')
    INDIVIDUAL_ID=$(echo "$status_response" | jq -r '.session.individualId')
    UPDATED_AT=$(echo "$status_response" | jq -r '.session.updatedAt')
    
    success "Status da sessão: $SESSION_STATUS"
    
    if [ "$INDIVIDUAL_ID" != "null" ] && [ -n "$INDIVIDUAL_ID" ]; then
        info "Individual ID: $INDIVIDUAL_ID"
    else
        info "Individual ID: Ainda não disponível"
    fi
    
    if [ "$UPDATED_AT" != "null" ]; then
        info "Última atualização: $UPDATED_AT"
    fi
    
    # ETAPA 3: Simular Metadados da Wallet
    step "ETAPA 3: Simulando metadados da wallet..."
    
    info "Estrutura de metadados que seria salva na wallet:"
    
    metadata_structure="{
        \"kycStatus\": \"IN_PROGRESS\",
        \"activeKYCSession\": {
            \"sessionId\": \"$SESSION_ID\",
            \"stage\": \"STAGE_1\",
            \"status\": \"$SESSION_STATUS\",
            \"createdAt\": \"$(date -u +%Y-%m-%dT%H:%M:%S.000Z)\",
            \"expiresAt\": \"$(date -u -d '+15 minutes' +%Y-%m-%dT%H:%M:%S.000Z)\",
            \"stage1Data\": {
                \"firstName\": \"$FIRST_NAME\",
                \"lastName\": \"$LAST_NAME\",
                \"birthDate\": \"$BIRTH_DATE\",
                \"documentCategory\": \"$DOCUMENT_CATEGORY\",
                \"documentCountry\": \"$DOCUMENT_COUNTRY\",
                \"documentId\": \"$DOCUMENT_ID\",
                \"nationality\": \"$NATIONALITY\",
                \"email\": \"$EMAIL\",
                \"address\": \"$ADDRESS\",
                \"city\": \"$CITY\",
                \"state\": \"$STATE\",
                \"postalCode\": \"$POSTAL_CODE\"
            }
        },
        \"kycLimits\": {
            \"currentLimit\": 2000.00,
            \"maxLimit\": 50000.00,
            \"currency\": \"BRL\",
            \"stage\": \"1\"
        }
    }"
    
    echo "$metadata_structure" | jq '.' 2>/dev/null || echo "$metadata_structure"
    
    success "Metadados da wallet preparados para Etapa 1"
    info "Limite atual: R$ 2.000,00 (Etapa 1)"
    info "Próximo limite: R$ 50.000,00 (Etapa 2)"
    
    # RESUMO
    echo ""
    echo "📋 RESUMO DO TESTE - ETAPA 1"
    echo "=============================="
    echo ""
    echo "  ✅ Session ID: $SESSION_ID"
    echo "  ✅ Status: $SESSION_STATUS"
    echo "  ✅ Liveness: $LIVENESS_REQUIRED"
    echo "  ✅ Limite: R$ 2.000,00"
    echo ""
    success "🎉 ETAPA 1 TESTADA COM SUCESSO!"
    echo ""
    info "📝 Próximos passos:"
    echo "  1. Etapa 2: Upload de documentos + liveness"
    echo "  2. Processamento completo do KYC"
    echo "  3. Teste de operações fiat"
    echo ""
    info "💡 Para testar Etapa 2, execute:"
    echo "  ./test-kyc-stage2-only.sh"
    
else
    error "Não foi possível extrair sessionId"
    info "Resposta completa: $response"
fi

echo ""
log "✨ Teste da Etapa 1 finalizado!"
