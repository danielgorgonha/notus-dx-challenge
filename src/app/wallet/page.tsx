import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Wallet, 
  Copy, 
  ExternalLink, 
  Plus, 
  RefreshCw, 
  TrendingUp, 
  Activity,
  AlertCircle,
  CheckCircle,
  Loader2,
  Zap,
  DollarSign,
  Clock,
  Shield,
  Sparkles,
  BarChart3,
  Settings,
  QrCode,
  Smartphone
} from "lucide-react";

export default async function WalletPage() {
  const user = await auth();

  if (!user) {
    redirect("/");
  }
  return (
    <AppLayout 
      title="Carteira Inteligente"
      description="Gerencie sua carteira inteligente e visualize detalhes da carteira"
    >
      <div className="space-y-8">
        {/* User Info Card */}
          <Card className="glass-card">
            <CardHeader>
            <CardTitle className="text-white flex items-center">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-lg mr-3">
                  <Wallet className="h-6 w-6 text-white" />
                </div>
              Informações do Usuário
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="text-sm text-slate-400">ID do Usuário</div>
                <div className="text-white font-semibold">{user.id}</div>
                </div>

                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="text-sm text-slate-400">Endereço da Wallet</div>
                <div className="text-white font-mono break-all">{user.wallet?.address}</div>
                </div>

              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="text-sm text-slate-400">Smart Wallet Address</div>
                <div className="text-white font-mono break-all">{user.accountAbstractionAddress}</div>
              </div>
              </div>
            </CardContent>
          </Card>

        {/* Smart Wallet Features */}
          <Card className="glass-card">
            <CardHeader>
            <CardTitle className="text-white flex items-center">
              <div className="p-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg mr-3">
                <Zap className="h-6 w-6 text-white" />
              </div>
              Recursos da Carteira Inteligente
            </CardTitle>
            </CardHeader>
            <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-gradient-to-br from-emerald-600/20 to-green-600/20 rounded-xl border border-emerald-500/30">
                <div className="flex items-center mb-3">
                  <div className="p-2 bg-emerald-500/20 rounded-lg mr-3">
                    <Shield className="h-5 w-5 text-emerald-400" />
                  </div>
                  <span className="text-white font-semibold">Abstração de Conta</span>
                </div>
                <p className="text-slate-300 text-sm">Carteira inteligente ERC-4337 com transações sem gas e segurança avançada</p>
              </div>

              <div className="p-4 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-xl border border-blue-500/30">
                <div className="flex items-center mb-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg mr-3">
                    <TrendingUp className="h-5 w-5 text-blue-400" />
                  </div>
                  <span className="text-white font-semibold">Acompanhamento de Portfólio</span>
                </div>
                <p className="text-slate-300 text-sm">Saldos de tokens em tempo real, valor do portfólio e análises de desempenho</p>
                </div>

              <div className="p-4 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-xl border border-purple-500/30">
                <div className="flex items-center mb-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg mr-3">
                    <Activity className="h-5 w-5 text-purple-400" />
                  </div>
                  <span className="text-white font-semibold">Histórico de Transações</span>
                </div>
                <p className="text-slate-300 text-sm">Histórico completo de transações com análises detalhadas e insights</p>
              </div>
            </div>
            </CardContent>
          </Card>
      </div>
    </AppLayout>
  );
}