/**
 * Token Footer Buttons Component
 * Botões de rodapé: Vender e Comprar (para todos os tokens no portfolio)
 * - Stablecoins (USDC/BRZ): Vender → withdraw, Comprar → deposit
 * - Outros tokens: Vender e Comprar → swap
 */

"use client";

import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";

interface TokenFooterButtonsProps {
  token: any;
  mode?: 'portfolio' | 'crypto';
}

export function TokenFooterButtons({ token, mode = 'portfolio' }: TokenFooterButtonsProps) {
  const router = useRouter();
  
  // Só renderizar no modo portfolio
  if (mode !== 'portfolio') {
    return null;
  }
  
  const symbol = token?.symbol?.toUpperCase() || '';
  const isStablecoin = symbol === 'BRZ' || symbol === 'USDC';

  const handleSell = () => {
    if (isStablecoin) {
      // Para stablecoins: navegar para withdraw (off-ramp)
      router.push('/wallet/withdraw');
    } else {
      // Para outros tokens: navegar para swap
      router.push('/swap');
    }
  };

  const handleBuy = () => {
    if (isStablecoin) {
      // Para stablecoins: navegar para deposit (on-ramp)
      router.push('/wallet/deposit');
    } else {
      // Para outros tokens: navegar para swap
      router.push('/swap');
    }
  };

  return (
    <div className="fixed bottom-16 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 p-4 pb-safe-area-inset-bottom z-[55] shadow-lg lg:bottom-0 lg:relative lg:border-t-0 lg:p-0 lg:z-auto lg:shadow-none">
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

