/**
 * Crypto Header Component
 * Cabeçalho da tela de criptomoedas
 */

"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CryptoHeaderProps {
  currency: 'BRL' | 'USD';
  onCurrencyToggle: () => void;
}

export function CryptoHeader({ currency, onCurrencyToggle }: CryptoHeaderProps) {
  const router = useRouter();

  return (
    <div className="sticky top-0 z-10 bg-slate-900 border-b border-slate-700/50 px-4 lg:px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Botão Voltar */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="text-white hover:bg-slate-800/50 -ml-2"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>

        {/* Título */}
        <h1 className="text-2xl lg:text-3xl font-bold text-white flex-1 text-center">
          Criptomoedas
        </h1>

        {/* Botão de Moeda */}
        <button
          onClick={onCurrencyToggle}
          className="w-10 h-10 rounded-full bg-white border-2 border-white/20 hover:border-white/40 flex items-center justify-center transition-all active:scale-95 flex-shrink-0"
          title={`Alternar para ${currency === 'BRL' ? 'USD' : 'BRL'}`}
        >
          <span className="text-slate-900 font-bold text-base">
            {currency === 'BRL' ? 'R$' : '$'}
          </span>
        </button>
      </div>
    </div>
  );
}

