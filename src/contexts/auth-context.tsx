"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { PrivyUser, AuthContextType } from "@/types/auth";
import { useRouter } from "next/navigation";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Sempre chama usePrivy - se não estiver dentro do PrivyProvider, será tratado pelo próprio hook
  const privyData = usePrivy();
  const router = useRouter();

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
      try {
        if (typeof logout === 'function') {
          await logout();
          // Redirecionar para a página inicial após logout
          router.push('/');
        }
      } catch (error) {
        console.error('Erro ao fazer logout:', error);
        // Mesmo com erro, redirecionar para a página inicial
        router.push('/');
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
  console.log(context?.user?.wallet);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
