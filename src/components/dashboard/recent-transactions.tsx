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
    <div className="glass-card relative overflow-hidden group">
      {/* Efeito de brilho decorativo */}
      <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center border border-purple-500/30">
              <span className="text-2xl">📊</span>
            </div>
            <h2 className="text-xl font-bold text-white">Transações Recentes</h2>
          </div>
          <Button variant="ghost" className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg px-3">
            Ver Todas →
          </Button>
        </div>

        <div className="space-y-3">
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
            transactions.slice(0, 5).map((transaction, index) => {
              const getTypeConfig = () => {
                switch (transaction.type) {
                  case 'swap':
                    return {
                      icon: ArrowRightLeft,
                      color: 'emerald',
                      bgColor: 'from-emerald-600/20 to-emerald-700/20',
                      borderColor: 'border-emerald-500/30',
                      iconColor: 'text-emerald-400',
                      label: 'Troca'
                    };
                  case 'liquidity':
                    return {
                      icon: Droplets,
                      color: 'blue',
                      bgColor: 'from-blue-600/20 to-blue-700/20',
                      borderColor: 'border-blue-500/30',
                      iconColor: 'text-blue-400',
                      label: 'Liquidez'
                    };
                  default:
                    return {
                      icon: Activity,
                      color: 'purple',
                      bgColor: 'from-purple-600/20 to-purple-700/20',
                      borderColor: 'border-purple-500/30',
                      iconColor: 'text-purple-400',
                      label: transaction.type?.charAt(0).toUpperCase() + transaction.type?.slice(1) || 'Transação'
                    };
                }
              };
              
              const config = getTypeConfig();
              const Icon = config.icon;
              const statusColors: Record<string, string> = {
                completed: 'text-green-400 bg-green-500/10 border-green-500/20',
                pending: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
                failed: 'text-red-400 bg-red-500/10 border-red-500/20'
              };
              const statusColor = statusColors[transaction.status || ''] || 'text-slate-400 bg-slate-500/10 border-slate-500/20';
              
              const hoverBorderClass = 
                config.color === 'emerald' ? 'hover:border-emerald-400/50' :
                config.color === 'blue' ? 'hover:border-blue-400/50' :
                'hover:border-purple-400/50';
              
              const shadowClass =
                config.color === 'emerald' ? 'shadow-emerald-500/20' :
                config.color === 'blue' ? 'shadow-blue-500/20' :
                'shadow-purple-500/20';
              
              return (
                <div 
                  key={index} 
                  className={`flex items-center justify-between p-4 bg-gradient-to-r ${config.bgColor} rounded-xl border ${config.borderColor} ${hoverBorderClass} transition-all duration-200 group/item`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-12 h-12 bg-gradient-to-br ${config.bgColor} ${config.borderColor} border rounded-xl flex items-center justify-center shadow-lg ${shadowClass} group-hover/item:scale-110 transition-transform duration-200 flex-shrink-0`}>
                      <Icon className={`h-6 w-6 ${config.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white truncate">{config.label}</div>
                      <div className="text-slate-400 text-sm">
                        {transaction.createdAt ? 
                          new Date(transaction.createdAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 
                          'Horário desconhecido'
                        }
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4 flex-shrink-0">
                    <div className="font-bold text-white">
                      {transaction.amount ? `${transaction.amount} ${transaction.token || ''}` : 'N/A'}
                    </div>
                    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border mt-1 ${statusColor}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${transaction.status === 'completed' ? 'bg-green-400' : transaction.status === 'pending' ? 'bg-yellow-400 animate-pulse' : 'bg-slate-400'}`} />
                      {transaction.status === 'completed' ? 'Concluída' :
                       transaction.status === 'pending' ? 'Pendente' :
                       transaction.status === 'failed' ? 'Falhou' :
                       transaction.status || 'Desconhecido'}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex items-center justify-center p-8">
              <div className="text-slate-400 text-center">
                <div className="text-4xl mb-3">📭</div>
                <div className="font-semibold text-lg mb-1">Ainda sem transações</div>
                <div className="text-sm mb-4">Que tal fazer a primeira?</div>
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

