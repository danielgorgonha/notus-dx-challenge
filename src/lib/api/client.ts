/**
 * Cliente unificado da API Notus
 * Usando ky para melhor experiência de desenvolvimento
 * 
 * NOTA: Este arquivo é usado tanto no servidor quanto no cliente
 * Removido 'server-only' para permitir uso em Client Components
 */

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
  timeout: 60000, // 60 segundos
  retry: {
    limit: 3,
    methods: ['get', 'post', 'put', 'delete'],
    statusCodes: [408, 413, 429, 500, 502, 503, 504],
    backoffLimit: 5000,
  },
  headers: {
    'x-api-key': process.env.NEXT_PUBLIC_NOTUS_API_KEY || process.env.NOTUS_API_KEY || '',
  },
      hooks: {
        beforeError: [
          async (error) => {
            const { response } = error;
            if (response && response.body) {
              const errorText = await response.text();
              let errorMessage = `API Error: ${response.status} ${response.statusText}`;
              let errorId: string | undefined;

              try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.message || errorMessage;
                errorId = errorData.id || undefined;
              } catch (parseError) {
                errorMessage += ` - ${errorText}`;
              }

              throw new NotusAPIError(errorMessage, response.status, errorId, errorText);
            }
            throw error;
          },
        ],
  },
});


