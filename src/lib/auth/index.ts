/**
 * Módulo Auth - Exportações centralizadas
 */

// Client-side auth functions
export {
  getClientAuthUser,
  registerWalletClient,
  getWalletClient,
} from './client';

// Server-side auth functions (only for server components)
export { auth } from './server';

// Shared types
export type { AuthUser, AuthResult, PrivyUser, AuthContextType } from '@/types/auth';
