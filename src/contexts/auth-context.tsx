"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { PrivyUser, AuthContextType } from "@/types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Sempre chama usePrivy - se não estiver dentro do PrivyProvider, será tratado pelo próprio hook
  const privyData = usePrivy();

  const { ready, authenticated, user, login, logout } = privyData;
  const [isLoading, setIsLoading] = useState(true);

  // Extrair individualId e walletAddress do usuário com tipagem correta
  const individualId = (user as PrivyUser)?.id || null;
  const walletAddress = (user as PrivyUser)?.wallet?.address || null;
  

  useEffect(() => {
    if (ready) {
      setIsLoading(false);
    }
  }, [ready]);

  const value: AuthContextType = {
    isAuthenticated: authenticated,
    isLoading,
    user: user as PrivyUser | null,
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
