"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  ready: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Verifica se estamos dentro do PrivyProvider
  let privyData = null;
  try {
    privyData = usePrivy();
  } catch (error) {
    // Se não estiver dentro do PrivyProvider, usa valores padrão
    privyData = {
      ready: false,
      authenticated: false,
      user: null,
      login: async () => {},
      logout: async () => {},
    };
  }

  const { ready, authenticated, user, login, logout } = privyData;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (ready) {
      setIsLoading(false);
    }
  }, [ready]);

  const value: AuthContextType = {
    isAuthenticated: authenticated,
    isLoading,
    user,
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
