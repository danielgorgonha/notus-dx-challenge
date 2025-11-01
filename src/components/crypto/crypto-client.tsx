/**
 * Crypto Client Component
 * Componente principal que orquestra a tela de mercado de criptomoedas
 */

"use client";

import { useState, useMemo } from "react";
import { CryptoHeader } from "./crypto-header";
import { CryptoSearchBar } from "./crypto-search-bar";
import { CryptoList } from "./crypto-list";

interface CryptoClientProps {
  initialTokens: any[];
  total: number;
}

export function CryptoClient({ initialTokens, total }: CryptoClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currency, setCurrency] = useState<'BRL' | 'USD'>('BRL');

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

  // Converter preços para BRL se necessário
  const tokensWithCurrency = useMemo(() => {
    return filteredTokens.map((token) => {
      const priceUsd = parseFloat(token.priceUsd || token.price || '0');
      const priceBrl = currency === 'BRL' ? priceUsd * USD_TO_BRL : priceUsd;
      
      return {
        ...token,
        priceUsd,
        priceBrl,
        displayPrice: currency === 'BRL' ? priceBrl : priceUsd,
      };
    });
  }, [filteredTokens, currency]);

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

