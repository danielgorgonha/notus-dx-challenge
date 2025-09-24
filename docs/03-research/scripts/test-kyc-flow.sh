#!/bin/bash

# Script para testar o fluxo completo de KYC
# Testa: Criação de sessão -> Upload de documentos -> Processamento -> Verificação de status

set -e

# Configurações
API_BASE="https://api.notus.team/api/v1"
API_KEY="${NOTUS_API_KEY:-YOUR_API_KEY_HERE}"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Verificar se API_KEY está definida
if [ "$API_KEY" = "YOUR_API_KEY_HERE" ]; then
    error "Por favor, defina a variável NOTUS_API_KEY"
    echo "Exemplo: export NOTUS_API_KEY='sua_api_key_aqui'"
    exit 1
fi

log "🚀 Iniciando teste do fluxo KYC completo"
log "API Base: $API_BASE"
log "API Key: ${API_KEY:0:10}..."

# Dados de teste para Etapa 1
FIRST_NAME="João"
LAST_NAME="Silva Santos"
BIRTH_DATE="1990-03-15"
DOCUMENT_CATEGORY="PASSPORT"
DOCUMENT_COUNTRY="BRAZIL"
DOCUMENT_ID="12345678901"
NATIONALITY="BRAZILIAN"
EMAIL="joao.silva@email.com"
ADDRESS="Rua das Flores, 123, Apto 45"
CITY="São Paulo"
STATE="SP"
POSTAL_CODE="01234-567"

# Wallet de teste (você pode alterar)
WALLET_ADDRESS="0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"

echo ""
log "📋 Dados de teste:"
echo "  Nome: $FIRST_NAME $LAST_NAME"
echo "  Email: $EMAIL"
echo "  Documento: $DOCUMENT_ID"
echo "  Wallet: $WALLET_ADDRESS"
echo ""

# =============================================================================
# ETAPA 1: Criar Sessão KYC
# =============================================================================

log "🔐 ETAPA 1: Criando sessão KYC..."

KYC_SESSION_RESPONSE=$(curl -s -X POST "$API_BASE/kyc/individual-verification-sessions/standard" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d "{
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
  }")

# Verificar se a resposta contém erro
if echo "$KYC_SESSION_RESPONSE" | grep -q '"statusCode"'; then
    error "Erro ao criar sessão KYC:"
    echo "$KYC_SESSION_RESPONSE" | jq '.' 2>/dev/null || echo "$KYC_SESSION_RESPONSE"
    exit 1
fi

# Extrair sessionId
SESSION_ID=$(echo "$KYC_SESSION_RESPONSE" | jq -r '.session.id' 2>/dev/null)

if [ "$SESSION_ID" = "null" ] || [ -z "$SESSION_ID" ]; then
    error "Não foi possível extrair sessionId da resposta:"
    echo "$KYC_SESSION_RESPONSE"
    exit 1
fi

success "Sessão KYC criada com sucesso!"
echo "  Session ID: $SESSION_ID"

# Extrair URLs de upload
FRONT_DOCUMENT_URL=$(echo "$KYC_SESSION_RESPONSE" | jq -r '.frontDocument.url' 2>/dev/null)
BACK_DOCUMENT_URL=$(echo "$KYC_SESSION_RESPONSE" | jq -r '.backDocument.url' 2>/dev/null)

echo "  Front Document URL: ${FRONT_DOCUMENT_URL:0:50}..."
echo "  Back Document URL: ${BACK_DOCUMENT_URL:0:50}..."

# =============================================================================
# ETAPA 2: Verificar Status da Sessão
# =============================================================================

echo ""
log "📊 ETAPA 2: Verificando status da sessão..."

SESSION_STATUS_RESPONSE=$(curl -s -X GET "$API_BASE/kyc/individual-verification-sessions/standard/$SESSION_ID" \
  -H "x-api-key: $API_KEY")

if echo "$SESSION_STATUS_RESPONSE" | grep -q '"statusCode"'; then
    error "Erro ao verificar status da sessão:"
    echo "$SESSION_STATUS_RESPONSE" | jq '.' 2>/dev/null || echo "$SESSION_STATUS_RESPONSE"
    exit 1
fi

SESSION_STATUS=$(echo "$SESSION_STATUS_RESPONSE" | jq -r '.session.status' 2>/dev/null)
success "Status da sessão: $SESSION_STATUS"

# =============================================================================
# ETAPA 3: Atualizar Metadados da Wallet (Simulação)
# =============================================================================

echo ""
log "💾 ETAPA 3: Simulando atualização de metadados da wallet..."

# Nota: Este endpoint pode não existir ou ter permissões diferentes
# Vamos tentar, mas não falhar se der erro
WALLET_METADATA_RESPONSE=$(curl -s -X PATCH "$API_BASE/wallets/$WALLET_ADDRESS/metadata" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d "{
    \"kycStatus\": \"IN_PROGRESS\",
    \"activeKYCSession\": {
      \"sessionId\": \"$SESSION_ID\",
      \"stage\": \"STAGE_1\",
      \"status\": \"$SESSION_STATUS\",
      \"createdAt\": \"$(date -u +%Y-%m-%dT%H:%M:%S.000Z)\",
      \"expiresAt\": \"$(date -u -d '+15 minutes' +%Y-%m-%dT%H:%M:%S.000Z)\"
    },
    \"kycLimits\": {
      \"currentLimit\": 2000.00,
      \"maxLimit\": 50000.00,
      \"currency\": \"BRL\",
      \"stage\": \"1\"
    }
  }" 2>/dev/null || echo "{\"error\": \"Endpoint não disponível ou sem permissão\"}")

if echo "$WALLET_METADATA_RESPONSE" | grep -q '"error"'; then
    warning "Não foi possível atualizar metadados da wallet (esperado em ambiente de teste)"
    echo "  Resposta: $WALLET_METADATA_RESPONSE"
else
    success "Metadados da wallet atualizados com sucesso!"
fi

# =============================================================================
# ETAPA 4: Simular Upload de Documentos
# =============================================================================

echo ""
log "📄 ETAPA 4: Simulando upload de documentos..."

# Criar arquivos de teste (imagens dummy)
FRONT_DOC_FILE="/tmp/front_document.jpg"
BACK_DOC_FILE="/tmp/back_document.jpg"

# Criar arquivos dummy (1KB cada)
dd if=/dev/zero of="$FRONT_DOC_FILE" bs=1024 count=1 2>/dev/null
dd if=/dev/zero of="$BACK_DOC_FILE" bs=1024 count=1 2>/dev/null

warning "Nota: Em um teste real, você precisaria:"
echo "  1. Criar imagens reais dos documentos"
echo "  2. Usar as URLs S3 pré-assinadas retornadas na criação da sessão"
echo "  3. Fazer upload usando FormData com os campos corretos"

# =============================================================================
# ETAPA 5: Processar Verificação
# =============================================================================

echo ""
log "⚙️  ETAPA 5: Processando verificação KYC..."

PROCESS_RESPONSE=$(curl -s -X POST "$API_BASE/kyc/individual-verification-sessions/standard/$SESSION_ID/process" \
  -H "x-api-key: $API_KEY")

if echo "$PROCESS_RESPONSE" | grep -q '"statusCode"'; then
    error "Erro ao processar verificação:"
    echo "$PROCESS_RESPONSE" | jq '.' 2>/dev/null || echo "$PROCESS_RESPONSE"
    exit 1
fi

success "Verificação processada com sucesso!"

# =============================================================================
# ETAPA 6: Verificar Status Final
# =============================================================================

echo ""
log "🔍 ETAPA 6: Verificando status final..."

# Aguardar um pouco para o processamento
sleep 3

FINAL_STATUS_RESPONSE=$(curl -s -X GET "$API_BASE/kyc/individual-verification-sessions/standard/$SESSION_ID" \
  -H "x-api-key: $API_KEY")

if echo "$FINAL_STATUS_RESPONSE" | grep -q '"statusCode"'; then
    error "Erro ao verificar status final:"
    echo "$FINAL_STATUS_RESPONSE" | jq '.' 2>/dev/null || echo "$FINAL_STATUS_RESPONSE"
    exit 1
fi

FINAL_STATUS=$(echo "$FINAL_STATUS_RESPONSE" | jq -r '.session.status' 2>/dev/null)
INDIVIDUAL_ID=$(echo "$FINAL_STATUS_RESPONSE" | jq -r '.session.individualId' 2>/dev/null)

success "Status final: $FINAL_STATUS"
if [ "$INDIVIDUAL_ID" != "null" ] && [ -n "$INDIVIDUAL_ID" ]; then
    success "Individual ID: $INDIVIDUAL_ID"
fi

# =============================================================================
# ETAPA 7: Testar Endpoints de Wallet
# =============================================================================

echo ""
log "👛 ETAPA 7: Testando endpoints de wallet..."

# Buscar dados da wallet
WALLET_RESPONSE=$(curl -s -X GET "$API_BASE/wallets/address?walletAddress=$WALLET_ADDRESS" \
  -H "x-api-key: $API_KEY")

if echo "$WALLET_RESPONSE" | grep -q '"statusCode"'; then
    warning "Erro ao buscar dados da wallet (pode não estar registrada):"
    echo "$WALLET_RESPONSE" | jq '.' 2>/dev/null || echo "$WALLET_RESPONSE"
else
    success "Dados da wallet obtidos com sucesso!"
    WALLET_REGISTERED=$(echo "$WALLET_RESPONSE" | jq -r '.wallet.registeredAt' 2>/dev/null)
    if [ "$WALLET_REGISTERED" != "null" ]; then
        echo "  Registrada em: $WALLET_REGISTERED"
    else
        echo "  Wallet não registrada ainda"
    fi
fi

# =============================================================================
# RESUMO FINAL
# =============================================================================

echo ""
log "📋 RESUMO DO TESTE:"
echo "  ✅ Sessão KYC criada: $SESSION_ID"
echo "  ✅ Status inicial: $SESSION_STATUS"
echo "  ✅ Verificação processada"
echo "  ✅ Status final: $FINAL_STATUS"
if [ "$INDIVIDUAL_ID" != "null" ] && [ -n "$INDIVIDUAL_ID" ]; then
    echo "  ✅ Individual ID obtido: $INDIVIDUAL_ID"
fi

echo ""
success "🎉 Teste do fluxo KYC concluído com sucesso!"
echo ""
log "📝 Próximos passos para teste completo:"
echo "  1. Implementar upload real de documentos"
echo "  2. Testar com wallet registrada"
echo "  3. Verificar integração com operações fiat"
echo "  4. Testar webhooks de notificação"

# Limpeza
rm -f "$FRONT_DOC_FILE" "$BACK_DOC_FILE"

echo ""
log "🧹 Arquivos temporários removidos"
log "✨ Teste finalizado!"
