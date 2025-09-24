#!/bin/bash

# Script simples para testar APENAS a Etapa 2 do KYC

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

echo "🧪 TESTE SIMPLES - ETAPA 2 KYC"
echo "==============================="
echo ""

# ETAPA 1: Criar Sessão KYC para Etapa 2 (com liveness)
step "ETAPA 1: Criando sessão KYC para Etapa 2 (com liveness)..."

kyc_data="{
    \"firstName\": \"$FIRST_NAME\",
    \"lastName\": \"$LAST_NAME\",
    \"birthDate\": \"$BIRTH_DATE\",
    \"documentCategory\": \"$DOCUMENT_CATEGORY\",
    \"documentCountry\": \"$DOCUMENT_COUNTRY\",
    \"documentId\": \"$DOCUMENT_ID\",
    \"nationality\": \"$NATIONALITY\",
    \"livenessRequired\": true,
    \"email\": \"$EMAIL\",
    \"address\": \"$ADDRESS\",
    \"city\": \"$CITY\",
    \"state\": \"$STATE\",
    \"postalCode\": \"$POSTAL_CODE\"
}"

log "Enviando dados para API (com liveness=true)..."

response=$(curl -s -X POST "$API_BASE/kyc/individual-verification-sessions/standard" \
    -H "Content-Type: application/json" \
    -H "x-api-key: $API_KEY" \
    -d "$kyc_data")

echo "Resposta: $response"

SESSION_ID=$(echo "$response" | jq -r '.session.id')
echo "SessionId: $SESSION_ID"

if [ "$SESSION_ID" != "null" ] && [ -n "$SESSION_ID" ]; then
    success "Sessão KYC Etapa 2 criada: $SESSION_ID"
    
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
        success "Front Document URL: ${FRONT_DOC_URL:0:50}..."
    fi
    
    if [ "$BACK_DOC_URL" != "null" ]; then
        success "Back Document URL: ${BACK_DOC_URL:0:50}..."
    fi
    
    # ETAPA 2: Simular Upload de Documentos
    step "ETAPA 2: Simulando upload de documentos..."
    
    info "Em um teste real, você faria:"
    echo "  1. Upload do documento frontal via URL S3 pré-assinada"
    echo "  2. Upload do documento traseiro (se necessário)"
    echo "  3. Verificação de liveness (se requerida)"
    
    # Criar arquivos de teste
    FRONT_DOC_FILE="/tmp/front_document_test.jpg"
    BACK_DOC_FILE="/tmp/back_document_test.jpg"
    
    # Criar arquivos dummy (1KB cada)
    echo "dummy image content" > "$FRONT_DOC_FILE"
    echo "dummy image content" > "$BACK_DOC_FILE"
    
    info "Arquivos de teste criados:"
    echo "  Front: $FRONT_DOC_FILE"
    echo "  Back: $BACK_DOC_FILE"
    
    info "⚠️  Para teste real, implemente upload usando as URLs S3 pré-assinadas"
    info "URLs disponíveis:"
    if [ "$FRONT_DOC_URL" != "null" ]; then
        echo "  Front: $FRONT_DOC_URL"
    fi
    if [ "$BACK_DOC_URL" != "null" ]; then
        echo "  Back: $BACK_DOC_URL"
    fi
    
    success "Simulação de upload concluída"
    
    # Limpar arquivos de teste
    rm -f "$FRONT_DOC_FILE" "$BACK_DOC_FILE"
    
    # ETAPA 3: Processar Verificação KYC
    step "ETAPA 3: Processando verificação KYC..."
    
    log "Processando verificação..."
    
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
    step "ETAPA 4: Verificando status final..."
    
    log "Consultando status final..."
    
    final_response=$(curl -s -X GET "$API_BASE/kyc/individual-verification-sessions/standard/$SESSION_ID" \
        -H "x-api-key: $API_KEY")
    
    echo "Final response: $final_response"
    
    FINAL_STATUS=$(echo "$final_response" | jq -r '.session.status')
    INDIVIDUAL_ID=$(echo "$final_response" | jq -r '.session.individualId')
    UPDATED_AT=$(echo "$final_response" | jq -r '.session.updatedAt')
    
    success "Status final: $FINAL_STATUS"
    
    if [ "$INDIVIDUAL_ID" != "null" ] && [ -n "$INDIVIDUAL_ID" ]; then
        success "Individual ID: $INDIVIDUAL_ID"
        KYC_APPROVED=true
    else
        info "Individual ID: Ainda não disponível"
        KYC_APPROVED=false
    fi
    
    if [ "$UPDATED_AT" != "null" ]; then
        info "Última atualização: $UPDATED_AT"
    fi
    
    # ETAPA 5: Atualizar Metadados da Wallet
    step "ETAPA 5: Atualizando metadados da wallet..."
    
    if [ "$KYC_APPROVED" = true ]; then
        # KYC aprovado - mover para histórico e atualizar limites
        info "KYC APROVADO! Atualizando metadados para Etapa 2"
        
        metadata_structure="{
            \"kycStatus\": \"COMPLETED\",
            \"activeKYCSession\": null,
            \"kycSessions\": [
                {
                    \"sessionId\": \"$SESSION_ID\",
                    \"stage\": \"STAGE_2\",
                    \"status\": \"COMPLETED\",
                    \"completedAt\": \"$(date -u +%Y-%m-%dT%H:%M:%S.000Z)\",
                    \"individualId\": \"$INDIVIDUAL_ID\"
                }
            ],
            \"kycLimits\": {
                \"currentLimit\": 50000.00,
                \"maxLimit\": 50000.00,
                \"currency\": \"BRL\",
                \"stage\": \"2\"
            }
        }"
        
        success "Limite atual: R$ 50.000,00 (Etapa 2)"
        info "Individual ID: $INDIVIDUAL_ID"
    else
        # KYC falhou - manter em progresso
        info "KYC não aprovado ainda. Mantendo limites da Etapa 1"
        
        metadata_structure="{
            \"kycStatus\": \"IN_PROGRESS\",
            \"activeKYCSession\": {
                \"sessionId\": \"$SESSION_ID\",
                \"stage\": \"STAGE_2\",
                \"status\": \"$FINAL_STATUS\",
                \"createdAt\": \"$(date -u +%Y-%m-%dT%H:%M:%S.000Z)\",
                \"expiresAt\": \"$(date -u -d '+15 minutes' +%Y-%m-%dT%H:%M:%S.000Z)\"
            },
            \"kycLimits\": {
                \"currentLimit\": 2000.00,
                \"maxLimit\": 50000.00,
                \"currency\": \"BRL\",
                \"stage\": \"1\"
            }
        }"
        
        info "Status: $FINAL_STATUS"
        info "Limite atual: R$ 2.000,00 (Etapa 1)"
    fi
    
    info "Estrutura de metadados:"
    echo "$metadata_structure" | jq '.' 2>/dev/null || echo "$metadata_structure"
    
    # RESUMO
    echo ""
    echo "📋 RESUMO DO TESTE - ETAPA 2"
    echo "=============================="
    echo ""
    echo "  ✅ Session ID: $SESSION_ID"
    echo "  ✅ Status final: $FINAL_STATUS"
    echo "  ✅ Liveness: $LIVENESS_REQUIRED"
    
    if [ "$KYC_APPROVED" = true ]; then
        echo "  ✅ Individual ID: $INDIVIDUAL_ID"
        echo "  ✅ Limite: R$ 50.000,00"
        echo ""
        success "🎉 ETAPA 2 TESTADA COM SUCESSO - KYC APROVADO!"
        echo ""
        info "📝 Próximos passos:"
        echo "  1. Testar operações fiat (on-ramp/off-ramp)"
        echo "  2. Implementar webhooks de notificação"
        echo "  3. Testar limites de transação"
    else
        echo "  ⚠️  Individual ID: Não disponível"
        echo "  ⚠️  Limite: R$ 2.000,00 (mantido da Etapa 1)"
        echo ""
        info "⚠️  ETAPA 2 TESTADA - KYC NÃO APROVADO AINDA"
        echo ""
        info "📝 KYC não foi aprovado ainda:"
        echo "  1. Verificar se documentos foram enviados corretamente"
        echo "  2. Aguardar processamento manual (se necessário)"
        echo "  3. Tentar novamente com documentos válidos"
    fi
    
else
    error "Não foi possível extrair sessionId"
    info "Resposta completa: $response"
fi

echo ""
log "✨ Teste da Etapa 2 finalizado!"
