# Design System Simplificado - Notus DX Challenge

> Versão otimizada para desenvolvimento em 2h/dia

## 🎯 **Estratégia Simplificada**

### **Foco Principal:**
- **Funcionalidade** > Visual perfeito
- **MVP rápido** > Design complexo
- **API testing** > Interface sofisticada

### **Abordagem:**
- Usar **shadcn/ui** como base (já configurado)
- Aplicar **cores da Notus** nos componentes existentes
- **Layout simples** mas profissional
- **Foco na usabilidade** para testar a API

---

## 🎨 **Paleta de Cores Simplificada**

```css
/* Cores principais */
--notus-blue: #0066FF;      /* Primária */
--notus-dark: #0A0A0F;      /* Fundo */
--notus-gray: #1A1A1F;      /* Cards */
--accent-green: #00D9A0;    /* Sucesso */
--accent-red: #FF4757;      /* Erro */
--accent-purple: #8B5CF6;   /* Premium */
```

### **Aplicação:**
- **Background**: `bg-slate-900` (próximo ao notus-dark)
- **Cards**: `bg-slate-800` (próximo ao notus-gray)
- **Primary**: `bg-blue-600` (próximo ao notus-blue)
- **Success**: `bg-emerald-500` (próximo ao accent-green)

---

## 📐 **Layout Simplificado**

### **Estrutura:**
```
┌─────────────────────────────────────┐
│ Header (Connect Wallet + Title)     │
├─────────────────────────────────────┤
│ Stats Cards (3 colunas)             │
├─────────────────────────────────────┤
│ Portfolio | Quick Actions           │
├─────────────────────────────────────┤
│ Recent Transactions                 │
└─────────────────────────────────────┘
```

### **Responsivo:**
- **Desktop**: 3 colunas → 2 colunas → 1 coluna
- **Mobile**: Stack vertical simples
- **Sidebar**: Removida para simplificar

---

## 🧩 **Componentes Essenciais**

### **1. Stats Cards**
```tsx
<Card className="bg-slate-800 border-slate-700">
  <CardHeader>
    <div className="flex items-center space-x-2">
      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
        <Wallet className="w-4 h-4 text-white" />
      </div>
      <CardTitle className="text-slate-200">Total Balance</CardTitle>
    </div>
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold text-white">$3,247.82</div>
    <div className="text-emerald-500 text-sm">+12.5%</div>
  </CardContent>
</Card>
```

### **2. Quick Actions**
```tsx
<div className="grid grid-cols-2 gap-4">
  <Button className="h-20 bg-blue-600 hover:bg-blue-700">
    <div className="text-center">
      <ArrowRightLeft className="w-6 h-6 mx-auto mb-2" />
      <div className="text-sm">Swap</div>
    </div>
  </Button>
  <Button className="h-20 bg-emerald-600 hover:bg-emerald-700">
    <div className="text-center">
      <Send className="w-6 h-6 mx-auto mb-2" />
      <div className="text-sm">Send</div>
    </div>
  </Button>
</div>
```

### **3. Portfolio Item**
```tsx
<div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
  <div className="flex items-center space-x-3">
    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
      <span className="text-white font-semibold text-sm">USDC</span>
    </div>
    <div>
      <div className="text-white font-medium">USD Coin</div>
      <div className="text-slate-400 text-sm">1,250.00 USDC</div>
    </div>
  </div>
  <div className="text-right">
    <div className="text-white font-medium">$1,250.00</div>
    <div className="text-emerald-500 text-sm">+0.1%</div>
  </div>
</div>
```

---

## 🚀 **Implementação Rápida**

### **Passo 1: Atualizar Tailwind Config**
```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        notus: {
          blue: '#0066FF',
          dark: '#0A0A0F',
          gray: '#1A1A1F',
        }
      }
    }
  }
}
```

### **Passo 2: Atualizar Layout Principal**
```tsx
// src/app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-900 text-white">
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  )
}
```

### **Passo 3: Dashboard Simplificado**
```tsx
// src/app/dashboard/page.tsx
export default function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-slate-400">Testing Notus API</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            Connect Wallet
          </Button>
        </div>
      </header>
      
      <main className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Implementar stats cards */}
        </div>
        
        {/* Portfolio & Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Implementar portfolio e quick actions */}
        </div>
      </main>
    </div>
  )
}
```

---

## ⏱️ **Cronograma de Implementação (2h)**

### **Dia 2 - 30min:**
- [ ] Atualizar `tailwind.config.js` com cores Notus
- [ ] Aplicar tema dark no layout principal
- [ ] Criar componente `StatsCard` básico

### **Dia 2 - 60min:**
- [ ] Implementar dashboard layout principal
- [ ] Criar seção de stats (3 cards)
- [ ] Implementar quick actions (4 botões)

### **Dia 2 - 30min:**
- [ ] Criar componente portfolio básico
- [ ] Adicionar hover effects simples
- [ ] Testar responsividade

---

## 🎯 **Resultado Esperado**

### **Visual:**
- ✅ **Profissional** mas não complexo
- ✅ **Cores da Notus** aplicadas consistentemente
- ✅ **Layout limpo** e funcional
- ✅ **Responsivo** para mobile

### **Funcional:**
- ✅ **Foco na API** testing
- ✅ **Navegação simples** entre funcionalidades
- ✅ **Estados claros** (conectado/desconectado)
- ✅ **Feedback visual** para ações

### **Técnico:**
- ✅ **Código limpo** e manutenível
- ✅ **Componentes reutilizáveis**
- ✅ **Performance otimizada**
- ✅ **Fácil de expandir**

---

## 💡 **Vantagens da Abordagem Simplificada**

1. **Rápida implementação** (2h vs 8h+)
2. **Foco no essencial** (API testing)
3. **Base sólida** para expansão futura
4. **Profissional** o suficiente para impressionar
5. **Manutenível** e escalável

---

**Status**: Design system simplificado criado  
**Próximo passo**: Implementar no projeto Next.js  
**Tempo estimado**: 2 horas total
