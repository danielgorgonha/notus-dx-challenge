/**
 * Crypto Client Component
 * Componente principal que orquestra a tela de mercado de criptomoedas
 */

"use client";

import { useState, useMemo } from "react";
import { CryptoHeader } from "./crypto-header";
import { CryptoSearchBar } from "./crypto-search-bar";
import { CryptoList } from "./crypto-list";
import { CryptoSortModal } from "./crypto-sort-modal";

interface CryptoClientProps {
  initialTokens: any[];
  total: number;
}

export function CryptoClient({ initialTokens, total }: CryptoClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currency, setCurrency] = useState<'BRL' | 'USD'>('BRL');
  
  // Estados de ordenação
  const [sortBy, setSortBy] = useState<"price" | "marketCap" | "priceChange24h" | "volume24h">("marketCap");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [showSortModal, setShowSortModal] = useState(false);
  
  // Estados temporários para o modal
  const [tempSortBy, setTempSortBy] = useState<"price" | "marketCap" | "priceChange24h" | "volume24h">("marketCap");
  const [tempSortDirection, setTempSortDirection] = useState<"asc" | "desc">("desc");

  // Taxa de conversão mockada (pode ser substituída por API de câmbio no futuro)
  const USD_TO_BRL = 5.0;

  // Filtrar tokens baseado na busca
  const filteredTokens = useMemo(() => {
    if (!searchQuery.trim()) {
      return initialTokens;
    }

    const query = searchQuery.toLowerCase();
    return initialTokens.filter((token) => {
      const name = token.name?.toLowerCase() || '';
      const symbol = token.symbol?.toLowerCase() || '';
      return name.includes(query) || symbol.includes(query);
    });
  }, [initialTokens, searchQuery]);

  // Converter preços para BRL se necessário e normalizar dados
  const tokensWithCurrency = useMemo(() => {
    return filteredTokens.map((token) => {
      const priceUsd = parseFloat(
        token.priceUsd || 
        token.priceUSD || 
        token.price || 
        token.priceInUsd ||
        '0'
      );
      const priceBrl = currency === 'BRL' ? priceUsd * USD_TO_BRL : priceUsd;
      
      // Extrair dados de mercado (tentar vários formatos possíveis)
      const marketCap = parseFloat(
        token.marketCap || 
        token.marketCapUSD || 
        token.marketCapUsd ||
        token.marketcap ||
        '0'
      );
      
      const priceChange24h = parseFloat(
        token.change24h || 
        token.change24hPercent || 
        token.change24H || 
        token.change24HPercent ||
        token.priceChange24h ||
        token.priceChange24hPercent ||
        token.priceChangePercent24h ||
        '0'
      );
      
      const volume24h = parseFloat(
        token.volume24h ||
        token.volume24hUSD ||
        token.volume24hUsd ||
        token.volume24H ||
        token.volume ||
        '0'
      );
      
      return {
        ...token,
        priceUsd,
        priceBrl,
        displayPrice: currency === 'BRL' ? priceBrl : priceUsd,
        marketCap,
        priceChange24h,
        volume24h,
      };
    });
  }, [filteredTokens, currency]);

  // Ordenar tokens
  const sortedTokens = useMemo(() => {
    return [...tokensWithCurrency].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'price':
          comparison = a.priceUsd - b.priceUsd;
          break;
        case 'marketCap':
          comparison = a.marketCap - b.marketCap;
          break;
        case 'priceChange24h':
          comparison = a.priceChange24h - b.priceChange24h;
          break;
        case 'volume24h':
          comparison = a.volume24h - b.volume24h;
          break;
        default:
          return 0;
      }
      
      return sortDirection === 'desc' ? -comparison : comparison;
    });
  }, [tokensWithCurrency, sortBy, sortDirection]);

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
    <div className="min-h-screen bg-slate-900 text-white pb-20 lg:pb-6">
      {/* Header */}
      <CryptoHeader 
        currency={currency}
        onCurrencyToggle={() => setCurrency(currency === 'BRL' ? 'USD' : 'BRL')}
      />

      {/* Search Bar */}
      <div className="px-4 lg:px-6 pt-4">
        <CryptoSearchBar 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

      {/* List */}
      <div className="px-4 lg:px-6 mt-4">
        <CryptoList 
          tokens={sortedTokens}
          total={total}
          currency={currency}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSortClick={handleOpenModal}
        />
      </div>

      {/* Sort Modal */}
      <CryptoSortModal
        isOpen={showSortModal}
        onClose={() => setShowSortModal(false)}
        sortBy={tempSortBy}
        sortDirection={tempSortDirection}
        onSortByChange={setTempSortBy}
        onSortDirectionChange={setTempSortDirection}
        onApply={handleApplySort}
      />
    </div>
  );
}
