/**
 * Client-side authentication utilities
 * These functions can be used in client components
 */

import { notusAPI } from '../api/client';

export interface AuthUser {
  id: string;
  email?: string;
  walletAddress?: string;
  individualId?: string;
}

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
}

/**
 * Get user information from client-side context
 * This is a placeholder - in a real app, you'd get this from your auth provider
 */
export async function getClientAuthUser(): Promise<AuthResult> {
  try {
    // This would typically come from your auth provider (Privy, etc.)
    // For now, we'll return a mock user
    const mockUser: AuthUser = {
      id: 'mock-user-id',
      email: 'user@example.com',
      walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    };

    return {
      success: true,
      user: mockUser,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get user',
    };
  }
}

/**
 * Register a wallet with Notus API (client-side)
 */
export async function registerWalletClient(walletAddress: string, metadata?: any) {
  try {
    const result = await notusAPI.registerSmartWallet(walletAddress, metadata);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to register wallet',
    };
  }
}

/**
 * Get wallet data (client-side)
 */
export async function getWalletClient(walletAddress: string) {
  try {
    const result = await notusAPI.getSmartWallet(walletAddress);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get wallet',
    };
  }
}
