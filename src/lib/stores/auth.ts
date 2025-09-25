import { create } from 'zustand';
import type { PrivyUser } from '@/types/auth';

interface AuthState {
  isAuthenticated: boolean;
  user: PrivyUser | null;
  individualId: string | null;
  walletAddress: string | null;
  setAuth: (user: PrivyUser, individualId?: string, walletAddress?: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  individualId: null,
  walletAddress: null,
  setAuth: (user, individualId, walletAddress) => set({
    isAuthenticated: true,
    user,
    individualId: individualId || null,
    walletAddress: walletAddress || null,
  }),
  clearAuth: () => set({
    isAuthenticated: false,
    user: null,
    individualId: null,
    walletAddress: null,
  }),
}));
