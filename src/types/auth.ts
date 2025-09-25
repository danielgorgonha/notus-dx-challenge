/**
 * Tipos compartilhados para autenticação
 * Usados tanto no servidor quanto no cliente
 */

// Tipo do usuário do Privy (compartilhado)
export interface PrivyUser {
  id: string;
  email?: {
    address: string;
    verified?: boolean;
  };
  wallet?: {
    address: string;
    walletClient?: string;
    chainId?: string;
  };
  linkedAccounts?: Array<{
    type: string;
    address?: string;
  }>;
  // Permitir propriedades adicionais do Privy
  [key: string]: unknown;
}

// Tipo estendido do usuário com dados do Notus
export interface AuthUser extends PrivyUser {
  accountAbstractionAddress?: string;
  individualId?: string;
}

// Resultado de autenticação
export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
}

// Contexto de autenticação
export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: PrivyUser | null;
  individualId: string | null;
  walletAddress: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  ready: boolean;
}
