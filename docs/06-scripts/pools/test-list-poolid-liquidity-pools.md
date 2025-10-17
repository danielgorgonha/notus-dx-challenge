Liquidity pools
Get Liquidity Pool
Get liquidity pool by pool ID with aggregated stats

https://api.notus.team
GET
/
api
/
v1
/
liquidity
/
pools
/
{id}
Send
Authorization

x-api-key



x-api-key (header)*
string
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmZGY5NzNlNS0zNTIzLTQwNzctOTAzZC1iYWNmYzBkMGMyZGQiLCJhcGlLZXlHZW5lcmF0ZWRBdCI6IjIwMjUtMTAtMTNUMTc6NDY6NTguMjU1WiIsIm9yZ2FuaXphdGlvbklkIjoiNmQ0YmQwZjYtMmVlNS00MWYwLTkxMjAtYmQwY2M0OGRmODEzIn0.7YvbiK9Tos-RqcDDsZnl9h_3V5B7KrISN4C0RSPCe1s
Path

id
string
137-0x4CcD010148379ea531D6C587CfDd60180196F9b1
Query

rangeInDays
integer
30
Authorization

x-api-key
x-api-key
<token>
In: header

Path Parameters
id
string
The unique identifier of the pool

Length1 <= length
Query Parameters
rangeInDays?
integer
Number of days to aggregate pool statistics for. Must be between 1 and 365 days. Default is 30 days.

Default30
Range1 <= value <= 365
Response Body
200

application/json
TypeScript Definitions

Use the response body type in TypeScript.

Copy
pool
PoolDetailsDTO
Liquidity pool with aggregated statistics

Show Attributes
provider
ProviderDTO
Details about the swap provider that was used

Show Attributes
address
string
The address of the pool

chain
ChainDTO
The chain where the pool is deployed

Show Attributes
id
number
EVM ID of the blockchain

name
string
Name of the blockchain

logo
string
URL for a logo of the blockchain

fee
number
The fee tier of the pool as decimal (e.g., 0.05 for 0.05%)

totalValueLockedUSD
string
The total value locked in USD as string

tokens
array<LiquidityPoolTokenDTO>
The tokens in the pool

Array Item
No Description

name
string
Full name of the token

symbol
string
Ticker symbol of the token

decimals
number
Maximum amount of decimals this token supports

address
string
Contract address of the token

Match^0x[a-fA-F0-9]{40}$
poolShareInPercentage
number
The percentage share of this token in the pool

poolShare
number
The actual share amount of this token in the pool

logo
string
Logo of the token

stats
PoolStatsDTO
Aggregated statistics for the pool over the specified time range

Show Attributes
rangeInDays
number
Number of days the statistics cover

feesInUSD
string
Total fees collected in USD on the period range

volumeInUSD
string
Total trading volume in USD on the period range

transactionsCount
number
Total number of transactions on the period range

403

application/json
FORBIDDEN

TypeScript Definitions

Use the response body type in TypeScript.

Copy
statusCode
number
HTTP status code

id
string
Our ID of the problem

message
string
A human readable message that explains the problem


curl -X GET "https://api.notus.team/api/v1/liquidity/pools/137-0x4CcD010148379ea531D6C587CfDd60180196F9b1?rangeInDays=30" \
  -H "x-api-key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmZGY5NzNlNS0zNTIzLTQwNzctOTAzZC1iYWNmYzBkMGMyZGQiLCJhcGlLZXlHZW5lcmF0ZWRBdCI6IjIwMjUtMTAtMTNUMTc6NDY6NTguMjU1WiIsIm9yZ2FuaXphdGlvbklkIjoiNmQ0YmQwZjYtMmVlNS00MWYwLTkxMjAtYmQwY2M0OGRmODEzIn0.7YvbiK9Tos-RqcDDsZnl9h_3V5B7KrISN4C0RSPCe1s"


  200
  {
  "pool": {
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
}

403

{
  "statusCode": 403,
  "id": "UNAVAILABLE_COMPUTE_UNITS",
  "message": "The project doesn't have enough compute units to perform this action. Please upgrade your plan."
}
