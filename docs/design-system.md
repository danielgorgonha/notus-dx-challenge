# Design System - Notus DX Challenge

## 🎨 Identidade Visual

### **Conceito**
Um dApp moderno que combina a simplicidade do Web2 com o poder do Web3, focado na experiência do desenvolvedor e na facilidade de uso.

### **Paleta de Cores**

#### **Cores Primárias**
```css
/* Azul Notus - Cor principal */
--notus-blue: #2563eb;
--notus-blue-light: #3b82f6;
--notus-blue-dark: #1d4ed8;

/* Verde DeFi - Para transações e sucesso */
--defi-green: #10b981;
--defi-green-light: #34d399;
--defi-green-dark: #059669;

/* Roxo Web3 - Para funcionalidades avançadas */
--web3-purple: #8b5cf6;
--web3-purple-light: #a78bfa;
--web3-purple-dark: #7c3aed;
```

#### **Cores Neutras**
```css
/* Cinzas */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-300: #d1d5db;
--gray-400: #9ca3af;
--gray-500: #6b7280;
--gray-600: #4b5563;
--gray-700: #374151;
--gray-800: #1f2937;
--gray-900: #111827;
```

#### **Cores de Status**
```css
/* Sucesso */
--success: #10b981;
--success-light: #d1fae5;
--success-dark: #065f46;

/* Erro */
--error: #ef4444;
--error-light: #fee2e2;
--error-dark: #991b1b;

/* Aviso */
--warning: #f59e0b;
--warning-light: #fef3c7;
--warning-dark: #92400e;

/* Info */
--info: #3b82f6;
--info-light: #dbeafe;
--info-dark: #1e40af;
```

### **Tipografia**

#### **Fontes**
- **Primária**: Inter (sistema)
- **Monospace**: JetBrains Mono (código)
- **Fallback**: system-ui, -apple-system, sans-serif

#### **Hierarquia**
```css
/* Headings */
--text-4xl: 2.25rem; /* 36px - Títulos principais */
--text-3xl: 1.875rem; /* 30px - Títulos de seção */
--text-2xl: 1.5rem; /* 24px - Subtítulos */
--text-xl: 1.25rem; /* 20px - Títulos de card */

/* Body */
--text-lg: 1.125rem; /* 18px - Texto grande */
--text-base: 1rem; /* 16px - Texto padrão */
--text-sm: 0.875rem; /* 14px - Texto pequeno */
--text-xs: 0.75rem; /* 12px - Labels */
```

### **Espaçamento**

#### **Sistema de Grid**
```css
--space-1: 0.25rem; /* 4px */
--space-2: 0.5rem; /* 8px */
--space-3: 0.75rem; /* 12px */
--space-4: 1rem; /* 16px */
--space-5: 1.25rem; /* 20px */
--space-6: 1.5rem; /* 24px */
--space-8: 2rem; /* 32px */
--space-10: 2.5rem; /* 40px */
--space-12: 3rem; /* 48px */
--space-16: 4rem; /* 64px */
--space-20: 5rem; /* 80px */
```

### **Componentes**

#### **Botões**
```css
/* Primário */
.btn-primary {
  background: var(--notus-blue);
  color: white;
  border-radius: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: var(--notus-blue-dark);
  transform: translateY(-1px);
}

/* Secundário */
.btn-secondary {
  background: transparent;
  color: var(--notus-blue);
  border: 2px solid var(--notus-blue);
  border-radius: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
}

/* DeFi (Verde) */
.btn-defi {
  background: var(--defi-green);
  color: white;
  border-radius: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
}
```

#### **Cards**
```css
.card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--gray-200);
  transition: all 0.3s;
}

.card:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.card-defi {
  border-left: 4px solid var(--defi-green);
}

.card-web3 {
  border-left: 4px solid var(--web3-purple);
}
```

#### **Formulários**
```css
.input {
  border: 2px solid var(--gray-300);
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.input:focus {
  outline: none;
  border-color: var(--notus-blue);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.input-error {
  border-color: var(--error);
}

.input-success {
  border-color: var(--success);
}
```

### **Ícones e Símbolos**

#### **Ícones Principais**
- **Wallet**: Carteira com raio (Smart Wallet)
- **Swap**: Setas duplas (Transfers & Swaps)
- **Pool**: Gotas interligadas (Liquidity Pools)
- **Shield**: Escudo (Segurança/KYC)
- **Chart**: Gráfico (Analytics)
- **Webhook**: Conexão (Real-time)

#### **Estilo de Ícones**
- **Tamanho**: 24px (padrão), 32px (destaque), 48px (hero)
- **Cor**: Seguir paleta de cores
- **Estilo**: Outline com preenchimento em hover

### **Layout**

#### **Grid System**
```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.grid-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
}

.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

@media (max-width: 768px) {
  .grid-2, .grid-3 {
    grid-template-columns: 1fr;
  }
}
```

#### **Breakpoints**
```css
--mobile: 640px;
--tablet: 768px;
--desktop: 1024px;
--wide: 1280px;
```

### **Animações**

#### **Transições**
```css
--transition-fast: 0.15s ease;
--transition-normal: 0.3s ease;
--transition-slow: 0.5s ease;
```

#### **Efeitos**
- **Hover**: Elevação sutil (translateY(-2px))
- **Loading**: Spinner com cores da marca
- **Success**: Checkmark animado
- **Error**: Shake animation

### **Estados**

#### **Loading States**
```css
.loading {
  position: relative;
  overflow: hidden;
}

.loading::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { left: -100%; }
  100% { left: 100%; }
}
```

#### **Empty States**
- **Ilustração**: SVG minimalista
- **Mensagem**: Texto explicativo
- **Ação**: Botão para ação principal

### **Acessibilidade**

#### **Contraste**
- **AA**: Mínimo 4.5:1 para texto normal
- **AAA**: Mínimo 7:1 para texto pequeno

#### **Foco**
```css
.focus-visible {
  outline: 2px solid var(--notus-blue);
  outline-offset: 2px;
}
```

### **Dark Mode**

#### **Cores Dark**
```css
[data-theme="dark"] {
  --bg-primary: var(--gray-900);
  --bg-secondary: var(--gray-800);
  --text-primary: var(--gray-100);
  --text-secondary: var(--gray-300);
  --border: var(--gray-700);
}
```

### **Brand Guidelines**

#### **Logo**
- **Forma**: Hexágono com "N" estilizado
- **Cores**: Azul Notus + Branco
- **Uso**: Sempre com espaço mínimo

#### **Tom de Voz**
- **Profissional** mas acessível
- **Técnico** mas claro
- **Inovador** mas confiável

#### **Aplicação**
- **Consistência** em todos os touchpoints
- **Simplicidade** na comunicação
- **Clareza** nas instruções
