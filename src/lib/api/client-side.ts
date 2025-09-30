/**
 * Cliente da API para o lado do cliente
 * Usa endpoints internos que fazem proxy para a Notus API
 */

import ky from 'ky';

// Cliente ky para endpoints internos
export const clientAPI = ky.create({
  prefixUrl: '/api',
  hooks: {
    beforeRequest: [
      (request) => {
        console.log('🔍 Client API Request:', {
          url: request.url,
          method: request.method,
        });
      },
    ],
    afterResponse: [
      (request, options, response) => {
        console.log('📡 Client API Response:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
        });
      },
    ],
  },
});

// Funções específicas para o cliente
export const clientWalletActions = {
  /**
   * Obter endereço da smart wallet
   */
  getAddress: async (params: {
    externallyOwnedAccount: string;
    factory?: string;
    salt?: string;
  }) => {
    const response = await clientAPI.get('wallet/address', {
      searchParams: {
        externallyOwnedAccount: params.externallyOwnedAccount,
        factory: params.factory || '0x7a1dbab750f12a90eb1b60d2ae3ad17d4d81effe',
        salt: params.salt || '0',
      },
    });

    return response.json();
  },

  /**
   * Registrar smart wallet
   */
  register: async (data: any) => {
    const response = await clientAPI.post('wallet/register', {
      json: data,
    });
    return response.json();
  },

  /**
   * Listar wallets
   */
  listWallets: async (page: number = 1, perPage: number = 20) => {
    const response = await clientAPI.get('wallet/list', {
      searchParams: { page, perPage },
    });
    return response.json();
  },

  /**
   * Obter portfolio da wallet
   */
  getPortfolio: async (walletAddress: string) => {
    const response = await clientAPI.get(`wallet/${walletAddress}/portfolio`);
    return response.json();
  },

  /**
   * Obter histórico da wallet
   */
  getHistory: async (walletAddress: string, params?: {
    take?: number;
    lastId?: string;
    type?: string;
    status?: string;
    chains?: string;
    createdAt?: string;
  }) => {
    const response = await clientAPI.get(`wallet/${walletAddress}/history`, {
      searchParams: params,
    });
    return response.json();
  },

  /**
   * Criar depósito
   */
  createDeposit: async (walletAddress: string, data: any) => {
    const response = await clientAPI.post(`wallet/${walletAddress}/deposit`, {
      json: data,
    });
    return response.json();
  },

  /**
   * Atualizar metadados da wallet
   */
  updateMetadata: async (walletAddress: string, data: any) => {
    const response = await clientAPI.patch(`wallet/${walletAddress}/metadata`, {
      json: data,
    });
    return response.json();
  },
};

export const clientKYCActions = {
  /**
   * Criar sessão KYC Standard
   */
  createStandardSession: async (data: any) => {
    const response = await clientAPI.post('kyc/sessions/standard', {
      json: data,
    });
    return response.json();
  },

  /**
   * Obter resultado da sessão KYC
   */
  getSessionResult: async (sessionId: string) => {
    const response = await clientAPI.get(`kyc/sessions/${sessionId}/result`);
    return response.json();
  },

  /**
   * Processar sessão KYC
   */
  processSession: async (sessionId: string) => {
    const response = await clientAPI.post(`kyc/sessions/${sessionId}/process`);
    return response.json();
  },
};

export const clientFiatActions = {
  /**
   * Criar quote de depósito fiat
   */
  createDepositQuote: async (data: any) => {
    const response = await clientAPI.post('fiat/deposit/quote', {
      json: data,
    });
    return response.json();
  },

  /**
   * Criar ordem de depósito fiat
   */
  createDepositOrder: async (data: any) => {
    const response = await clientAPI.post('fiat/deposit/order', {
      json: data,
    });
    return response.json();
  },

  /**
   * Criar quote de saque fiat
   */
  createWithdrawalQuote: async (data: any) => {
    const response = await clientAPI.post('fiat/withdraw/quote', {
      json: data,
    });
    return response.json();
  },

  /**
   * Criar ordem de saque fiat
   */
  createWithdrawalOrder: async (data: any) => {
    const response = await clientAPI.post('fiat/withdraw/order', {
      json: data,
    });
    return response.json();
  },
};

export const clientBlockchainActions = {
  /**
   * Listar chains suportadas
   */
  listChains: async (page: number = 1, perPage: number = 20) => {
    const response = await clientAPI.get('blockchain/chains', {
      searchParams: { page, perPage },
    });
    return response.json();
  },

  /**
   * Listar tokens suportados
   */
  listTokens: async (page: number = 1, perPage: number = 20) => {
    const response = await clientAPI.get('blockchain/tokens', {
      searchParams: { page, perPage },
    });
    return response.json();
  },
};

export const clientSwapActions = {
  /**
   * Criar operação de swap
   */
  createSwap: async (data: any) => {
    const response = await clientAPI.post('swap', {
      json: data,
    });
    return response.json();
  },
};

export const clientTransferActions = {
  /**
   * Criar operação de transferência
   */
  createTransfer: async (data: any) => {
    const response = await clientAPI.post('transfer', {
      json: data,
    });
    return response.json();
  },
};

export const clientLiquidityActions = {
  /**
   * Listar pools de liquidez
   */
  listPools: async (params?: {
    page?: number;
    perPage?: number;
    chainId?: number;
    token0?: string;
    token1?: string;
  }) => {
    const response = await clientAPI.get('liquidity/pools', {
      searchParams: params,
    });
    return response.json();
  },

  /**
   * Obter detalhes de um pool
   */
  getPool: async (poolId: string) => {
    const response = await clientAPI.get(`liquidity/pools/${poolId}`);
    return response.json();
  },

  /**
   * Obter dados históricos do pool
   */
  getHistoricalData: async (poolId: string, days?: number) => {
    const response = await clientAPI.get(`liquidity/pools/${poolId}/historical-data`, {
      searchParams: { days },
    });
    return response.json();
  },

  /**
   * Criar liquidez em um pool
   */
  createLiquidity: async (data: any) => {
    const response = await clientAPI.post('liquidity/create', {
      json: data,
    });
    return response.json();
  },

  /**
   * Alterar liquidez em um pool
   */
  changeLiquidity: async (data: any) => {
    const response = await clientAPI.post('liquidity/change', {
      json: data,
    });
    return response.json();
  },

  /**
   * Coletar taxas de liquidez
   */
  collectFees: async (data: any) => {
    const response = await clientAPI.post('liquidity/collect', {
      json: data,
    });
    return response.json();
  },

  /**
   * Obter quantidades de liquidez
   */
  getAmounts: async (poolId: string, walletAddress: string) => {
    const response = await clientAPI.get('liquidity/amounts', {
      searchParams: { poolId, walletAddress },
    });
    return response.json();
  },
};
