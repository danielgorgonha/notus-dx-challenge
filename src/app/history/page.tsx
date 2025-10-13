"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  History as HistoryIcon, 
  ArrowRightLeft, 
  Wallet,
  Droplets,
  Activity,
  Loader2,
  TrendingUp,
  TrendingDown,
  ExternalLink
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useSmartWallet } from "@/hooks/use-smart-wallet";
import { useQuery } from "@tanstack/react-query";
import { getHistory } from "@/lib/actions/dashboard";

export default function HistoryPage() {
  const { wallet } = useSmartWallet();
  const accountAbstractionAddress = wallet?.accountAbstraction;

  // Query para buscar histórico completo
  const { data: history, isLoading, error } = useQuery({
    queryKey: ['history-full', accountAbstractionAddress],
    queryFn: () => getHistory(accountAbstractionAddress || '', { take: 100 }),
    enabled: !!accountAbstractionAddress,
    refetchInterval: 30000, // Refetch a cada 30 segundos
  });

  const getTransactionIcon = (type: string) => {
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

  const getTransactionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      swap: 'Swap',
      liquidity: 'Liquidez',
      pool: 'Pool',
      transfer: 'Transferência',
      send: 'Enviado',
      receive: 'Recebido',
      deposit: 'Depósito',
      withdrawal: 'Saque'
    };
    return labels[type] || type?.charAt(0).toUpperCase() + type?.slice(1) || 'Transação';
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      completed: { label: 'Concluída', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
      pending: { label: 'Pendente', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
      failed: { label: 'Falhou', className: 'bg-red-500/20 text-red-400 border-red-500/30' },
      processing: { label: 'Processando', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' }
    };

    const config = statusConfig[status] || { label: status, className: 'bg-slate-500/20 text-slate-400 border-slate-500/30' };

    return (
      <Badge className={`${config.className} border`}>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Data inválida';
    }
  };

  const transactions = (history && typeof history === 'object' && history !== null && 'transactions' in history && Array.isArray(history.transactions))
    ? history.transactions
    : [];

  return (
    <ProtectedRoute>
      <AppLayout 
        title="Histórico de Transações"
        description="Visualize todas as suas transações"
      >
        <div className="space-y-6">
          {/* Header */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <HistoryIcon className="h-5 w-5 mr-2" />
                Histórico Completo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-slate-400 text-sm">Total de Transações</div>
                  <div className="text-2xl font-bold text-white">
                    {isLoading ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      transactions.length
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-slate-400 text-sm">Carteira</div>
                  <div className="text-white font-mono text-sm">
                    {accountAbstractionAddress ? 
                      `${accountAbstractionAddress.slice(0, 6)}...${accountAbstractionAddress.slice(-4)}` : 
                      'Não conectada'
                    }
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions List */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white">Transações</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center p-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
                  <span className="ml-3 text-slate-400">Carregando histórico...</span>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center p-12">
                  <Activity className="h-12 w-12 text-red-400 mb-4" />
                  <div className="text-red-400 text-center">
                    <div className="font-semibold mb-2">Erro ao carregar histórico</div>
                    <div className="text-sm text-slate-400">
                      {error instanceof Error ? error.message : 'Erro desconhecido'}
                    </div>
                  </div>
                </div>
              ) : transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12">
                  <HistoryIcon className="h-12 w-12 text-slate-500 mb-4" />
                  <div className="text-slate-400 text-center">
                    <div className="font-semibold mb-2">Nenhuma transação encontrada</div>
                    <div className="text-sm">Suas transações aparecerão aqui</div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((transaction: any, index: number) => (
                    <div 
                      key={transaction.id || index}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors group"
                    >
                      <div className="flex items-center flex-1">
                        <div className="w-10 h-10 bg-slate-700/50 rounded-full flex items-center justify-center mr-4 group-hover:bg-slate-600/50 transition-colors">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-white">
                              {getTransactionTypeLabel(transaction.type)}
                            </span>
                            {getStatusBadge(transaction.status || 'completed')}
                          </div>
                          
                          <div className="text-slate-400 text-sm">
                            {transaction.createdAt ? formatDate(transaction.createdAt) : 'Data desconhecida'}
                          </div>
                          
                          {transaction.hash && (
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-xs text-slate-500 font-mono">
                                {transaction.hash.slice(0, 10)}...{transaction.hash.slice(-8)}
                              </span>
                              <ExternalLink className="h-3 w-3 text-slate-500" />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right ml-4">
                        <div className="font-semibold text-white">
                          {transaction.amount ? 
                            `${parseFloat(transaction.amount).toFixed(4)} ${transaction.token || ''}` : 
                            'N/A'
                          }
                        </div>
                        {transaction.amountUsd && (
                          <div className="text-slate-400 text-sm">
                            ${parseFloat(transaction.amountUsd).toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
