# Teste - Obter Pool de Liquidez por ID

## Endpoint
```
GET /api/v1/liquidity/pools/{id}
```

## Descrição
Obtém detalhes de uma pool de liquidez específica pelo ID, incluindo estatísticas agregadas. Este endpoint é usado para visualizar informações detalhadas de uma pool individual.

## Parâmetros de Path

### Obrigatórios
- `id` (string): O identificador único da pool (formato: chainId-0x...)

### Opcionais
- `rangeInDays` (integer): Número de dias para agregar estatísticas (1-365, padrão: 30)

## Exemplo de Uso
```bash
curl -X GET "https://api.notus.team/api/v1/liquidity/pools/137-0x4CcD010148379ea531D6C587CfDd60180196F9b1?rangeInDays=30" \
  -H "x-api-key: YOUR_API_KEY"
```

## Estrutura da Resposta

### 200 - Sucesso
```json
{
  "pool": {
    "provider": {
      "name": "Uniswap V3",
      "logoUrl": "https://assets.notus.team/UniswapV3.png",
      "explorerURL": "https://app.uniswap.org/explore/pools/"
    },
    "address": "0x94ab9e4553ffb839431e37cc79ba8905f45bfbea",
    "chain": {
      "id": 137,
      "name": "POLYGON",
      "logo": "https://logopolygon.com"
    },
    "fee": 0.30,
    "totalValueLockedUSD": "478900.00",
    "tokens": [
      {
        "name": "Bridged USDC (Polygon PoS Bridge)",
        "symbol": "USDC.E",
        "decimals": 6,
        "address": "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
        "poolShareInPercentage": 17.37,
        "poolShare": 66284.946057,
        "logo": "https://coin-images.coingecko.com/coins/images/33000/large/usdc.png"
      },
      {
        "name": "Chainlink",
        "symbol": "LINK",
        "decimals": 18,
        "address": "0x53e0bca35ec356bd5dddfebbd1fc0fd03fabad39",
        "poolShareInPercentage": 82.63,
        "poolShare": 23678.85393412778,
        "logo": "https://coin-images.coingecko.com/coins/images/877/large/chainlink-new-logo.png"
      }
    ],
    "stats": {
      "rangeInDays": 30,
      "feesInUSD": "1108.55",
      "volumeInUSD": "369700.00",
      "transactionsCount": 300530
    }
  }
}
```

## Campos da Resposta

### Pool Object
- `provider`: Detalhes do provedor de swap
  - `name`: Nome do protocolo (ex: "Uniswap V3")
  - `logoUrl`: URL do logo
  - `explorerURL`: URL do explorador
- `address`: Endereço da pool
- `chain`: Informações da blockchain
  - `id`: ID da chain (137 = Polygon)
  - `name`: Nome da chain
  - `logo`: URL do logo da chain
- `fee`: Taxa da pool (ex: 0.30 = 0.30%)
- `totalValueLockedUSD`: TVL em USD
- `tokens`: Array de tokens na pool
  - `name`: Nome completo do token
  - `symbol`: Símbolo do token
  - `decimals`: Decimais do token
  - `address`: Endereço do contrato
  - `poolShareInPercentage`: Porcentagem na pool
  - `poolShare`: Quantidade real na pool
  - `logo`: URL do logo do token
- `stats`: Estatísticas agregadas
  - `rangeInDays`: Dias cobertos pelas estatísticas
  - `feesInUSD`: Taxas coletadas em USD
  - `volumeInUSD`: Volume de negociação em USD
  - `transactionsCount`: Número de transações

## Códigos de Erro

### 403 - Forbidden
```json
{
  "statusCode": 403,
  "id": "UNAVAILABLE_COMPUTE_UNITS",
  "message": "The project doesn't have enough compute units to perform this action. Please upgrade your plan."
}
```

### 404 - Not Found
```json
{
  "statusCode": 404,
  "id": "POOL_NOT_FOUND",
  "message": "Pool with the specified ID was not found."
}
```

## Pools de Teste
Para testar este endpoint, usamos as seguintes pools específicas:

1. **USDC.E/LINK**: `137-0x94ab9e4553ffb839431e37cc79ba8905f45bfbea`
2. **WETH/USDT**: `137-0xbb98b3d2b18aef63a3178023a920971cf5f29be4`
3. **WETH/USDT**: `137-0x4ccd010148379ea531d6c587cfdd60180196f9b1`
4. **WETH/USDT**: `137-0xa4d8c89f0c20efbe54cba9e7e7a7e509056228d9`
5. **WPOL/USDT**: `137-0x9b08288c3be4f62bbf8d1c20ac9c5e6f9467d8b7`

## Uso no Frontend
Este endpoint é consumido pela tela `/pools/[id]` para exibir:
- Composição da pool (porcentagens dos tokens)
- TVL, Volume, Tarifas
- Informações do protocolo e rede
- Links para exploradores
- Contrato da pool
