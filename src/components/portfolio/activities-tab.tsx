/**
 * Activities Tab Component
 * Exibe histórico de transações agrupadas por data
 */

"use client";

import { useState } from "react";
import { 
  ArrowDown, 
  ArrowUp, 
  ArrowRightLeft, 
  Droplets,
  Plus,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivitiesTabProps {
  history: any;
  walletAddress: string;
}

interface Transaction {
  id?: string;
  hash?: string;
  type?: string;
  status?: string;
  amount?: string;
  token?: string;
  from?: string;
  to?: string;
  timestamp?: string;
  createdAt?: string;
  metadata?: Record<string, unknown>;
}

export function ActivitiesTab({ history, walletAddress }: ActivitiesTabProps) {
  const [selectedFilters, setSelectedFilters] = useState({
    from: null as string | null,
    to: null as string | null,
    network: null as string | null,
  });

  const transactions = history?.transactions || [];

  // Agrupar transações por data
  const groupedTransactions = transactions.reduce((acc: Record<string, Transaction[]>, tx: Transaction) => {
    const date = new Date(tx.createdAt || tx.timestamp || Date.now());
    const dateKey = date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(tx);
    return acc;
  }, {});

  // Ordenar datas (mais recente primeiro)
  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => {
    const dateA = new Date(a.split('/').reverse().join('-'));
    const dateB = new Date(b.split('/').reverse().join('-'));
    return dateB.getTime() - dateA.getTime();
  });

  const getTransactionIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'receive':
      case 'deposit':
        return { icon: ArrowDown, color: 'text-green-400' };
      case 'send':
      case 'transfer':
        return { icon: ArrowUp, color: 'text-red-400' };
      case 'swap':
        return { icon: ArrowRightLeft, color: 'text-blue-400' };
      case 'liquidity':
      case 'invest':
        return { icon: Droplets, color: 'text-purple-400' };
      case 'buy':
        return { icon: Plus, color: 'text-green-400' };
      default:
        return { icon: ArrowRightLeft, color: 'text-slate-400' };
    }
  };

  const getTransactionLabel = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'receive':
      case 'deposit':
        return 'Recebimento';
      case 'send':
      case 'transfer':
        return 'Envio';
      case 'swap':
        return 'Swap';
      case 'liquidity':
      case 'invest':
        return 'Invest. Pool';
      case 'buy':
        return 'Compra';
      default:
        return type || 'Transação';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'success':
        return { icon: CheckCircle2, color: 'text-green-400', label: 'Sucesso' };
      case 'pending':
        return { icon: Clock, color: 'text-yellow-400', label: 'Pendente' };
      case 'failed':
      case 'error':
        return { icon: XCircle, color: 'text-red-400', label: 'Falhou' };
      default:
        return { icon: CheckCircle2, color: 'text-green-400', label: 'Sucesso' };
    }
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount?: string, token?: string) => {
    if (!amount) return '';
    const num = parseFloat(amount);
    if (isNaN(num)) return '';
    // Formatação mais compacta: mostrar menos decimais para valores pequenos
    const decimals = num < 0.001 ? 8 : num < 1 ? 6 : 2;
    return `${num >= 0 ? '+' : ''}${num.toFixed(decimals)} ${token || ''}`.trim();
  };

  const formatCurrency = (value: number) => {
    // Usar R$ para valores negativos (gastos) e $ para valores positivos (recebimentos)
    if (value < 0) {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(Math.abs(value));
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="px-4 lg:px-6 pb-20 lg:pb-6">
      {/* Filtros */}
      <div className="flex gap-3 mb-6">
        <button className="flex-1 px-4 py-2.5 bg-slate-800/50 rounded-lg border border-slate-700/50 text-white text-sm font-medium hover:bg-slate-700/50 transition-colors">
          De
        </button>
        <button className="flex-1 px-4 py-2.5 bg-slate-800/50 rounded-lg border border-slate-700/50 text-white text-sm font-medium hover:bg-slate-700/50 transition-colors">
          Até
        </button>
        <button className="flex-1 px-4 py-2.5 bg-slate-800/50 rounded-lg border border-slate-700/50 text-white text-sm font-medium hover:bg-slate-700/50 transition-colors">
          Rede
        </button>
      </div>

      {/* Lista de transações agrupadas por data */}
      <div className="space-y-6">
        {sortedDates.length > 0 ? (
          sortedDates.map((date) => (
            <div key={date}>
              {/* Cabeçalho da data */}
              <div className="text-slate-400 text-sm font-medium mb-3">
                {date}
              </div>

              {/* Transações do dia */}
              <div className="space-y-4">
                {groupedTransactions[date].map((tx, index) => {
                  const { icon: TxIcon, color: txColor } = getTransactionIcon(tx.type || '');
                  const { icon: StatusIcon, color: statusColor, label: statusLabel } = getStatusIcon(tx.status || 'completed');
                  
                  // Tentar extrair informações de tokens da metadata ou dos campos padrão
                  const token0 = tx.metadata?.token0 || tx.metadata?.tokenIn || tx.token;
                  const token1 = tx.metadata?.token1 || tx.metadata?.tokenOut;
                  const amount0 = tx.metadata?.amount0 || tx.metadata?.amountIn || tx.amount;
                  const amount1 = tx.metadata?.amount1 || tx.metadata?.amountOut;
                  const amountUsd = tx.metadata?.amountUsd || tx.metadata?.amountUSD || tx.metadata?.amountUSd;
                  
                  // Se for uma transação de swap/liquidity, pode ter ambos os tokens
                  const hasMultipleTokens = token0 && token1 && (tx.type?.toLowerCase() === 'swap' || tx.type?.toLowerCase() === 'liquidity' || tx.type?.toLowerCase() === 'invest');

                  // Lógica para formatação de valores conforme tipo de transação
                  const isBuy = tx.type?.toLowerCase() === 'buy';
                  const isReceive = tx.type?.toLowerCase() === 'receive' || tx.type?.toLowerCase() === 'deposit';
                  
                  return (
                    <div key={tx.id || tx.hash || index} className="space-y-3">
                      {/* Card principal da transação */}
                      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                        <div className="flex items-start justify-between">
                          {/* Lado esquerdo: ícone e informações */}
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                              isBuy
                                ? "bg-green-500/20 border border-green-500/30"
                                : tx.type?.toLowerCase() === 'invest'
                                ? "bg-purple-500/20 border border-purple-500/30"
                                : isReceive
                                ? "bg-green-500/20 border border-green-500/30"
                                : "bg-blue-500/20 border border-blue-500/30"
                            )}>
                              <TxIcon className={cn("h-5 w-5", txColor)} />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="text-white font-medium mb-1">
                                {getTransactionLabel(tx.type || '')}
                              </div>
                              <div className="text-slate-400 text-sm">
                                {formatTime(tx.createdAt || tx.timestamp)}
                              </div>
                            </div>
                          </div>

                          {/* Lado direito: valores */}
                          <div className="text-right flex-shrink-0 ml-4">
                            {hasMultipleTokens ? (
                              <div className="space-y-1">
                                {amount0 && (
                                  <div className="text-white text-sm font-medium">
                                    {formatAmount(amount0.toString(), token0)}
                                  </div>
                                )}
                                {amount1 && (
                                  <div className="text-white text-sm font-medium">
                                    {formatAmount(amount1.toString(), token1)}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <div className="text-white text-sm font-medium">
                                  {isBuy 
                                    ? formatAmount(amount0?.toString() || tx.amount || '0', token0)
                                    : formatAmount(amount0?.toString() || tx.amount || '0', token0)
                                  }
                                </div>
                                {amountUsd && parseFloat(amountUsd.toString()) !== 0 && (
                                  <div className="text-slate-400 text-xs">
                                    {isBuy 
                                      ? `-${new Intl.NumberFormat('pt-BR', {
                                          style: 'currency',
                                          currency: 'BRL',
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        }).format(Math.abs(parseFloat(amountUsd.toString())))}`
                                      : new Intl.NumberFormat('en-US', {
                                          style: 'currency',
                                          currency: 'USD',
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        }).format(Math.abs(parseFloat(amountUsd.toString())))
                                    }
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Status da transação - abaixo do card */}
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-sm">Status</span>
                        <div className="flex items-center gap-2">
                          <StatusIcon className={cn("h-4 w-4", statusColor)} />
                          <span className={cn("text-sm font-medium", statusColor)}>
                            {statusLabel}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="text-slate-400 mb-2">Nenhuma transação encontrada</div>
            <div className="text-slate-500 text-sm">Seu histórico aparecerá aqui</div>
          </div>
        )}
      </div>
    </div>
  );
}

