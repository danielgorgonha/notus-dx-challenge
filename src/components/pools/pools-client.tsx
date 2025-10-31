/**
 * Pools Client Component
 * Gerencia interatividade, filtros e ordenação
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PoolsList } from "./pools-list";
import { PoolSortModal } from "./pool-sort-modal";

interface Pool {
  id: string;
  protocol: string;
  tokenPair: string;
  token1: { symbol: string; logo: string; color: string };
  token2: { symbol: string; logo: string; color: string };
  rentabilidade: string;
  tvl: string;
  tarifa: string;
  volume24h: string;
  composition: string;
  address: string;
  chain: any;
  provider: any;
  stats: any;
  tokens: any[];
  fee: number;
  metrics: any;
}

interface PoolsClientProps {
  initialPools: Pool[];
  walletAddress?: string;
}

export function PoolsClient({
  initialPools,
  walletAddress,
}: PoolsClientProps) {
  const [pools, setPools] = useState<Pool[]>(initialPools);
  const [sortBy, setSortBy] = useState<"rentabilidade" | "tvl" | "tarifa" | "volume">("rentabilidade");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [showSortModal, setShowSortModal] = useState(false);
  
  // Estados temporários para o modal
  const [tempSortBy, setTempSortBy] = useState<"rentabilidade" | "tvl" | "tarifa" | "volume">("rentabilidade");
  const [tempSortDirection, setTempSortDirection] = useState<"asc" | "desc">("desc");

  // Ordenar pools
  const sortedPools = [...pools].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'rentabilidade':
        comparison = a.metrics.apr - b.metrics.apr;
        break;
      case 'tvl':
        comparison = a.metrics.tvl - b.metrics.tvl;
        break;
      case 'tarifa':
        comparison = a.fee - b.fee;
        break;
      case 'volume':
        comparison = a.metrics.volume24h - b.metrics.volume24h;
        break;
      default:
        return 0;
    }
    
    return sortDirection === 'desc' ? -comparison : comparison;
  });

  const handleOpenModal = () => {
    setTempSortBy(sortBy);
    setTempSortDirection(sortDirection);
    setShowSortModal(true);
  };

  const handleApplySort = () => {
    setSortBy(tempSortBy);
    setSortDirection(tempSortDirection);
    setShowSortModal(false);
  };

  return (
    <>
      <PoolsList
        pools={sortedPools}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSortClick={handleOpenModal}
        walletAddress={walletAddress}
      />
      
      <PoolSortModal
        isOpen={showSortModal}
        onClose={() => setShowSortModal(false)}
        sortBy={tempSortBy}
        sortDirection={tempSortDirection}
        onSortByChange={setTempSortBy}
        onSortDirectionChange={setTempSortDirection}
        onApply={handleApplySort}
      />
    </>
  );
}

