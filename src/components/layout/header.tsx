"use client";

import { Button } from "@/components/ui/button";
import { usePrivy } from "@privy-io/react-auth";
import { LogOut, User, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface HeaderProps {
  title: string;
  description?: string;
}

export function Header({ title, description }: HeaderProps) {
  const { user, logout } = usePrivy();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      // Redirecionar para a landing page após logout
      router.push("/");
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const userEmail = typeof user?.email === 'string' 
    ? user.email 
    : user?.email?.address || 'Usuário';

  return (
    <header className="bg-slate-900/60 backdrop-blur-md flex-shrink-0 border-b border-slate-800/50 lg:bg-transparent lg:border-none sticky top-0 z-40">
      <div className="px-3 sm:px-4 lg:px-8 py-2.5 sm:py-3 lg:py-6">
        {/* Mobile: Layout compacto em coluna */}
        <div className="flex lg:flex-row flex-col justify-between items-start lg:items-center gap-2 lg:gap-4">
          {/* Título e Descrição */}
          <div className="flex-1 min-w-0 w-full lg:w-auto">
            <h1 className="text-lg sm:text-xl lg:text-3xl font-bold text-white mb-0.5 sm:mb-1 lg:mb-2 truncate">
              {title}
            </h1>
            {description && (
              <p className="text-slate-400 text-xs sm:text-sm lg:text-base truncate hidden sm:block">
                {description}
              </p>
            )}
          </div>
          
          {/* Ações: User Info e Logout */}
          <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 w-full lg:w-auto justify-end">
            {/* User Info - apenas no desktop */}
            <div className="hidden lg:flex items-center space-x-3 bg-slate-800/50 rounded-lg px-3 sm:px-4 py-2">
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
              <span className="text-white text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">
                {userEmail}
              </span>
            </div>
            
            {/* Logout Button - compacto no mobile */}
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="flex items-center justify-center lg:space-x-2 text-slate-400 hover:text-white hover:bg-slate-800/50 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 lg:py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm h-8 sm:h-9 lg:h-auto"
              disabled={isLoggingOut}
              title="Sair"
            >
              {isLoggingOut ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              <span className="hidden lg:inline ml-0 lg:ml-2">
                {isLoggingOut ? 'Saindo...' : 'Logout'}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
