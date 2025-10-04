/**
 * Cliente unificado da API Notus
 * Usando ky para melhor experiência de desenvolvimento
 */

import 'server-only';
import ky from 'ky';

export class NotusAPIError extends Error {
  constructor(
    message: string,
    public status: number,
    public errorId?: string,
    public originalResponse?: string
  ) {
    super(message);
    this.name = 'NotusAPIError';
  }
}

// Cliente ky para a API Notus
export const notusAPI = ky.create({
  prefixUrl: process.env.NEXT_PUBLIC_NOTUS_API_URL || 'https://api.notus.team/api/v1',
  headers: {
    'x-api-key': process.env.NOTUS_API_KEY || '',
  },
  hooks: {
    beforeRequest: [
      (request) => {
        console.log('🔍 Notus API Request:', {
          url: request.url,
          method: request.method,
          headers: {
            'x-api-key': `${process.env.NOTUS_API_KEY?.slice(0, 20)}...`,
          },
        });
      },
    ],
    afterResponse: [
      (request, options, response) => {
        console.log('📡 Notus API Response:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
        });
      },
    ],
    beforeError: [
      async (error) => {
        const { response } = error;
        if (response && response.body) {
          const errorText = await response.text();
          console.error('❌ Notus API Error:', errorText);
          
          // Parse error response para extrair informações específicas
          let errorMessage = `API Error: ${response.status} ${response.statusText}`;
          let errorId: string | undefined;
          
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorMessage;
            errorId = errorData.id || undefined;
            
            // Log específico para erros conhecidos
            if (errorId === 'INDIVIDUAL_NOT_FOUND') {
              console.warn('🔍 Individual não encontrado - será criado automaticamente');
            }
          } catch (parseError) {
            // Se não conseguir fazer parse, usa o texto original
            errorMessage += ` - ${errorText}`;
          }
          
          throw new NotusAPIError(errorMessage, response.status, errorId, errorText);
        }
        throw error;
      },
    ],
  },
});


// Log da configuração da API
console.log('🔧 Notus API Client Config:', {
  baseURL: process.env.NEXT_PUBLIC_NOTUS_API_URL || 'https://api.notus.team/api/v1',
  hasApiKey: !!process.env.NOTUS_API_KEY,
  apiKeyLength: process.env.NOTUS_API_KEY?.length || 0
});
