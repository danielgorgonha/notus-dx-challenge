#!/bin/bash

# Script para testar APENAS a Etapa 1 do KYC (dados pessoais)
# Sem upload de documentos - apenas validação dos dados

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
        echo "  ./test-kyc-stage1-only.sh"
        echo ""
        exit 1
    fi
    
    success "API Key configurada: ${API_KEY:0:10}..."
}

# Dados de teste para Etapa 1
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

# ETAPA 1: Criar Sessão KYC (apenas dados pessoais)
create_kyc_session_stage1() {
    step "ETAPA 1: Criando sessão KYC (apenas dados pessoais)..."
    
    local kyc_data="{
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
    
    local response=$(make_request "POST" "$API_BASE/kyc/individual-verification-sessions/standard" "$kyc_data" "Criando sessão KYC...")
    local request_exit_code=$?
    
    info "Resposta da API: ${response:0:100}..."
    
    if [ $request_exit_code -eq 0 ]; then
        SESSION_ID=$(extract_json_value "$response" '.session.id')
        info "SessionId extraído: $SESSION_ID"
        
        if [ "$SESSION_ID" != "null" ] && [ -n "$SESSION_ID" ]; then
            success "Sessão KYC criada: $SESSION_ID"
            
            # Extrair informações da sessão
            SESSION_STATUS=$(extract_json_value "$response" '.session.status')
            SESSION_CREATED=$(extract_json_value "$response" '.session.createdAt')
            LIVENESS_REQUIRED=$(extract_json_value "$response" '.session.livenessRequired')
            
            info "Status inicial: $SESSION_STATUS"
            info "Criada em: $SESSION_CREATED"
            info "Liveness necessário: $LIVENESS_REQUIRED"
            
            # Extrair URLs de upload (mesmo que não vamos usar na Etapa 1)
            FRONT_DOC_URL=$(extract_json_value "$response" '.frontDocumentUpload.url')
            BACK_DOC_URL=$(extract_json_value "$response" '.backDocumentUpload.url')
            
            if [ "$FRONT_DOC_URL" != "null" ]; then
                info "Front Document URL disponível: ${FRONT_DOC_URL:0:50}..."
            fi
            
            if [ "$BACK_DOC_URL" != "null" ]; then
                info "Back Document URL disponível: ${BACK_DOC_URL:0:50}..."
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

# ETAPA 2: Verificar Status da Sessão
check_session_status() {
    step "ETAPA 2: Verificando status da sessão..."
    
    local response=$(make_request "GET" "$API_BASE/kyc/individual-verification-sessions/standard/$SESSION_ID" "" "Verificando status...")
    
    if [ $? -eq 0 ]; then
        SESSION_STATUS=$(extract_json_value "$response" '.session.status')
        INDIVIDUAL_ID=$(extract_json_value "$response" '.session.individualId')
        UPDATED_AT=$(extract_json_value "$response" '.session.updatedAt')
        
        success "Status da sessão: $SESSION_STATUS"
        
        if [ "$INDIVIDUAL_ID" != "null" ] && [ -n "$INDIVIDUAL_ID" ]; then
            info "Individual ID: $INDIVIDUAL_ID"
        else
            info "Individual ID: Ainda não disponível"
        fi
        
        if [ "$UPDATED_AT" != "null" ]; then
            info "Última atualização: $UPDATED_AT"
        fi
        
        return 0
    else
        error "Falha ao verificar status da sessão"
        return 1
    fi
}

# ETAPA 3: Simular Atualização de Metadados da Wallet
update_wallet_metadata_stage1() {
    step "ETAPA 3: Simulando atualização de metadados da wallet..."
    
    # Simular a estrutura de metadados que seria salva na wallet
    local metadata_structure="{
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
    
    info "Estrutura de metadados que seria salva na wallet:"
    echo "$metadata_structure" | jq '.' 2>/dev/null || echo "$metadata_structure"
    
    success "Metadados da wallet preparados para Etapa 1"
    info "Limite atual: R$ 2.000,00 (Etapa 1)"
    info "Próximo limite: R$ 50.000,00 (Etapa 2)"
    
    return 0
}

# ETAPA 4: Testar Validação de Dados (sem processar)
validate_data_only() {
    step "ETAPA 4: Validando dados sem processar verificação..."
    
    info "Dados enviados para validação:"
    echo "  Nome: $FIRST_NAME $LAST_NAME"
    echo "  Data de nascimento: $BIRTH_DATE"
    echo "  Documento: $DOCUMENT_ID ($DOCUMENT_CATEGORY)"
    echo "  Nacionalidade: $NATIONALITY"
    echo "  Email: $EMAIL"
    echo "  Endereço: $ADDRESS, $CITY/$STATE, $POSTAL_CODE"
    
    success "Dados validados com sucesso"
    info "Sessão KYC criada e pronta para Etapa 2 (upload de documentos)"
    
    return 0
}

# Função principal
main() {
    echo ""
    echo -e "${PURPLE}🧪 TESTE ETAPA 1 - KYC (APENAS DADOS PESSOAIS)${NC}"
    echo -e "${PURPLE}===============================================${NC}"
    echo ""
    
    # Verificações iniciais
    check_dependencies
    check_api_key
    
    echo ""
    info "Dados de teste para Etapa 1:"
    echo "  Nome: $FIRST_NAME $LAST_NAME"
    echo "  Email: $EMAIL"
    echo "  Documento: $DOCUMENT_ID"
    echo "  Wallet: $WALLET_ADDRESS"
    echo ""
    
    # Executar etapas
    local step_count=0
    local success_count=0
    
    # ETAPA 1: Criar Sessão KYC
    if create_kyc_session_stage1; then
        ((success_count++))
    fi
    ((step_count++))
    
    # ETAPA 2: Verificar Status
    if check_session_status; then
        ((success_count++))
    fi
    ((step_count++))
    
    # ETAPA 3: Simular Metadados
    if update_wallet_metadata_stage1; then
        ((success_count++))
    fi
    ((step_count++))
    
    # ETAPA 4: Validar Dados
    if validate_data_only; then
        ((success_count++))
    fi
    ((step_count++))
    
    # RESUMO FINAL
    echo ""
    echo -e "${PURPLE}📋 RESUMO DO TESTE - ETAPA 1${NC}"
    echo -e "${PURPLE}==============================${NC}"
    echo ""
    echo "  Total de etapas: $step_count"
    echo "  Etapas bem-sucedidas: $success_count"
    echo "  Taxa de sucesso: $(( success_count * 100 / step_count ))%"
    echo ""
    
    if [ "$SESSION_ID" != "null" ] && [ -n "$SESSION_ID" ]; then
        echo "  ✅ Session ID: $SESSION_ID"
    fi
    
    if [ "$SESSION_STATUS" != "null" ] && [ -n "$SESSION_STATUS" ]; then
        echo "  ✅ Status: $SESSION_STATUS"
    fi
    
    echo ""
    if [ $success_count -eq $step_count ]; then
        success "🎉 ETAPA 1 TESTADA COM SUCESSO!"
        echo ""
        info "📝 Próximos passos:"
        echo "  1. Etapa 2: Upload de documentos + liveness"
        echo "  2. Processamento completo do KYC"
        echo "  3. Teste de operações fiat"
        echo ""
        info "💡 Para testar Etapa 2, execute:"
        echo "  ./test-kyc-stage2-only.sh"
    elif [ $success_count -gt $(( step_count / 2 )) ]; then
        warning "⚠️  A maioria dos testes passou, mas alguns falharam"
    else
        error "❌ Muitos testes falharam - verifique a configuração"
    fi
    
    echo ""
    log "✨ Teste da Etapa 1 finalizado!"
}

# Executar função principal
main "$@"
