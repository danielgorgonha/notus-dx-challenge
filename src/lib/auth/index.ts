/**
 * Módulo Auth - Exportações centralizadas
 */

// Client-side auth functions - Use useAuth() hook instead
// Removed duplicate functions - use AuthContext

// Server-side auth functions (only for server components)
export { auth } from './server';

// Shared types
export type { AuthUser, AuthResult, PrivyUser, AuthContextType } from '@/types/auth';
