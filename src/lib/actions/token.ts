/**
 * Token Actions
 * Server Actions para operações relacionadas a tokens
 */

'use server';

import { listTokens } from './blockchain';

/**
 * Busca informações detalhadas de um token específico
 * Usa o parâmetro search da API Notus para buscar diretamente por símbolo
 */
export async function getTokenBySymbol(symbol: string) {
  try {
    console.log('🔍 Buscando token por símbolo:', symbol);
    
    // Usar o parâmetro search da API Notus para buscar diretamente
    const response = await listTokens({
      page: 1,
      perPage: 10, // Reduzir já que estamos buscando por símbolo específico
      orderBy: 'marketCap',
      orderDir: 'desc',
      search: symbol, // Buscar diretamente pelo símbolo na API
    });

    // A API pode retornar múltiplos resultados, buscar o que corresponde exatamente
    const token = response.tokens?.find(
      (t) => t.symbol?.toUpperCase() === symbol.toUpperCase()
    );

    if (token) {
      console.log('✅ Token encontrado:', token.symbol, token.name, token.priceUsd);
    } else {
      console.log('⚠️ Token não encontrado na primeira busca, tentando sem search...');
      
      // Se não encontrou com search, tentar buscar sem filtro (pode estar em outra página)
      const fallbackResponse = await listTokens({
        page: 1,
        perPage: 100,
        orderBy: 'marketCap',
        orderDir: 'desc',
      });
      
      const fallbackToken = fallbackResponse.tokens?.find(
        (t) => t.symbol?.toUpperCase() === symbol.toUpperCase()
      );
      
      if (fallbackToken) {
        console.log('✅ Token encontrado no fallback:', fallbackToken.symbol);
        return fallbackToken;
      }
    }

    return token || null;
  } catch (error) {
    console.error('❌ Erro ao buscar token:', error);
    return null;
  }
}

/**
 * Busca informações detalhadas de um token por endereço
 */
export async function getTokenByAddress(address: string, chainId?: number) {
  try {
    const response = await listTokens({
      page: 1,
      perPage: 100,
      orderBy: 'marketCap',
      orderDir: 'desc',
    });

    const token = response.tokens?.find(
      (t) => 
        t.address?.toLowerCase() === address.toLowerCase() &&
        (!chainId || t.chain?.id === chainId)
    );

    return token || null;
  } catch (error) {
    console.error('❌ Erro ao buscar token:', error);
    return null;
  }
}

