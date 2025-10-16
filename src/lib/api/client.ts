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
    'x-api-key': process.env.NOTUS_API_KEY || process.env.NEXT_PUBLIC_NOTUS_API_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmZGY5NzNlNS0zNTIzLTQwNzctOTAzZC1iYWNmYzBkMGMyZGQiLCJhcGlLZXlHZW5lcmF0ZWRBdCI6IjIwMjUtMTAtMTNUMTc6NDY6NTguMjU1WiIsIm9yZ2FuaXphdGlvbklkIjoiNmQ0YmQwZjYtMmVlNS00MWYwLTkxMjAtYmQwY2M0OGRmODEzIn0.7YvbiK9Tos-RqcDDsZnl9h_3V5B7KrISN4C0RSPCe1s',
  },
      hooks: {
        beforeRequest: [
          (request) => {
            console.log('🚀 Fazendo requisição para:', request.url);
            console.log('🔑 Headers da requisição:', Object.fromEntries(request.headers.entries()));
          }
        ],
        beforeError: [
          async (error) => {
            console.log('❌ Erro na requisição:', error);
            const { response } = error;
            if (response && response.body) {
              const errorText = await response.text();
              console.log('📄 Resposta de erro:', errorText);
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


