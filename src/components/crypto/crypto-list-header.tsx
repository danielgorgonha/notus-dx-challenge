/**
 * Crypto List Header Component
 * Cabeçalho da lista com contador e ordenação
 */

"use client";

interface CryptoListHeaderProps {
  total: number;
  originalTotal: number;
}

export function CryptoListHeader({ total, originalTotal }: CryptoListHeaderProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="text-white text-base font-medium">
        Cripto - {total}
      </div>
      <div className="text-yellow-400 text-sm font-medium flex items-center gap-1">
        Capitalização de mercado
        <span className="text-xs ml-1">↓</span>
      </div>
    </div>
  );
}

