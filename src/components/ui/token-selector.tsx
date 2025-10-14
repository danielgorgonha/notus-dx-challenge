"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronDown, 
  Search, 
  Loader2,
  AlertCircle
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { listTokensByChain } from "@/lib/actions/blockchain";
import { getPortfolio } from "@/lib/actions/dashboard";

interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  chainId: number;
  logoUrl?: string;
  price?: number;
  isNative: boolean;
  balance?: string;
  balanceUsd?: string;
}

interface TokenSelectorProps {
  selectedToken: Token | null;
  onTokenSelect: (token: Token) => void;
  chainId: number;
  walletAddress?: string;
  placeholder?: string;
  showBalance?: boolean;
  className?: string;
  autoSelectSymbol?: string;
  compact?: boolean;
}

export function TokenSelector({
  selectedToken,
  onTokenSelect,
  chainId,
  walletAddress,
  placeholder = "Selecionar token",
  showBalance = true,
  className = "",
  autoSelectSymbol,
  compact = false
}: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Buscar tokens suportados da API Notus
  const { data: tokensData, isLoading: tokensLoading, error: tokensError } = useQuery({
    queryKey: ['tokens', chainId],
    queryFn: async () => {
      const result = await listTokensByChain({ 
        chainId, 
        page: 1, 
        perPage: 100, 
        orderBy: 'marketCap', 
        orderDir: 'desc' 
      });
      return result;
    },
    refetchInterval: 300000, // 5 minutos
  });

  // Buscar portfolio do usuário para obter saldos
  const { data: portfolioData, isLoading: portfolioLoading, error: portfolioError } = useQuery({
    queryKey: ['portfolio', walletAddress],
    queryFn: () => getPortfolio(walletAddress || ''),
    enabled: !!walletAddress,
    refetchInterval: 30000,
  });


  // Combinar tokens suportados com saldos do portfolio + tokens do portfolio que não estão na lista suportada
  const tokensWithBalances = React.useMemo(() => {
    const supportedTokens = tokensData?.tokens || [];
    const portfolioTokens = portfolioData?.tokens || [];
    
    
    // 1. Mapear tokens suportados com saldos do portfolio
    const supportedWithBalances = supportedTokens.map((token: any) => {
      const portfolioToken = portfolioTokens.find((pt: any) => 
        pt.address.toLowerCase() === token.address.toLowerCase() && 
        pt.chainId === token.chain?.id
      );
      
      
      return {
        address: token.address,
        symbol: token.symbol,
        name: token.name,
        decimals: token.decimals,
        chainId: token.chain?.id,
        logoUrl: token.logo,
        price: token.priceUsd !== undefined ? parseFloat(token.priceUsd) : undefined,
        isNative: token.address === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
        balance: portfolioToken?.balanceFormatted || portfolioToken?.balance || "0",
        balanceUsd: portfolioToken?.balanceUsd || "0"
      };
    });
    
    // 2. Adicionar tokens do portfolio que não estão na lista suportada
    const portfolioOnlyTokens = portfolioTokens
      .filter((pt: any) => {
        // Verificar se este token do portfolio NÃO está na lista suportada
        return !supportedTokens.some((st: any) => 
          st.address.toLowerCase() === pt.address.toLowerCase() && 
          pt.chainId === st.chain?.id
        );
      })
      .map((pt: any) => ({
        address: pt.address,
        symbol: pt.symbol,
        name: pt.name,
        decimals: pt.decimals,
        chainId: pt.chainId,
        logoUrl: pt.logo,
        price: pt.priceUsd ? parseFloat(pt.priceUsd) : undefined,
        isNative: false,
        balance: pt.balanceFormatted || pt.balance || "0",
        balanceUsd: pt.balanceUsd || "0"
      }));
    
    
    // 3. Combinar e remover duplicatas
    const allTokens = [...supportedWithBalances, ...portfolioOnlyTokens];
    
    // 4. Remover duplicatas por símbolo (manter o token com maior saldo)
    const uniqueTokens = allTokens.reduce((acc: any[], current: any) => {
      const existingIndex = acc.findIndex(token => 
        token.symbol.toLowerCase() === current.symbol.toLowerCase() && 
        (token.chainId === current.chainId || token.chain?.id === current.chain?.id)
      );
      
      if (existingIndex === -1) {
        // Token não existe, adicionar
        acc.push(current);
      } else {
        // Token existe, manter o que tem maior saldo
        const existing = acc[existingIndex];
        const currentBalance = parseFloat(current.balance || "0");
        const existingBalance = parseFloat(existing.balance || "0");
        
        if (currentBalance > existingBalance) {
          acc[existingIndex] = current;
        }
      }
      
      return acc;
    }, []);
    
    // 5. Filtrar apenas tokens da mesma chain
    const sameChainTokens = uniqueTokens.filter(token => token.chain?.id === chainId);
    
    // 6. Ordenar por saldo (tokens com saldo primeiro)
    const finalTokens = sameChainTokens.sort((a, b) => {
      const balanceA = parseFloat(a.balance || "0");
      const balanceB = parseFloat(b.balance || "0");
      return balanceB - balanceA; // Maior saldo primeiro
    });
    
    return finalTokens;
  }, [tokensData, portfolioData]);

  // Auto-selecionar token quando disponível
  React.useEffect(() => {
    if (autoSelectSymbol && !selectedToken && tokensWithBalances.length > 0) {
      const tokenToSelect = tokensWithBalances.find(token => 
        token.symbol.toLowerCase() === autoSelectSymbol.toLowerCase()
      );
      if (tokenToSelect) {
        onTokenSelect(tokenToSelect);
      }
    }
  }, [autoSelectSymbol, selectedToken, tokensWithBalances, onTokenSelect]);

  // Filtrar tokens por busca
  const filteredTokens = React.useMemo(() => {
    if (!searchQuery) return tokensWithBalances;
    
    const query = searchQuery.toLowerCase();
    return tokensWithBalances.filter(token => 
      token.symbol.toLowerCase().includes(query) ||
      token.name.toLowerCase().includes(query) ||
      token.address.toLowerCase().includes(query)
    );
  }, [tokensWithBalances, searchQuery]);

  const handleTokenSelect = (token: Token) => {
    onTokenSelect(token);
    setIsOpen(false);
    setSearchQuery("");
  };

  const formatBalance = (balance: string, decimals: number) => {
    const num = parseFloat(balance);
    if (num === 0) return "0";
    if (num < 0.0001) return num.toFixed(8);
    if (num >= 1) return num.toFixed(2);
    return num.toFixed(4);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Botão de seleção */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className={`${compact ? 'px-3 py-2 h-auto' : 'w-full justify-between p-3 h-auto'} bg-slate-800/50 border-slate-600 hover:bg-slate-700/50`}
      >
        <div className={`flex items-center ${compact ? 'space-x-2' : 'space-x-3'}`}>
          {selectedToken ? (
            <>
              <div className={compact ? 'text-sm' : 'text-lg'}>
                {selectedToken.logoUrl && (
                  <img src={selectedToken.logoUrl} alt={selectedToken.symbol} className={`${compact ? 'w-5 h-5' : 'w-6 h-6'} rounded-full`} />
                )}
              </div>
              <div className="text-left">
                <div className={`text-white font-semibold ${compact ? 'text-sm' : ''}`}>{selectedToken.symbol}</div>
                {!compact && <div className="text-slate-400 text-sm">{selectedToken.name}</div>}
              </div>
            </>
          ) : (
            <div className={`text-slate-400 ${compact ? 'text-sm' : ''}`}>{placeholder}</div>
          )}
        </div>
        <ChevronDown className={`h-4 w-4 text-slate-400 ${compact ? 'ml-2' : ''}`} />
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-50 max-h-80 overflow-hidden">
          {/* Barra de busca */}
          <div className="p-3 border-b border-slate-600">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar token..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-700 border-slate-600 text-white"
              />
            </div>
          </div>

          {/* Lista de tokens */}
          <div className="max-h-60 overflow-y-auto">
            {tokensLoading ? (
              <div className="flex items-center justify-center p-6">
                <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
                <span className="ml-2 text-slate-400">Carregando tokens...</span>
              </div>
            ) : tokensError ? (
              <div className="flex items-center justify-center p-6">
                <AlertCircle className="h-6 w-6 text-red-400" />
                <span className="ml-2 text-red-400">Erro ao carregar tokens</span>
              </div>
            ) : filteredTokens.length === 0 ? (
              <div className="p-6 text-center text-slate-400">
                Nenhum token encontrado
              </div>
            ) : (
              filteredTokens.map((token) => (
                <button
                  key={`${token.address}-${token.chainId || 'unknown'}-${token.symbol}`}
                  onClick={() => handleTokenSelect(token)}
                  className="w-full flex items-center justify-between p-3 hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-lg">
                      {token.logoUrl && (
                        <img src={token.logoUrl} alt={token.symbol} className="w-6 h-6 rounded-full" />
                      )}
                    </div>
                    <div className="text-left">
                      <div className="text-white font-semibold">{token.symbol}</div>
                      <div className="text-slate-400 text-sm">{token.name}</div>
                    </div>
                  </div>
                  
                  {showBalance && walletAddress && (
                    <div className="text-right">
                      <div className="text-white text-sm">
                        {formatBalance(token.balance || "0", token.decimals)}
                      </div>
                      {token.balanceUsd && parseFloat(token.balanceUsd) > 0 && (
                        <div className="text-slate-400 text-xs">
                          ${parseFloat(token.balanceUsd).toFixed(2)}
                        </div>
                      )}
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Overlay para fechar */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
