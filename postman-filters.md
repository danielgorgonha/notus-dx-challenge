# 🔍 Filtros Completos para API Notus - Pools de Liquidez

## 📋 **Parâmetros Disponíveis (Baseado na Documentação)**

### **1. Parâmetros Básicos**
- `take` (integer): Máximo de pools por página (1-50, padrão: 10)
- `offset` (integer): Número de pools para pular (usado para paginação)

### **2. Filtros de Chain**
- `chainIds` (array<number>): Filtrar por chains
  - **Ethereum**: `1`
  - **Polygon**: `137`
  - **Arbitrum One**: `42161`
  - **Avalanche**: `43114`
  - **Base**: `8453`
  - **BNB Smart Chain**: `56`
  - **Gnosis**: `100`
  - **OP Mainnet**: `10`

### **3. Filtros de Token**
- `tokensAddresses` (array<string>): Filtrar por endereços de tokens
- `ids` (array<string>): Filtrar por IDs de pools

### **4. Filtros de Configuração**
- `filterWhitelist` (boolean): Filtrar por whitelist do projeto (true | false, padrão: true)
- `rangeInDays` (integer): Número de dias para agregar estatísticas (1-365, padrão: 30)

---

## 🚀 **URLs para Testar no Postman**

### **1. Teste Básico**
```
GET https://api.notus.team/api/v1/liquidity/pools?take=10&offset=0
```

### **2. Teste com Chains Específicas**

#### **Ethereum**
```
GET https://api.notus.team/api/v1/liquidity/pools?take=10&offset=0&chainIds=1
```

#### **Polygon**
```
GET https://api.notus.team/api/v1/liquidity/pools?take=10&offset=0&chainIds=137
```

#### **Arbitrum**
```
GET https://api.notus.team/api/v1/liquidity/pools?take=10&offset=0&chainIds=42161
```

#### **Avalanche**
```
GET https://api.notus.team/api/v1/liquidity/pools?take=10&offset=0&chainIds=43114
```

#### **Base**
```
GET https://api.notus.team/api/v1/liquidity/pools?take=10&offset=0&chainIds=8453
```

#### **BNB Smart Chain**
```
GET https://api.notus.team/api/v1/liquidity/pools?take=10&offset=0&chainIds=56
```

#### **Gnosis**
```
GET https://api.notus.team/api/v1/liquidity/pools?take=10&offset=0&chainIds=100
```

#### **OP Mainnet**
```
GET https://api.notus.team/api/v1/liquidity/pools?take=10&offset=0&chainIds=10
```

### **3. Teste com Múltiplas Chains**
```
GET https://api.notus.team/api/v1/liquidity/pools?take=20&offset=0&chainIds=1,137,42161
```

### **4. Teste com Diferentes Ranges de Dias**

#### **1 Dia**
```
GET https://api.notus.team/api/v1/liquidity/pools?take=10&offset=0&rangeInDays=1
```

#### **7 Dias**
```
GET https://api.notus.team/api/v1/liquidity/pools?take=10&offset=0&rangeInDays=7
```

#### **30 Dias (padrão)**
```
GET https://api.notus.team/api/v1/liquidity/pools?take=10&offset=0&rangeInDays=30
```

#### **90 Dias**
```
GET https://api.notus.team/api/v1/liquidity/pools?take=10&offset=0&rangeInDays=90
```

#### **365 Dias**
```
GET https://api.notus.team/api/v1/liquidity/pools?take=10&offset=0&rangeInDays=365
```

### **5. Teste com Filtros de Whitelist**

#### **Com Whitelist (padrão)**
```
GET https://api.notus.team/api/v1/liquidity/pools?take=10&offset=0&filterWhitelist=true
```

#### **Sem Whitelist**
```
GET https://api.notus.team/api/v1/liquidity/pools?take=10&offset=0&filterWhitelist=false
```

### **6. Teste com Tokens Específicos**

#### **WBTC**
```
GET https://api.notus.team/api/v1/liquidity/pools?take=10&offset=0&tokensAddresses=0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f
```

#### **WETH**
```
GET https://api.notus.team/api/v1/liquidity/pools?take=10&offset=0&tokensAddresses=0x82af49447d8a07e3bd95bd0d56f35241523fbab1
```

#### **USDC**
```
GET https://api.notus.team/api/v1/liquidity/pools?take=10&offset=0&tokensAddresses=0xa0b86a33e6c0b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4
```

### **7. Teste com Múltiplos Tokens**
```
GET https://api.notus.team/api/v1/liquidity/pools?take=10&offset=0&tokensAddresses=0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f,0x82af49447d8a07e3bd95bd0d56f35241523fbab1
```

### **8. Teste com IDs Específicos**
```
GET https://api.notus.team/api/v1/liquidity/pools?take=10&offset=0&ids=137-0xb8ab220a0f3a1e162d991481dac35874057c7a87
```

### **9. Teste com Paginação**
```
GET https://api.notus.team/api/v1/liquidity/pools?take=10&offset=0
GET https://api.notus.team/api/v1/liquidity/pools?take=10&offset=10
GET https://api.notus.team/api/v1/liquidity/pools?take=10&offset=20
GET https://api.notus.team/api/v1/liquidity/pools?take=10&offset=30
```

### **10. Combinações Complexas**

#### **Ethereum + WBTC + 7 dias + sem whitelist**
```
GET https://api.notus.team/api/v1/liquidity/pools?take=10&offset=0&chainIds=1&tokensAddresses=0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f&rangeInDays=7&filterWhitelist=false
```

#### **Múltiplas chains + múltiplos tokens + 30 dias**
```
GET https://api.notus.team/api/v1/liquidity/pools?take=20&offset=0&chainIds=1,137,42161&tokensAddresses=0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f,0x82af49447d8a07e3bd95bd0d56f35241523fbab1&rangeInDays=30
```

---

## 🔑 **Headers Necessários**

```
Content-Type: application/json
x-api-key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmZGY5NzNlNS0zNTIzLTQwNzctOTAzZC1iYWNmYzBkMGMyZGQiLCJhcGlLZXlHZW5lcmF0ZWRBdCI6IjIwMjUtMTAtMTNUMTc6NDY6NTguMjU1WiIsIm9yZ2FuaXphdGlvbklkIjoiNmQ0YmQwZjYtMmVlNS00MWYwLTkxMjAtYmQwY2M0OGRmODEzIn0.7YvbiK9Tos-RqcDDsZnl9h_3V5B7KrISN4C0RSPCe1s
```

---

## 📊 **O que Procurar nos Resultados**

### **Pools com Atividade Real:**
- `stats.volumeInUSD > 0`
- `stats.feesInUSD > 0`
- `stats.transactionsCount > 0`

### **Pools com TVL Significativo:**
- `totalValueLockedUSD > 1000`

### **Pools por Chain:**
- Verificar se diferentes chains retornam dados diferentes
- Comparar volume e fees entre chains

### **Pools por Range de Dias:**
- Testar se `rangeInDays` afeta os dados de volume e fees
- Verificar se ranges menores (1-7 dias) mostram mais atividade recente

---

## 🎯 **Próximos Passos**

1. **Execute o script**: `./test-all-filters.sh`
2. **Teste no Postman**: Use as URLs acima
3. **Analise os resultados**: Procure por pools com dados reais
4. **Identifique padrões**: Qual chain/range/token retorna dados melhores
5. **Implemente no código**: Use os filtros que funcionam melhor
