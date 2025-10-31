/**
 * History Transaction List Component (Client)
 * Lista de transações com ícones e formatação
 */

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRightLeft, 
  Droplets,
  TrendingUp,
  TrendingDown,
  Activity,
  ExternalLink,
  Loader2
} from "lucide-react";
import Link from "next/link";

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
}

interface HistoryTransactionListProps {
  transactions: Transaction[];
  walletAddress: string;
}

export function HistoryTransactionList({
  transactions,
  walletAddress,
}: HistoryTransactionListProps) {
  const getTransactionIcon = (type?: string) => {
    switch (type) {
      case 'swap':
        return <ArrowRightLeft className="h-5 w-5 text-blue-400" />;
      case 'liquidity':
      case 'pool':
        return <Droplets className="h-5 w-5 text-purple-400" />;
      case 'transfer':
      case 'send':
        return <TrendingUp className="h-5 w-5 text-red-400" />;
      case 'receive':
      case 'deposit':
        return <TrendingDown className="h-5 w-5 text-green-400" />;
      default:
        return <Activity className="h-5 w-5 text-slate-400" />;
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'completed':
      case 'success':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Concluída</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pendente</Badge>;
      case 'failed':
      case 'error':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Falha</Badge>;
      default:
        return <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">{status || 'Desconhecido'}</Badge>;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Data desconhecida';
    
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const getExplorerUrl = (hash?: string, chainId: number = 137) => {
    if (!hash) return null;
    const explorers: Record<number, string> = {
      137: `https://polygonscan.com/tx/${hash}`,
      1: `https://etherscan.io/tx/${hash}`,
    };
    return explorers[chainId] || null;
  };

  if (transactions.length === 0) {
    return (
      <Card className="glass-card">
        <CardContent className="flex flex-col items-center justify-center p-12">
          <Activity className="h-16 w-16 text-slate-500 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Nenhuma transação encontrada</h3>
          <p className="text-slate-400 text-center">
            Suas transações aparecerão aqui quando você começar a usar a carteira.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction, index) => {
        const explorerUrl = getExplorerUrl(transaction.hash);
        const isOutgoing = transaction.from?.toLowerCase() === walletAddress.toLowerCase();
        
        return (
          <Card key={transaction.id || transaction.hash || index} className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-white">
                        {transaction.type === 'swap' ? 'Troca' : 
                         transaction.type === 'liquidity' ? 'Liquidez' :
                         transaction.type === 'transfer' ? (isOutgoing ? 'Envio' : 'Recebimento') :
                         transaction.type === 'deposit' ? 'Depósito' :
                         transaction.type?.charAt(0).toUpperCase() + transaction.type?.slice(1) || 'Transação'}
                      </h4>
                      {getStatusBadge(transaction.status)}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-slate-400">
                      <span>{formatDate(transaction.createdAt || transaction.timestamp)}</span>
                      {transaction.hash && (
                        <span className="font-mono text-xs">
                          {transaction.hash.slice(0, 8)}...{transaction.hash.slice(-6)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-semibold text-white text-lg">
                      {transaction.amount ? (
                        <>
                          {transaction.amount} {transaction.token || ''}
                        </>
                      ) : (
                        'N/A'
                      )}
                    </div>
                    {transaction.token && (
                      <div className="text-xs text-slate-400">{transaction.token}</div>
                    )}
                  </div>

                  {explorerUrl && (
                    <Link
                      href={explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <ExternalLink className="h-5 w-5 text-slate-400 hover:text-white" />
                    </Link>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

