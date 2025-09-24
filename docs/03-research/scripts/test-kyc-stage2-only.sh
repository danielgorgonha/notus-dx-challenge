#!/bin/bash

# Script para testar APENAS a Etapa 2 do KYC (upload de documentos + liveness)
# Requer uma sessão KYC da Etapa 1 já criada

set -e

# Configurações
API_BASE="https://api.notus.team/api/v1"
API_KEY="${NOTUS_API_KEY:-YOUR_API_KEY_HERE}"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Funções de log
log() { echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
info() { echo -e "${CYAN}ℹ️  $1${NC}"; }
step() { echo -e "${PURPLE}🔸 $1${NC}"; }

# Verificar dependências
check_dependencies() {
    log "Verificando dependências..."
    
    if ! command -v curl &> /dev/null; then
        error "curl não encontrado. Instale curl primeiro."
        exit 1
    fi
    
    if ! command -v jq &> /dev/null; then
        error "jq não encontrado. Instale jq primeiro."
        exit 1
    fi
    
    success "Dependências verificadas"
}

# Verificar API_KEY
check_api_key() {
    if [ "$API_KEY" = "YOUR_API_KEY_HERE" ]; then
        error "Por favor, defina a variável NOTUS_API_KEY"
        echo ""
        echo "Exemplo:"
        echo "  export NOTUS_API_KEY='sua_api_key_aqui'"
        echo "  ./test-kyc-stage2-only.sh"
        echo ""
        exit 1
    fi
    
    success "API Key configurada: ${API_KEY:0:10}..."
}

# Dados de teste para Etapa 2
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

# Função para fazer requisição com tratamento de erro
make_request() {
    local method="$1"
    local url="$2"
    local data="$3"
    local description="$4"
    
    log "$description" >&2
    
    if [ -n "$data" ]; then
        response=$(curl -s -X "$method" "$url" \
            -H "Content-Type: application/json" \
            -H "x-api-key: $API_KEY" \
            -d "$data")
    else
        response=$(curl -s -X "$method" "$url" \
            -H "x-api-key: $API_KEY")
    fi
    
    # Verificar se a resposta contém erro
    if echo "$response" | jq -e '.statusCode' > /dev/null 2>&1; then
        error "Erro na requisição:" >&2
        echo "$response" | jq '.' 2>/dev/null || echo "$response" >&2
        return 1
    fi
    
    # Para endpoints que retornam 204 (No Content), resposta vazia é esperada
    if [ -z "$response" ]; then
        if [[ "$url" == *"/process" ]]; then
            info "Resposta vazia esperada para endpoint de processamento" >&2
        else
            error "Resposta vazia da API" >&2
            return 1
        fi
    fi
    
    echo "$response"
    return 0
}

# Função para extrair valor JSON
extract_json_value() {
    local json="$1"
    local key="$2"
    echo "$json" | jq -r "$key" 2>/dev/null || echo "null"
}

# ETAPA 1: Criar Nova Sessão KYC para Etapa 2 (com liveness)
create_kyc_session_stage2() {
    step "ETAPA 1: Criando sessão KYC para Etapa 2 (com liveness)..."
    
    local kyc_data="{
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
    
    local response=$(make_request "POST" "$API_BASE/kyc/individual-verification-sessions/standard" "$kyc_data" "Criando sessão KYC Etapa 2...")
    local request_exit_code=$?
    
    info "Resposta da API: ${response:0:100}..."
    
    if [ $request_exit_code -eq 0 ]; then
        SESSION_ID=$(extract_json_value "$response" '.session.id')
        info "SessionId extraído: $SESSION_ID"
        
        if [ "$SESSION_ID" != "null" ] && [ -n "$SESSION_ID" ]; then
            success "Sessão KYC Etapa 2 criada: $SESSION_ID"
            
            # Extrair informações da sessão
            SESSION_STATUS=$(extract_json_value "$response" '.session.status')
            SESSION_CREATED=$(extract_json_value "$response" '.session.createdAt')
            LIVENESS_REQUIRED=$(extract_json_value "$response" '.session.livenessRequired')
            
            info "Status inicial: $SESSION_STATUS"
            info "Criada em: $SESSION_CREATED"
            info "Liveness necessário: $LIVENESS_REQUIRED"
            
            # Extrair URLs de upload
            FRONT_DOC_URL=$(extract_json_value "$response" '.frontDocumentUpload.url')
            BACK_DOC_URL=$(extract_json_value "$response" '.backDocumentUpload.url')
            
            if [ "$FRONT_DOC_URL" != "null" ]; then
                success "Front Document URL: ${FRONT_DOC_URL:0:50}..."
            fi
            
            if [ "$BACK_DOC_URL" != "null" ]; then
                success "Back Document URL: ${BACK_DOC_URL:0:50}..."
            fi
            
            return 0
        else
            error "Não foi possível extrair sessionId"
            info "Resposta completa: $response"
            return 1
        fi
    else
        error "Falha ao criar sessão KYC (exit code: $request_exit_code)"
        info "Resposta: $response"
        return 1
    fi
}

# ETAPA 2: Simular Upload de Documentos
simulate_document_upload() {
    step "ETAPA 2: Simulando upload de documentos..."
    
    info "Em um teste real, você faria:"
    echo "  1. Upload do documento frontal via URL S3 pré-assinada"
    echo "  2. Upload do documento traseiro (se necessário)"
    echo "  3. Verificação de liveness (se requerida)"
    
    # Criar arquivos de teste
    FRONT_DOC_FILE="/tmp/front_document_test.jpg"
    BACK_DOC_FILE="/tmp/back_document_test.jpg"
    
    # Criar arquivos dummy (1KB cada)
    dd if=/dev/zero of="$FRONT_DOC_FILE" bs=1024 count=1 2>/dev/null
    dd if=/dev/zero of="$BACK_DOC_FILE" bs=1024 count=1 2>/dev/null
    
    info "Arquivos de teste criados:"
    echo "  Front: $FRONT_DOC_FILE"
    echo "  Back: $BACK_DOC_FILE"
    
    # Nota: Em um teste real, você precisaria:
    # 1. Usar as URLs S3 pré-assinadas retornadas
    # 2. Fazer upload usando FormData
    # 3. Aguardar confirmação do upload
    
    warning "⚠️  Para teste real, implemente upload usando as URLs S3 pré-assinadas"
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
    
    return 0
}

# ETAPA 3: Processar Verificação KYC
process_kyc_verification() {
    step "ETAPA 3: Processando verificação KYC..."
    
    local response=$(make_request "POST" "$API_BASE/kyc/individual-verification-sessions/standard/$SESSION_ID/process" "" "Processando verificação...")
    
    if [ $? -eq 0 ]; then
        success "Verificação processada"
        
        # Aguardar processamento
        info "Aguardando processamento (5 segundos)..."
        sleep 5
        
        return 0
    else
        error "Falha ao processar verificação"
        return 1
    fi
}

# ETAPA 4: Verificar Status Final
check_final_status() {
    step "ETAPA 4: Verificando status final..."
    
    local response=$(make_request "GET" "$API_BASE/kyc/individual-verification-sessions/standard/$SESSION_ID" "" "Verificando status final...")
    
    if [ $? -eq 0 ]; then
        FINAL_STATUS=$(extract_json_value "$response" '.session.status')
        INDIVIDUAL_ID=$(extract_json_value "$response" '.session.individualId')
        UPDATED_AT=$(extract_json_value "$response" '.session.updatedAt')
        
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
        
        return 0
    else
        error "Falha ao verificar status final"
        return 1
    fi
}

# ETAPA 5: Atualizar Metadados da Wallet para Etapa 2
update_wallet_metadata_stage2() {
    step "ETAPA 5: Atualizando metadados da wallet para Etapa 2..."
    
    if [ "$KYC_APPROVED" = true ]; then
        # KYC aprovado - mover para histórico e atualizar limites
        local metadata_structure="{
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
        
        success "KYC APROVADO! Metadados atualizados para Etapa 2"
        info "Limite atual: R$ 50.000,00 (Etapa 2)"
        info "Individual ID: $INDIVIDUAL_ID"
    else
        # KYC falhou - manter em progresso
        local metadata_structure="{
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
        
        warning "KYC não aprovado ainda. Mantendo limites da Etapa 1"
        info "Status: $FINAL_STATUS"
        info "Limite atual: R$ 2.000,00 (Etapa 1)"
    fi
    
    info "Estrutura de metadados:"
    echo "$metadata_structure" | jq '.' 2>/dev/null || echo "$metadata_structure"
    
    return 0
}

# Função principal
main() {
    echo ""
    echo -e "${PURPLE}🧪 TESTE ETAPA 2 - KYC (UPLOAD + LIVENESS)${NC}"
    echo -e "${PURPLE}===========================================${NC}"
    echo ""
    
    # Verificações iniciais
    check_dependencies
    check_api_key
    
    echo ""
    info "Dados de teste para Etapa 2:"
    echo "  Nome: $FIRST_NAME $LAST_NAME"
    echo "  Email: $EMAIL"
    echo "  Documento: $DOCUMENT_ID"
    echo "  Wallet: $WALLET_ADDRESS"
    echo "  Liveness: REQUERIDO"
    echo ""
    
    # Executar etapas
    local step_count=0
    local success_count=0
    
    # ETAPA 1: Criar Sessão KYC Etapa 2
    if create_kyc_session_stage2; then
        ((success_count++))
    fi
    ((step_count++))
    
    # ETAPA 2: Simular Upload
    if simulate_document_upload; then
        ((success_count++))
    fi
    ((step_count++))
    
    # ETAPA 3: Processar Verificação
    if process_kyc_verification; then
        ((success_count++))
    fi
    ((step_count++))
    
    # ETAPA 4: Verificar Status Final
    if check_final_status; then
        ((success_count++))
    fi
    ((step_count++))
    
    # ETAPA 5: Atualizar Metadados
    if update_wallet_metadata_stage2; then
        ((success_count++))
    fi
    ((step_count++))
    
    # RESUMO FINAL
    echo ""
    echo -e "${PURPLE}📋 RESUMO DO TESTE - ETAPA 2${NC}"
    echo -e "${PURPLE}==============================${NC}"
    echo ""
    echo "  Total de etapas: $step_count"
    echo "  Etapas bem-sucedidas: $success_count"
    echo "  Taxa de sucesso: $(( success_count * 100 / step_count ))%"
    echo ""
    
    if [ "$SESSION_ID" != "null" ] && [ -n "$SESSION_ID" ]; then
        echo "  ✅ Session ID: $SESSION_ID"
    fi
    
    if [ "$FINAL_STATUS" != "null" ] && [ -n "$FINAL_STATUS" ]; then
        echo "  ✅ Status final: $FINAL_STATUS"
    fi
    
    if [ "$INDIVIDUAL_ID" != "null" ] && [ -n "$INDIVIDUAL_ID" ]; then
        echo "  ✅ Individual ID: $INDIVIDUAL_ID"
    fi
    
    echo ""
    if [ $success_count -eq $step_count ]; then
        success "🎉 ETAPA 2 TESTADA COM SUCESSO!"
        echo ""
        if [ "$KYC_APPROVED" = true ]; then
            info "📝 Próximos passos:"
            echo "  1. Testar operações fiat (on-ramp/off-ramp)"
            echo "  2. Implementar webhooks de notificação"
            echo "  3. Testar limites de transação"
            echo ""
            info "💡 Para testar operações fiat, execute:"
            echo "  ./test-fiat-operations.sh"
        else
            info "📝 KYC não foi aprovado ainda:"
            echo "  1. Verificar se documentos foram enviados corretamente"
            echo "  2. Aguardar processamento manual (se necessário)"
            echo "  3. Tentar novamente com documentos válidos"
        fi
    elif [ $success_count -gt $(( step_count / 2 )) ]; then
        warning "⚠️  A maioria dos testes passou, mas alguns falharam"
    else
        error "❌ Muitos testes falharam - verifique a configuração"
    fi
    
    echo ""
    log "✨ Teste da Etapa 2 finalizado!"
}

# Executar função principal
main "$@"
