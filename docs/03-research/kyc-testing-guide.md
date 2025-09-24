# 🧪 Guia de Testes - Fluxo KYC + Wallet Integration

Este documento serve como guia completo para testar o fluxo KYC integrado com wallets, desde o acesso do usuário até as operações de on-ramp. O objetivo é ajudar desenvolvedores e testadores a validar todo o sistema.

## 📋 Pré-requisitos

### Configuração do Ambiente

```bash
# 1. Definir variáveis de ambiente
export NOTUS_API_KEY="sua_api_key_aqui"
export BASE_URL="https://api.notus.team/api/v1"

# 2. Verificar dependências
curl --version
jq --version

# 3. Criar diretório de testes
mkdir -p tests/kyc-flow
cd tests/kyc-flow
```

### Dados de Teste

```bash
# Dados do usuário para teste
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

# Wallet de teste (altere conforme necessário)
WALLET_ADDRESS="0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
```

## 🎯 Cenários de Teste

### Cenário 1: Usuário Novo (Acesso via Email)

Este cenário testa o fluxo completo de um usuário que acessa o sistema pela primeira vez usando email.

#### 1.1. Cadastro Inicial

```bash
#!/bin/bash
# test-new-user-email.sh

echo "🔐 TESTE: Usuário Novo - Acesso via Email"
echo "=========================================="

# Simular criação de conta (isso seria feito pelo frontend)
echo "1. Usuário acessa sistema com email: $EMAIL"
echo "2. Sistema cria conta automaticamente"
echo "3. Wallet é gerada automaticamente"
echo "4. KYC Etapa 0 é criada automaticamente"

# Verificar se wallet foi criada (simulação)
echo "5. Verificando wallet criada: $WALLET_ADDRESS"
```

#### 1.2. Verificação de Status Inicial

```bash
# Verificar status inicial da wallet
curl -s -X GET "$BASE_URL/wallets/address?walletAddress=$WALLET_ADDRESS" \
  -H "x-api-key: $NOTUS_API_KEY" \
  -H "Content-Type: application/json" | jq '.'

# Resultado esperado:
# - wallet.registeredAt: null (não registrada ainda)
# - wallet.metadata.kyc.kycStatus: "NOT_STARTED"
# - wallet.metadata.kyc.kycLimits.stage: "0"
# - wallet.metadata.kyc.kycLimits.currentLimit: 0
```

### Cenário 2: Etapa 1 - Dados Pessoais (Limite R$ 2.000,00)

#### 2.1. Criar Sessão KYC

```bash
#!/bin/bash
# test-kyc-stage1.sh

echo "📝 TESTE: Etapa 1 - Dados Pessoais"
echo "=================================="

# Criar sessão KYC
KYC_RESPONSE=$(curl -s -X POST "$BASE_URL/kyc/individual-verification-sessions/standard" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $NOTUS_API_KEY" \
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

echo "Resposta da criação de sessão:"
echo "$KYC_RESPONSE" | jq '.'

# Extrair sessionId
SESSION_ID=$(echo "$KYC_RESPONSE" | jq -r '.session.id')
echo "Session ID: $SESSION_ID"

# Verificar se sessão foi criada com sucesso
if [ "$SESSION_ID" != "null" ] && [ -n "$SESSION_ID" ]; then
    echo "✅ Sessão KYC criada com sucesso!"
else
    echo "❌ Erro ao criar sessão KYC"
    exit 1
fi
```

#### 2.2. Atualizar Metadados da Wallet

```bash
# Atualizar metadados da wallet com sessão KYC ativa
METADATA_RESPONSE=$(curl -s -X PATCH "$BASE_URL/wallets/$WALLET_ADDRESS/metadata" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $NOTUS_API_KEY" \
  -d "{
    \"kycStatus\": \"IN_PROGRESS\",
    \"activeKYCSession\": {
      \"sessionId\": \"$SESSION_ID\",
      \"stage\": \"STAGE_1\",
      \"status\": \"PENDING\",
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
  }")

echo "Resposta da atualização de metadados:"
echo "$METADATA_RESPONSE" | jq '.'
```

#### 2.3. Verificar Status da Sessão

```bash
# Verificar status da sessão KYC
STATUS_RESPONSE=$(curl -s -X GET "$BASE_URL/kyc/individual-verification-sessions/standard/$SESSION_ID" \
  -H "x-api-key: $NOTUS_API_KEY")

echo "Status da sessão KYC:"
echo "$STATUS_RESPONSE" | jq '.'

SESSION_STATUS=$(echo "$STATUS_RESPONSE" | jq -r '.session.status')
echo "Status atual: $SESSION_STATUS"
```

### Cenário 3: Etapa 2 - Documentação + Liveness (Limite R$ 50.000,00)

#### 3.1. Criar Nova Sessão para Etapa 2

```bash
#!/bin/bash
# test-kyc-stage2.sh

echo "📄 TESTE: Etapa 2 - Documentação + Liveness"
echo "==========================================="

# Criar nova sessão para Etapa 2 (com liveness)
KYC_STAGE2_RESPONSE=$(curl -s -X POST "$BASE_URL/kyc/individual-verification-sessions/standard" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $NOTUS_API_KEY" \
  -d "{
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
  }")

echo "Resposta da criação de sessão Etapa 2:"
echo "$KYC_STAGE2_RESPONSE" | jq '.'

# Extrair sessionId e URLs de upload
SESSION_ID_2=$(echo "$KYC_STAGE2_RESPONSE" | jq -r '.session.id')
FRONT_DOC_URL=$(echo "$KYC_STAGE2_RESPONSE" | jq -r '.frontDocument.url')
BACK_DOC_URL=$(echo "$KYC_STAGE2_RESPONSE" | jq -r '.backDocument.url')

echo "Session ID Etapa 2: $SESSION_ID_2"
echo "Front Document URL: $FRONT_DOC_URL"
echo "Back Document URL: $BACK_DOC_URL"
```

#### 3.2. Simular Upload de Documentos

```bash
# Criar arquivos de teste
FRONT_DOC_FILE="/tmp/front_document_test.jpg"
BACK_DOC_FILE="/tmp/back_document_test.jpg"

# Criar arquivos dummy (1KB cada)
dd if=/dev/zero of="$FRONT_DOC_FILE" bs=1024 count=1 2>/dev/null
dd if=/dev/zero of="$BACK_DOC_FILE" bs=1024 count=1 2>/dev/null

echo "Arquivos de teste criados:"
echo "Front: $FRONT_DOC_FILE"
echo "Back: $BACK_DOC_FILE"

# Nota: Em um teste real, você precisaria:
# 1. Usar as URLs S3 pré-assinadas retornadas
# 2. Fazer upload usando FormData
# 3. Aguardar confirmação do upload

echo "⚠️  Para teste real, implemente upload usando as URLs S3 pré-assinadas"
```

#### 3.3. Processar Verificação

```bash
# Processar verificação KYC
PROCESS_RESPONSE=$(curl -s -X POST "$BASE_URL/kyc/individual-verification-sessions/standard/$SESSION_ID_2/process" \
  -H "x-api-key: $NOTUS_API_KEY")

echo "Resposta do processamento:"
echo "$PROCESS_RESPONSE" | jq '.'

# Aguardar processamento
echo "Aguardando processamento..."
sleep 5

# Verificar status final
FINAL_STATUS_RESPONSE=$(curl -s -X GET "$BASE_URL/kyc/individual-verification-sessions/standard/$SESSION_ID_2" \
  -H "x-api-key: $NOTUS_API_KEY")

echo "Status final da sessão:"
echo "$FINAL_STATUS_RESPONSE" | jq '.'

FINAL_STATUS=$(echo "$FINAL_STATUS_RESPONSE" | jq -r '.session.status')
INDIVIDUAL_ID=$(echo "$FINAL_STATUS_RESPONSE" | jq -r '.session.individualId')

echo "Status final: $FINAL_STATUS"
if [ "$INDIVIDUAL_ID" != "null" ] && [ -n "$INDIVIDUAL_ID" ]; then
    echo "Individual ID: $INDIVIDUAL_ID"
fi
```

### Cenário 4: Teste de On-Ramp (Depósito Fiat)

#### 4.1. Criar Quote de Depósito

```bash
#!/bin/bash
# test-fiat-deposit.sh

echo "💰 TESTE: On-Ramp - Depósito Fiat"
echo "================================="

# Verificar se KYC está completo
if [ -z "$INDIVIDUAL_ID" ] || [ "$INDIVIDUAL_ID" = "null" ]; then
    echo "❌ KYC não está completo. Individual ID necessário."
    exit 1
fi

# Criar quote de depósito
DEPOSIT_QUOTE_RESPONSE=$(curl -s -X POST "$BASE_URL/fiat/deposit/quote" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $NOTUS_API_KEY" \
  -d "{
    \"paymentMethodToSend\": \"PIX\",
    \"receiveCryptoCurrency\": \"USDC\",
    \"amountToSendInFiatCurrency\": 100,
    \"individualId\": \"$INDIVIDUAL_ID\",
    \"walletAddress\": \"$WALLET_ADDRESS\",
    \"chainId\": 137
  }")

echo "Resposta do quote de depósito:"
echo "$DEPOSIT_QUOTE_RESPONSE" | jq '.'

# Extrair quoteId
QUOTE_ID=$(echo "$DEPOSIT_QUOTE_RESPONSE" | jq -r '.depositQuote.quoteId')
echo "Quote ID: $QUOTE_ID"
```

#### 4.2. Criar Ordem de Depósito

```bash
# Criar ordem de depósito
DEPOSIT_ORDER_RESPONSE=$(curl -s -X POST "$BASE_URL/fiat/deposit" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $NOTUS_API_KEY" \
  -d "{
    \"quoteId\": \"$QUOTE_ID\"
  }")

echo "Resposta da ordem de depósito:"
echo "$DEPOSIT_ORDER_RESPONSE" | jq '.'

# Extrair dados do PIX
ORDER_ID=$(echo "$DEPOSIT_ORDER_RESPONSE" | jq -r '.depositOrder.orderId')
PIX_KEY=$(echo "$DEPOSIT_ORDER_RESPONSE" | jq -r '.depositOrder.paymentMethodToSendDetails.pixKey')
QR_CODE=$(echo "$DEPOSIT_ORDER_RESPONSE" | jq -r '.depositOrder.paymentMethodToSendDetails.base64QrCode')

echo "Order ID: $ORDER_ID"
echo "PIX Key: $PIX_KEY"
echo "QR Code: ${QR_CODE:0:50}..."
```

## 🔧 Script de Teste Completo

### Script Principal

```bash
#!/bin/bash
# complete-kyc-flow-test.sh

set -e

# Configurações
API_BASE="https://api.notus.team/api/v1"
API_KEY="${NOTUS_API_KEY:-YOUR_API_KEY_HERE}"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }

# Verificar API_KEY
if [ "$API_KEY" = "YOUR_API_KEY_HERE" ]; then
    error "Por favor, defina NOTUS_API_KEY"
    exit 1
fi

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

log "🚀 Iniciando teste completo do fluxo KYC"
log "API Base: $API_BASE"
log "Wallet: $WALLET_ADDRESS"

# ETAPA 1: Criar Sessão KYC
log "🔐 ETAPA 1: Criando sessão KYC..."
KYC_RESPONSE=$(curl -s -X POST "$API_BASE/kyc/individual-verification-sessions/standard" \
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

SESSION_ID=$(echo "$KYC_RESPONSE" | jq -r '.session.id')
if [ "$SESSION_ID" = "null" ] || [ -z "$SESSION_ID" ]; then
    error "Erro ao criar sessão KYC"
    echo "$KYC_RESPONSE"
    exit 1
fi
success "Sessão KYC criada: $SESSION_ID"

# ETAPA 2: Verificar Status
log "📊 ETAPA 2: Verificando status..."
STATUS_RESPONSE=$(curl -s -X GET "$API_BASE/kyc/individual-verification-sessions/standard/$SESSION_ID" \
  -H "x-api-key: $API_KEY")
SESSION_STATUS=$(echo "$STATUS_RESPONSE" | jq -r '.session.status')
success "Status da sessão: $SESSION_STATUS"

# ETAPA 3: Processar Verificação
log "⚙️  ETAPA 3: Processando verificação..."
PROCESS_RESPONSE=$(curl -s -X POST "$API_BASE/kyc/individual-verification-sessions/standard/$SESSION_ID/process" \
  -H "x-api-key: $API_KEY")
success "Verificação processada"

# ETAPA 4: Verificar Status Final
log "🔍 ETAPA 4: Verificando status final..."
sleep 3
FINAL_RESPONSE=$(curl -s -X GET "$API_BASE/kyc/individual-verification-sessions/standard/$SESSION_ID" \
  -H "x-api-key: $API_KEY")
FINAL_STATUS=$(echo "$FINAL_RESPONSE" | jq -r '.session.status')
INDIVIDUAL_ID=$(echo "$FINAL_RESPONSE" | jq -r '.session.individualId')

success "Status final: $FINAL_STATUS"
if [ "$INDIVIDUAL_ID" != "null" ] && [ -n "$INDIVIDUAL_ID" ]; then
    success "Individual ID: $INDIVIDUAL_ID"
    
    # ETAPA 5: Teste de On-Ramp
    log "💰 ETAPA 5: Testando on-ramp..."
    DEPOSIT_QUOTE=$(curl -s -X POST "$API_BASE/fiat/deposit/quote" \
      -H "Content-Type: application/json" \
      -H "x-api-key: $API_KEY" \
      -d "{
        \"paymentMethodToSend\": \"PIX\",
        \"receiveCryptoCurrency\": \"USDC\",
        \"amountToSendInFiatCurrency\": 100,
        \"individualId\": \"$INDIVIDUAL_ID\",
        \"walletAddress\": \"$WALLET_ADDRESS\",
        \"chainId\": 137
      }")
    
    QUOTE_ID=$(echo "$DEPOSIT_QUOTE" | jq -r '.depositQuote.quoteId')
    if [ "$QUOTE_ID" != "null" ] && [ -n "$QUOTE_ID" ]; then
        success "Quote de depósito criado: $QUOTE_ID"
        
        # Criar ordem de depósito
        DEPOSIT_ORDER=$(curl -s -X POST "$API_BASE/fiat/deposit" \
          -H "Content-Type: application/json" \
          -H "x-api-key: $API_KEY" \
          -d "{\"quoteId\": \"$QUOTE_ID\"}")
        
        ORDER_ID=$(echo "$DEPOSIT_ORDER" | jq -r '.depositOrder.orderId')
        success "Ordem de depósito criada: $ORDER_ID"
    else
        warning "Não foi possível criar quote de depósito"
    fi
else
    warning "Individual ID não disponível - KYC pode não estar completo"
fi

# RESUMO
echo ""
log "📋 RESUMO DO TESTE:"
echo "  ✅ Sessão KYC: $SESSION_ID"
echo "  ✅ Status: $FINAL_STATUS"
if [ "$INDIVIDUAL_ID" != "null" ] && [ -n "$INDIVIDUAL_ID" ]; then
    echo "  ✅ Individual ID: $INDIVIDUAL_ID"
    echo "  ✅ On-ramp testado com sucesso"
fi

success "🎉 Teste completo finalizado!"
```

## 📝 Checklist de Testes

### ✅ Testes Básicos

- [ ] Criação de sessão KYC
- [ ] Verificação de status da sessão
- [ ] Processamento de verificação
- [ ] Atualização de metadados da wallet
- [ ] Criação de quote de depósito
- [ ] Criação de ordem de depósito

### ✅ Testes de Integração

- [ ] Fluxo completo Etapa 1
- [ ] Fluxo completo Etapa 2
- [ ] Upload de documentos (simulado)
- [ ] Verificação de liveness
- [ ] On-ramp completo
- [ ] Off-ramp completo

### ✅ Testes de Validação

- [ ] Validação de dados de entrada
- [ ] Verificação de limites KYC
- [ ] Tratamento de erros
- [ ] Timeout de sessões
- [ ] Webhooks de notificação

## 🚨 Troubleshooting

### Erros Comuns

1. **API Key inválida**
   ```bash
   # Verificar se a API key está definida
   echo $NOTUS_API_KEY
   ```

2. **Sessão expirada**
   ```bash
   # Verificar expiração da sessão
   echo "$KYC_RESPONSE" | jq '.session.expiresAt'
   ```

3. **Wallet não registrada**
   ```bash
   # Registrar wallet primeiro
   curl -X POST "$BASE_URL/wallets/register" \
     -H "x-api-key: $NOTUS_API_KEY" \
     -d '{"externallyOwnedAccount": "0x...", "factory": "0x..."}'
   ```

### Logs e Debug

```bash
# Habilitar logs detalhados
export CURL_VERBOSE=1

# Salvar respostas para análise
curl ... > response.json 2> error.log
```

---

**Última atualização:** 20/01/2025  
**Versão:** 1.0  
**Status:** Pronto para testes
