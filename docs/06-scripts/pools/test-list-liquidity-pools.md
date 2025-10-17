# Teste - Listar Pools de Liquidez

## Endpoint
```
GET /api/v1/liquidity/pools
```

## Descrição
Lista os pools de liquidez que existem no blockchain. O pool pode estar quebrado, como se quase não tivesse liquidez. Use os dados retornados por este endpoint para avaliar se vale a pena investir no pool.

## Parâmetros de Query

### Obrigatórios
- Nenhum

### Opcionais
- `take` (integer): Quantidade máxima de pools por página (1-50, padrão: 10)
- `offset` (integer): Número de pools a pular para paginação (padrão: 0)
- `chainIds` (array): Filtrar por chains específicas
- `tokensAddresses` (array): Filtrar por tokens específicos
- `filterWhitelist` (boolean): Filtrar por lista de permissões (padrão: false)
- `rangeInDays` (integer): Número de dias para estatísticas (1-365, padrão: 30)
- `ids` (array): Filtrar por IDs específicos de pools

## Chains Suportadas
- Arbitrum One: 42161
- Avalanche: 43114
- Base: 8453
- BNB Smart Chain: 56
- Ethereum: 1
- Gnosis: 100
- OP Mainnet: 10
- Polygon: 137

## Headers
```
x-api-key: [SUA_API_KEY]
```

## Resposta de Sucesso (200)
```json
{
  "pools": [
    {
      "provider": {
        "name": "XY",
        "logoUrl": "https://assets.notus.team/Lifi.png",
        "explorerURL": "https://explorer.li.fi"
      },
      "address": "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640",
      "chain": {
        "id": 137,
        "name": "POLYGON",
        "logo": "https://logopolygon.com"
      },
      "fee": 0.05,
      "totalValueLockedUSD": "10000.453",
      "tokens": [
        {
          "name": "Wrapped Bitcoin",
          "symbol": "WBTC",
          "decimals": 18,
          "address": "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f",
          "poolShareInPercentage": 50.5,
          "poolShare": 1000.25,
          "logo": "https://assets.notus.team/wbtc.png"
        }
      ],
      "stats": {
        "rangeInDays": 30,
        "feesInUSD": "1500.75",
        "volumeInUSD": "50000.25",
        "transactionsCount": 1250
      }
    }
  ]
}
```

## Resposta de Erro (403)
```json
{
  "statusCode": 403,
  "id": "UNAVAILABLE_COMPUTE_UNITS",
  "message": "The project doesn't have enough compute units to perform this action. Please upgrade your plan."
}
```

## Resposta de Erro (500)
```json
{
  "statusCode": 500,
  "id": "DB_API_FAILED",
  "message": "We had a problem fetching the data from our metadata servers. If the problem persists, contact our support."
}
```

## Exemplo de Uso
```bash
curl -X GET "https://api.notus.team/api/v1/liquidity/pools?take=10&chainIds=137&rangeInDays=30" \
  -H "x-api-key: [SUA_API_KEY]"
```

## Objetivo do Teste
- Verificar se o endpoint retorna pools válidos
- Testar diferentes combinações de filtros
- Validar estrutura dos dados retornados
- Identificar pools com maior TVL e atividade
- Testar paginação e limites