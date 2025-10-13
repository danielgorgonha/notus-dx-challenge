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

  // Tokens padrão para fallback quando API não retorna tokens
  const DEFAULT_TOKENS = [
    {
      address: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
      symbol: "USDC",
      name: "USD Coin",
      decimals: 6,
      chainId: 137,
      isNative: false,
      price: 1.00
    },
    {
      address: "0x4e15361fd6b4bb609fa63c81a2be19d873717870",
      symbol: "BRZ",
      name: "Brazilian Real Token",
      decimals: 18,
      chainId: 137,
      isNative: false,
      price: 0.20
    },
    {
      address: "0x0000000000000000000000000000000000000000",
      symbol: "MATIC",
      name: "Polygon",
      decimals: 18,
      chainId: 137,
      isNative: true,
      price: 0.80
    },
    {
      address: "0x7ceb23fd6fc0ad59bb62c01bdb4a4c4e96f73b4e",
      symbol: "WETH",
      name: "Wrapped Ethereum",
      decimals: 18,
      chainId: 137,
      isNative: false,
      price: 2500.00
    }
  ];

  // Buscar tokens suportados da API Notus
  const { data: tokensData, isLoading: tokensLoading, error: tokensError } = useQuery({
    queryKey: ['tokens', chainId],
    queryFn: () => listTokensByChain(chainId, 1, 100, 'fdf973e5-3523-4077-903d-bacfc0d0c2dd', false, 'marketCap', 'desc'),
    refetchInterval: 300000, // 5 minutos
  });

  // Buscar portfolio do usuário para obter saldos
  const { data: portfolioData, isLoading: portfolioLoading, error: portfolioError } = useQuery({
    queryKey: ['portfolio', walletAddress],
    queryFn: () => getPortfolio(walletAddress || ''),
    enabled: !!walletAddress,
    refetchInterval: 30000,
  });

  console.log("TokenSelector - walletAddress:", walletAddress);
  console.log("TokenSelector - portfolioData:", portfolioData);
  console.log("TokenSelector - portfolioError:", portfolioError);

  // Combinar tokens suportados com saldos do portfolio + tokens do portfolio que não estão na lista suportada
  const tokensWithBalances = React.useMemo(() => {
    const supportedTokens = tokensData?.tokens || [];
    const portfolioTokens = portfolioData?.tokens || [];
    
    console.log("TokenSelector - supportedTokens:", supportedTokens.length);
    console.log("TokenSelector - portfolioTokens:", portfolioTokens.length);
    
    // 1. Mapear tokens suportados com saldos do portfolio
    const supportedWithBalances = supportedTokens.map((token: any) => {
      const portfolioToken = portfolioTokens.find((pt: any) => 
        pt.address.toLowerCase() === token.address.toLowerCase() && 
        pt.chainId === token.chainId
      );
      
      if (portfolioToken) {
        console.log(`TokenSelector - Found portfolio token for ${token.symbol}:`, portfolioToken);
      }
      
      return {
        address: token.address,
        symbol: token.symbol,
        name: token.name,
        decimals: token.decimals,
        chainId: token.chainId,
        logoUrl: token.logo,
        price: token.marketCap ? token.marketCap / 1000000 : undefined,
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
          st.chainId === pt.chainId
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
    
    console.log("TokenSelector - portfolioOnlyTokens:", portfolioOnlyTokens.length);
    
    // 3. Combinar e ordenar por saldo (tokens com saldo primeiro)
    const allTokens = [...supportedWithBalances, ...portfolioOnlyTokens];
    return allTokens.sort((a, b) => {
      const balanceA = parseFloat(a.balance || "0");
      const balanceB = parseFloat(b.balance || "0");
      return balanceB - balanceA; // Maior saldo primeiro
    });
  }, [tokensData, portfolioData]);

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
                {selectedToken.logoUrl ? (
                  <img src={selectedToken.logoUrl} alt={selectedToken.symbol} className="w-6 h-6 rounded-full" />
                ) : (
                  selectedToken.symbol === 'USDC' ? '💙' : 
                  selectedToken.symbol === 'BRZ' ? '🇧🇷' :
                  selectedToken.symbol === 'ETH' ? '💎' :
                  selectedToken.symbol === 'MATIC' ? '🟣' : '🪙'
                )}
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
                      {token.logoUrl ? (
                        <img src={token.logoUrl} alt={token.symbol} className="w-6 h-6 rounded-full" />
                      ) : (
                        token.symbol === 'USDC' ? '💙' : 
                        token.symbol === 'BRZ' ? '🇧🇷' :
                        token.symbol === 'ETH' ? '💎' :
                        token.symbol === 'MATIC' ? '🟣' : '🪙'
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
