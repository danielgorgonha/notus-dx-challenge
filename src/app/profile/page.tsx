"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  User, 
  Settings,
  ChevronRight
} from "lucide-react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useSmartWallet } from "@/hooks/use-smart-wallet";

export default function ProfilePage() {
  const router = useRouter();
  const { user } = usePrivy();
  const { wallet } = useSmartWallet();

  return (
    <ProtectedRoute>
      <AppLayout 
        title="Perfil"
        description="Gerencie suas configurações e informações"
      >
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Info do Usuário */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <User className="h-5 w-5 mr-2" />
                Informações da Conta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                <div>
                  <div className="text-slate-400 text-sm">Email</div>
                  <div className="text-white font-semibold">
                    {typeof user?.email === 'string' ? user.email : user?.email?.address || 'Não configurado'}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex-1">
                  <div className="text-slate-400 text-sm">Endereço da Carteira</div>
                  <div className="text-white font-mono text-sm break-all">
                    {wallet?.accountAbstraction || 'Carteira não criada'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configurações */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Configurações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                onClick={() => router.push('/profile/kyc')}
                className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left"
                variant="ghost"
              >
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-yellow-400 mr-3" />
                  <div>
                    <div className="text-white font-semibold">Verificação KYC</div>
                    <div className="text-slate-400 text-sm">Verificar identidade e aumentar limites</div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}

