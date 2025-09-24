/**
 * Client-side authentication utilities
 * These functions can be used in client components
 */

import { notusAPI } from '../api/client';
import { registerSmartWallet, getSmartWallet } from '../wallet';
import { AuthUser, AuthResult } from '@/types/auth';

/**
 * Get user information from client-side context
 * This function should be used in client components that need auth data
 * For server components, use the auth() function from server.ts
 */
export async function getClientAuthUser(): Promise<AuthResult> {
  try {
    // This function is meant to be used in client components
    // The actual user data should come from the AuthContext via useAuth()
    // This is a fallback for cases where the context is not available
    
    return {
      success: false,
      error: 'Use useAuth() hook in client components instead of this function',
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
    const result = await registerSmartWallet(walletAddress, metadata);
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
    const result = await getSmartWallet(walletAddress);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get wallet',
    };
  }
}
