/**
 * Dashboard Mobile Header Component
 * Header estilo mobile com foto do usuário, nome, saldo e controles
 */

"use client";

import { Eye, EyeOff, ChevronRight, Wallet } from "lucide-react";
import { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";

interface DashboardMobileHeaderProps {
  totalBalance: number;
  currency: 'USD' | 'BRL';
  onCurrencyChange: (currency: 'USD' | 'BRL') => void;
  exchangeRate?: number;
  showBalance?: boolean;
  onToggleBalance?: (show: boolean) => void;
}

export function DashboardMobileHeader({
  totalBalance,
  currency,
  onCurrencyChange,
  exchangeRate = 5.32,
  showBalance: externalShowBalance,
  onToggleBalance,
}: DashboardMobileHeaderProps) {
  const { user } = usePrivy();
  const [internalShowBalance, setInternalShowBalance] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const showBalance = externalShowBalance !== undefined ? externalShowBalance : internalShowBalance;
  
  const handleToggleBalance = () => {
    const newValue = !showBalance;
    if (onToggleBalance) {
      onToggleBalance(newValue);
    } else {
      setInternalShowBalance(newValue);
    }
  };

  // Detectar scroll para colapsar header
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      setIsScrolled(scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Extrair nome do usuário do email
  const getUserName = () => {
    const email = typeof user?.email === 'string' ? user.email : user?.email?.address || '';
    const name = email.split('@')[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatUSD = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const convertCurrency = (value: number) => {
    if (currency === 'BRL') {
      return value * exchangeRate;
    }
    return value;
  };

  const formatValue = (value: number) => {
    const convertedValue = convertCurrency(value);
    return currency === 'BRL' ? formatCurrency(convertedValue) : formatUSD(convertedValue);
  };

  const displayBalance = showBalance ? formatValue(totalBalance) : '••••••';
  const displayBalanceLabel = showBalance 
    ? (currency === 'BRL' ? 'R$' : '$')
    : '••';

  return (
    <div 
      className={`lg:hidden fixed top-0 left-0 right-0 z-[100] bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 transition-all duration-300 shadow-2xl ${
        isScrolled ? 'rounded-b-lg py-2' : 'rounded-b-3xl pt-6 pb-10'
      }`}
      style={{ 
        paddingTop: isScrolled 
          ? 'max(0.5rem, env(safe-area-inset-top, 0.5rem))' 
          : 'max(1.5rem, env(safe-area-inset-top, 1.5rem))' 
      }}
    >
      <div className={`px-5 transition-all duration-300 ${isScrolled ? 'py-0' : ''}`}>
        {/* Top bar com controles - sempre visível */}
        <div className="flex items-center justify-between">
          {/* Avatar do usuário */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`rounded-full bg-slate-900/20 border-2 border-slate-900/30 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-lg transition-all duration-300 ${
              isScrolled ? 'w-10 h-10' : 'w-16 h-16'
            }`}>
              {user?.google?.picture ? (
                <img 
                  src={user.google.picture} 
                  alt={getUserName()}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                  <span className={`font-bold text-white transition-all duration-300 ${
                    isScrolled ? 'text-base' : 'text-2xl'
                  }`}>
                    {getUserName().charAt(0)}
                  </span>
                </div>
              )}
            </div>
            {/* Nome do usuário - oculto quando scrolled */}
            <div className={`flex-1 min-w-0 transition-all duration-300 ${
              isScrolled ? 'opacity-0 max-w-0 overflow-hidden' : 'opacity-100 max-w-full'
            }`}>
              <div className="text-slate-900 font-black text-xl leading-tight mb-1">Olá, {getUserName()}</div>
              <div className="text-slate-800 text-sm font-semibold">Meu patrimônio</div>
            </div>
          </div>

          {/* Botões de controle - sempre visíveis */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            {/* Botão mostrar/esconder saldo */}
            <button
              onClick={handleToggleBalance}
              className={`rounded-full bg-slate-900/20 hover:bg-slate-900/30 active:scale-95 flex items-center justify-center transition-all border border-slate-900/30 shadow-md ${
                isScrolled ? 'w-9 h-9' : 'w-11 h-11'
              }`}
              title={showBalance ? 'Ocultar saldo' : 'Mostrar saldo'}
            >
              {showBalance ? (
                <Eye className={`text-slate-900 transition-all duration-300 ${isScrolled ? 'h-4 w-4' : 'h-5 w-5'}`} />
              ) : (
                <EyeOff className={`text-slate-900 transition-all duration-300 ${isScrolled ? 'h-4 w-4' : 'h-5 w-5'}`} />
              )}
            </button>

            {/* Botão trocar moeda */}
            <button
              onClick={() => onCurrencyChange(currency === 'BRL' ? 'USD' : 'BRL')}
              className={`rounded-full bg-slate-900/20 hover:bg-slate-900/30 active:scale-95 flex items-center justify-center transition-all border border-slate-900/30 font-black text-slate-900 shadow-md ${
                isScrolled ? 'w-9 h-9 text-xs' : 'w-11 h-11 text-sm'
              }`}
              title="Trocar moeda"
            >
              {currency === 'BRL' ? 'R$' : '$'}
            </button>
          </div>
        </div>

        {/* Saldo total - oculto quando scrolled */}
        {!isScrolled && (
          <div className="flex items-end justify-between mt-8">
            <div className="flex-1 min-w-0">
              <div className="text-slate-800 text-xs font-semibold mb-2 opacity-90">Saldo total</div>
              <div className="text-5xl font-black text-slate-900 mb-1 leading-none">
                {displayBalance}
              </div>
              <div className="text-slate-700 text-xs font-semibold opacity-80">
                {displayBalanceLabel} {currency === 'BRL' ? 'Real' : 'Dólar'}
              </div>
            </div>
            
            {/* Ícone decorativo */}
            <div className="w-14 h-14 bg-slate-900/10 rounded-xl flex items-center justify-center border-2 border-slate-900/20 ml-4 flex-shrink-0 shadow-md">
              <Wallet className="h-7 w-7 text-slate-900/60" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

