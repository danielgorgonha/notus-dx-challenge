/**
 * Crypto Sort Modal Component (Client)
 * Modal para ordenação de criptomoedas
 */

"use client";

import { ArrowUp, ArrowDown } from "lucide-react";

interface CryptoSortModalProps {
  isOpen: boolean;
  onClose: () => void;
  sortBy: "price" | "marketCap" | "priceChange24h" | "volume24h";
  sortDirection: "asc" | "desc";
  onSortByChange: (sortBy: "price" | "marketCap" | "priceChange24h" | "volume24h") => void;
  onSortDirectionChange: (direction: "asc" | "desc") => void;
  onApply: () => void;
}

export function CryptoSortModal({
  isOpen,
  onClose,
  sortBy,
  sortDirection,
  onSortByChange,
  onSortDirectionChange,
  onApply,
}: CryptoSortModalProps) {
  if (!isOpen) return null;

  const sortOptions = [
    { value: 'price' as const, label: 'Preço atual' },
    { value: 'marketCap' as const, label: 'Capitalização de mercado' },
    { value: 'priceChange24h' as const, label: 'Maior alteração de preço (24h)' },
    { value: 'volume24h' as const, label: 'Volume negociado (24h)' },
  ];

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/60 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-slate-800 rounded-t-2xl border-t border-slate-700">
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-slate-600 rounded-full" />
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <h3 className="text-white font-bold text-xl mb-6">Classificação</h3>
          
          <div className="space-y-3 mb-6">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onSortByChange(option.value)}
                className={`w-full text-left px-4 py-4 rounded-lg transition-colors ${
                  sortBy === option.value
                    ? 'bg-slate-700/80 border-2 border-slate-600 text-white'
                    : 'bg-slate-700/30 border-2 border-transparent text-slate-300 hover:bg-slate-700/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-base">{option.label}</span>
                  {sortBy === option.value && (
                    <span className="text-yellow-400 text-lg">
                      {sortDirection === 'desc' ? '↓' : '↑'}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={onApply}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-semibold py-4 rounded-lg transition-colors"
          >
            Aplicar
          </button>
        </div>
      </div>
    </>
  );
}

