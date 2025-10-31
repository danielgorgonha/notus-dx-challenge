/**
 * Transaction List Component (Client)
 * Lista de transações com filtros e interatividade
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRightLeft, 
  Wallet,
  Droplets,
  Activity,
  TrendingUp,
  TrendingDown,
  Loader2,
} from "lucide-react";

interface Transaction {
  id?: string;
  type?: string;
  amount?: string;
  token?: string;
  status?: string;
  createdAt?: string;
  hash?: string;
}

interface TransactionListProps {
  transactions?: Transaction[];
  isLoading?: boolean;
  error?: Error | null;
  accountAbstractionAddress?: string;
}

export function TransactionList({
  transactions = [],
  isLoading = false,
  error = null,
  accountAbstractionAddress,
}: TransactionListProps) {
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
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Falhou</Badge>;
      default:
        return <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">Desconhecido</Badge>;
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
      return 'Data inválida';
    }
  };

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white">Histórico de Transações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
            <span className="ml-2 text-slate-400">Carregando transações...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white">Histórico de Transações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="text-red-400 text-center">
              <div className="font-semibold">Erro ao carregar transações</div>
              <div className="text-sm text-slate-400 mt-1">
                {error instanceof Error ? error.message : 'Erro desconhecido'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white">Histórico de Transações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="text-slate-400 text-center">
              <div className="font-semibold">Ainda sem transações</div>
              <div className="text-sm mt-1">Que tal fazer a primeira?</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-white">Histórico de Transações</CardTitle>
        {accountAbstractionAddress && (
          <p className="text-sm text-slate-400 mt-2">
            Wallet: {accountAbstractionAddress.slice(0, 6)}...{accountAbstractionAddress.slice(-4)}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction, index) => (
            <div 
              key={transaction.id || index} 
              className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 bg-emerald-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                  {getTransactionIcon(transaction.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white">
                    {transaction.type === 'swap' ? 'Troca' : 
                     transaction.type === 'liquidity' ? 'Liquidez' :
                     transaction.type === 'transfer' ? 'Transferência' :
                     transaction.type === 'deposit' ? 'Depósito' :
                     transaction.type?.charAt(0).toUpperCase() + transaction.type?.slice(1) || 'Transação'}
                  </div>
                  <div className="text-slate-400 text-sm mt-1">
                    {formatDate(transaction.createdAt)}
                  </div>
                  {transaction.hash && (
                    <div className="text-xs text-slate-500 mt-1 font-mono">
                      {transaction.hash.slice(0, 10)}...{transaction.hash.slice(-8)}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="text-right">
                  <div className="font-semibold text-white">
                    {transaction.amount ? `${transaction.amount} ${transaction.token || ''}` : 'N/A'}
                  </div>
                  <div className="mt-1">
                    {getStatusBadge(transaction.status)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

