# Arquitetura e Casos de Uso - Notus DX Challenge

## 🏗️ Arquitetura do Sistema

### **Visão Geral**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   External      │
│   (Next.js)     │◄──►│   (API Routes)  │◄──►│   Services      │
│                 │    │                 │    │                 │
│ • React         │    │ • Server Actions│    │ • Notus API     │
│ • Privy SDK     │    │ • Auth Handler  │    │ • Privy API     │
│ • TanStack Query│    │ • Notus Client  │    │ • Blockchain    │
│ • Zustand       │    │ • Validation    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Fluxo de Dados**
```
User Action → Frontend → Server Action → Notus API → Blockchain
     ↑                                           ↓
     └─── Response ←─── Frontend ←─── Response ←──┘
```

## 📋 Casos de Uso

### **UC01: Autenticação e Criação de Wallet**

#### **Ator Principal**: Usuário
#### **Pré-condições**: Usuário acessa o dApp
#### **Fluxo Principal**:
1. Usuário clica em "Login"
2. Sistema exibe modal Privy
3. Usuário escolhe método de login (email/social/wallet)
4. Privy autentica o usuário
5. Sistema verifica se usuário tem wallet
6. Se não tiver, cria wallet automaticamente
7. Sistema registra smart wallet na Notus API
8. Usuário é redirecionado para dashboard

#### **Fluxos Alternativos**:
- **3a**: Usuário cancela login → Retorna à tela inicial
- **6a**: Erro na criação de wallet → Exibe erro e tenta novamente

#### **Pós-condições**: Usuário autenticado com smart wallet criada

---

### **UC02: Visualizar Portfolio**

#### **Ator Principal**: Usuário autenticado
#### **Pré-condições**: Usuário está logado
#### **Fluxo Principal**:
1. Usuário acessa dashboard
2. Sistema busca dados do portfolio via Notus API
3. Sistema exibe saldos de tokens
4. Sistema exibe valor total em USD
5. Sistema exibe gráfico de distribuição

#### **Fluxos Alternativos**:
- **2a**: API indisponível → Exibe estado de loading
- **2b**: Erro na API → Exibe mensagem de erro

#### **Pós-condições**: Portfolio exibido com dados atualizados

---

### **UC03: Executar Transferência**

#### **Ator Principal**: Usuário autenticado
#### **Pré-condições**: Usuário tem saldo suficiente
#### **Fluxo Principal**:
1. Usuário acessa seção "Transfers"
2. Usuário preenche formulário (destino, token, valor)
3. Sistema valida dados
4. Sistema solicita quote da Notus API
5. Sistema exibe preview da transação
6. Usuário confirma transação
7. Sistema solicita assinatura via Privy
8. Sistema executa transação via Notus API
9. Sistema exibe confirmação

#### **Fluxos Alternativos**:
- **3a**: Dados inválidos → Exibe erros de validação
- **4a**: Saldo insuficiente → Exibe erro
- **7a**: Usuário cancela assinatura → Cancela transação

#### **Pós-condições**: Transferência executada com sucesso

---

### **UC04: Executar Swap de Tokens**

#### **Ator Principal**: Usuário autenticado
#### **Pré-condições**: Usuário tem tokens para swap
#### **Fluxo Principal**:
1. Usuário acessa seção "Swaps"
2. Usuário seleciona token origem e destino
3. Usuário insere valor
4. Sistema solicita quote da Notus API
5. Sistema exibe taxa de câmbio e slippage
6. Usuário ajusta slippage se necessário
7. Usuário confirma swap
8. Sistema solicita assinatura via Privy
9. Sistema executa swap via Notus API
10. Sistema exibe confirmação

#### **Fluxos Alternativos**:
- **4a**: Par de tokens não suportado → Exibe erro
- **5a**: Slippage muito alto → Exibe aviso
- **8a**: Usuário cancela → Cancela swap

#### **Pós-condições**: Swap executado com sucesso

---

### **UC05: Interagir com Liquidity Pools**

#### **Ator Principal**: Usuário autenticado
#### **Pré-condições**: Usuário tem tokens para liquidez
#### **Fluxo Principal**:
1. Usuário acessa seção "Liquidity"
2. Sistema exibe pools disponíveis
3. Usuário seleciona pool
4. Sistema exibe detalhes (APR, TVL, composição)
5. Usuário escolhe ação (Add/Remove)
6. Usuário insere valores
7. Sistema calcula impermanent loss
8. Usuário confirma operação
9. Sistema solicita assinatura via Privy
10. Sistema executa operação via Notus API
11. Sistema exibe confirmação

#### **Fluxos Alternativos**:
- **7a**: Impermanent loss alto → Exibe aviso
- **9a**: Usuário cancela → Cancela operação

#### **Pós-condições**: Operação de liquidez executada

---

### **UC06: Verificar Status KYC**

#### **Ator Principal**: Usuário autenticado
#### **Pré-condições**: Usuário está logado
#### **Fluxo Principal**:
1. Usuário acessa seção "KYC"
2. Sistema verifica status via Notus API
3. Sistema exibe status atual
4. Se pendente, exibe formulário
5. Usuário preenche dados
6. Sistema submete para verificação
7. Sistema exibe confirmação

#### **Fluxos Alternativos**:
- **3a**: Já aprovado → Exibe status aprovado
- **3b**: Rejeitado → Exibe motivo e opção de reenvio

#### **Pós-condições**: Status KYC atualizado

---

## 🔄 Fluxos de Integração

### **Fluxo de Autenticação Completo**
```
1. User Login (Privy)
   ↓
2. Get User Data
   ↓
3. Check Wallet Exists
   ↓
4. Create Wallet (if needed)
   ↓
5. Register Smart Wallet (Notus)
   ↓
6. Return User + Smart Wallet
```

### **Fluxo de Transação**
```
1. User Input
   ↓
2. Validate Input
   ↓
3. Get Quote (Notus API)
   ↓
4. Show Preview
   ↓
5. User Confirmation
   ↓
6. Sign Message (Privy)
   ↓
7. Execute Transaction (Notus API)
   ↓
8. Show Result
```

### **Fluxo de Error Handling**
```
1. API Error
   ↓
2. Log Error
   ↓
3. Show User-Friendly Message
   ↓
4. Offer Retry Option
   ↓
5. Fallback to Mock Data (if available)
```

## 🎯 MVP - Funcionalidades Essenciais

### **Fase 1: Base (Dias 1-3)**
- ✅ Autenticação Privy
- ✅ Criação de Smart Wallet
- ✅ Dashboard básico
- ✅ Portfolio view

### **Fase 2: Transações (Dias 4-5)**
- [ ] Transferências
- [ ] Swaps básicos
- [ ] Histórico de transações

### **Fase 3: DeFi (Dia 6)**
- [ ] Liquidity pools
- [ ] Add/remove liquidity

### **Fase 4: Compliance (Dia 7)**
- [ ] KYC flow
- [ ] Status verification

### **Fase 5: Polimento (Dias 8-10)**
- [ ] Error handling
- [ ] Loading states
- [ ] Responsive design
- [ ] Testing
- [ ] Documentation

## 🔧 Componentes Técnicos

### **Frontend Components**
```
src/components/
├── auth/
│   ├── PrivyLoginButton.tsx
│   └── AuthGuard.tsx
├── dashboard/
│   ├── Portfolio.tsx
│   ├── BalanceCard.tsx
│   └── TransactionHistory.tsx
├── transfers/
│   ├── TransferForm.tsx
│   └── TransferPreview.tsx
├── swaps/
│   ├── SwapForm.tsx
│   └── SwapPreview.tsx
├── liquidity/
│   ├── PoolList.tsx
│   ├── PoolDetails.tsx
│   └── LiquidityForm.tsx
└── ui/
    ├── Button.tsx
    ├── Card.tsx
    ├── Input.tsx
    └── Modal.tsx
```

### **API Routes**
```
src/app/api/
├── auth/
│   └── route.ts
├── notus/
│   ├── portfolio/route.ts
│   ├── transfer/route.ts
│   ├── swap/route.ts
│   └── liquidity/route.ts
└── webhooks/
    └── route.ts
```

### **Server Actions**
```
src/actions/
├── auth.ts
├── portfolio.ts
├── transfers.ts
├── swaps.ts
└── liquidity.ts
```

## 📊 Métricas de Sucesso

### **Funcionais**
- [ ] Login/logout funcionando
- [ ] Smart wallet creation
- [ ] 1+ transfer executado
- [ ] 1+ swap executado
- [ ] Portfolio exibindo dados
- [ ] Liquidity pool interaction

### **UX/UI**
- [ ] Interface responsiva
- [ ] Loading states
- [ ] Error handling
- [ ] Feedback visual
- [ ] Navegação intuitiva

### **Técnicas**
- [ ] Código TypeScript sem erros
- [ ] Performance < 3s load time
- [ ] Error rate < 5%
- [ ] Mobile compatibility

## 🚀 Próximos Passos

1. **Implementar autenticação completa**
2. **Criar componentes base**
3. **Integrar Notus API**
4. **Testar fluxos principais**
5. **Polir UX/UI**
6. **Documentar feedback**
