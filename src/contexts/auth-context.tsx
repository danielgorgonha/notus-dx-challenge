"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: unknown;
  individualId: string | null;
  walletAddress: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  ready: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Sempre chama usePrivy - se não estiver dentro do PrivyProvider, será tratado pelo próprio hook
  const privyData = usePrivy();

  const { ready, authenticated, user, login, logout } = privyData;
  const [isLoading, setIsLoading] = useState(true);

  // Extrair individualId e walletAddress do usuário
  const individualId = user?.id || null;
  const walletAddress = user?.wallet?.address || null;
  

  useEffect(() => {
    if (ready) {
      setIsLoading(false);
    }
  }, [ready]);

  const value: AuthContextType = {
    isAuthenticated: authenticated,
    isLoading,
    user,
    individualId,
    walletAddress,
    login: async () => {
      if (typeof login === 'function') {
        await login();
      }
    },
    logout: async () => {
      if (typeof logout === 'function') {
        await logout();
      }
    },
    ready,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
