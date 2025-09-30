"use client";

import { Button } from "@/components/ui/button";
import { usePrivy } from "@privy-io/react-auth";
import { Shield, LogOut, User, Menu, Loader2 } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  title: string;
  description?: string;
  onMenuClick?: () => void;
}

export function Header({ title, description, onMenuClick }: HeaderProps) {
  const { user, logout } = usePrivy();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
      <div className="px-8 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            {/* Botão menu hambúrguer para mobile */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Menu className="h-6 w-6 text-white" />
            </button>
            
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
              {description && (
                <p className="text-slate-300">{description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {!!user && (
              <div className="flex items-center gap-2 text-slate-300">
                <User className="h-4 w-4" />
                <span className="text-sm">
                  {(user as { email?: { address: string }; wallet?: { address: string } })?.email?.address || (user as { email?: { address: string }; wallet?: { address: string } })?.wallet?.address?.slice(0, 6)}...
                </span>
              </div>
            )}
            <Button 
              variant="ghost" 
              className="text-slate-300 hover:text-white hover:bg-white/10"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="mr-2 h-4 w-4" />
              )}
              {isLoggingOut ? 'Saindo...' : 'Logout'}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
