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
    <header className="bg-transparent">
      <div className="px-8 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            {/* Botão menu hambúrguer para mobile */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
            >
              <Menu className="h-6 w-6 text-white" />
            </button>
            
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
              {description && (
                <p className="text-slate-400">{description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-slate-800/50 rounded-lg px-4 py-2">
              <User className="h-5 w-5 text-slate-400" />
              <span className="text-white text-sm">
                {typeof user?.email === 'string' ? user.email : user?.email?.address || 'Usuário'}
              </span>
            </div>
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="flex items-center space-x-2 text-slate-400 hover:text-white hover:bg-slate-800/50 px-4 py-2 rounded-lg transition-all duration-200"
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <ChevronRight className="h-4 w-4" />
                  <LogOut className="h-4 w-4" />
                </>
              )}
              <span>{isLoggingOut ? 'Saindo...' : 'Logout'}</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
