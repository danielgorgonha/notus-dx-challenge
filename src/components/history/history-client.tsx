/**
 * History Client Component
 * Gerencia interatividade e filtros do histórico
 */

"use client";

import { useState } from "react";
import { HistoryTransactionList } from "./history-transaction-list";
import { HistoryFilters } from "./history-filters";

interface Transaction {
  id?: string;
  hash?: string;
  type?: string;
  status?: string;
  amount?: string;
  token?: string;
  from?: string;
  to?: string;
  timestamp?: string;
  createdAt?: string;
  metadata?: Record<string, unknown>;
}

interface HistoryClientProps {
  initialTransactions: Transaction[];
  walletAddress: string;
}

export function HistoryClient({
  initialTransactions,
  walletAddress,
}: HistoryClientProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'type'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filtrar transações
  const filteredTransactions = transactions.filter((tx) => {
    if (filter === 'all') return true;
    if (filter === 'completed') return tx.status === 'completed';
    if (filter === 'pending') return tx.status === 'pending';
    if (filter === 'failed') return tx.status === 'failed';
    return tx.type === filter;
  });

  // Ordenar transações
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    const aDate = a.createdAt || a.timestamp || '';
    const bDate = b.createdAt || b.timestamp || '';
    
    if (sortBy === 'date') {
      return sortOrder === 'desc' 
        ? new Date(bDate).getTime() - new Date(aDate).getTime()
        : new Date(aDate).getTime() - new Date(bDate).getTime();
    }
    
    if (sortBy === 'amount') {
      const aAmount = parseFloat(a.amount || '0');
      const bAmount = parseFloat(b.amount || '0');
      return sortOrder === 'desc' ? bAmount - aAmount : aAmount - bAmount;
    }
    
    return 0;
  });

  return (
    <div className="space-y-6">
      <HistoryFilters
        filter={filter}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onFilterChange={setFilter}
        onSortByChange={setSortBy}
        onSortOrderChange={setSortOrder}
      />
      
      <HistoryTransactionList
        transactions={sortedTransactions}
        walletAddress={walletAddress}
      />
    </div>
  );
}

