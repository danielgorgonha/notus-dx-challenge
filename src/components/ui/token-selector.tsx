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
}

export function TokenSelector({
  selectedToken,
  onTokenSelect,
  chainId,
  walletAddress,
  placeholder = "Selecionar token",
  showBalance = true,
  className = ""
}: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Buscar tokens disponíveis na chain
  const { data: tokensData, isLoading: tokensLoading, error: tokensError } = useQuery({
    queryKey: ['tokens', chainId],
    queryFn: () => listTokensByChain(chainId, 1, 100),
    enabled: !!chainId,
  });

  // Buscar portfolio para mostrar saldos
  const { data: portfolio } = useQuery({
    queryKey: ['portfolio', walletAddress],
    queryFn: () => getPortfolio(walletAddress || ''),
    enabled: !!walletAddress && showBalance,
    refetchInterval: 30000,
  });

  // Combinar tokens com saldos do portfolio
  const tokensWithBalances = React.useMemo(() => {
    if (!tokensData?.tokens) return [];
    
    return tokensData.tokens.map(token => {
      const portfolioToken = portfolio?.tokens?.find((t: any) => 
        t.symbol === token.symbol || t.address === token.address
      );
      
      return {
        ...token,
        balance: portfolioToken?.balance || "0",
        balanceUsd: portfolioToken?.balanceUsd || "0"
      };
    });
  }, [tokensData, portfolio]);

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
        className="w-full justify-between p-3 h-auto bg-slate-800/50 border-slate-600 hover:bg-slate-700/50"
      >
        <div className="flex items-center space-x-3">
          {selectedToken ? (
            <>
              <div className="text-lg">
                {selectedToken.symbol === 'USDC' ? '💙' : 
                 selectedToken.symbol === 'BRZ' ? '🇧🇷' :
                 selectedToken.symbol === 'ETH' ? '💎' :
                 selectedToken.symbol === 'MATIC' ? '🟣' : '🪙'}
              </div>
              <div className="text-left">
                <div className="text-white font-semibold">{selectedToken.symbol}</div>
                <div className="text-slate-400 text-sm">{selectedToken.name}</div>
              </div>
            </>
          ) : (
            <div className="text-slate-400">{placeholder}</div>
          )}
        </div>
        <ChevronDown className="h-4 w-4 text-slate-400" />
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
                  key={`${token.address}-${token.chainId}`}
                  onClick={() => handleTokenSelect(token)}
                  className="w-full flex items-center justify-between p-3 hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-lg">
                      {token.symbol === 'USDC' ? '💙' : 
                       token.symbol === 'BRZ' ? '🇧🇷' :
                       token.symbol === 'ETH' ? '💎' :
                       token.symbol === 'MATIC' ? '🟣' : '🪙'}
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
