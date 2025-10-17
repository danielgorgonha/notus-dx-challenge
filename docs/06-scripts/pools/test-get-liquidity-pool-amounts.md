# Teste: Obter Valores de Liquidez

## Descrição
Obtenha as quantidades de tokens necessárias para fornecer liquidez a um pool com base no máximo que você deseja gastar em um token. Você pode passar o valor máximo para ambos os tokens e receber cotações para os dois cenários possíveis. Dessa forma, você pode verificar em uma única chamada qual opção funciona com base nos valores que seu usuário tem.

**Exemplo**: Seu usuário deseja fornecer liquidez ao pool ETH-USDC e tem 100 USDC e 100 ETH em sua carteira. Ao passar ambos como valores máximos em `tokenXMaxAmount`, você obterá duas cotações. Um informando quanto ETH você precisa fornecer se enviar 100 USDC e outro informando quanto USDC você precisa fornecer com 100 ETH. Então você pode escolher qual deles realmente se adapta à liquidez que seu usuário tem.

**Nota**: Se apenas um deles for devolvido, significa que a faixa de preço está fora do preço atual, portanto, apenas um token pode ser fornecido para criar liquidez, o outro será sempre zero.

## Endpoint
```
GET /api/v1/liquidity/amounts
```

## Parâmetros de Consulta

### Obrigatórios
- **liquidityProvider** (string): Provedor opcional para entrar em um pool de liquidez. Se não for fornecido, o Uniswap v3 será usado.
  - Valor: `"UNISWAP_V3"`
- **chainId** (number): A rede blockchain onde a liquidez será fornecida
  - Arbitrum One: `42161`
  - Avalanche: `43114`
  - Base: `8453`
  - BNB Smart Chain: `56`
  - Ethereum: `1`
  - Gnosis: `100`
  - OP Mainnet: `10`
  - Polygon: `137`
- **token0** (string): O endereço (em formato hexadecimal) de um dos tokens do pool
  - Padrão: `^0x[a-fA-F0-9]{40}$`
- **token1** (string): O endereço (em formato hexadecimal) do outro token do pool
  - Padrão: `^0x[a-fA-F0-9]{40}$`
- **poolFeePercent** (number): Define a taxa obtida ao fornecer liquidez
  - Alcance: `0.01 <= value <= 100`
- **minPrice** (number): Preço mínimo a liquidez estará ativa
  - Alcance: `0 <= value <= 3.4026e+38`
- **maxPrice** (number): Preço máximo a liquidez estará ativa
  - Alcance: `0 <= value <= 3.4026e+38`
- **payGasFeeToken** (string): O endereço do token usado para pagar a taxa de transação
  - Padrão: `^0x[a-fA-F0-9]{40}$`
- **gasFeePaymentMethod** (string): Define como a taxa será paga
  - Valores: `"ADD_TO_AMOUNT"` | `"DEDUCT_FROM_AMOUNT"`

### Opcionais
- **token0MaxAmount** (string): A quantidade máxima de token0 a adicionar ao pool de liquidez
  - Padrão: `"1"`
- **token1MaxAmount** (string): A quantidade máxima de token1 a ser adicionada ao pool de liquidez
  - Padrão: `"1"`

## Headers
```
x-api-key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmZGY5NzNlNS0zNTIzLTQwNzctOTAzZC1iYWNmYzBkMGMyZGQiLCJhcGlLZXlHZW5lcmF0ZWRBdCI6IjIwMjUtMTAtMTNUMTc6NDY6NTguMjU1WiIsIm9yZ2FuaXphdGlvbklkIjoiNmQ0YmQwZjYtMmVlNS00MWYwLTkxMjAtYmQwY2M0OGRmODEzIn0.7YvbiK9Tos-RqcDDsZnl9h_3V5B7KrISN4C0RSPCe1s
```

## Exemplo de Requisição
```bash
curl -X GET "https://api.notus.team/api/v1/liquidity/amounts?liquidityProvider=UNISWAP_V3&chainId=42161&token0=0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f&token1=0xaf88d065e77c8cc2239327c5edb3a432268e5831&poolFeePercent=1&token0MaxAmount=26.2345&token1MaxAmount=1823.2&minPrice=83475.12&maxPrice=102300.5&payGasFeeToken=0x82af49447d8a07e3bd95bd0d56f35241523fbab1&gasFeePaymentMethod=ADD_TO_AMOUNT" \
  -H "x-api-key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmZGY5NzNlNS0zNTIzLTQwNzctOTAzZC1iYWNmYzBkMGMyZGQiLCJhcGlLZXlHZW5lcmF0ZWRBdCI6IjIwMjUtMTAtMTNUMTc6NDY6NTguMjU1WiIsIm9yZ2FuaXphdGlvbklkIjoiNmQ0YmQwZjYtMmVlNS00MWYwLTkxMjAtYmQwY2M0OGRmODEzIn0.7YvbiK9Tos-RqcDDsZnl9h_3V5B7KrISN4C0RSPCe1s"
```

## Respostas

### 200 - Sucesso
```json
{
  "poolPrice": "18342.234512",
  "amounts": {
    "token0MaxAmount": {
      "token0Amount": "2345.91",
      "token1Amount": "723.123"
    },
    "token1MaxAmount": {
      "token0Amount": "2345.91",
      "token1Amount": "723.123"
    }
  }
}
```

### 400 - Solicitação Ruim
```json
{
  "statusCode": 400,
  "id": "NOT_AUTHORIZED_TOKENS",
  "message": ""
}
```

### 403 - Proibido
```json
{
  "statusCode": 403,
  "id": "UNAVAILABLE_COMPUTE_UNITS",
  "message": "The project doesn't have enough compute units to perform this action. Please upgrade your plan."
}
```

### 500 - Erro do Servidor
```json
{
  "statusCode": 500,
  "id": "BLOCKCHAIN_ERROR",
  "message": "We had a problem fetching the data from the blockchain. If the problem persists, contact our support."
}
```

## Estrutura da Resposta

### poolPrice
- **Tipo**: string
- **Descrição**: Preço atual do pool como uma string. O preço é sempre p = token1 / token0

### amounts
- **Tipo**: QuantidadesDTO
- **Descrição**: Quantidades que você precisa fornecer para a piscina. Se os valores de dois tokens foram fornecidos, isso terá dois itens, caso contrário, é um único item.

#### token0MaxAmount
- **Tipo**: TokenAmountsDTO
- **Descrição**: Quantidade de tokens que você precisa fornecer ao pool se estiver usando o token0MaxAmount
- **token0Amount** (string): Quantidade de token0 como string
- **token1Amount** (string): Quantidade de token1 como string

#### token1MaxAmount
- **Tipo**: TokenAmountsDTO
- **Descrição**: Quantidade de tokens que você precisa fornecer ao pool se estiver usando o token1MaxAmount
- **token0Amount** (string): Quantidade de token0 como string
- **token1Amount** (string): Quantidade de token1 como string