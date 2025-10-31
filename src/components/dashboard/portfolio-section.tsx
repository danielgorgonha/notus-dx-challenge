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
    <div className="glass-card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Portfolio</h2>
        <Button variant="ghost" className="text-blue-400 hover:text-blue-300">
          Ver Todos
        </Button>
      </div>
      
      <div className="space-y-4">
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
            <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                  {token.symbol?.slice(0, 4) || 'TOK'}
                </div>
                <div>
                  <div className="font-semibold text-white">{token.name || 'Token Desconhecido'}</div>
                  <div className="text-slate-400 text-sm">
                    {formatTokenBalance(token.balance || '0', token.decimals)} {token.symbol || 'TOK'}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-white">
                  {formatValue(parseFloat(token.balanceUsd || '0'))}
                </div>
                <div className="text-yellow-400 text-sm">
                  {token.symbol || 'TOK'}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center p-8">
            <div className="text-slate-400 text-center">
              <div className="font-semibold">Nenhum token encontrado</div>
              <div className="text-sm mt-1">Seu portfolio está vazio</div>
              <Button className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold">
                Adicionar Fundos
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

