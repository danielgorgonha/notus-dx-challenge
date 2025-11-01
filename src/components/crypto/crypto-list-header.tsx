/**
 * Crypto List Header Component
 * Cabeçalho da lista com contador e ordenação
 */

"use client";

interface CryptoListHeaderProps {
  total: number;
  originalTotal: number;
  sortBy: "price" | "marketCap" | "priceChange24h" | "volume24h";
  sortDirection: "asc" | "desc";
  onSortClick: () => void;
}

const sortLabels: Record<"price" | "marketCap" | "priceChange24h" | "volume24h", string> = {
  price: "Preço atual",
  marketCap: "Capitalização de mercado",
  priceChange24h: "Maior alteração de preço (24h)",
  volume24h: "Volume negociado (24h)",
};

export function CryptoListHeader({ 
  total, 
  originalTotal,
  sortBy,
  sortDirection,
  onSortClick 
}: CryptoListHeaderProps) {
  // Mostrar o originalTotal da API Notus (total de tokens filtrados por chain)
  // Se houver busca ativa e resultar em menos tokens, mostrar o total filtrado
  const displayTotal = total > 0 && total < originalTotal ? total : originalTotal;
  
  return (
    <div className="flex items-center justify-between py-3">
      <div className="text-white text-base font-medium">
        Cripto - {displayTotal.toLocaleString('pt-BR')}
      </div>
      <button
        onClick={onSortClick}
        className="text-yellow-400 text-sm font-medium flex items-center gap-1 hover:text-yellow-300 transition-colors"
      >
        {sortLabels[sortBy]}
        <span className="text-xs ml-1">{sortDirection === 'desc' ? '↓' : '↑'}</span>
      </button>
    </div>
  );
}

