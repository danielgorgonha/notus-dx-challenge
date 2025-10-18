# Create Liquidity Pool

## Description
This endpoint creates liquidity for a liquidity pool.

## Endpoint
```
POST https://api.notus.team/api/v1/liquidity/create
```

## Headers
| Header | Type | Required | Description |
|--------|------|----------|-------------|
| x-api-key | string | Yes | API authentication key |

## Request Body Parameters

### Required Parameters
| Parameter | Type | Description | Validation |
|-----------|------|-------------|------------|
| walletAddress | string | The wallet address (in hexadecimal format) that will provide liquidity | Pattern: `^0x[a-fA-F0-9]{40}$` |
| toAddress | string | The address (in hexadecimal format) that receives the token representing the provided liquidity | Pattern: `^0x[a-fA-F0-9]{40}$` |
| chainId | number | The blockchain network where liquidity will be provided | Supported chains: Arbitrum One (42161), Avalanche (43114), Base (8453), BNB Smart Chain (56), Ethereum (1), Gnosis (100), OP Mainnet (10), Polygon (137) |
| payGasFeeToken | string | The address of the token (in hexadecimal format) used to pay transaction fees | Pattern: `^0x[a-fA-F0-9]{40}$` |
| gasFeePaymentMethod | string | Defines how the fee will be paid | Values: "ADD_TO_AMOUNT" \| "DEDUCT_FROM_AMOUNT" |
| token0 | string | The address (in hexadecimal format) of one of the pool tokens | Pattern: `^0x[a-fA-F0-9]{40}$` |
| token1 | string | The address (in hexadecimal format) of the other pool token | Pattern: `^0x[a-fA-F0-9]{40}$` |
| poolFeePercent | number | Defines the fee obtained when providing liquidity | Range: 0.01 <= value <= 100 |
| token0Amount | string | The amount of token0 to add to the liquidity pool, expressed as a decimal string | - |
| token1Amount | string | The amount of token1 to add to the liquidity pool, expressed as a decimal string | - |
| minPrice | number | Minimum price at which liquidity will be active | Range: 0 <= value |
| maxPrice | number | Maximum price at which liquidity will be active | Range: 0 <= value |

### Optional Parameters
| Parameter | Type | Description | Default | Range |
|-----------|------|-------------|---------|-------|
| liquidityProvider | string | Optional provider to enter a liquidity pool. If not provided, Uniswap v3 will be used | "UNISWAP_V3" | - |
| transactionFeePercent | number | Percentage fee applied to the transaction (e.g., 5 for 5%) | 0 | 0 <= value <= 99.99 |
| slippage | number | Optional parameter that controls the maximum allowed deviation from the expected price of a trade and the actual price at which the trade is executed | 0.5 | 0.5 <= value <= 99 |
| metadata | object | Empty object | {} | - |

## Response

### Success Response (200)
```json
  {
  "operation": {
    "liquidityProvider": "UNISWAP_V3",
    "walletAddress": "0x6e397ddf51d9f15dbe0414538e7529f51f2e5464",
    "toAddress": "0x1337133713371337133713371337133713371337",
    "chainId": 42161,
    "transactionFeePercent": 2.5,
    "payGasFeeToken": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
    "gasFeePaymentMethod": "ADD_TO_AMOUNT",
    "token0": "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f",
    "token1": "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
    "poolFeePercent": 1,
    "token0Amount": "26.2345",
    "token1Amount": "1823.2",
    "minPrice": 83475.12,
    "maxPrice": 102300.5,
    "slippage": 1.2,
    "metadata": {
      "key": "value"
    }
  }
}
```

### Error Responses

#### 400 Bad Request
```json
{
  "statusCode": 400,
  "id": "NOT_AUTHORIZED_TOKENS",
  "message": ""
}
```

#### 403 Forbidden
```json
{
  "statusCode": 403,
  "id": "UNAVAILABLE_COMPUTE_UNITS",
  "message": "The project doesn't have enough compute units to perform this action. Please upgrade your plan."
}
```

#### 404 Not Found
```json
{
  "statusCode": 404,
  "id": "ACCOUNT_ABSTRACTION_ADDRESS_NOT_REGISTERED_WITH_PROJECT",
  "message": "The requested wallet \"0x6e397ddf51d9f15dbe0414538e7529f51f2e5464\" is not registered with the project"
}
```

## Example Request
```bash
curl -X POST "https://api.notus.team/api/v1/liquidity/create" \
  -H "x-api-key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmZGY5NzNlNS0zNTIzLTQwNzctOTAzZC1iYWNmYzBkMGMyZGQiLCJhcGlLZXlHZW5lcmF0ZWRBdCI6IjIwMjUtMTAtMTNUMTc6NDY6NTguMjU1WiIsIm9yZ2FuaXphdGlvbklkIjoiNmQ0YmQwZjYtMmVlNS00MWYwLTkxMjAtYmQwY2M0OGRmODEzIn0.7YvbiK9Tos-RqcDDsZnl9h_3V5B7KrISN4C0RSPCe1s" \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x6e397ddf51d9f15dbe0414538e7529f51f2e5464",
    "toAddress": "0x1337133713371337133713371337133713371337",
    "chainId": 42161,
    "payGasFeeToken": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
    "gasFeePaymentMethod": "ADD_TO_AMOUNT",
    "token0": "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f",
    "token1": "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
    "poolFeePercent": 1,
    "token0Amount": "26.2345",
    "token1Amount": "1823.2",
    "minPrice": 83475.12,
    "maxPrice": 102300.5
  }'
```

## Notes
- The price is always p = token1 / token0
- Lower fee values are recommended for more stable tokens, while higher values are more suitable for volatile assets
- The allowed values depend on the provider, so check the provider's documentation for which fee levels are allowed
- Slippage parameter: 1 unit equals 1%