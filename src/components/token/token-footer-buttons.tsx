/**
 * Token Footer Buttons Component
 * Botões de rodapé: Vender e Comprar (apenas para stablecoins no portfolio)
 */

"use client";

import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";

interface TokenFooterButtonsProps {
  token: any;
}

export function TokenFooterButtons({ token }: TokenFooterButtonsProps) {
  const router = useRouter();
  
  const symbol = token?.symbol?.toUpperCase() || '';
  const isStablecoin = symbol === 'BRZ' || symbol === 'USDC';

  // Só mostrar para stablecoins
  if (!isStablecoin) {
    return null;
  }

  const handleSell = () => {
    // Navegar para withdraw (off-ramp)
    router.push('/wallet/withdraw');
  };

  const handleBuy = () => {
    // Navegar para deposit (on-ramp)
    router.push('/wallet/deposit');
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 p-4 pb-safe-area-inset-bottom z-[40] lg:relative lg:border-t-0 lg:p-0 lg:z-auto">
      <div className="flex gap-3 max-w-7xl mx-auto lg:px-6">
        {/* Botão Vender */}
        <button
          onClick={handleSell}
          className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-4 rounded-xl transition-colors border border-slate-700"
        >
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
            <Minus className="h-5 w-5 text-white" />
          </div>
          <span>Vender</span>
        </button>

        {/* Botão Comprar */}
        <button
          onClick={handleBuy}
          className="flex-1 flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-semibold py-4 rounded-xl transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-slate-900/20 flex items-center justify-center">
            <Plus className="h-5 w-5 text-slate-900" />
          </div>
          <span>Comprar</span>
        </button>
      </div>
    </div>
  );
}

