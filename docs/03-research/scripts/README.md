# 🧪 Scripts de Teste - KYC + Wallet Integration

Este diretório contém scripts para testar o fluxo completo de KYC integrado com wallets, desde o acesso do usuário até as operações de on-ramp.

## 📁 Arquivos Disponíveis

### Scripts Principais

- **`complete-kyc-flow-test.sh`** - Script completo que testa todo o fluxo KYC
- **`test-kyc-flow.sh`** - Script básico de teste (versão anterior)

### Documentação

- **`../docs/03-research/kyc-flow-diagrams.md`** - Diagramas Mermaid do fluxo
- **`../docs/03-research/kyc-testing-guide.md`** - Guia completo de testes

## 🚀 Como Usar

### 1. Configuração Inicial

```bash
# Definir API Key
export NOTUS_API_KEY="sua_api_key_aqui"

# Verificar dependências
curl --version
jq --version
```

### 2. Executar Teste Completo

```bash
# Executar script completo
./complete-kyc-flow-test.sh
```

### 3. Executar Testes Individuais

```bash
# Teste básico (versão anterior)
./test-kyc-flow.sh
```

## 📋 O que é Testado

### ✅ Fluxo Completo

1. **Criação de Sessão KYC**
   - Dados pessoais (Etapa 1)
   - Validação de entrada
   - Criação na API Notus

2. **Verificação de Status**
   - Consulta de status da sessão
   - Validação de dados retornados

3. **Atualização de Metadados**
   - Vinculação sessionId à wallet
   - Atualização de limites KYC

4. **Processamento de Verificação**
   - Início do processamento KYC
   - Aguardar conclusão

5. **Verificação de Status Final**
   - Status final da sessão
   - Extração de Individual ID

6. **Teste de On-Ramp**
   - Criação de quote de depósito
   - Criação de ordem de depósito
   - Dados do PIX

7. **Verificação de Dados da Wallet**
   - Status de registro
   - Metadados atualizados

## 🎯 Cenários de Teste

### Cenário 1: Usuário Novo (Email)
- Cadastro inicial
- Criação automática de wallet
- KYC Etapa 0 automática

### Cenário 2: Etapa 1 - Dados Pessoais
- Formulário completo
- Limite R$ 2.000,00
- Sessão KYC criada

### Cenário 3: Etapa 2 - Documentação
- Upload de documentos
- Verificação liveness
- Limite R$ 50.000,00

### Cenário 4: On-Ramp Completo
- Quote de depósito
- Ordem de depósito
- Dados PIX/QR Code

## 📊 Dados de Teste

O script usa os seguintes dados de teste:

```bash
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
```

## 🔧 Configuração Avançada

### Variáveis de Ambiente

```bash
# API Configuration
export NOTUS_API_KEY="sua_api_key_aqui"
export API_BASE="https://api.notus.team/api/v1"

# Test Data (opcional - pode ser sobrescrito)
export TEST_WALLET_ADDRESS="0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
export TEST_EMAIL="joao.silva@teste.com"
```

### Personalização de Dados

Para usar dados diferentes, edite as variáveis no início do script:

```bash
# Editar arquivo
nano complete-kyc-flow-test.sh

# Alterar dados de teste
FIRST_NAME="Seu Nome"
LAST_NAME="Seu Sobrenome"
EMAIL="seu@email.com"
# ... outros dados
```

## 📝 Logs e Debug

### Habilitar Logs Detalhados

```bash
# Habilitar verbose do curl
export CURL_VERBOSE=1

# Salvar respostas para análise
./complete-kyc-flow-test.sh > test-results.log 2> test-errors.log
```

### Analisar Respostas

```bash
# Verificar respostas salvas
cat test-results.log | jq '.'

# Verificar erros
cat test-errors.log
```

## 🚨 Troubleshooting

### Erros Comuns

1. **API Key inválida**
   ```bash
   # Verificar se está definida
   echo $NOTUS_API_KEY
   ```

2. **Dependências faltando**
   ```bash
   # Instalar curl
   sudo apt-get install curl
   
   # Instalar jq
   sudo apt-get install jq
   ```

3. **Permissões de execução**
   ```bash
   # Tornar executável
   chmod +x complete-kyc-flow-test.sh
   ```

4. **Sessão expirada**
   ```bash
   # Verificar expiração
   echo "$KYC_RESPONSE" | jq '.session.expiresAt'
   ```

### Debug de Requisições

```bash
# Testar endpoint individual
curl -X GET "https://api.notus.team/api/v1/kyc/individual-verification-sessions/standard/SESSION_ID" \
  -H "x-api-key: $NOTUS_API_KEY" | jq '.'
```

## 📈 Interpretação de Resultados

### Status de Sucesso

- ✅ **Verde**: Operação bem-sucedida
- ⚠️ **Amarelo**: Aviso (não crítico)
- ❌ **Vermelho**: Erro crítico

### Métricas de Teste

- **Total de etapas**: Número total de operações testadas
- **Etapas bem-sucedidas**: Operações que passaram
- **Taxa de sucesso**: Percentual de sucesso

### Resultados Esperados

```
📋 RESUMO DO TESTE
==================

  Total de etapas: 7
  Etapas bem-sucedidas: 7
  Taxa de sucesso: 100%

  ✅ Session ID: a1b2c3d4-e5f6-7890-abcd-ef1234567890
  ✅ Status final: COMPLETED
  ✅ Individual ID: ind_1234567890abcdef
  ✅ Quote ID: quote_1234567890abcdef
  ✅ Order ID: order_1234567890abcdef

🎉 TODOS OS TESTES PASSARAM COM SUCESSO!
```

## 🔄 Integração com CI/CD

### GitHub Actions

```yaml
name: KYC Flow Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup dependencies
        run: |
          sudo apt-get update
          sudo apt-get install -y curl jq
      - name: Run KYC tests
        env:
          NOTUS_API_KEY: ${{ secrets.NOTUS_API_KEY }}
        run: |
          cd scripts
          chmod +x complete-kyc-flow-test.sh
          ./complete-kyc-flow-test.sh
```

### Docker

```dockerfile
FROM ubuntu:20.04

RUN apt-get update && apt-get install -y curl jq bash

COPY scripts/ /scripts/
WORKDIR /scripts

RUN chmod +x complete-kyc-flow-test.sh

CMD ["./complete-kyc-flow-test.sh"]
```

## 📚 Recursos Adicionais

### Documentação Relacionada

- [Diagramas do Fluxo KYC](../docs/03-research/kyc-flow-diagrams.md)
- [Guia de Testes](../docs/03-research/kyc-testing-guide.md)
- [API Reference](../docs/03-research/api-reference-summaries.md)

### Exemplos de Uso

- [KYCManager Component](../src/components/kyc/KYCManager.tsx)
- [useKYCManager Hook](../src/hooks/useKYCManager.ts)
- [Exemplo de Integração](../src/components/examples/KYCExample.tsx)

## 🤝 Contribuição

Para contribuir com melhorias nos scripts:

1. Fork o repositório
2. Crie uma branch para sua feature
3. Implemente as melhorias
4. Teste com dados reais
5. Submeta um pull request

### Padrões de Código

- Use cores consistentes para output
- Inclua tratamento de erros
- Documente funções complexas
- Mantenha compatibilidade com bash

---

**Última atualização:** 20/01/2025  
**Versão:** 1.0  
**Status:** Pronto para uso
