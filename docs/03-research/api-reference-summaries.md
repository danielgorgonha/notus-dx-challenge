# 📚 API Reference Summaries - Notus

Este documento centraliza todos os resumos da API Reference da Notus, organizados por funcionalidade para facilitar o desenvolvimento e documentação do projeto.

## 📋 Índice

- [Smart Wallets](#smart-wallets)
- [Gasless & Transaction Abstraction](#gasless--transaction-abstraction)
- [KYC e Ramp Fiat](#kyc-e-ramp-fiat)
- [Webhooks](#webhooks)
- [Exemplos Oficiais da API](#exemplos-oficiais-da-api)
- [Exemplos de cURL para Testes](#exemplos-de-curl-para-testes)
- [Swaps e Transferências](#swaps-e-transferências)
- [Liquidity Pools](#liquidity-pools)

---

## 🔐 Smart Wallets

### Resumo Completo das Rotas

**Fonte:** smartwallet.txt  
**Data:** 22/09/2024

#### 1. Create Deposit Transaction
- **Método:** `POST /api/v1/wallets/{walletAddress}/deposit`
- **Propósito:** Fornece transação para EOA depositar fundos em smart wallet
- **Parâmetros:**
  - `walletAddress` (path): Endereço da smart wallet
  - `amount`: Valor a transferir (string decimal)
  - `chainId`: Rede blockchain
  - `token`: Endereço do token (0xeeee... para nativos)
  - `fromAddress`: Endereço EOA iniciando transferência

#### 2. Get Smart Wallet
- **Método:** `GET /api/v1/wallets/address`
- **Propósito:** Recupera detalhes de smart wallet do usuário
- **Parâmetros:**
  - `externallyOwnedAccount`: Endereço público da EOA
  - `factory`: Endereço do contrato factory
  - `salt`: Número salt (opcional, padrão 0)
  - `eip7702`: Usar padrão EIP7702 (opcional)

#### 3. Get Smart Wallet Portfolio
- **Método:** `GET /api/v1/wallets/{walletAddress}/portfolio`
- **Propósito:** Obtém portfolio de smart wallet
- **Retorna:** Lista de saldos em diferentes tokens

#### 4. Register Smart Wallet
- **Método:** `POST /api/v1/wallets/register`
- **Propósito:** Registra nova smart wallet para usuário
- **Parâmetros:**
  - `externallyOwnedAccount`: Endereço público da EOA
  - `factory`: Endereço do contrato factory
  - `metadata`: Metadados customizados (máx 1KB)

#### 5. Get Smart Wallet History
- **Método:** `GET /api/v1/wallets/{walletAddress}/history`
- **Propósito:** Lista histórica de transações com filtros
- **Filtros:** take, lastId, type, status, chains, createdAt

#### 6. Update Transaction Metadata
- **Método:** `PATCH /api/v1/wallets/{walletAddress}/transactions/{transactionId}/metadata`

#### 7. Update Wallet Metadata
- **Método:** `PATCH /api/v1/wallets/{walletAddress}/metadata`

#### Chains Suportadas
- Arbitrum One (42161)
- Avalanche (43114)
- Base (8453)
- BNB Smart Chain (56)
- Ethereum (1)
- Gnosis (100)
- OP Mainnet (10)
- Polygon (137)

---

## ⛽ Gasless & Transaction Abstraction

### Análise Completa

**Fonte:** Gasless&TransactionAbstraction.txt  
**Data:** 22/09/2024

#### Overview
- **Problema:** Transações blockchain complexas e custosas, exigindo gerenciamento de gas e múltiplas aprovações
- **Solução:** Paymasters ERC-4337, transações em lote e session keys
- **Benefício:** Experiência sem friction, eficiente em custos e automatizada

#### Funcionalidades Core
- **Transações Gasless:** Usar Paymasters integrados
- **Pagamento Flexível:** Gas com tokens ERC-20 (não apenas nativos)
- **Transações em Lote:** Agrupar múltiplas operações
- **Session Keys:** Pré-autorizar transações para automação

#### Fluxo Técnico Completo

##### 1. Setup Inicial
- Instalar viem para interações blockchain
- Configurar API key e constantes
- Inicializar conta wallet com chave privada

##### 2. Account Abstraction Setup
- **Registro:** `POST /wallets/register`
- **Parâmetros:** externallyOwnedAccount, factory, salt
- **Retorno:** smartWalletAddress (ainda não deployed onchain)

##### 3. Transaction Quote
- **Endpoint:** Request transfer para obter cotação
- **Parâmetros:**
  - `payGasFeeToken`: Token para pagar gas
  - `token`: Token a transferir
  - `amount`: Valor
  - `walletAddress`: Endereço da smart wallet
  - `signerAddress`: Endereço do signatário
  - `toAddress`: Destino
  - `chainId`: Rede blockchain
  - `gasFeePaymentMethod`: Método de pagamento

##### 4. Transaction Execution
- **Assinatura:** `account.signMessage(data.quoteId)`
- **Execução:** `POST /crypto/execute-user-op`
- **Parâmetros:** signature, quoteId
- **Retorno:** userOpHash para tracking

#### Considerações Técnicas
- **Smart Wallet Deployment:** Acontece automaticamente na primeira transação
- **Gas Token:** Deve ser ERC-20 mantido na smart wallet
- **Error Handling:** Tratar falhas de signature e execution
- **Monitoring:** Usar userOpHash para acompanhar status

#### Vantagens da Arquitetura
- ✅ **UX Simplificada:** Usuários não precisam possuir ETH/MATIC
- ✅ **Flexibilidade:** Gas payment com qualquer ERC-20
- ✅ **Automação:** Session keys permitem fluxos automatizados
- ✅ **Eficiência:** Batch transactions reduzem custos

#### Aplicação no Projeto
**Trilha B (Swaps & Transfers):**
- Implementar fluxo completo de transferência gasless
- Testar diferentes combinações de tokens para gas payment
- Validar user operations e tracking

**Trilha C (Liquidity Pools):**
- Aplicar mesmo padrão para operações de pool
- Testar batch transactions para múltiplas operações
- Implementar session keys para automação

---

## 🆔 KYC e Ramp Fiat

### Análise Detalhada Completa

**Fonte:** kyc-ramp.txt  
**Data:** 22/09/2024

#### Ramp Overview
- **Status:** Em desenvolvimento (Q2 2025)
- **Mercados:** Latino-americanos selecionados
- **Funcionalidades:**
  - Depósitos e saques fiat via métodos locais
  - KYC/KYB automático com webhooks
  - Liquidação direta em smart wallet
  - Trilha de auditoria completa

#### Moedas e Redes Suportadas
**Fiat:** BRL, USD, MXN, COP, ARS  
**Crypto:** USDC, BRZ  
**Redes:** POLYGON, ARBITRUM, BASE

#### Fluxos Técnicos

##### ON-RAMP (Depósito)
1. **Create Quote:** `POST /fiat/deposit/quote`
2. **Create Order:** `POST /fiat/deposit`
3. **Retorna:** orderId, paymentMethodDetails (PIX, QR code)

##### OFF-RAMP (Saque)
1. **Create Quote:** `POST /fiat/withdraw/quote`
2. **Create Order:** `POST /fiat/withdraw`
3. **Execute:** `POST /crypto/execute-user-op` (obrigatório)

#### KYC Process
1. **Create Session:** `POST /kyc/individual-verification-sessions/standard`
2. **Upload Documents:** URLs S3 pré-assinadas
3. **Finalize:** `POST /kyc/individual-verification-sessions/standard/:sessionId/process`
4. **Check Status:** `GET /kyc/individual-verification-sessions/standard/:sessionId`

#### Documentos Aceitos
**Brasileiros:** RG (frente/verso), CNH (frente/verso), Passaporte  
**Internacionais:** Passaporte, Carteira de Identidade Nacional

#### Limitações
- Limite mensal: $9,000 USD (após KYC)
- BRZ requer KYC com documento brasileiro
- KYC obrigatório para operações fiat

---

## 🔔 Webhooks

### Análise Completa

**Fonte:** webhooks.txt  
**Data:** 22/09/2024

#### Overview
- **Propósito:** Notificações de eventos blockchain em tempo real
- **Benefícios:** Elimina polling manual, melhora performance
- **Funcionalidades:**
  - Notificações instantâneas de atividade
  - Alertas customizados
  - Monitoramento de transações grandes

#### Configuração
1. Login no Dashboard Notus
2. Navegar para seção Webhooks
3. Create Webhook
4. Preencher: URL, Event Types
5. Salvar (ativo imediatamente)

#### Segurança (Svix)
- **Assinatura:** HMAC com SHA-256
- **Headers:** svix-id, svix-timestamp, svix-signature
- **Verificação:** Concatenação de id.timestamp.payload
- **Implementação:** crypto.createHmac com secret base64

#### Eventos Disponíveis
- `ramp.deposit` - Depósitos fiat
- `ramp.withdraw` - Saques fiat
- `transaction` - Transações blockchain
- `swap` - Operações de swap

#### Status de Webhooks
- COMPLETED
- FAILED
- PROCESSING

---

## 📚 Exemplos Oficiais da API

### Análise Completa dos Exemplos

**Fonte:** notus-api-examples.txt  
**Data:** 22/09/2024

#### Estrutura do Monorepo
- **Tecnologias:** Turborepo, Bun, Next.js, React 19, TypeScript
- **Styling:** Tailwind CSS, Radix UI
- **Autenticação:** Privy, Web3Auth
- **Blockchain:** Viem para interações

#### Exemplos Disponíveis

##### 1. Privy Next.js Notus API
- **Funcionalidades:** Account abstraction, smart contracts, wallet connection
- **Implementação:** Fluxo completo de autenticação com Privy + Notus
- **Factory Address:** `0x7a1dbab750f12a90eb1b60d2ae3ad17d4d81effe`

##### 2. Fiat KYC Next.js Notus API
- **Funcionalidades:** KYC verification, fiat onramp/offramp, smart wallets
- **Implementação:** Server Actions + HTTP layer + schemas
- **Fluxos:** KYC completo, depósito PIX, saque fiat

##### 3. Web3Auth Wagmi
- **Funcionalidades:** Web3Auth integration, Wagmi blockchain interactions
- **Setup:** Vite + React

##### 4. KYC React Native
- **Funcionalidades:** KYC mobile, document upload, identity verification

##### 5. Liveness KYC SDK
- **Funcionalidades:** Liveness verification, KYC SDK integration

#### Padrões de Implementação

##### Configuração da API
```typescript
const notusAPI = ky.create({
  prefixUrl: "https://api.notus.team/api/v1",
  headers: {
    "x-api-key": process.env.NOTUS_API_KEY,
  },
});
```

##### Fluxo de Autenticação
1. Obter token Privy dos cookies
2. Buscar/criar usuário no Privy
3. Verificar/registrar Smart Wallet na Notus
4. Retornar dados do usuário com account abstraction

##### Estrutura de Server Actions
```typescript
export async function actionName(data: SchemaType) {
  try {
    const result = await apiCall(data);
    return { success: true, data: result, error: null };
  } catch (error) {
    return { success: false, error: error.message, data: null };
  }
}
```

#### Recursos Suportados
- **Moedas:** BRL, USD, USDC, BRZ
- **Países:** Brasil, Estados Unidos
- **Documentos:** RG, Passaporte, CNH
- **Blockchains:** Ethereum Mainnet, Sepolia Testnet
- **Pagamentos:** PIX, transferência bancária

#### Aplicação no Projeto
- **Base para autenticação:** Usar exemplo Privy Next.js
- **KYC e fiat operations:** Usar exemplo fiat-kyc-nextjs
- **Padrões consistentes:** Server Actions + HTTP layer + schemas
- **Estrutura recomendada:** actions/, http/, lib/, components/, app/

---

## 🧪 Exemplos de cURL para Testes

### Resumo Completo dos Endpoints

**Fonte:** notus-api-curl-examples.txt  
**Data:** 22/09/2024

#### Configuração Base
```bash
export NOTUS_API_KEY="YOUR_API_KEY"
export BASE_URL="https://api.notus.team/api/v1"

# Headers padrão
-H "Content-Type: application/json" \
-H "x-api-key: $NOTUS_API_KEY"
```

#### Categorias de Endpoints

##### 🌐 Blockchain (2 endpoints)
- **List Chains:** `GET /blockchain/chains`
- **List Tokens:** `GET /blockchain/tokens`

##### 💰 Fiat Operations (4 endpoints)
- **Create Fiat Deposit Quote:** `POST /fiat/deposit/quote`
- **Create Fiat Deposit Order:** `POST /fiat/deposit`
- **Create Fiat Withdrawal Quote:** `POST /fiat/withdraw/quote`
- **Create Fiat Withdrawal Order:** `POST /fiat/withdraw`

##### 🆔 KYC (3 endpoints)
- **Create KYC Session:** `POST /kyc/individual-verification-sessions/standard`
- **Get KYC Result:** `GET /kyc/individual-verification-sessions/standard/{sessionId}`
- **Process KYC:** `POST /kyc/individual-verification-sessions/standard/{sessionId}/process`

##### 🏊 Liquidity Pools (7 endpoints)
- **List Pools:** `GET /liquidity/pools`
- **Get Pool:** `GET /liquidity/pools/{poolId}`
- **Create Liquidity:** `POST /liquidity/create`
- **Change Liquidity:** `POST /liquidity/change`
- **Collect Fees:** `POST /liquidity/collect-fees`
- **Get Amounts:** `GET /liquidity/amounts`
- **Get Historical Data:** `GET /liquidity/pools/{poolId}/historical-data`

##### 🔐 Smart Wallets (8 endpoints)
- **Register Wallet:** `POST /wallets/register`
- **Get Wallet:** `GET /wallets/address`
- **Get Wallets by Project:** `GET /wallets`
- **Get Portfolio:** `GET /wallets/{walletAddress}/portfolio`
- **Get History:** `GET /wallets/{walletAddress}/history`
- **Create Deposit:** `POST /wallets/{walletAddress}/deposit`
- **Update Wallet Metadata:** `PATCH /wallets/{walletAddress}/metadata`
- **Update Transaction Metadata:** `PATCH /wallets/{walletAddress}/transactions/{transactionId}/metadata`

##### 🔄 Swaps (1 endpoint)
- **Create Swap:** `POST /swaps`

##### 💸 Transfers (1 endpoint)
- **Create Transfer:** `POST /transfers`

##### ⚙️ User Operations (4 endpoints)
- **Create Batch Operation:** `POST /user-operations/batch`
- **Create Custom Operation:** `POST /user-operations/custom`
- **Execute User Operation:** `POST /user-operations/execute`
- **Get User Operation:** `GET /user-operations/{userOpHash}`

#### Status de Retorno Padrão
- **200** - Sucesso
- **400** - Dados inválidos ou parâmetros incorretos
- **500** - Erro interno do servidor

#### Exemplos de Uso
- **Configuração completa** com headers e autenticação
- **Payloads de exemplo** para todos os endpoints POST/PATCH
- **Parâmetros de query** para endpoints GET
- **Script de teste automatizado** em Bash

#### Aplicação no Projeto
- **Testes manuais** de todos os endpoints
- **Validação de integração** antes da implementação
- **Debugging** de problemas de API
- **Documentação de comportamento** esperado

---

## 🔄 Swaps e Transferências

### Status: 📋 A Implementar

**Funcionalidades Planejadas:**
- Interface de swap de tokens
- Transferências entre wallets
- Cálculo de taxas e gas
- Execução de User Operations

**Endpoints Identificados:**
- `POST /api/v1/wallets/{walletAddress}/deposit`
- `POST /crypto/execute-user-op`

**Observações:**
- Necessário implementar interface de usuário
- Integrar com sistema de portfolio existente
- Testar em múltiplas redes blockchain

---

## 🏊 Liquidity Pools

### Status: 📋 A Implementar

**Funcionalidades Planejadas:**
- Listagem de pools de liquidez
- Adição/remoção de liquidez
- Cálculo de impermanent loss
- Monitoramento de rendimentos

**Endpoints:**
*A ser identificado conforme documentação da API*

**Observações:**
- Foco na Trilha C do desafio
- Integrar com sistema de portfolio
- Implementar cálculos de risco

---

## 📊 Resumo de Implementação

### ✅ Implementado
- Smart Wallets (criação, registro, consulta)
- Portfolio e histórico
- Autenticação com Privy

### 🚧 Em Desenvolvimento
- Swaps e transferências
- Interface de usuário

### 📋 Planejado
- Gasless & Transaction Abstraction
- Liquidity pools
- Webhooks
- KYC/Ramp (opcional)

### ✅ Analisado
- Exemplos oficiais da API (5 projetos)
- Padrões de implementação
- Estruturas de projeto recomendadas
- Exemplos de cURL para testes (30 endpoints)

### ⏳ Aguardando
- Módulo Ramp (Q2 2025)
- Documentação adicional de DeFi

---

**Última atualização:** 22 de setembro de 2024  
**Próxima revisão:** Conforme novos resumos da API Reference
