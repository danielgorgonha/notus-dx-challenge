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
  
  // Logs serão adicionados após as definições das variáveis

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
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 300000, // 5 minutos
    gcTime: 600000, // 10 minutos
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
    
    console.log('🔍 DEBUG TokenSelector:');
    console.log('- chainId:', chainId);
    console.log('- supportedTokens:', supportedTokens.length);
    console.log('- portfolioTokens:', portfolioTokens.length);
    console.log('- tokensData:', tokensData);
    console.log('- portfolioData:', portfolioData);
    
    // Verificar estrutura dos tokens
    if (supportedTokens.length > 0) {
      console.log('🔍 DEBUG First token structure:', supportedTokens[0]);
      console.log('🔍 DEBUG First token chain:', (supportedTokens[0] as any).chain);
    }
    
    
    // 1. Mapear tokens suportados com saldos do portfolio
    const supportedWithBalances = supportedTokens.map((token: any) => {
      const portfolioToken = portfolioTokens.find((pt: any) => 
        pt.address.toLowerCase() === token.address.toLowerCase() && 
        pt.chainId === (token.chain?.id || token.chainId)
      );
      
      const mappedToken = {
        address: token.address,
        symbol: token.symbol,
        name: token.name,
        decimals: token.decimals,
        chainId: token.chain?.id || token.chainId,
        logoUrl: token.logo,
        price: token.priceUsd !== undefined ? parseFloat(token.priceUsd) : undefined,
        isNative: token.address === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
        balance: portfolioToken?.balanceFormatted || portfolioToken?.balance || "0",
        balanceUsd: portfolioToken?.balanceUsd || "0"
      };
      
      console.log('🔍 DEBUG Token mapping:', token.symbol, 'chainId:', (token as any).chain?.id, 'mapped:', mappedToken.chainId);
      
      return mappedToken;
    });
    
    console.log('✅ DEBUG supportedWithBalances:', supportedWithBalances.length);
    
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
    const sameChainTokens = uniqueTokens.filter(token => {
      const tokenChainId = token.chainId || token.chain?.id;
      const match = tokenChainId === chainId;
      
      console.log('🔍 DEBUG Chain filter:');
      console.log('- token:', token.symbol, 'tokenChainId:', tokenChainId, 'target:', chainId, 'match:', match);
      
      return match;
    });
    
    // 6. Ordenar por saldo (tokens com saldo primeiro)
    const finalTokens = sameChainTokens.sort((a, b) => {
      const balanceA = parseFloat(a.balance || "0");
      const balanceB = parseFloat(b.balance || "0");
      return balanceB - balanceA; // Maior saldo primeiro
    });
    
    console.log('✅ DEBUG Final tokens:', finalTokens.length);
    console.log('- sameChainTokens:', sameChainTokens.length);
    console.log('- finalTokens:', finalTokens.slice(0, 3));
    
    return finalTokens;
  }, [tokensData, portfolioData]);

  // Auto-selecionar token quando disponível
  React.useEffect(() => {
    console.log('🔍 DEBUG TokenSelector auto-select:', {
      autoSelectSymbol,
      selectedToken: selectedToken?.symbol,
      tokensCount: tokensWithBalances.length,
      availableTokens: tokensWithBalances.map(t => t.symbol).slice(0, 5)
    });
    
    if (autoSelectSymbol && !selectedToken && tokensWithBalances.length > 0) {
      const tokenToSelect = tokensWithBalances.find(token => 
        token.symbol.toLowerCase() === autoSelectSymbol.toLowerCase()
      );
      
      console.log('🔍 DEBUG TokenSelector search:', {
        lookingFor: autoSelectSymbol,
        found: tokenToSelect?.symbol,
        allSymbols: tokensWithBalances.map(t => t.symbol)
      });
      
      if (tokenToSelect) {
        console.log('✅ DEBUG TokenSelector auto-selecting:', tokenToSelect.symbol);
        onTokenSelect(tokenToSelect);
      } else {
        console.log('❌ DEBUG TokenSelector token not found:', autoSelectSymbol);
      }
    }
  }, [autoSelectSymbol, selectedToken, tokensWithBalances, onTokenSelect]);

  // Filtrar tokens por busca
  const filteredTokens = React.useMemo(() => {
    console.log('🔍 DEBUG filteredTokens:');
    console.log('- tokensWithBalances:', tokensWithBalances.length);
    console.log('- searchQuery:', searchQuery);
    
    if (!searchQuery) {
      console.log('✅ DEBUG: Retornando todos os tokens');
      return tokensWithBalances;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = tokensWithBalances.filter(token => 
      token.symbol.toLowerCase().includes(query) ||
      token.name.toLowerCase().includes(query) ||
      token.address.toLowerCase().includes(query)
    );
    
    console.log('✅ DEBUG: Filtrados', filtered.length, 'tokens');
    return filtered;
  }, [tokensWithBalances, searchQuery]);


  const handleTokenSelect = (token: Token) => {
    console.log('🔍 DEBUG: Token selecionado:', token.symbol);
    onTokenSelect(token);
    setIsOpen(false);
    setSearchQuery("");
  };


  // Se estiver carregando, mostrar loading
  if (tokensLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-sm text-gray-500">Carregando tokens...</span>
      </div>
    );
  }

  // Se houver erro, mostrar erro
  if (tokensError) {
    return (
      <div className="flex items-center justify-center p-4">
        <span className="text-sm text-red-500">Erro ao carregar tokens: {tokensError.message}</span>
      </div>
    );
  }

  // Se não há tokens, mostrar mensagem
  if (!tokensWithBalances || tokensWithBalances.length === 0) {
    console.log('❌ DEBUG: Nenhum token disponível');
    console.log('- tokensWithBalances:', tokensWithBalances);
    console.log('- length:', tokensWithBalances?.length);
    return (
      <div className="flex items-center justify-center p-4">
        <span className="text-sm text-gray-500">Nenhum token disponível</span>
      </div>
    );
  }
  
  console.log('✅ DEBUG: Renderizando TokenSelector com', tokensWithBalances.length, 'tokens');
  console.log('🔍 DEBUG TokenSelector render:', {
    isOpen,
    searchQuery,
    tokensWithBalances: tokensWithBalances?.length,
    filteredTokens: filteredTokens?.length
  });


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
        onClick={() => {
          console.log('🔍 DEBUG: Clique no botão, isOpen:', isOpen, '->', !isOpen);
          setIsOpen(!isOpen);
        }}
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
              (() => {
                console.log('🔍 DEBUG: Renderizando', filteredTokens.length, 'tokens');
                console.log('- filteredTokens:', filteredTokens.slice(0, 3));
                console.log('- filteredTokens[0]:', filteredTokens[0]);
                return filteredTokens.map((token) => {
                  console.log('🔍 DEBUG: Renderizando token:', token.symbol);
                  return (
                <button
                  key={`${token.address}-${token.chainId || 'unknown'}-${token.symbol}`}
                  onClick={() => {
                    console.log('🔍 DEBUG: Clique no token:', token.symbol);
                    handleTokenSelect(token);
                  }}
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
                  );
                });
              })()
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
