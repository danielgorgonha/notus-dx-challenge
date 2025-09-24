# Guia de Deploy na Vercel

## 📋 Pré-requisitos

### 1. Conta Vercel
- [ ] Criar conta na [Vercel](https://vercel.com)
- [ ] Conectar conta GitHub (recomendado)

### 2. Vercel CLI
```bash
# Instalar Vercel CLI globalmente
npm install -g vercel

# Ou usar pnpm
pnpm add -g vercel

# Verificar instalação
vercel --version
```

### 3. Variáveis de Ambiente
Certifique-se de ter as seguintes variáveis configuradas:

```env
# Privy Authentication
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
PRIVY_APP_SECRET=your_privy_app_secret

# Notus API
NEXT_PUBLIC_NOTUS_API_URL=https://api.notus.team/api/v1
NEXT_PUBLIC_NOTUS_API_KEY=your_notus_api_key
```

## 🚀 Processo de Deploy

### Método 1: Deploy via Vercel CLI

#### 1. Login na Vercel
```bash
vercel login
```

#### 2. Configurar Projeto
```bash
# Na pasta do projeto
vercel

# Seguir as instruções:
# - Set up and deploy? Y
# - Which scope? [seu-username]
# - Link to existing project? N
# - Project name: notus-dx-challenge
# - Directory: ./
# - Override settings? N
```

#### 3. Configurar Variáveis de Ambiente
```bash
# Adicionar variáveis uma por uma
vercel env add NEXT_PUBLIC_PRIVY_APP_ID
vercel env add PRIVY_APP_SECRET
vercel env add NEXT_PUBLIC_NOTUS_API_URL
vercel env add NEXT_PUBLIC_NOTUS_API_KEY

# Ou adicionar todas de uma vez
vercel env add NEXT_PUBLIC_PRIVY_APP_ID production
vercel env add PRIVY_APP_SECRET production
vercel env add NEXT_PUBLIC_NOTUS_API_URL production
vercel env add NEXT_PUBLIC_NOTUS_API_KEY production
```

#### 4. Deploy
```bash
# Deploy para produção
vercel --prod

# Ou deploy de preview
vercel
```

### Método 2: Deploy via Dashboard Vercel

#### 1. Importar Projeto
1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Clique em "New Project"
3. Importe o repositório GitHub
4. Configure o projeto:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `pnpm build`
   - **Output Directory**: `.next`

#### 2. Configurar Variáveis de Ambiente
1. Vá para Settings > Environment Variables
2. Adicione todas as variáveis necessárias
3. Marque para Production, Preview e Development

#### 3. Deploy
1. Clique em "Deploy"
2. Aguarde o build completar
3. Acesse a URL fornecida

## 🔧 Configurações do Projeto

### Build Settings
```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": ".next",
  "installCommand": "pnpm install",
  "framework": "nextjs"
}
```

### Vercel Configuration (vercel.json)
```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": ".next",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_PRIVY_APP_ID": "@privy-app-id",
    "PRIVY_APP_SECRET": "@privy-app-secret",
    "NEXT_PUBLIC_NOTUS_API_URL": "@notus-api-url",
    "NEXT_PUBLIC_NOTUS_API_KEY": "@notus-api-key"
  }
}
```

## 🔄 CI/CD Automático

### Configuração GitHub Actions (Opcional)

Crie `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
          
      - name: Install dependencies
        run: pnpm install
        
      - name: Build project
        run: pnpm build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

### Secrets Necessários no GitHub
- `VERCEL_TOKEN`: Token da Vercel
- `ORG_ID`: ID da organização Vercel
- `PROJECT_ID`: ID do projeto Vercel

## 🐛 Troubleshooting

### Problemas Comuns

#### 1. Build Falha
```bash
# Verificar logs
vercel logs [deployment-url]

# Build local para debug
pnpm build
```

#### 2. Variáveis de Ambiente
```bash
# Verificar variáveis
vercel env ls

# Remover e readicionar
vercel env rm VARIABLE_NAME
vercel env add VARIABLE_NAME
```

#### 3. Dependências
```bash
# Limpar cache
vercel --force

# Reinstalar dependências
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Logs e Debugging
```bash
# Ver logs em tempo real
vercel logs --follow

# Ver logs de um deployment específico
vercel logs [deployment-url]
```

## 📊 Monitoramento

### Vercel Analytics
1. Ative Vercel Analytics no dashboard
2. Monitore performance e erros
3. Configure alertas para falhas

### Health Checks
- **Build Status**: ✅ Funcionando
- **Deploy Status**: ✅ Automático
- **Environment Variables**: ✅ Configuradas
- **Domain**: ✅ Configurado

## 🔐 Segurança

### Variáveis Sensíveis
- Nunca commite variáveis de ambiente
- Use Vercel Environment Variables
- Configure diferentes valores para dev/staging/prod

### Domínio Customizado
1. Vá para Settings > Domains
2. Adicione seu domínio
3. Configure DNS conforme instruções
4. Ative SSL automático

## 📈 Otimizações

### Performance
- **Image Optimization**: Automática no Next.js
- **Static Generation**: Configurada para páginas estáticas
- **CDN**: Automático via Vercel Edge Network

### Caching
- **Static Assets**: Cache automático
- **API Routes**: Configurar cache headers
- **ISR**: Implementar quando necessário

## 🎯 Checklist de Deploy

### Antes do Deploy
- [ ] Build local funcionando (`pnpm build`)
- [ ] Testes passando
- [ ] Variáveis de ambiente configuradas
- [ ] Domínio configurado (se aplicável)

### Durante o Deploy
- [ ] Monitorar logs de build
- [ ] Verificar variáveis de ambiente
- [ ] Testar funcionalidades principais

### Após o Deploy
- [ ] Testar aplicação em produção
- [ ] Verificar analytics
- [ ] Configurar monitoramento
- [ ] Documentar URL de produção

## 📞 Suporte

### Recursos Úteis
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel CLI Reference](https://vercel.com/docs/cli)

### Contatos
- **Vercel Support**: [support.vercel.com](https://support.vercel.com)
- **GitHub Issues**: Para problemas do projeto
- **Documentação**: Este guia e docs/ do projeto

---

**Última atualização**: 24 de Janeiro de 2025
**Versão**: 1.0
**Status**: ✅ Pronto para produção
