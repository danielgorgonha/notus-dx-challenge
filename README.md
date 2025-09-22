# Notus DX Challenge

> Testing Notus API for Developer Experience research

Este projeto é parte da pesquisa de **Developer Experience (DX)** da **NotusLabs**, focada em avaliar a usabilidade da API NotusLab em cenários reais de desenvolvimento Web3.

## 🎯 Objetivo

- **Avaliar a usabilidade da API NotusLab** em cenários reais
- **Identificar pontos de fricção** na documentação e implementação  
- **Coletar feedback qualitativo** sobre a experiência do desenvolvedor
- **Mapear necessidades** da comunidade dev Web2/Web3
- **Testar todas as trilhas** (A, B, C) da API Notus

## 🛠️ Stack Técnico

- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Autenticação**: Privy SDK (@privy-io/react-auth)
- **Estado**: Zustand
- **API**: TanStack Query + Notus REST API
- **Formulários**: React Hook Form + Zod
- **Ícones**: Lucide React

## 🚀 Quick Start

### Pré-requisitos

- Node.js 18+
- pnpm
- Conta Privy (para autenticação Web3)
- API Key da Notus

### Instalação

```bash
# Clone o repositório
git clone <repo-url>
cd notus-dx-challenge

# Instale as dependências
pnpm install

# Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais
```

### Configuração

1. **Privy Setup**:
   - Crie uma conta em [Privy](https://privy.io)
   - Configure seu app e obtenha o `APP_ID`
   - Adicione no `.env.local`:
     ```env
     NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
     PRIVY_APP_SECRET=your_privy_app_secret
     ```

2. **Notus API**:
   - Obtenha sua API key da Notus
   - Adicione no `.env.local`:
     ```env
     NOTUS_API_URL=https://api.notus.team
     NOTUS_API_KEY=your_notus_api_key
     ```

### Executar

```bash
# Desenvolvimento
pnpm dev

# Build
pnpm build

# Produção
pnpm start
```

## 📁 Estrutura do Projeto

```
notus-dx-challenge/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── dashboard/          # Dashboard principal
│   │   ├── transfers/          # Trilha B - Transfers
│   │   ├── swaps/              # Trilha B - Swaps
│   │   ├── liquidity/          # Trilha C - Liquidity Pools
│   │   └── api/notus/          # API Routes
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── features/           # Feature components
│   │   └── providers/          # React providers
│   ├── lib/
│   │   ├── api/                # API clients (Notus, Privy)
│   │   ├── stores/             # Zustand stores
│   │   └── utils/              # Utility functions
│   ├── modules/                # Feature modules
│   │   ├── kyc-fiat/           # Trilha A
│   │   ├── swaps-transfer/     # Trilha B
│   │   ├── liquidity/          # Trilha C
│   │   ├── portfolio/          # Comum
│   │   └── history/            # Comum
│   ├── actions/                # Server Actions
│   └── types/                  # TypeScript types
├── docs/
│   ├── api-feedback.md         # Feedback da API
│   ├── roadmap.md              # Roadmap de 10 dias
│   └── pitch-deck/             # Materiais de apresentação
└── public/demo/                # Screenshots e demos
```

## 🛤️ Trilhas Testadas

### Trilha A - Smart Wallet + KYC + Fiat
- ✅ Autenticação Web3 via Privy
- ✅ Criação de Smart Wallet
- ✅ Fluxo de KYC (Know Your Customer)
- ✅ Integração com Fiat (depósitos/saques)
- ✅ Portfolio e histórico

### Trilha B - Smart Wallet + Swaps + Transfer
- ✅ Autenticação Web3 via Privy
- ✅ Criação de Smart Wallet
- ✅ Transferências entre carteiras
- ✅ Swaps de tokens
- ✅ Portfolio e histórico

### Trilha C - Smart Wallet + Liquidity Pools
- ✅ Autenticação Web3 via Privy
- ✅ Criação de Smart Wallet
- ✅ Interação com pools de liquidez
- ✅ Add/remove liquidity
- ✅ Portfolio e histórico

## 📊 Funcionalidades

- **Dashboard Unificado**: Interface única para todas as trilhas
- **Autenticação Web3**: Login via email, social ou wallet
- **Smart Wallets**: Criação e gerenciamento automático
- **Transações**: Transfers, swaps e operações DeFi
- **Portfolio**: Acompanhamento de saldos e histórico
- **Responsivo**: Interface adaptada para mobile e desktop

## 📝 Documentação

- [API Feedback](./docs/api-feedback.md) - Observações sobre a API Notus
- [Roadmap](./docs/roadmap.md) - Plano de 10 dias
- [Pitch Deck](./docs/pitch-deck/) - Materiais de apresentação

## 🧪 Testing

```bash
# Lint
pnpm lint

# Type check
pnpm type-check

# Build test
pnpm build
```

## 📈 Métricas de Sucesso

### Funcional
- [x] Login/logout funcionando
- [x] Smart wallet creation/registration
- [x] Pelo menos 1 transfer executado
- [x] Pelo menos 1 swap executado
- [x] Portfolio e history exibindo dados
- [x] Liquidity pool interaction básica

### Documentação
- [x] 10+ insights documentados
- [x] Video demo de 5-7 minutos
- [x] Pitch deck com findings
- [x] Relatório final estruturado

## 🤝 Contribuição

Este é um projeto de pesquisa da NotusLabs. Para contribuições:

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🔗 Links Úteis

- [Notus API Docs](https://docs.notus.team)
- [Privy Docs](https://docs.privy.io)
- [NotusLabs Discord](https://discord.gg/7zmMuPcP)

## 📞 Contato

- **NotusLabs**: [Discord](https://discord.gg/7zmMuPcP)
- **Desenvolvedor**: [GitHub](https://github.com/danielgorgonha)

---

**NotusLabs DX Research • 10 Days Challenge**