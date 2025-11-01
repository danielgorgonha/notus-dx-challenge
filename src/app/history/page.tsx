/**
 * History Page - Server Component
 * Busca histórico no servidor e renderiza componentes client-side para interatividade
 */

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { getWalletAddress, getHistory } from "@/lib/actions/dashboard";
import { AppLayout } from "@/components/layout/app-layout";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { HistoryClient } from "@/components/history/history-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History as HistoryIcon } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function HistoryPage() {
  // Autenticação no servidor
  const user = await auth();
  
  if (!user || !user.wallet?.address) {
    redirect("/");
  }

  const externallyOwnedAccount = user.wallet.address;
  
  // Buscar wallet address primeiro
  const walletData = await getWalletAddress({ externallyOwnedAccount });
  const wallet = walletData.wallet;
  const accountAbstractionAddress = wallet?.accountAbstraction || user.accountAbstractionAddress;

  // Buscar histórico completo no servidor
  const history = await getHistory(accountAbstractionAddress || '', { take: 100 });

  const transactions = history?.transactions || [];

  return (
    <ProtectedRoute>
      <AppLayout 
        title="Histórico"
        description="Histórico de transações da carteira"
      >
        <div className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500/80 to-purple-600/80 rounded-xl flex items-center justify-center">
                  <HistoryIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-white">Histórico de Transações</CardTitle>
                  <p className="text-slate-400 text-sm mt-1">
                    {transactions.length} {transactions.length === 1 ? 'transação' : 'transações'}
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>

          <HistoryClient
            initialTransactions={transactions}
            walletAddress={accountAbstractionAddress || ''}
          />
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}

