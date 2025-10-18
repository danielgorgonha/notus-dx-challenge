Pools de liquidez
Obtenha dados históricos da piscina
Obtenha dados históricos detalhados para um pool específico, incluindo volume e taxas ao longo do tempo

https://api.notus.team
PEGAR
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
/
historical-data

Enviar

Autorização

x-api-chave



x-api-key (cabeçalho)*
string
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmZGY5NzNlNS0zNTIzLTQwNzctOTAzZC1iYWNmYzBkMGMyZGQiLCJhcGlLZXlHZW5lcmF0ZWRBdCI6IjIwMjUtMTAtMTNUMTc6NDY6NTguMjU1WiIsIm9yZ2FuaXphdGlvbklkIjoiNmQ0YmQwZjYtMmVlNS00MWYwLTkxMjAtYmQwY2M0OGRmODEzIn0.7YvbiK9Tos-RqcDDsZnl9h_3V5B7KrISN4C0RSPCe1s

Caminho

id
string
137-0x4CcD010148379ea531D6C587CfDd60180196F9b1

Consulta

intervaloEmDias
integer
30

grupoPorIntervalo
string
DAILY
Autorização

x-api-chave
x-api-chave
<símbolo>
Em: header

Parâmetros de caminho
id
corda
O identificador único do pool

Comprimento1 <= length
Parâmetros de consulta
intervaloEmDias?
inteiro
Número de dias para consultar estatísticas (máximo 365 dias)

Padrão30
Alcance0 < value <= 365
grupoPorIntervalo?
corda
Intervalo para agrupar estatísticas de pool. POR HORA, DIARIAMENTE, SEMANALMENTE, MENSALMENTE ou ANUALMENTE

Padrão"DAILY"
Valor em"HOURLY" | "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY"
Órgão de resposta

200

aplicação/json
Dados históricos do pool recuperados com sucesso

Definições TypeScript

Use o tipo de corpo de resposta em TypeScript.


Copiar
estatísticas
Estatísticas do PoolDTO
Dados estatísticos do pool


Mostrar atributos
intervaloEmDias
número
Número de dias que as estatísticas abrangem

grupoPorIntervalo
corda
O intervalo utilizado para agrupar as estatísticas

Valor em"HOURLY" | "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY"
poolId
corda
O identificador único do pool

itens
array<PoolStatisticsItemDTO>
Matriz de pontos de dados estatísticos para o intervalo de tempo especificado


Item de matriz
Sem descrição

carimbo de data/hora
número
Carimbo de data/hora do ponto de dados em milissegundos

volumeInUSD
corda
Volume de negociação em USD neste período

taxasInUSD
corda
Taxas cobradas em USD neste período

fecharInUSD
corda
Preço de fechamento em USD para este período

altoInUSD
corda
Preço mais alto em USD durante este período

baixoInUSD
corda
Preço mais baixo em USD durante este período

valor total bloqueado em USD
corda
Valor total bloqueado em USD neste momento

token0PreçoNoToken1
corda
Preço do primeiro token em comparação com o segundo token

token1PreçoNoToken0
corda
Preço do segundo token em comparação com o primeiro token


403

aplicação/json
PROIBIDO

Definições TypeScript

Use o tipo de corpo de resposta em TypeScript.


Copiar
código de status
número
Código de status HTTP

id
corda
Nossa identificação do problema

mensagem
corda
Uma mensagem legível por humanos que explica o problema


curl -X GET "https://api.notus.team/api/v1/liquidity/pools/137-0x4CcD010148379ea531D6C587CfDd60180196F9b1/historical-data?rangeInDays=30&groupByInterval=DAILY" \
  -H "x-api-key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmZGY5NzNlNS0zNTIzLTQwNzctOTAzZC1iYWNmYzBkMGMyZGQiLCJhcGlLZXlHZW5lcmF0ZWRBdCI6IjIwMjUtMTAtMTNUMTc6NDY6NTguMjU1WiIsIm9yZ2FuaXphdGlvbklkIjoiNmQ0YmQwZjYtMmVlNS00MWYwLTkxMjAtYmQwY2M0OGRmODEzIn0.7YvbiK9Tos-RqcDDsZnl9h_3V5B7KrISN4C0RSPCe1s"


  200
{
  "statistics": {
    "rangeInDays": 30,
    "groupByInterval": "DAILY",
    "poolId": "137-0x4CcD010148379ea531D6C587CfDd60180196F9b1",
    "items": [
      {
        "timestamp": 1678900000000,
        "volumeInUSD": "15000.50",
        "feesInUSD": "750.25",
        "closeInUSD": "0.00036046617504367228",
        "highInUSD": "0.00038494169673061318",
        "lowInUSD": "0.00035904368570694481",
        "totalValueLockedInUSD": "500000.75",
        "token0PriceInToken1": "1.25",
        "token1PriceInToken0": "1.25"
      }
    ]
  }
}

403

{
  "statusCode": 403,
  "id": "UNAVAILABLE_COMPUTE_UNITS",
  "message": "The project doesn't have enough compute units to perform this action. Please upgrade your plan."
}