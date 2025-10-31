/**
 * Pool Sort Modal Component (Client)
 * Modal para ordenação de pools
 */

"use client";

import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown } from "lucide-react";

interface PoolSortModalProps {
  isOpen: boolean;
  onClose: () => void;
  sortBy: "rentabilidade" | "tvl" | "tarifa" | "volume";
  sortDirection: "asc" | "desc";
  onSortByChange: (sortBy: "rentabilidade" | "tvl" | "tarifa" | "volume") => void;
  onSortDirectionChange: (direction: "asc" | "desc") => void;
  onApply: () => void;
}

export function PoolSortModal({
  isOpen,
  onClose,
  sortBy,
  sortDirection,
  onSortByChange,
  onSortDirectionChange,
  onApply,
}: PoolSortModalProps) {
  if (!isOpen) return null;

  const sortOptions = [
    { value: 'rentabilidade' as const, label: 'Rentabilidade' },
    { value: 'tvl' as const, label: 'TVL' },
    { value: 'tarifa' as const, label: 'Tarifa' },
    { value: 'volume' as const, label: 'Volume (24h)' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md mx-4 w-full" 
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-white font-bold text-lg mb-4">Ordenar por</h3>
        
        <div className="space-y-3 mb-6">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onSortByChange(option.value)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                sortBy === option.value
                  ? 'bg-yellow-500/20 border-2 border-yellow-500/50 text-yellow-400'
                  : 'bg-slate-700/50 border-2 border-transparent text-white hover:bg-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{option.label}</span>
                {sortBy === option.value && (
                  <span className="text-yellow-400">
                    {sortDirection === 'desc' ? '↓' : '↑'}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 mb-6">
          <span className="text-slate-300 text-sm">Ordem:</span>
          <Button
            variant={sortDirection === 'desc' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSortDirectionChange('desc')}
            className="flex items-center gap-2"
          >
            <ArrowDown className="h-4 w-4" />
            Descendente
          </Button>
          <Button
            variant={sortDirection === 'asc' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSortDirectionChange('asc')}
            className="flex items-center gap-2"
          >
            <ArrowUp className="h-4 w-4" />
            Ascendente
          </Button>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={onApply}
            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-slate-900"
          >
            Aplicar
          </Button>
        </div>
      </div>
    </div>
  );
}

