# Deploy e CI/CD - Notus DX Challenge

## 🚀 Deploy Rápido

### 1. Instalar Vercel CLI
```bash
pnpm add -g vercel
```

### 2. Login e Deploy
```bash
vercel login
vercel --prod
```

### 3. Configurar Variáveis de Ambiente

#### Opção 1: Script Automático (Recomendado)
```bash
# Executar o script de configuração automática
cd docs/03-deployment
chmod +x setup-env.sh
./setup-env.sh
```

#### Opção 2: Manual
```bash
vercel env add NEXT_PUBLIC_PRIVY_APP_ID
vercel env add NOTUS_API_KEY
vercel env add PRIVY_APP_SECRET
vercel env add NEXT_PUBLIC_NOTUS_API_URL
vercel env add NEXT_PUBLIC_NODE_ENV
```

## 📋 Checklist de Deploy

### ✅ Pré-Deploy
- [ ] Build local funcionando (`pnpm build`)
- [ ] Todas as variáveis de ambiente configuradas
- [ ] Commits organizados e pushados
- [ ] Testes passando

### ✅ Deploy
- [ ] Vercel CLI instalado
- [ ] Login realizado
- [ ] Projeto configurado
- [ ] Variáveis de ambiente adicionadas
- [ ] Deploy executado com sucesso

### ✅ Pós-Deploy
- [ ] Aplicação funcionando em produção
- [ ] Funcionalidades principais testadas
- [ ] Analytics configurado
- [ ] Monitoramento ativo

## 🔧 Configurações

### Script de Configuração Automática

O arquivo `setup-env.sh` automatiza a configuração de todas as variáveis de ambiente necessárias na Vercel:

```bash
#!/bin/bash
# Script para configurar variáveis de ambiente na Vercel
# Lê valores do .env.local e os adiciona automaticamente

# Variáveis configuradas:
# - NEXT_PUBLIC_PRIVY_APP_ID
# - NOTUS_API_KEY  
# - PRIVY_APP_SECRET
# - NEXT_PUBLIC_NOTUS_API_URL
# - NEXT_PUBLIC_NODE_ENV
```

**Como usar:**
1. Certifique-se de que o arquivo `.env.local` está configurado
2. Execute: `./setup-env.sh`
3. O script irá ler as variáveis e configurá-las automaticamente na Vercel

### Variáveis de Ambiente Necessárias
```env
# Server-side (apenas no servidor)
NOTUS_API_KEY=your_notus_api_key
PRIVY_APP_SECRET=your_privy_app_secret

# Client-side (expostas no browser)
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
NEXT_PUBLIC_NOTUS_API_URL=https://api.notus.team/api/v1
NEXT_PUBLIC_NODE_ENV=production
```

### Build Configuration
- **Framework**: Next.js 15.5.3
- **Package Manager**: pnpm
- **Build Command**: `pnpm build`
- **Output Directory**: `.next`

## 📊 Status do Projeto

### ✅ Build Status
- **Compilação**: ✅ Funcionando
- **Linting**: ✅ Sem erros
- **TypeScript**: ✅ Sem erros
- **Dependencies**: ✅ Atualizadas

### ✅ Funcionalidades
- **Landing Page**: ✅ Funcionando
- **Privy Authentication**: ✅ Integrado
- **Smart Wallet**: ✅ Implementado
- **KYC Flow**: ✅ Integrado com API real
- **Notus API**: ✅ Migrado de mocks para real

## 🐛 Troubleshooting

### Problemas Comuns

#### Build Falha
```bash
# Verificar logs
vercel logs

# Build local
pnpm build
```

#### Variáveis de Ambiente
```bash
# Listar variáveis
vercel env ls

# Verificar valores
vercel env pull .env.local

# Reconfigurar todas as variáveis (se necessário)
cd docs/03-deployment
./setup-env.sh
```

#### Erro "Cannot initialize the Privy provider with an invalid Privy app ID"
Este erro geralmente ocorre quando:
1. `NEXT_PUBLIC_PRIVY_APP_ID` não está configurado na Vercel
2. A variável está configurada mas não está sendo lida corretamente

**Solução:**
```bash
# Verificar se a variável está configurada
vercel env ls | grep PRIVY

# Reconfigurar se necessário
vercel env rm NEXT_PUBLIC_PRIVY_APP_ID
vercel env add NEXT_PUBLIC_PRIVY_APP_ID production
```

## 📚 Documentação Completa

- [Guia Completo de Deploy](./vercel-deploy-guide.md)
- [Daily Board - 24/01/2025](../02-development/daily/daily-board-2025-01-24.md)
- [Configuração do Projeto](../01-setup/README.md)

## 🎯 Próximos Passos

1. **Deploy Inicial**: Executar deploy na Vercel
2. **Configurar CI/CD**: Ativar GitHub Actions
3. **Monitoramento**: Configurar analytics e alertas
4. **Otimizações**: Implementar melhorias de performance

---

**Status**: ✅ Pronto para Deploy
**Última atualização**: 24 de Janeiro de 2025
