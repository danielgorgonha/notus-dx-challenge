/**
 * History Filters Component (Client)
 * Filtros e ordenação do histórico
 */

"use client";

import { Button } from "@/components/ui/button";
import { Filter, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

interface HistoryFiltersProps {
  filter: string;
  sortBy: 'date' | 'amount' | 'type';
  sortOrder: 'asc' | 'desc';
  onFilterChange: (filter: string) => void;
  onSortByChange: (sortBy: 'date' | 'amount' | 'type') => void;
  onSortOrderChange: (order: 'asc' | 'desc') => void;
}

export function HistoryFilters({
  filter,
  sortBy,
  sortOrder,
  onFilterChange,
  onSortByChange,
  onSortOrderChange,
}: HistoryFiltersProps) {
  return (
    <div className="glass-card">
      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-slate-400" />
          <span className="text-sm text-slate-300">Filtrar:</span>
        </div>
        
        <div className="flex gap-2">
          {['all', 'completed', 'pending', 'failed', 'swap', 'transfer', 'liquidity'].map((filterOption) => (
            <Button
              key={filterOption}
              variant={filter === filterOption ? 'default' : 'outline'}
              size="sm"
              onClick={() => onFilterChange(filterOption)}
              className="capitalize"
            >
              {filterOption === 'all' ? 'Todas' :
               filterOption === 'completed' ? 'Concluídas' :
               filterOption === 'pending' ? 'Pendentes' :
               filterOption === 'failed' ? 'Falhas' :
               filterOption}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <span className="text-sm text-slate-300">Ordenar:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value as 'date' | 'amount' | 'type')}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white"
          >
            <option value="date">Data</option>
            <option value="amount">Valor</option>
            <option value="type">Tipo</option>
          </select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? (
              <ArrowUp className="h-4 w-4" />
            ) : (
              <ArrowDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

