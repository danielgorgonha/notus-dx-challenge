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
  const { ready, authenticated, user, login, logout } = usePrivy();
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
    login,
    logout,
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
