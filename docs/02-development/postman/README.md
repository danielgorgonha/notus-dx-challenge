# 📮 Postman Collection - Notus API

Esta pasta contém a coleção completa do Postman para testar todas as funcionalidades da API Notus.

## 📁 Arquivos

- **`notus-api-complete-collection.json`** - Coleção completa com todos os endpoints
- **`notus-api-environment.json`** - Environment com todas as variáveis configuradas
- **`README.md`** - Este arquivo de documentação

## 🚀 Como Usar

### 1. Importar no Postman

1. Abra o Postman
2. Clique em **Import**
3. Selecione os arquivos:
   - `notus-api-complete-collection.json` (coleção)
   - `notus-api-environment.json` (environment)
4. A coleção e environment serão importados com todas as requisições organizadas

### 2. Configurar Environment

1. Selecione o environment **"Notus API - Environment"** no dropdown do Postman
2. Configure as variáveis obrigatórias:

#### Variáveis Obrigatórias:
- **`api_key`** - Sua chave da API Notus (obtenha no dashboard)
- **`wallet_address`** - Endereço da sua wallet (substitua o valor de exemplo)

#### Variáveis Pré-configuradas:
- **`base_url`** - URL base da API (já configurada)
- **`factory_address`** - Endereço do factory para smart wallets
- **`chain_id`** - ID da chain (Polygon = 137)
- **`individual_id`** - ID do individual para operações KYC/Fiat
- **`session_id`** - ID da sessão KYC
- **`pool_id`** - ID do pool de liquidez
- **`transaction_id`** - ID da transação
- **`user_op_hash`** - Hash da user operation
- **Valores de exemplo** para nomes, CPF, datas, etc.

### 3. Configurar Autenticação

A coleção já está configurada com autenticação por API Key. Certifique-se de que a variável `api_key` está configurada corretamente no environment.

### 4. Variáveis Disponíveis no Environment

O environment inclui **42 variáveis** pré-configuradas:

#### 🔧 Configuração Base:
- `base_url` - URL da API
- `api_key` - Chave da API (configure com sua chave)
- `chain_id` - ID da chain (137 = Polygon)
- `project_id` - ID do projeto para whitelist
- `page`, `per_page` - Parâmetros de paginação

#### 🔐 Smart Wallets:
- `wallet_address` - Endereço da wallet
- `factory_address` - Endereço do factory
- `salt` - Salt para criação de wallet

#### 🆔 KYC & Fiat:
- `individual_id` - ID do individual
- `session_id` - ID da sessão KYC
- `cpf` - CPF de exemplo
- `first_name`, `last_name` - Nomes de exemplo
- `birth_date` - Data de nascimento
- `country` - País (BR)

#### 💰 Tokens & Valores:
- `token_usdc` - Endereço do token USDC
- `token_brz` - Endereço do token BRZ
- `amount_100`, `amount_50`, `amount_1000`, `amount_2000` - Valores de exemplo
- `order_by`, `order_dir` - Parâmetros de ordenação
- `search_token` - Busca por token
- `filter_chain_id`, `filter_whitelist` - Filtros de tokens

#### 🏊 Liquidity Pools:
- `pool_id` - ID do pool
- `slippage` - Slippage (0.5%)

#### ⚙️ User Operations:
- `user_op_hash` - Hash da user operation
- `signature` - Assinatura de exemplo
- `target_address` - Endereço de destino

#### 📋 Outros:
- `quote_id`, `order_id` - IDs de exemplo
- `pix_key` - Chave PIX de exemplo
- `days_30`, `take_20` - Parâmetros de paginação
- `wallet_name`, `wallet_description` - Metadados da wallet

## 📋 Categorias de Endpoints

### 🌐 Blockchain (2 endpoints)
- List Chains
- List Tokens

### 🔐 Smart Wallets (8 endpoints)
- Register Smart Wallet
- Get Smart Wallet
- Get Smart Wallets by Project
- Get Smart Wallet Portfolio
- Get Smart Wallet History
- Create Deposit Transaction
- Update Wallet Metadata
- Update Transaction Metadata

### 🆔 KYC (4 endpoints)
- Create Standard Individual Session (Level 1)
- Create Standard Individual Session (Level 2)
- Get KYC Session Result
- Process KYC Session

### 💰 Fiat Operations (4 endpoints)
- Create Fiat Deposit Quote
- Create Fiat Deposit Order
- Create Fiat Withdrawal Quote
- Create Fiat Withdrawal Order

### 🔄 Swaps (1 endpoint)
- Create Swap

### 💸 Transfers (1 endpoint)
- Create Transfer

### 🏊 Liquidity Pools (7 endpoints)
- List Liquidity Pools
- Get Liquidity Pool
- Create Liquidity
- Change Liquidity
- Collect Fees from Liquidity
- Get Liquidity Amounts
- Get Pool Historical Data

### ⚙️ User Operations (4 endpoints)
- Create Batch Operation
- Create Custom User Operation
- Execute User Operation
- Get User Operation

## 🧪 Testes Automatizados

A coleção inclui testes automatizados que verificam:

- ✅ Status codes válidos
- ✅ Tempo de resposta aceitável
- ✅ Headers de content-type
- ✅ Estrutura JSON das respostas
- ✅ Tratamento de erros específicos

## 🔧 Scripts de Debug

### Pre-request Script
- Log da requisição para debug
- Validação de variáveis obrigatórias
- Avisos para configurações de exemplo

### Test Script
- Testes básicos de resposta
- Log detalhado para debug
- Validações específicas por tipo de resposta

## 📊 Status Codes Esperados

- **200** - Sucesso
- **201** - Criado com sucesso
- **400** - Dados inválidos ou parâmetros incorretos
- **401** - API Key inválida ou não configurada
- **403** - Acesso negado
- **404** - Recurso não encontrado
- **500** - Erro interno do servidor

## 🎯 Fluxos de Teste Recomendados

### 1. Fluxo Básico (Smart Wallets)
1. List Chains
2. List Tokens
3. Register Smart Wallet
4. Get Smart Wallet
5. Get Smart Wallet Portfolio

### 2. Fluxo KYC Completo
1. Create Standard Individual Session (Level 1)
2. Get KYC Session Result
3. Process KYC Session
4. Create Standard Individual Session (Level 2)

### 3. Fluxo Fiat Operations
1. Create Fiat Deposit Quote
2. Create Fiat Deposit Order
3. Create Fiat Withdrawal Quote
4. Create Fiat Withdrawal Order

### 4. Fluxo DeFi (Swaps + Liquidity)
1. List Liquidity Pools
2. Get Liquidity Pool
3. Create Swap
4. Create Liquidity
5. Get Liquidity Amounts

### 5. Fluxo User Operations
1. Create Batch Operation
2. Execute User Operation
3. Get User Operation

## ⚠️ Observações Importantes

### Rate Limiting
- A API possui rate limiting
- Implemente delays entre requisições se necessário
- Use retry logic com backoff exponencial

### Dados de Exemplo
- Muitos endpoints usam dados de exemplo
- Substitua pelos seus dados reais antes de testar
- Valide endereços de wallet e tokens

### Ambiente de Teste
- Use ambiente de teste antes de produção
- Mantenha logs detalhados das requisições
- Valide todos os parâmetros antes de enviar

## 🔗 Links Úteis

- [Documentação da API Notus](https://docs.notus.team/)
- [Dashboard Notus](https://dashboard.notus.team/)
- [Exemplos Oficiais](https://github.com/notus-labs/notus-api-examples)

## 📝 Logs e Debug

Para debug avançado, verifique:
1. **Console do Postman** - Logs automáticos de todas as requisições
2. **Test Results** - Resultados dos testes automatizados
3. **Response Body** - Conteúdo completo das respostas
4. **Headers** - Headers de requisição e resposta

---

**Última atualização:** 20 de Janeiro de 2025  
**Versão da Coleção:** 1.0.0
