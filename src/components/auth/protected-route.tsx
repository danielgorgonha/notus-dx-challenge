"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { ready, authenticated, user } = usePrivy();
  const router = useRouter();

  // Debug logging
  useEffect(() => {
    console.log('🔐 ProtectedRoute - Auth State:', {
      ready,
      authenticated,
      hasUser: !!user,
      userId: user?.id,
    });
  }, [ready, authenticated, user]);

  useEffect(() => {
    if (ready && !authenticated) {
      console.log('❌ ProtectedRoute: User not authenticated, redirecting to /');
      // Usar replace para evitar loop de navegação
      router.replace("/");
    }
  }, [ready, authenticated, router]);

  // Adicionar timeout para evitar ficar carregando indefinidamente
  useEffect(() => {
    if (!ready) {
      const timeout = setTimeout(() => {
        console.warn('⚠️ ProtectedRoute: Privy ready state taking too long (>5s), checking auth anyway...');
      }, 5000); // 5 segundos
      
      return () => clearTimeout(timeout);
    }
  }, [ready]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-emerald-500 rounded-xl mx-auto mb-4 flex items-center justify-center animate-pulse">
            <svg className="h-8 w-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!authenticated || !user) {
    // Mostrar loading enquanto redireciona ao invés de retornar null
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-emerald-500 rounded-xl mx-auto mb-4 flex items-center justify-center animate-pulse">
            <svg className="h-8 w-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-white text-lg">Redirecionando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
