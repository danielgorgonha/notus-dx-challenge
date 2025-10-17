# Teste - Pools Específicas (Script Bash)

## 📋 Visão Geral

Script bash automatizado para testar o endpoint `/api/v1/liquidity/pools` com **5 pools específicas** da rede Polygon, exibindo métricas detalhadas como nas interfaces de DeFi.

## 🎯 Objetivo

Testar pools de liquidez específicas e analisar métricas reais que correspondem aos dados mostrados nas interfaces de usuário, incluindo:
- **Rentabilidade estimada (APR)**
- **TVL (Total Value Locked)**
- **Fees (24h)**
- **Volume (24h)**
- **Composição dos tokens**
- **Par de tokens**

## 🏊‍♂️ Pools Testadas

### Pool 1: USDC.E/LINK
- **ID**: `137-0x94ab9e4553ffb839431e37cc79ba8905f45bfbea`
- **Fee**: 0.3%
- **TVL**: ~$454K
- **Rent. estimada**: ~79% a.a.

### Pool 2: WETH/USDT
- **ID**: `137-0xbb98b3d2b18aef63a3178023a920971cf5f29be4`
- **Fee**: 0.05%
- **TVL**: ~$437K
- **Rent. estimada**: ~120K% a.a.

### Pool 3: WETH/USDT (Alternativa)
- **ID**: `137-0x4ccd010148379ea531d6c587cfdd60180196f9b1`
- **Fee**: 0.3%
- **TVL**: ~$3.3M
- **Rent. estimada**: ~226K% a.a.

### Pool 4: USDC/WETH
- **ID**: `137-0xa4d8c89f0c20efbe54cba9e7e7a7e509056228d9`
- **Fee**: 0.05%
- **TVL**: ~$897K
- **Rent. estimada**: ~145K% a.a.

### Pool 5: WPOL/USDT
- **ID**: `137-0x9b08288c3be4f62bbf8d1c20ac9c5e6f9467d8b7`
- **Fee**: 0.05%
- **TVL**: ~$1.1M
- **Rent. estimada**: ~66% a.a.

## 🚀 Como Executar

### Pré-requisitos
```bash
# Instalar dependências (se necessário)
sudo apt-get install curl jq bc
```

### Execução
```bash
# Navegar para a pasta
cd /home/dan/development/staff/notus-dx-challenge/docs/06-scripts/pools/

# Executar o script
./test-specific-pools.sh
```

## 📊 Testes Realizados

### **Teste 1: Pool Única com Diferentes Ranges**
- **30 dias**: Estatísticas mensais
- **60 dias**: Estatísticas bimestrais  
- **90 dias**: Estatísticas trimestrais
- **180 dias**: Estatísticas semestrais
- **365 dias**: Estatísticas anuais

### **Teste 2: Múltiplas Pools**
- **3 pools**: Teste com 3 pools simultaneamente
- **5 pools**: Teste com todas as 5 pools

### **Teste 3: Filtros de Whitelist**
- **Whitelist ativo**: `filterWhitelist=true`
- **Whitelist inativo**: `filterWhitelist=false`

### **Teste 4: Todas as 5 Pools**
- **Análise completa**: Todas as pools com métricas detalhadas

## 📈 Métricas Exibidas

Para cada pool, o script mostra:

```
🏊‍♂️ POOL: 137-0x94ab9e4553ffb839431e37cc79ba8905f45bfbea
├─ Par: usdc.e/link
├─ Chain: Polygon
├─ Fee: 0.3%
├─ TVL: $454,641.05
├─ Rent. estimada: 79.00% a.a.
├─ Fees (365d): $360,602.44
├─ Fees (24h): $987.95
├─ Volume (365d): $120,206,854.98
├─ Volume (24h): $329,333.84
├─ Transações: 300,479
├─ Composição: usdc.e (14.5%) / link (85.5%)
└─ Endereço: 0x94ab9e4553ffb839431e37cc79ba8905f45bfbea
```

## 🔧 Funcionalidades do Script

### **Cálculos Automáticos**
- **APR**: Calculado automaticamente baseado em fees e TVL
- **Fees 24h**: Fees totais divididas pelos dias do range
- **Volume 24h**: Volume total dividido pelos dias do range
- **Formatação de moeda**: Valores em formato legível

### **Cores e Formatação**
- **Verde**: Status OK e dados válidos
- **Azul**: Informações das pools
- **Amarelo**: Cabeçalhos e seções
- **Vermelho**: Erros e problemas

### **Resumo Geral**
- **TVL Total**: Soma de todos os TVLs
- **Fees Total**: Soma de todas as fees
- **Volume Total**: Soma de todos os volumes

## 📋 Estrutura do Script

### **Configurações**
```bash
# URLs e chaves
BASE_URL="https://api.notus.team/api/v1"
API_KEY="[SUA_API_KEY]"

# Pool IDs (formato: chainId-0x...)
POOL_ID="137-0x94ab9e4553ffb839431e37cc79ba8905f45bfbea"
# ... mais 4 pools
```

### **Funções Principais**
- `format_currency()`: Formata valores monetários
- `calculate_apr()`: Calcula rentabilidade anual
- `test_pool()`: Executa teste individual
- `test_multiple_pools()`: Testa múltiplas pools
- `test_range()`: Testa diferentes ranges de tempo

## 🎯 Resultados Esperados

### **Dados Válidos**
- ✅ Status HTTP 200
- ✅ Pools encontradas: 1, 3, ou 5
- ✅ Métricas calculadas corretamente
- ✅ Dados formatados e legíveis

### **Métricas das Imagens**
- ✅ **Rent. estimada**: Valores reais de APR
- ✅ **TVL**: Valores em USD formatados
- ✅ **Fees (24h)**: Taxas diárias aproximadas
- ✅ **Volume (24h)**: Volume diário aproximado
- ✅ **Composição**: Percentuais dos tokens
- ✅ **Par de tokens**: Símbolos corretos

## 🔍 Análise dos Resultados

### **Pools com Maior TVL**
1. **WETH/USDT** (0.3%): ~$3.3M
2. **WPOL/USDT** (0.05%): ~$1.1M
3. **USDC/WETH** (0.05%): ~$897K

### **Pools com Maior Rentabilidade**
1. **WETH/USDT** (0.3%): ~226K% a.a.
2. **USDC/WETH** (0.05%): ~145K% a.a.
3. **WETH/USDT** (0.05%): ~120K% a.a.

### **Pools com Maior Volume**
1. **WETH/USDT** (0.3%): ~$6.6B/dia
2. **USDC/WETH** (0.05%): ~$7B/dia
3. **WETH/USDT** (0.05%): ~$2.8B/dia

## 🚨 Troubleshooting

### **Problemas Comuns**
- **Erro 401**: Verificar API key
- **Erro 400**: Verificar formato dos IDs
- **Dados N/A**: Pool pode não existir ou estar inativa
- **Valores 0**: Pool pode não ter atividade recente

### **Soluções**
- Verificar se as pools existem na rede Polygon
- Confirmar se os IDs estão no formato correto
- Testar com ranges menores (7, 30 dias)
- Verificar conectividade com a API

## 📝 Logs e Debug

O script exibe logs detalhados:
- **Status HTTP**: 200 (OK) ou códigos de erro
- **Pools encontradas**: Quantidade retornada
- **Métricas calculadas**: Valores processados
- **Resumo geral**: Totais agregados

## 🎉 Conclusão

O script fornece uma análise completa das pools de liquidez, mostrando dados reais que correspondem às interfaces de DeFi, permitindo avaliar:
- **Rentabilidade** das pools
- **Liquidez** disponível
- **Atividade** de negociação
- **Composição** dos tokens
- **Performance** histórica

