/**
 * 🌐 Blockchain Actions
 * Endpoints para consultar chains e tokens suportados
 */

import { notusAPI } from '../api/client';

export const blockchainActions = {
  /**
   * Lista todas as chains suportadas
   */
  listChains: (page: number = 1, perPage: number = 20) =>
    notusAPI.get("crypto/chains", {
      searchParams: { page, perPage },
    }).json(),

  /**
   * Lista todos os tokens suportados
   */
  listTokens: (page: number = 1, perPage: number = 20) =>
    notusAPI.get("crypto/tokens", {
      searchParams: { page, perPage },
    }).json(),
};
