/**
 * Crypto Search Bar Component
 * Barra de busca para filtrar criptomoedas
 */

"use client";

import { Search } from "lucide-react";

interface CryptoSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function CryptoSearchBar({ searchQuery, onSearchChange }: CryptoSearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
      <input
        type="text"
        placeholder="Busca"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition-colors"
      />
    </div>
  );
}

