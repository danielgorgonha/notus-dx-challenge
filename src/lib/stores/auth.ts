import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  user: any | null
  wallet: any | null
  isAuthenticated: boolean
  setUser: (user: any) => void
  setWallet: (wallet: any) => void
  setAuthenticated: (isAuthenticated: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      wallet: null,
      isAuthenticated: false,
      setUser: (user) => set({ user }),
      setWallet: (wallet) => set({ wallet }),
      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      logout: () => set({ user: null, wallet: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
)
