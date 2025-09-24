import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  individualId: string | null;
  walletAddress: string | null;
  setAuth: (user: any, individualId?: string, walletAddress?: string) => void;
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
