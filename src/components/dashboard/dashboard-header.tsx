/**
 * Dashboard Header Component (Client)
 * Header com informações de segurança e toggle de moeda
 */

"use client";

import { Shield, LogOut, Loader2 } from "lucide-react";
import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  userEmail?: string;
  exchangeRate?: number;
  onCurrencyToggle?: (currency: 'USD' | 'BRL') => void;
}

export function DashboardHeader({ 
  userEmail, 
  exchangeRate = 5.32,
  onCurrencyToggle 
}: DashboardHeaderProps) {
  const [currency, setCurrency] = useState<'USD' | 'BRL'>('BRL');
  const { logout } = usePrivy();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const toggleCurrency = () => {
    const newCurrency = currency === 'BRL' ? 'USD' : 'BRL';
    setCurrency(newCurrency);
    onCurrencyToggle?.(newCurrency);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="glass-card mb-6 sm:mb-8 bg-gradient-to-r from-slate-800/40 via-slate-800/30 to-slate-700/40 border border-slate-700/50 relative overflow-hidden group">
      {/* Efeito de brilho decorativo */}
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-transparent to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative">
            <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/30 group-hover:scale-105 transition-transform duration-300">
              <Shield className="h-7 w-7 text-slate-900" />
            </div>
            {/* Badge de status */}
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900 shadow-lg">
              <div className="w-full h-full bg-green-400 rounded-full animate-pulse" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-1 flex items-center gap-2">
              <span>🔒</span>
              <span>Carteira Protegida</span>
            </h3>
            <p className="text-slate-300/90 text-sm truncate">
              {userEmail || 'Usuário'} • Sua chave privada fica só com você
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
          <button
            onClick={toggleCurrency}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-700/60 hover:bg-slate-600/60 rounded-xl transition-all duration-200 border border-slate-600/50 hover:border-slate-500/50 hover:shadow-lg hover:shadow-yellow-500/10 backdrop-blur-sm"
          >
            <span className="text-white font-bold text-lg">
              {currency === 'BRL' ? 'R$' : '$'}
            </span>
            <span className="text-slate-300 text-sm font-medium">
              {currency === 'BRL' ? 'Real' : 'Dólar'}
            </span>
          </button>
          
          <div className="text-right hidden sm:block">
            <div className="text-slate-400 text-xs mb-1">Status</div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-400 font-semibold text-sm">Seguro</span>
            </div>
          </div>

          {/* Botão de Logout - Desktop */}
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="hidden lg:flex items-center gap-2 text-slate-300 hover:text-white hover:bg-slate-800/60 active:bg-slate-700/60 px-4 py-2 rounded-xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-200 text-sm backdrop-blur-sm"
            disabled={isLoggingOut}
            title="Sair"
          >
            {isLoggingOut ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-yellow-400" />
                <span className="text-xs">Saindo...</span>
              </>
            ) : (
              <>
                <LogOut className="h-4 w-4" />
                <span className="text-xs">Logout</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

