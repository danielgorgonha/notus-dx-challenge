# Diagramas - Notus DX Challenge

## 🏗️ Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                        NOTUS DX CHALLENGE                      │
│                     (Next.js Frontend)                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   Auth      │  │  Dashboard  │  │  Transfers  │            │
│  │ (Privy)     │  │ (Portfolio) │  │   & Swaps   │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │ Liquidity   │  │    KYC      │  │  Analytics  │            │
│  │   Pools     │  │ (Compliance)│  │ (History)   │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
├─────────────────────────────────────────────────────────────────┤
│                    Server Actions & API Routes                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   Auth      │  │   Notus     │  │  Validation │            │
│  │  Handler    │  │   Client    │  │   & Utils   │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EXTERNAL SERVICES                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   Privy     │  │   Notus     │  │ Blockchain  │            │
│  │    API      │  │    API      │  │  Networks   │            │
│  │             │  │             │  │             │            │
│  │ • Auth      │  │ • Smart     │  │ • Ethereum  │            │
│  │ • Wallets   │  │   Wallets   │  │ • Polygon   │            │
│  │ • Signing   │  │ • Transfers │  │ • Arbitrum  │            │
│  │             │  │ • Swaps     │  │ • Optimism  │            │
│  │             │  │ • Liquidity │  │             │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Fluxo de Autenticação

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    User     │    │  Frontend   │    │   Privy     │    │   Notus     │
│             │    │  (Next.js)  │    │    API      │    │    API      │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       │ 1. Click Login    │                   │                   │
       ├──────────────────►│                   │                   │
       │                   │ 2. Open Privy     │                   │
       │                   │    Modal          │                   │
       │                   ├──────────────────►│                   │
       │                   │                   │ 3. Authenticate   │
       │                   │                   │    User           │
       │                   │                   │                   │
       │                   │ 4. Return User    │                   │
       │                   │◄──────────────────┤                   │
       │                   │                   │                   │
       │                   │ 5. Check Wallet   │                   │
       │                   │    Exists         │                   │
       │                   ├──────────────────►│                   │
       │                   │                   │ 6. Create Wallet  │
       │                   │                   │    (if needed)    │
       │                   │                   │                   │
       │                   │ 7. Register Smart │                   │
       │                   │    Wallet         │                   │
       │                   ├──────────────────────────────────────►│
       │                   │                   │                   │
       │                   │ 8. Return Smart   │                   │
       │                   │    Wallet Address │                   │
       │                   │◄──────────────────────────────────────┤
       │                   │                   │                   │
       │ 9. Redirect to    │                   │                   │
       │    Dashboard      │                   │                   │
       │◄──────────────────┤                   │                   │
```

## 💸 Fluxo de Transferência

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    User     │    │  Frontend   │    │   Notus     │    │ Blockchain  │
│             │    │  (Next.js)  │    │    API      │    │  Network    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       │ 1. Fill Transfer  │                   │                   │
       │    Form           │                   │                   │
       ├──────────────────►│                   │                   │
       │                   │ 2. Validate Input │                   │
       │                   │                   │                   │
       │                   │ 3. Request Quote  │                   │
       │                   ├──────────────────►│                   │
       │                   │                   │ 4. Calculate      │
       │                   │                   │    Gas & Fees     │
       │                   │                   │                   │
       │                   │ 5. Return Quote   │                   │
       │                   │◄──────────────────┤                   │
       │                   │                   │                   │
       │ 6. Show Preview   │                   │                   │
       │◄──────────────────┤                   │                   │
       │                   │                   │                   │
       │ 7. Confirm        │                   │                   │
       ├──────────────────►│                   │                   │
       │                   │ 8. Sign Message   │                   │
       │                   │    (Privy)        │                   │
       │                   │                   │                   │
       │                   │ 9. Execute        │                   │
       │                   │    Transaction    │                   │
       │                   ├──────────────────►│                   │
       │                   │                   │ 10. Submit to     │
       │                   │                   │     Blockchain    │
       │                   │                   ├──────────────────►│
       │                   │                   │                   │
       │                   │ 11. Return Hash   │                   │
       │                   │◄──────────────────┤                   │
       │                   │                   │                   │
       │ 12. Show Success  │                   │                   │
       │◄──────────────────┤                   │                   │
```

## 🔄 Fluxo de Swap

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    User     │    │  Frontend   │    │   Notus     │    │   DEX       │
│             │    │  (Next.js)  │    │    API      │    │ (Uniswap)   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       │ 1. Select Tokens  │                   │                   │
       │    & Amount       │                   │                   │
       ├──────────────────►│                   │                   │
       │                   │ 2. Request Quote  │                   │
       │                   ├──────────────────►│                   │
       │                   │                   │ 3. Get Best Route │
       │                   │                   ├──────────────────►│
       │                   │                   │                   │
       │                   │ 4. Return Quote   │                   │
       │                   │    + Slippage     │                   │
       │                   │◄──────────────────┤                   │
       │                   │                   │                   │
       │ 5. Show Quote     │                   │                   │
       │    & Slippage     │                   │                   │
       │◄──────────────────┤                   │                   │
       │                   │                   │                   │
       │ 6. Adjust         │                   │                   │
       │    Slippage       │                   │                   │
       ├──────────────────►│                   │                   │
       │                   │                   │                   │
       │ 7. Confirm Swap   │                   │                   │
       ├──────────────────►│                   │                   │
       │                   │ 8. Sign Message   │                   │
       │                   │    (Privy)        │                   │
       │                   │                   │                   │
       │                   │ 9. Execute Swap   │                   │
       │                   ├──────────────────►│                   │
       │                   │                   │ 10. Execute on    │
       │                   │                   │     DEX           │
       │                   │                   ├──────────────────►│
       │                   │                   │                   │
       │                   │ 11. Return Hash   │                   │
       │                   │◄──────────────────┤                   │
       │                   │                   │                   │
       │ 12. Show Success  │                   │                   │
       │◄──────────────────┤                   │                   │
```

## 🏊 Fluxo de Liquidity Pool

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    User     │    │  Frontend   │    │   Notus     │    │   Uniswap   │
│             │    │  (Next.js)  │    │    API      │    │     V3      │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       │ 1. Browse Pools   │                   │                   │
       ├──────────────────►│                   │                   │
       │                   │ 2. Get Pool List  │                   │
       │                   ├──────────────────►│                   │
       │                   │                   │ 3. Fetch Pool     │
       │                   │                   │    Data           │
       │                   │                   ├──────────────────►│
       │                   │                   │                   │
       │                   │ 4. Return Pool    │                   │
       │                   │    Data (APR,     │                   │
       │                   │    TVL, etc.)     │                   │
       │                   │◄──────────────────┤                   │
       │                   │                   │                   │
       │ 5. Show Pool      │                   │                   │
       │    Details        │                   │                   │
       │◄──────────────────┤                   │                   │
       │                   │                   │                   │
       │ 6. Select Action  │                   │                   │
       │    (Add/Remove)   │                   │                   │
       ├──────────────────►│                   │                   │
       │                   │                   │                   │
       │ 7. Enter Amounts  │                   │                   │
       ├──────────────────►│                   │                   │
       │                   │ 8. Calculate      │                   │
       │                   │    Impermanent    │                   │
       │                   │    Loss           │                   │
       │                   │                   │                   │
       │ 9. Show Preview   │                   │                   │
       │    + Risk         │                   │                   │
       │◄──────────────────┤                   │                   │
       │                   │                   │                   │
       │ 10. Confirm       │                   │                   │
       ├──────────────────►│                   │                   │
       │                   │ 11. Sign Message  │                   │
       │                   │    (Privy)        │                   │
       │                   │                   │                   │
       │                   │ 12. Execute       │                   │
       │                   │    Operation      │                   │
       │                   ├──────────────────►│                   │
       │                   │                   │ 13. Execute on    │
       │                   │                   │     Uniswap V3   │
       │                   │                   ├──────────────────►│
       │                   │                   │                   │
       │                   │ 14. Return Hash   │                   │
       │                   │◄──────────────────┤                   │
       │                   │                   │                   │
       │ 15. Show Success  │                   │                   │
       │◄──────────────────┤                   │                   │
```

## 🔐 Fluxo de KYC

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    User     │    │  Frontend   │    │   Notus     │    │   KYC       │
│             │    │  (Next.js)  │    │    API      │    │ Provider    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       │ 1. Access KYC     │                   │                   │
       │    Section        │                   │                   │
       ├──────────────────►│                   │                   │
       │                   │ 2. Check Status   │                   │
       │                   ├──────────────────►│                   │
       │                   │                   │ 3. Query KYC      │
       │                   │                   │    Status         │
       │                   │                   ├──────────────────►│
       │                   │                   │                   │
       │                   │ 4. Return Status  │                   │
       │                   │◄──────────────────┤                   │
       │                   │                   │                   │
       │ 5. Show Status    │                   │                   │
       │    (Pending/      │                   │                   │
       │    Approved/      │                   │                   │
       │    Rejected)      │                   │                   │
       │◄──────────────────┤                   │                   │
       │                   │                   │                   │
       │ 6. Fill Form      │                   │                   │
       │    (if needed)    │                   │                   │
       ├──────────────────►│                   │                   │
       │                   │ 7. Submit KYC     │                   │
       │                   │    Data           │                   │
       │                   ├──────────────────►│                   │
       │                   │                   │ 8. Process KYC    │
       │                   │                   ├──────────────────►│
       │                   │                   │                   │
       │                   │ 9. Return Result  │                   │
       │                   │◄──────────────────┤                   │
       │                   │                   │                   │
       │ 10. Show Result   │                   │                   │
       │◄──────────────────┤                   │                   │
```

## 📊 Estados da Aplicação

```
┌─────────────────────────────────────────────────────────────────┐
│                        APP STATES                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │   Loading   │    │   Error     │    │   Success   │         │
│  │             │    │             │    │             │         │
│  │ • Spinner   │    │ • Message   │    │ • Checkmark │         │
│  │ • Skeleton  │    │ • Retry     │    │ • Confetti  │         │
│  │ • Progress  │    │ • Fallback  │    │ • Redirect  │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │   Empty     │    │   Pending   │    │  Completed  │         │
│  │             │    │             │    │             │         │
│  │ • No Data   │    │ • Waiting   │    │ • Finished  │         │
│  │ • CTA       │    │ • Progress  │    │ • History   │         │
│  │ • Help      │    │ • Cancel    │    │ • Details   │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🎯 MVP Roadmap Visual

```
Dia 1-2: Setup & Auth
├── ✅ Next.js + TypeScript
├── ✅ Privy Integration
├── ✅ Smart Wallet Creation
└── ✅ Basic Dashboard

Dia 3: Portfolio & History
├── [ ] Portfolio API
├── [ ] Balance Display
├── [ ] Transaction History
└── [ ] Responsive Layout

Dia 4-5: Transfers & Swaps
├── [ ] Transfer Form
├── [ ] Transfer Execution
├── [ ] Swap Interface
├── [ ] Swap Execution
└── [ ] Error Handling

Dia 6: Liquidity Pools
├── [ ] Pool List
├── [ ] Pool Details
├── [ ] Add Liquidity
├── [ ] Remove Liquidity
└── [ ] Risk Calculator

Dia 7: KYC (Optional)
├── [ ] KYC Form
├── [ ] Status Check
├── [ ] Compliance
└── [ ] Fiat Integration

Dia 8-10: Polish & Deploy
├── [ ] Error Handling
├── [ ] Loading States
├── [ ] Mobile Responsive
├── [ ] Testing
├── [ ] Documentation
└── [ ] Demo Video
```
