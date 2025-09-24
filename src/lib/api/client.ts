/**
 * Cliente unificado da API Notus
 * Centraliza todas as chamadas à API com tratamento de erros consistente
 */

export interface NotusAPIError {
  status: number;
  errorId?: string;
  message: string;
  originalResponse?: string;
}

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

export class NotusAPIClient {
  private baseURL: string;
  private apiKey: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_NOTUS_API_URL || 'https://api.notus.team/api/v1';
    this.apiKey = process.env.NEXT_PUBLIC_NOTUS_API_KEY || '';
    
    if (!this.apiKey) {
      throw new Error('NEXT_PUBLIC_NOTUS_API_KEY não encontrada nas variáveis de ambiente');
    }

    console.log('🔧 Notus API Client Config:', {
      baseURL: this.baseURL,
      hasApiKey: !!this.apiKey,
      apiKeyLength: this.apiKey?.length || 0
    });
  }

  /**
   * Método base para fazer requisições à API
   */
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    console.log('🔍 Notus API Request:', {
      url,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': `${this.apiKey?.slice(0, 20)}...`,
      },
      body: options.body
    });
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        ...options.headers,
      },
    });

    console.log('📡 Notus API Response:', {
      status: response.status,
      statusText: response.statusText,
      url: response.url
    });

    if (!response.ok) {
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

    // Para endpoints que retornam 204 (No Content), retorna void
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Instância singleton do cliente
export const notusAPI = new NotusAPIClient();
