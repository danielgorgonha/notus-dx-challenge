/**
 * Recent Transactions Component (Client)
 * Exibe transações recentes
 */

"use client";

import { Button } from "@/components/ui/button";
import { ArrowRightLeft, Droplets, Activity, Loader2 } from "lucide-react";

interface Transaction {
  type?: string;
  amount?: string;
  token?: string;
  status?: string;
  createdAt?: string;
}

interface RecentTransactionsProps {
  transactions?: Transaction[];
  isLoading?: boolean;
  error?: Error | null;
}

export function RecentTransactions({
  transactions = [],
  isLoading = false,
  error = null,
}: RecentTransactionsProps) {
  return (
    <div className="glass-card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Transações Recentes</h2>
        <Button variant="ghost" className="text-blue-400 hover:text-blue-300">
          Ver Todas
        </Button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
            <span className="ml-2 text-slate-400">Carregando transações...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-red-400 text-center">
              <div className="font-semibold">Erro ao carregar transações</div>
              <div className="text-sm text-slate-400 mt-1">
                {error instanceof Error ? error.message : 'Erro desconhecido'}
              </div>
            </div>
          </div>
        ) : transactions.length > 0 ? (
          transactions.slice(0, 5).map((transaction, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-emerald-600/20 rounded-full flex items-center justify-center mr-3">
                  {transaction.type === 'swap' ? (
                    <ArrowRightLeft className="h-5 w-5 text-emerald-400" />
                  ) : transaction.type === 'liquidity' ? (
                    <Droplets className="h-5 w-5 text-blue-400" />
                  ) : (
                    <Activity className="h-5 w-5 text-purple-400" />
                  )}
                </div>
                <div>
                  <div className="font-semibold text-white">
                    {transaction.type === 'swap' ? 'Troca' : 
                     transaction.type === 'liquidity' ? 'Liquidez' :
                     transaction.type === 'deposit' ? 'Depósito' :
                     transaction.type?.charAt(0).toUpperCase() + transaction.type?.slice(1) || 'Transação'}
                  </div>
                  <div className="text-slate-400 text-sm">
                    {transaction.createdAt ? 
                      new Date(transaction.createdAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 
                      'Horário desconhecido'
                    }
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-white">
                  {transaction.amount ? `${transaction.amount} ${transaction.token || ''}` : 'N/A'}
                </div>
                <div className="text-slate-400 text-sm">
                  {transaction.status === 'completed' ? 'Concluída' :
                   transaction.status === 'pending' ? 'Pendente' :
                   transaction.status || 'Status desconhecido'}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center p-8">
            <div className="text-slate-400 text-center">
              <div className="font-semibold">Ainda sem transações</div>
              <div className="text-sm mt-1">Que tal fazer a primeira?</div>
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

