# 📊 Diagramas do Fluxo KYC + Wallet Integration

Este documento contém os diagramas Mermaid que ilustram o fluxo completo do sistema KYC integrado com wallets, desde o acesso do usuário até as operações de on-ramp.

## 🎯 Visão Geral do Sistema

### Fluxo Principal de Acesso e KYC

```mermaid
graph TD
    A[Usuário Acessa Sistema] --> B{Tipo de Acesso}
    
    B -->|Email| C[Criar Conta com Email]
    B -->|Wallet| D[Conectar Wallet Existente]
    
    C --> E[Etapa 0: KYC Automático]
    D --> F[Verificar Status KYC]
    
    E --> G[Wallet Criada + KYC Etapa 0]
    F --> H{Status KYC Atual}
    
    G --> I[Navegação Livre]
    H -->|Etapa 0| I
    H -->|Etapa 1| J[Limite: R$ 2.000,00]
    H -->|Etapa 2| K[Limite: R$ 50.000,00]
    H -->|Etapa 3| L[Contato Necessário]
    
    I --> M[Pode Navegar, Não Pode Operar]
    J --> N[Pode Operar até R$ 2.000,00]
    K --> O[Pode Operar até R$ 50.000,00]
    L --> P[Operações Limitadas]
```

## 🔐 Fluxo Detalhado de KYC

### Etapas do KYC

```mermaid
graph TD
    A[Início] --> B[Etapa 0: Cadastro Inicial]
    B --> C[Etapa 1: Dados Pessoais]
    C --> D[Etapa 2: Documentação + Liveness]
    D --> E[Etapa 3: Contato Manual]
    
    B --> B1[Email Cadastrado]
    B1 --> B2[Wallet Criada Automaticamente]
    B2 --> B3[KYC Status: Etapa 0]
    B3 --> B4[Limite: R$ 0,00]
    
    C --> C1[Formulário Dados Pessoais]
    C1 --> C2[Nome, CPF, Endereço, etc.]
    C2 --> C3[Sessão KYC Criada]
    C3 --> C4[KYC Status: Etapa 1]
    C4 --> C5[Limite: R$ 2.000,00]
    
    D --> D1[Upload Documentos]
    D1 --> D2[Frente/Verso RG/CNH/Passaporte]
    D2 --> D3[Verificação Liveness]
    D3 --> D4[Processamento KYC]
    D4 --> D5[KYC Status: Etapa 2]
    D5 --> D6[Limite: R$ 50.000,00]
    
    E --> E1[Contato com Suporte]
    E1 --> E2[Verificação Manual]
    E2 --> E3[Limite Personalizado]
```

## 💰 Fluxo de On-Ramp (Depósito Fiat)

### Processo Completo de Depósito

```mermaid
sequenceDiagram
    participant U as Usuário
    participant W as Wallet
    participant K as Sistema KYC
    participant N as API Notus
    participant B as Banco/PIX
    
    U->>W: Acessa Wallet
    W->>K: Verifica Status KYC
    K-->>W: Status: Etapa 1 (R$ 2.000,00)
    
    U->>W: Solicita Depósito R$ 100,00
    W->>N: POST /fiat/deposit/quote
    Note over N: Verifica limite KYC
    N-->>W: Quote ID + Dados PIX
    
    W->>U: Exibe QR Code PIX
    U->>B: Paga via PIX
    B->>N: Confirma Pagamento
    
    N->>N: Processa Depósito
    N->>W: Credita USDC na Wallet
    N-->>W: Webhook: Depósito Concluído
    
    W->>U: Notifica Sucesso
    U->>W: Visualiza Saldo Atualizado
```

## 🔄 Fluxo de Off-Ramp (Saque Fiat)

### Processo Completo de Saque

```mermaid
sequenceDiagram
    participant U as Usuário
    participant W as Wallet
    participant K as Sistema KYC
    participant N as API Notus
    participant B as Banco/PIX
    
    U->>W: Acessa Wallet
    W->>K: Verifica Status KYC
    K-->>W: Status: Etapa 2 (R$ 50.000,00)
    
    U->>W: Solicita Saque R$ 1.000,00
    W->>N: POST /fiat/withdraw/quote
    Note over N: Verifica limite KYC
    N-->>W: Quote ID + UserOperation
    
    W->>U: Solicita Assinatura
    U->>W: Assina UserOperation
    W->>N: POST /crypto/execute-user-op
    
    N->>N: Executa UserOperation
    N->>B: Transfere para PIX
    N-->>W: Webhook: Saque Concluído
    
    W->>U: Notifica Sucesso
    U->>B: Recebe PIX
```

## 🏗️ Arquitetura do Sistema

### Componentes e Integração

```mermaid
graph TB
    subgraph "Frontend"
        A[KYCManager Component]
        B[WalletDashboard]
        C[PortfolioView]
        D[TransactionHistory]
    end
    
    subgraph "Hooks & State"
        E[useKYCManager]
        F[useWalletMetadata]
        G[useTransactionHistory]
    end
    
    subgraph "API Layer"
        H[Wallet Metadata API]
        I[KYC Session Manager]
        J[Notus API Client]
    end
    
    subgraph "External APIs"
        K[Notus KYC API]
        L[Notus Fiat API]
        M[Notus Wallet API]
        N[S3 Upload Service]
    end
    
    A --> E
    B --> F
    C --> G
    D --> G
    
    E --> H
    E --> I
    F --> H
    G --> J
    
    H --> M
    I --> K
    J --> L
    J --> M
    I --> N
```

## 📱 Fluxo de Navegação do Usuário

### Jornada Completa do Usuário

```mermaid
journey
    title Jornada do Usuário no Sistema KYC + Wallet
    
    section Acesso Inicial
      Acessa Sistema: 5: Usuário
      Escolhe Login: 4: Usuário
      Cadastra Email: 3: Usuário
      Wallet Criada: 5: Sistema
    
    section Navegação Inicial
      Explora Telas: 4: Usuário
      Tenta Operar: 2: Usuário
      Vê Limitação: 3: Usuário
      Decide Fazer KYC: 4: Usuário
    
    section Etapa 1 KYC
      Preenche Dados: 3: Usuário
      Submete Formulário: 4: Usuário
      Aguarda Processamento: 2: Usuário
      Recebe Aprovação: 5: Usuário
    
    section Operações Básicas
      Faz Primeiro Depósito: 5: Usuário
      Testa Limite R$ 2.000: 4: Usuário
      Quer Mais Limite: 4: Usuário
      Decide Etapa 2: 3: Usuário
    
    section Etapa 2 KYC
      Upload Documentos: 3: Usuário
      Verificação Liveness: 2: Usuário
      Aguarda Aprovação: 2: Usuário
      Recebe Limite R$ 50.000: 5: Usuário
    
    section Operações Avançadas
      Faz Depósitos Grandes: 5: Usuário
      Usa Todos os Recursos: 5: Usuário
      Sistema Funciona Perfeitamente: 5: Usuário
```

## 🔧 Fluxo Técnico de Implementação

### Sessão KYC + Metadados da Wallet

```mermaid
sequenceDiagram
    participant C as Componente
    participant H as useKYCManager
    participant M as Wallet Metadata
    participant N as Notus API
    participant S as S3 Storage
    
    C->>H: createKYCSession(data)
    H->>N: POST /kyc/individual-verification-sessions/standard
    N-->>H: sessionId + uploadUrls
    H->>M: addActiveKYCSession(sessionId)
    M-->>H: Metadados atualizados
    H-->>C: Sessão criada
    
    C->>H: uploadDocument(file, sessionId)
    H->>S: Upload via presigned URL
    S-->>H: Upload concluído
    H->>N: POST /kyc/.../process
    N-->>H: Processamento iniciado
    
    C->>H: checkSessionStatus(sessionId)
    H->>N: GET /kyc/.../standard/{sessionId}
    N-->>H: Status atualizado
    H->>M: updateActiveKYCSessionStatus()
    M-->>H: Metadados atualizados
    H-->>C: Status atual
    
    Note over N: KYC Aprovado
    H->>M: finalizeKYCSession(individualId)
    M-->>H: Sessão movida para histórico
    H-->>C: KYC Completo
```

## 🎯 Casos de Uso Principais

### 1. Usuário Novo (Email)

```mermaid
graph TD
    A[Usuário acessa com email] --> B[Sistema cria conta]
    B --> C[Wallet gerada automaticamente]
    C --> D[KYC Etapa 0 - Automático]
    D --> E[Usuário pode navegar]
    E --> F[Usuário tenta operar]
    F --> G[Sistema bloqueia - KYC necessário]
    G --> H[Usuário inicia Etapa 1]
    H --> I[Limite R$ 2.000,00 liberado]
```

### 2. Usuário com Wallet Existente

```mermaid
graph TD
    A[Usuário conecta wallet] --> B[Sistema verifica KYC]
    B --> C{Status KYC}
    C -->|Etapa 0| D[Pode navegar, não operar]
    C -->|Etapa 1| E[Pode operar até R$ 2.000,00]
    C -->|Etapa 2| F[Pode operar até R$ 50.000,00]
    C -->|Etapa 3| G[Contato necessário]
```

### 3. Processo de On-Ramp Completo

```mermaid
graph TD
    A[Usuário quer depositar] --> B{Sistema verifica KYC}
    B -->|Etapa 0| C[Bloqueia - KYC necessário]
    B -->|Etapa 1+| D[Permite depósito]
    D --> E[Sistema cria quote]
    E --> F[Usuário paga PIX]
    F --> G[Sistema credita wallet]
    G --> H[Usuário recebe notificação]
```

## 📊 Estados e Transições

### Estados do KYC

```mermaid
stateDiagram-v2
    [*] --> Etapa0: Usuário cadastra email
    Etapa0 --> Etapa1: Preenche dados pessoais
    Etapa1 --> Etapa2: Upload documentos + liveness
    Etapa2 --> Etapa3: Contato manual necessário
    Etapa3 --> [*]: Limite personalizado
    
    Etapa0 --> Etapa0: Navegação livre
    Etapa1 --> Etapa1: Operações até R$ 2.000,00
    Etapa2 --> Etapa2: Operações até R$ 50.000,00
    Etapa3 --> Etapa3: Operações limitadas
    
    note right of Etapa0: Limite: R$ 0,00
    note right of Etapa1: Limite: R$ 2.000,00
    note right of Etapa2: Limite: R$ 50.000,00
    note right of Etapa3: Limite: Personalizado
```

## 🚀 Próximos Passos

### Implementação e Testes

1. **Testes de Integração**
   - Testar fluxo completo com API Notus
   - Validar upload de documentos
   - Verificar webhooks de notificação

2. **Implementação Frontend**
   - Integrar KYCManager nas telas principais
   - Implementar portfolio e histórico
   - Adicionar notificações em tempo real

3. **Testes de Usuário**
   - Testar jornada completa do usuário
   - Validar limites e restrições
   - Verificar experiência em diferentes dispositivos

---

**Última atualização:** 20/01/2025  
**Versão:** 1.0  
**Status:** Em desenvolvimento
