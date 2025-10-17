# Scripts de Teste - API Notus

Esta pasta contém scripts para testar os endpoints da API Notus e entender como eles funcionam.

## Estrutura

```
docs/06-scripts/
├── pools/
│   ├── test-list-liquidity-pools.sh    # Script de teste
│   └── test-list-liquidity-pools.md     # Documentação do endpoint
└── README.md                           # Este arquivo
```

## Como Usar

### 1. Executar um Script de Teste

```bash
# Navegar para a pasta do script
cd docs/06-scripts/pools/

# Executar o script
./test-list-liquidity-pools.sh
```

### 2. O que o Script Faz

- Testa diferentes combinações de parâmetros
- Valida a estrutura dos dados retornados
- Salva as respostas em arquivos JSON
- Gera relatório de análise
- Fornece recomendações de melhoria

### 3. Arquivos Gerados

Cada execução gera:
- `liquidity_pools_[teste]_[timestamp].json` - Respostas da API
- Relatório no terminal com análise dos dados

## Endpoints Testados

### Pools de Liquidez
- **Endpoint**: `GET /api/v1/liquidity/pools`
- **Script**: `pools/test-list-liquidity-pools.sh`
- **Documentação**: `pools/test-list-liquidity-pools.md`

## Objetivos dos Testes

1. **Validar Funcionamento**: Verificar se os endpoints respondem corretamente
2. **Entender Dados**: Analisar a estrutura e qualidade dos dados
3. **Testar Filtros**: Validar diferentes combinações de parâmetros
4. **Identificar Problemas**: Encontrar limitações ou bugs
5. **Documentar Insights**: Registrar observações para o relatório final

## Pré-requisitos

- `curl` - Para fazer requisições HTTP
- `jq` - Para processar JSON
- `bash` - Para executar os scripts

## Instalação de Dependências

```bash
# Ubuntu/Debian
sudo apt-get install curl jq

# macOS
brew install curl jq

# Verificar instalação
curl --version
jq --version
```

## Exemplo de Execução

```bash
$ ./test-list-liquidity-pools.sh

Iniciando testes do endpoint /liquidity/pools
Mon Jan 15 10:30:00 UTC 2025

Teste: basic
Descrição: Listagem básica com parâmetros padrão
URL: https://api.notus.team/api/v1/liquidity/pools
----------------------------------------
Status: 200 (OK)
Pools encontrados: 10

Estrutura dos dados:
{
  "address": "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640",
  "chain": "POLYGON",
  "fee": 0.05,
  "totalValueLockedUSD": "10000.453",
  "tokens_count": 2,
  "stats": {
    "rangeInDays": 30,
    "feesInUSD": "1500.75",
    "volumeInUSD": "50000.25",
    "transactionsCount": 1250
  }
}
Resposta salva em: liquidity_pools_basic_20250115_103000.json
```

## Próximos Passos

1. Execute os scripts para testar os endpoints
2. Analise os arquivos JSON gerados
3. Documente os insights no relatório final
4. Use os dados para melhorar a implementação

