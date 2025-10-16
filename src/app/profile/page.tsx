"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  User, 
  Settings,
  ChevronRight,
  LogOut,
  Copy,
  Check
} from "lucide-react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useSmartWallet } from "@/hooks/use-smart-wallet";
import { useState } from "react";
import { toast } from "sonner";

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = usePrivy();
  const { wallet } = useSmartWallet();
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyAddress = async () => {
    if (wallet?.accountAbstraction) {
      await navigator.clipboard.writeText(wallet.accountAbstraction);
      setCopiedAddress(true);
      toast.success("Endereço copiado!");
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  const handleCopyEmail = async () => {
    const email = typeof user?.email === 'string' ? user.email : user?.email?.address;
    if (email) {
      await navigator.clipboard.writeText(email);
      setCopiedEmail(true);
      toast.success("Email copiado!");
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <ProtectedRoute>
      <AppLayout 
        title="Perfil"
        description="Gerencie suas configurações e informações"
      >

        <div className="space-y-8 max-w-4xl mx-auto">
          {/* Info do Usuário */}
          <Card className="bg-slate-800/50 border-slate-700/50 rounded-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-white flex items-center text-lg">
                <User className="h-5 w-5 mr-3 text-slate-400" />
                Informações da Conta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Email */}
              <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/50 hover:bg-slate-700/40 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-slate-400 text-sm mb-1">Email</div>
                    <div className="text-white font-semibold text-lg">
                      {typeof user?.email === 'string' ? user.email : user?.email?.address || 'Não configurado'}
                    </div>
                  </div>
                  <Button
                    onClick={handleCopyEmail}
                    size="sm"
                    variant="ghost"
                    className="ml-4 p-2 hover:bg-slate-600/50 transition-all duration-200"
                  >
                    {copiedEmail ? (
                      <Check className="h-4 w-4 text-green-400" />
                    ) : (
                      <Copy className="h-4 w-4 text-slate-400" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Endereço da Carteira */}
              <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/50 hover:bg-slate-700/40 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-slate-400 text-sm mb-1">Endereço da Carteira</div>
                    <div className="text-white font-mono text-sm break-all">
                      {wallet?.accountAbstraction || 'Carteira não criada'}
                    </div>
                  </div>
                  <Button
                    onClick={handleCopyAddress}
                    size="sm"
                    variant="ghost"
                    className="ml-4 p-2 hover:bg-slate-600/50 transition-all duration-200"
                    disabled={!wallet?.accountAbstraction}
                  >
                    {copiedAddress ? (
                      <Check className="h-4 w-4 text-green-400" />
                    ) : (
                      <Copy className="h-4 w-4 text-slate-400" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configurações */}
          <Card className="bg-slate-800/50 border-slate-700/50 rounded-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-white flex items-center text-lg">
                <Settings className="h-5 w-5 mr-3 text-slate-400" />
                Configurações
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Verificação KYC */}
              <Button
                onClick={() => router.push('/profile/kyc')}
                className="w-full flex items-center justify-between p-8 bg-slate-700/20 hover:bg-slate-700/40 border border-slate-600/30 hover:border-slate-500/50 rounded-xl text-left transition-all duration-300 group hover:shadow-lg hover:shadow-yellow-400/10"
                variant="ghost"
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full border-2 border-yellow-400/60 bg-yellow-400/15 flex items-center justify-center mr-5 group-hover:bg-yellow-400/25 group-hover:border-yellow-400/80 transition-all duration-300 group-hover:scale-105">
                    <Shield className="h-6 w-6 text-yellow-400 group-hover:text-yellow-300 transition-colors duration-300" />
                  </div>
                  <div>
                    <div className="text-white font-semibold text-lg group-hover:text-yellow-50 transition-colors duration-300">Verificação KYC</div>
                    <div className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors duration-300">Verificar identidade e aumentar limites</div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-yellow-400 group-hover:translate-x-1 transition-all duration-300" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}

