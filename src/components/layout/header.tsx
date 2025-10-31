"use client";

import { Button } from "@/components/ui/button";
import { usePrivy } from "@privy-io/react-auth";
import { Shield, LogOut, User, Menu, Loader2, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface HeaderProps {
  title: string;
  description?: string;
  onMenuClick?: () => void;
}

export function Header({ title, description, onMenuClick }: HeaderProps) {
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

  return (
    <header className="bg-transparent flex-shrink-0 border-b border-slate-800/50 lg:border-none">
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
            {/* Botão menu hambúrguer para mobile */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-700/50 transition-colors flex-shrink-0"
            >
              <Menu className="h-6 w-6 text-white" />
            </button>
            
            <div className="min-w-0 flex-1 sm:flex-none">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1 sm:mb-2 truncate">{title}</h1>
              {description && (
                <p className="text-slate-400 text-sm sm:text-base truncate">{description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto justify-end">
            <div className="hidden sm:flex items-center space-x-3 bg-slate-800/50 rounded-lg px-3 sm:px-4 py-2">
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
              <span className="text-white text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">
                {typeof user?.email === 'string' ? user.email : user?.email?.address || 'Usuário'}
              </span>
            </div>
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="flex items-center space-x-2 text-slate-400 hover:text-white hover:bg-slate-800/50 px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm"
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <LogOut className="h-4 w-4" />
                </>
              )}
              <span className="hidden sm:inline">{isLoggingOut ? 'Saindo...' : 'Logout'}</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
