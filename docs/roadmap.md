# Roadmap - Notus DX Challenge

> Plano detalhado de 10 dias para testar todas as funcionalidades da API Notus

## 📅 Cronograma Geral

| Período | Fase | Atividades |
|---------|------|------------|
| 21-27 set | Execução | Testes práticos |
| 28 set - 04 out | Entrega | Relatório final, Avaliações |
| 05-10 out | Seleção | Entrevista com os Top 5 |

## 🎯 Objetivos por Dia

### **Dia 1: Setup & Base Authentication** 
*Fundação do projeto*

#### Morning (2-3h)
- [x] Criar repositório `notus-dx-challenge`
- [x] Setup Next.js 14 + TypeScript + Tailwind
- [x] Configurar estrutura de pastas
- [x] Instalar Privy SDK
- [x] Criar `.env.example` com variáveis necessárias

#### Afternoon (2-3h)
- [x] Implementar Privy Provider no layout
- [x] Criar componente `PrivyLoginButton`
- [x] Configurar server-side `auth()` function
- [x] Testar login/logout básico
- [x] Documentar no `docs/API_FEEDBACK.md`

**Deliverables**:
- [x] Login funcional com Privy
- [x] Smart wallet creation automática
- [x] Documentação inicial do setup

---

### **Dia 2: Smart Wallet & API Client**
*Base para todas as trilhas*

#### Morning (2-3h)
- [ ] Configurar cliente Notus API (`lib/notus-api.ts`)
- [ ] Implementar wallet registration flow
- [ ] Criar helper functions para API calls
- [ ] Testar wallet creation via Postman/Thunder Client

#### Afternoon (2-3h)
- [ ] Criar dashboard básico com user info
- [ ] Mostrar EOA address e Smart Wallet address
- [ ] Implementar wallet balance check
- [ ] Criar layout base para as trilhas

**Deliverables**:
- [ ] Dashboard funcional mostrando wallets
- [ ] Cliente API centralizado
- [ ] Balance checking

---

### **Dia 3: Portfolio & History (Base comum)**
*Funcionalidade compartilhada por todas trilhas*

#### Morning (2-3h)
- [ ] Implementar endpoint `GET /portfolio`
- [ ] Criar componente Portfolio com lista de tokens
- [ ] Implementar formatação de valores (decimals, USD)
- [ ] Testar com diferentes tokens

#### Afternoon (2-3h)
- [ ] Implementar endpoint `GET /history`
- [ ] Criar componente History com filtros
- [ ] Implementar paginação básica
- [ ] Documentar comportamento dos endpoints

**Deliverables**:
- [ ] Portfolio view funcional
- [ ] History com transações
- [ ] Componentes reutilizáveis

---

### **Dia 4: Trilha B - Transfers**
*Smart Wallet + Transfer + Portfolio + History*

#### Morning (2-3h)
- [ ] Implementar `getTransferQuote` server action
- [ ] Criar formulário de transfer (to, amount, token)
- [ ] Implementar validações básicas
- [ ] Testar quote generation

#### Afternoon (2-3h)
- [ ] Implementar `executeUserOperation` 
- [ ] Criar fluxo: Quote → Sign → Execute
- [ ] Implementar feedback visual (loading, success, error)
- [ ] Testar transfer completo

**Deliverables**:
- [ ] Transfer funcional entre carteiras
- [ ] User operation execution
- [ ] Feedback de UX documentado

---

### **Dia 5: Trilha B - Swaps**
*Smart Wallet + Swaps + Portfolio + History*

#### Morning (2-3h)
- [ ] Implementar `getSwapQuote` server action
- [ ] Criar componente Swap (from/to tokens)
- [ ] Implementar token selection dropdown
- [ ] Testar different token pairs

#### Afternoon (2-3h)
- [ ] Implementar swap execution flow
- [ ] Criar slippage settings
- [ ] Implementar price impact warnings
- [ ] Testar swaps end-to-end

**Deliverables**:
- [ ] Swap interface funcional
- [ ] Token pair testing
- [ ] Documentação de limitações da API

---

### **Dia 6: Trilha C - Liquidity Pools**
*Smart Wallet + Liquidity pools + Portfolio + History*

#### Morning (2-3h)
- [ ] Implementar `getLiquidityPools` endpoint
- [ ] Criar componente Pool List
- [ ] Mostrar APR, TVL, pool composition
- [ ] Implementar pool details view

#### Afternoon (2-3h)
- [ ] Implementar `addLiquidity` flow
- [ ] Criar formulário add/remove liquidity
- [ ] Implementar impermanent loss calculator
- [ ] Testar pool interactions

**Deliverables**:
- [ ] Liquidity pools interface
- [ ] Add/remove liquidity funcional
- [ ] Risk calculations

---

### **Dia 7: Trilha A - KYC & Fiat (Opcional)**
*Se houver tempo disponível*

#### Morning (2-3h)
- [ ] Implementar KYC submission flow
- [ ] Criar formulário de verificação
- [ ] Implementar status checking
- [ ] Documentar KYC requirements

#### Afternoon (2-3h)
- [ ] Implementar fiat deposit/withdrawal
- [ ] Criar interface para bank linking
- [ ] Testar fiat integration
- [ ] Documentar compliance aspects

**Deliverables**:
- [ ] KYC flow (se disponível na API)
- [ ] Fiat integration testing

---

### **Dia 8: Integration & Testing**
*Conectar todas as funcionalidades*

#### Morning (2-3h)
- [ ] Implementar navigation entre trilhas
- [ ] Criar workflow completo: Login → Transfer → Swap → Pool
- [ ] Testar edge cases (insufficient balance, etc)
- [ ] Implementar error handling robusto

#### Afternoon (2-3h)
- [ ] Testar todos os fluxos end-to-end
- [ ] Implementar loading states consistentes
- [ ] Criar transaction status tracking
- [ ] Documentar bugs e limitations encontrados

**Deliverables**:
- [ ] Fluxo completo funcionando
- [ ] Error handling robusto
- [ ] Documentation de edge cases

---

### **Dia 9: Demo & Documentation**
*Preparação para entrega*

#### Morning (2-3h)
- [ ] Gravar video demo (5-7 min)
  - [ ] Login flow
  - [ ] Cada trilha funcionando
  - [ ] Highlights dos insights
- [ ] Criar pitch deck (5-7 slides)
- [ ] Escrever README detalhado

#### Afternoon (2-3h)
- [ ] Compilar `API_FEEDBACK.md` final
- [ ] Organizar screenshots para o relatório
- [ ] Criar deployment (Vercel/Netlify)
- [ ] Testar deployment funcionando

**Deliverables**:
- [ ] Video demo completo
- [ ] Pitch deck finalizado
- [ ] Deployment live

---

### **Dia 10: Final Delivery**
*Entrega e documentação final*

#### Morning (2-3h)
- [ ] Finalizar relatório técnico seguindo template Notus
- [ ] Review final do código e documentação
- [ ] Criar post para LinkedIn
- [ ] Submit no repositório público

#### Afternoon (2-3h)
- [ ] Preencher Forms 2 (Pós-teste)
- [ ] Enviar relatório final
- [ ] Publicar post no LinkedIn
- [ ] Preparar apresentação para possível entrevista

**Deliverables**:
- [ ] Relatório final submetido
- [ ] Post LinkedIn publicado
- [ ] Projeto completo no GitHub

---

## 📊 Métricas de Sucesso

### Funcional
- [ ] Login/logout funcionando
- [ ] Smart wallet creation/registration
- [ ] Pelo menos 1 transfer executado com sucesso
- [ ] Pelo menos 1 swap executado com sucesso
- [ ] Portfolio e history exibindo dados corretos
- [ ] Liquidity pool interaction básica

### Documentação
- [ ] 10+ insights documentados no API_FEEDBACK.md
- [ ] Video demo de 5-7 minutos
- [ ] Pitch deck com findings
- [ ] Relatório final estruturado

### Technical
- [ ] Código TypeScript sem erros
- [ ] Deployment funcionando
- [ ] Error handling implementado
- [ ] Loading states consistentes

---

## 🚨 Contingency Plan

### Se alguma API não funcionar
- Documente o problema detalhadamente
- Implemente mock/placeholder
- Foque nas APIs que funcionam
- Use isso como feedback valioso

### Se ficar sem tempo
- Priorize: Auth → Transfers → Swaps
- Liquidity pools pode ser demonstrado via API calls no video
- KYC pode ser documentado como "future work"

### Se encontrar bugs críticos
- Documente com screenshots/logs
- Tente workarounds
- Continue com outras funcionalidades
- Relate no feedback como high priority

---

## 📝 Daily Checklist Template

```markdown
## Dia X - [Data]

### Planned:
- [ ] Task 1
- [ ] Task 2

### Completed:
- [x] Completed task
- [x] Another completed task

### Blockers/Issues:
- Issue with endpoint X: [description]
- API returning unexpected response: [details]

### Insights/Feedback:
- Documentation could be clearer about Y
- Endpoint Z has high latency
- UX consideration: [note]

### Tomorrow:
- [ ] Priority task for next day
```

---

**Status**: Em andamento  
**Última atualização**: 21 de setembro de 2024  
**Próxima revisão**: Diária
