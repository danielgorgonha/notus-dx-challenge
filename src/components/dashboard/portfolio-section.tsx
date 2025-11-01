/**
 * Portfolio Section Component (Client)
 * Exibe tokens do portfolio
 */

"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface Token {
  symbol?: string;
  name?: string;
  balance?: string;
  balanceUsd?: string;
  decimals?: number;
}

interface PortfolioSectionProps {
  tokens?: Token[];
  isLoading?: boolean;
  error?: Error | null;
  formatTokenBalance: (balance: string | number, decimals?: number) => string;
  formatValue: (value: number) => string;
}

export function PortfolioSection({
  tokens = [],
  isLoading = false,
  error = null,
  formatTokenBalance,
  formatValue,
}: PortfolioSectionProps) {
  return (
    <div className="glass-card relative overflow-hidden group">
      {/* Efeito de brilho decorativo */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-blue-500/30">
              <span className="text-2xl">💼</span>
            </div>
            <h2 className="text-xl font-bold text-white">Portfolio</h2>
          </div>
          <Button variant="ghost" className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg px-3">
            Ver Todos →
          </Button>
        </div>
        
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
              <span className="ml-2 text-slate-400">Carregando portfolio...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-red-400 text-center">
                <div className="font-semibold">Erro ao carregar portfolio</div>
                <div className="text-sm text-slate-400 mt-1">
                  {error instanceof Error ? error.message : 'Erro desconhecido'}
                </div>
              </div>
            </div>
          ) : tokens.length > 0 ? (
            tokens.slice(0, 3).map((token, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-800/40 to-slate-700/40 rounded-xl border border-slate-700/50 hover:border-slate-600/70 hover:bg-gradient-to-r hover:from-slate-700/50 hover:to-slate-600/50 transition-all duration-200 group/item"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-yellow-500/30 group-hover/item:scale-110 transition-transform duration-200 flex-shrink-0">
                    {token.symbol?.slice(0, 2).toUpperCase() || 'TK'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white truncate">{token.name || 'Token Desconhecido'}</div>
                    <div className="text-slate-400 text-sm truncate">
                      {formatTokenBalance(token.balance || '0', token.decimals)} {token.symbol || 'TOK'}
                    </div>
                  </div>
                </div>
                <div className="text-right ml-4 flex-shrink-0">
                  <div className="font-bold text-white text-lg">
                    {formatValue(parseFloat(token.balanceUsd || '0'))}
                  </div>
                  <div className="text-yellow-400 text-xs font-medium">
                    {token.symbol || 'TOK'}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center p-8">
              <div className="text-slate-400 text-center">
                <div className="text-4xl mb-3">📭</div>
                <div className="font-semibold text-lg mb-1">Nenhum token encontrado</div>
                <div className="text-sm mb-4">Seu portfolio está vazio</div>
                <Button className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-slate-900 font-bold shadow-lg shadow-yellow-500/30">
                  Adicionar Fundos
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

