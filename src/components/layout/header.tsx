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
    <header className="bg-gradient-to-r from-slate-900/95 via-slate-900/90 to-slate-900/95 backdrop-blur-xl flex-shrink-0 border-b border-slate-800/60 shadow-lg shadow-black/20 lg:bg-transparent lg:border-none lg:shadow-none sticky top-0 z-40">
      {/* Gradiente decorativo superior - apenas mobile */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent lg:hidden" />
      
      <div className="relative px-4 sm:px-5 lg:px-8 py-3 sm:py-3.5 lg:py-6">
        {/* Mobile: Layout melhorado em linha */}
        <div className="flex lg:flex-row flex-row justify-between items-center gap-3 lg:gap-4">
          {/* Título e Descrição */}
          <div className="flex-1 min-w-0 lg:w-auto">
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Ícone decorativo mobile */}
              <div className="lg:hidden w-8 h-8 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-lg flex items-center justify-center border border-yellow-500/30 flex-shrink-0">
                <div className="w-2 h-2 bg-yellow-400 rounded-full shadow-lg shadow-yellow-500/50" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h1 className="text-base sm:text-lg lg:text-3xl font-bold text-white leading-tight truncate">
                  {title}
                </h1>
                {description && (
                  <p className="text-slate-400/90 text-xs sm:text-sm lg:text-base truncate hidden sm:block mt-0.5">
                    {description}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* Ações: User Info e Logout */}
          <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 flex-shrink-0">
            {/* User Info - apenas no desktop */}
            <div className="hidden lg:flex items-center space-x-3 bg-slate-800/50 rounded-lg px-3 sm:px-4 py-2 border border-slate-700/50">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 flex items-center justify-center">
                <User className="h-3.5 w-3.5 text-yellow-400" />
              </div>
              <span className="text-white text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">
                {userEmail}
              </span>
            </div>
            
            {/* Logout Button - melhorado para mobile */}
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="relative flex items-center justify-center lg:space-x-2 text-slate-300 hover:text-white hover:bg-slate-800/60 active:bg-slate-700/60 px-2.5 sm:px-3 lg:px-4 py-2 sm:py-2 lg:py-2 rounded-xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-200 text-xs sm:text-sm h-9 sm:h-10 lg:h-auto backdrop-blur-sm lg:backdrop-blur-0 lg:border-0"
              disabled={isLoggingOut}
              title="Sair"
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-yellow-400" />
                  <span className="hidden lg:inline ml-2 text-xs">Saindo...</span>
                </>
              ) : (
                <>
                  <div className="relative">
                    <LogOut className="h-4 w-4" />
                    <div className="absolute inset-0 bg-yellow-500/10 rounded-full blur-sm opacity-0 hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="hidden lg:inline ml-2 text-xs">Logout</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
