#!/bin/bash

# Script completo para testar o fluxo KYC + Wallet Integration
# Baseado no guia de testes da documentação

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
NC='\033[0m' # No Color

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
        echo "  ./complete-kyc-flow-test.sh"
        echo ""
        exit 1
    fi
    
    success "API Key configurada: ${API_KEY:0:10}..."
}

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

# Função para fazer requisição com tratamento de erro
make_request() {
    local method="$1"
    local url="$2"
    local data="$3"
    local description="$4"
    
    log "$description" >&2  # Redirecionar log para stderr
    
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
    
    # Debug: mostrar resposta se estiver vazia (mas não é erro para alguns endpoints)
    if [ -z "$response" ]; then
        # Para endpoints que retornam 204 (No Content), resposta vazia é esperada
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

# ETAPA 1: Criar Sessão KYC
create_kyc_session() {
    step "ETAPA 1: Criando sessão KYC..."
    
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
    
    # Debug: mostrar resposta
    info "Resposta da API: ${response:0:100}..."
    
    if [ $request_exit_code -eq 0 ]; then
        SESSION_ID=$(extract_json_value "$response" '.session.id')
        info "SessionId extraído: $SESSION_ID"
        
        if [ "$SESSION_ID" != "null" ] && [ -n "$SESSION_ID" ]; then
            success "Sessão KYC criada: $SESSION_ID"
            
            # Extrair URLs de upload
            FRONT_DOC_URL=$(extract_json_value "$response" '.frontDocumentUpload.url')
            BACK_DOC_URL=$(extract_json_value "$response" '.backDocumentUpload.url')
            
            info "Front Document URL: ${FRONT_DOC_URL:0:50}..."
            info "Back Document URL: ${BACK_DOC_URL:0:50}..."
            
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
        success "Status da sessão: $SESSION_STATUS"
        
        # Mostrar detalhes da sessão
        local createdAt=$(extract_json_value "$response" '.session.createdAt')
        local livenessRequired=$(extract_json_value "$response" '.session.livenessRequired')
        
        info "Criada em: $createdAt"
        info "Liveness necessário: $livenessRequired"
        
        return 0
    else
        error "Falha ao verificar status da sessão"
        return 1
    fi
}

# ETAPA 3: Atualizar Metadados da Wallet
update_wallet_metadata() {
    step "ETAPA 3: Atualizando metadados da wallet..."
    
    local metadata_data="{
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
    
    local response=$(make_request "PATCH" "$API_BASE/wallets/$WALLET_ADDRESS/metadata" "$metadata_data" "Atualizando metadados...")
    
    if [ $? -eq 0 ]; then
        success "Metadados da wallet atualizados"
        return 0
    else
        warning "Não foi possível atualizar metadados (pode ser esperado em ambiente de teste)"
        return 1
    fi
}

# ETAPA 4: Processar Verificação
process_verification() {
    step "ETAPA 4: Processando verificação KYC..."
    
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

# ETAPA 5: Verificar Status Final
check_final_status() {
    step "ETAPA 5: Verificando status final..."
    
    local response=$(make_request "GET" "$API_BASE/kyc/individual-verification-sessions/standard/$SESSION_ID" "" "Verificando status final...")
    
    if [ $? -eq 0 ]; then
        FINAL_STATUS=$(extract_json_value "$response" '.session.status')
        INDIVIDUAL_ID=$(extract_json_value "$response" '.session.individualId')
        
        success "Status final: $FINAL_STATUS"
        
        if [ "$INDIVIDUAL_ID" != "null" ] && [ -n "$INDIVIDUAL_ID" ]; then
            success "Individual ID: $INDIVIDUAL_ID"
            return 0
        else
            warning "Individual ID não disponível - KYC pode não estar completo"
            return 1
        fi
    else
        error "Falha ao verificar status final"
        return 1
    fi
}

# ETAPA 6: Teste de On-Ramp
test_onramp() {
    step "ETAPA 6: Testando on-ramp (depósito fiat)..."
    
    if [ -z "$INDIVIDUAL_ID" ] || [ "$INDIVIDUAL_ID" = "null" ]; then
        warning "Individual ID não disponível - pulando teste de on-ramp"
        return 1
    fi
    
    # Criar quote de depósito
    local deposit_quote_data="{
        \"paymentMethodToSend\": \"PIX\",
        \"receiveCryptoCurrency\": \"USDC\",
        \"amountToSendInFiatCurrency\": 100,
        \"individualId\": \"$INDIVIDUAL_ID\",
        \"walletAddress\": \"$WALLET_ADDRESS\",
        \"chainId\": 137
    }"
    
    local quote_response=$(make_request "POST" "$API_BASE/fiat/deposit/quote" "$deposit_quote_data" "Criando quote de depósito...")
    
    if [ $? -eq 0 ]; then
        QUOTE_ID=$(extract_json_value "$quote_response" '.depositQuote.quoteId')
        
        if [ "$QUOTE_ID" != "null" ] && [ -n "$QUOTE_ID" ]; then
            success "Quote de depósito criado: $QUOTE_ID"
            
            # Criar ordem de depósito
            local order_data="{\"quoteId\": \"$QUOTE_ID\"}"
            local order_response=$(make_request "POST" "$API_BASE/fiat/deposit" "$order_data" "Criando ordem de depósito...")
            
            if [ $? -eq 0 ]; then
                ORDER_ID=$(extract_json_value "$order_response" '.depositOrder.orderId')
                PIX_KEY=$(extract_json_value "$order_response" '.depositOrder.paymentMethodToSendDetails.pixKey')
                
                success "Ordem de depósito criada: $ORDER_ID"
                info "PIX Key: $PIX_KEY"
                
                return 0
            else
                error "Falha ao criar ordem de depósito"
                return 1
            fi
        else
            error "Não foi possível extrair quoteId"
            return 1
        fi
    else
        error "Falha ao criar quote de depósito"
        return 1
    fi
}

# ETAPA 7: Verificar Dados da Wallet
check_wallet_data() {
    step "ETAPA 7: Verificando dados da wallet..."
    
    local response=$(make_request "GET" "$API_BASE/wallets/address?walletAddress=$WALLET_ADDRESS" "" "Verificando dados da wallet...")
    
    if [ $? -eq 0 ]; then
        local registeredAt=$(extract_json_value "$response" '.wallet.registeredAt')
        local walletAddress=$(extract_json_value "$response" '.wallet.walletAddress')
        
        success "Dados da wallet obtidos"
        info "Endereço: $walletAddress"
        
        if [ "$registeredAt" != "null" ]; then
            info "Registrada em: $registeredAt"
        else
            info "Wallet não registrada ainda"
        fi
        
        return 0
    else
        warning "Não foi possível obter dados da wallet (pode não estar registrada)"
        return 1
    fi
}

# Função principal
main() {
    echo ""
    echo -e "${PURPLE}🚀 TESTE COMPLETO DO FLUXO KYC + WALLET INTEGRATION${NC}"
    echo -e "${PURPLE}===================================================${NC}"
    echo ""
    
    # Verificações iniciais
    check_dependencies
    check_api_key
    
    echo ""
    info "Dados de teste:"
    echo "  Nome: $FIRST_NAME $LAST_NAME"
    echo "  Email: $EMAIL"
    echo "  Documento: $DOCUMENT_ID"
    echo "  Wallet: $WALLET_ADDRESS"
    echo ""
    
    # Executar etapas
    local step_count=0
    local success_count=0
    
    # ETAPA 1: Criar Sessão KYC
    if create_kyc_session; then
        ((success_count++))
    fi
    ((step_count++))
    
    # ETAPA 2: Verificar Status
    if check_session_status; then
        ((success_count++))
    fi
    ((step_count++))
    
    # ETAPA 3: Atualizar Metadados
    if update_wallet_metadata; then
        ((success_count++))
    fi
    ((step_count++))
    
    # ETAPA 4: Processar Verificação
    if process_verification; then
        ((success_count++))
    fi
    ((step_count++))
    
    # ETAPA 5: Verificar Status Final
    if check_final_status; then
        ((success_count++))
    fi
    ((step_count++))
    
    # ETAPA 6: Teste de On-Ramp
    if test_onramp; then
        ((success_count++))
    fi
    ((step_count++))
    
    # ETAPA 7: Verificar Dados da Wallet
    if check_wallet_data; then
        ((success_count++))
    fi
    ((step_count++))
    
    # RESUMO FINAL
    echo ""
    echo -e "${PURPLE}📋 RESUMO DO TESTE${NC}"
    echo -e "${PURPLE}==================${NC}"
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
    
    if [ "$QUOTE_ID" != "null" ] && [ -n "$QUOTE_ID" ]; then
        echo "  ✅ Quote ID: $QUOTE_ID"
    fi
    
    if [ "$ORDER_ID" != "null" ] && [ -n "$ORDER_ID" ]; then
        echo "  ✅ Order ID: $ORDER_ID"
    fi
    
    echo ""
    if [ $success_count -eq $step_count ]; then
        success "🎉 TODOS OS TESTES PASSARAM COM SUCESSO!"
    elif [ $success_count -gt $(( step_count / 2 )) ]; then
        warning "⚠️  A maioria dos testes passou, mas alguns falharam"
    else
        error "❌ Muitos testes falharam - verifique a configuração"
    fi
    
    echo ""
    info "📝 Próximos passos:"
    echo "  1. Implementar upload real de documentos"
    echo "  2. Testar com wallet registrada"
    echo "  3. Verificar integração com operações fiat"
    echo "  4. Testar webhooks de notificação"
    echo ""
    
    log "✨ Teste finalizado!"
}

# Executar função principal
main "$@"
