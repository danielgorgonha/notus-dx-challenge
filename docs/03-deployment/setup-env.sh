#!/bin/bash

# Script para configurar variáveis de ambiente na Vercel
echo "🔧 Configurando variáveis de ambiente na Vercel..."

# Ler valores do .env.local
source .env.local

# Adicionar variáveis uma por uma
echo "📝 Adicionando NEXT_PUBLIC_PRIVY_APP_ID..."
echo "$NEXT_PUBLIC_PRIVY_APP_ID" | vercel env add NEXT_PUBLIC_PRIVY_APP_ID production

echo "📝 Adicionando NOTUS_API_KEY..."
echo "$NOTUS_API_KEY" | vercel env add NOTUS_API_KEY production

echo "📝 Adicionando PRIVY_APP_SECRET..."
echo "$PRIVY_APP_SECRET" | vercel env add PRIVY_APP_SECRET production

echo "📝 Adicionando NEXT_PUBLIC_NOTUS_API_URL..."
echo "$NEXT_PUBLIC_NOTUS_API_URL" | vercel env add NEXT_PUBLIC_NOTUS_API_URL production

echo "📝 Adicionando NEXT_PUBLIC_NODE_ENV..."
echo "production" | vercel env add NEXT_PUBLIC_NODE_ENV production

echo "✅ Todas as variáveis foram configuradas!"
echo "🔍 Verificando configuração..."
vercel env ls
