/**
 * Módulo Auth - Exportações centralizadas
 */

// Client-side auth functions
export {
  getClientAuthUser,
  registerWalletClient,
  getWalletClient,
  type AuthUser,
  type AuthResult,
} from './client';

// Server-side auth functions (only for server components)
export { auth } from './server';
