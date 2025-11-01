/**
 * Crypto List Component
 * Lista de criptomoedas com cabeçalho e itens
 */

"use client";

import { CryptoListHeader } from "./crypto-list-header";
import { CryptoListItem } from "./crypto-list-item";

interface CryptoListProps {
  tokens: any[];
  total: number;
  currency: 'BRL' | 'USD';
  sortBy: "price" | "marketCap" | "priceChange24h" | "volume24h";
  sortDirection: "asc" | "desc";
  onSortClick: () => void;
}

export function CryptoList({ 
  tokens, 
  total, 
  currency,
  sortBy,
  sortDirection,
  onSortClick
}: CryptoListProps) {
  return (
    <div className="space-y-4">
      {/* Cabeçalho da Lista */}
      <CryptoListHeader 
        total={tokens.length}
        originalTotal={total}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSortClick={onSortClick}
      />

      {/* Lista de Tokens */}
      <div className="space-y-3">
        {tokens.length > 0 ? (
          tokens.map((token, index) => (
            <CryptoListItem
              key={token.address || token.symbol || index}
              token={token}
              currency={currency}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <div className="text-slate-400 mb-2">Nenhuma criptomoeda encontrada</div>
            <div className="text-slate-500 text-sm">Tente ajustar sua busca</div>
          </div>
        )}
      </div>
    </div>
  );
}

