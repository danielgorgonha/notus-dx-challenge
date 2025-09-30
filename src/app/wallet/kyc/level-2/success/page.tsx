"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Shield, Star } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function KYCLevel2SuccessPage() {
  const router = useRouter();

  return (
    <ProtectedRoute>
      <div className="flex justify-center">
      <div className="w-full max-w-2xl space-y-6">
        {/* Success Card */}
        <Card className="glass-card bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-green-500/30">
          <CardContent className="p-8 text-center">
            <div className="p-4 bg-green-500/20 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-400" />
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-4">
              Verificação Nível 2 Aprovada!
            </h1>
            
            <p className="text-slate-300 text-lg mb-6">
              Parabéns! Sua verificação de documentos foi concluída com sucesso. 
              Agora você pode fazer depósitos de até <span className="text-green-400 font-semibold">R$ 50.000,00</span> por mês.
            </p>

            <div className="bg-slate-800/50 rounded-lg p-6 mb-6">
              <h3 className="text-white font-semibold mb-4">Status da Verificação</h3>
              <div className="space-y-3 text-left">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-slate-300">Dados pessoais verificados</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-slate-300">Documentos verificados</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-slate-300">Verificação facial concluída</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-slate-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">3</span>
                  </div>
                  <span className="text-slate-400">Limites personalizados (Nível 3)</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => router.push('/wallet/kyc')}
                variant="outline"
                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                Ver Status KYC
              </Button>
              <Button
                onClick={() => router.push('/deposit')}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Fazer Depósito
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Benefits Card */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <div className="p-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg mr-3">
                <Star className="h-6 w-6 text-white" />
              </div>
              Benefícios do Nível 2
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-600/10 rounded-lg border border-green-500/30">
                <h4 className="font-semibold text-white mb-2">Limite de Depósito</h4>
                <p className="text-2xl font-bold text-green-400">R$ 50.000,00</p>
                <p className="text-slate-400 text-sm">por mês</p>
              </div>
              <div className="p-4 bg-green-600/10 rounded-lg border border-green-500/30">
                <h4 className="font-semibold text-white mb-2">Limite de Saque</h4>
                <p className="text-2xl font-bold text-green-400">R$ 50.000,00</p>
                <p className="text-slate-400 text-sm">por mês</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Card */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg mr-3">
                <Shield className="h-6 w-6 text-white" />
              </div>
              Recursos Desbloqueados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-800/50 rounded-lg">
                <h4 className="font-semibold text-white mb-2">Depósitos PIX</h4>
                <p className="text-slate-300 text-sm">
                  Depósitos instantâneos via PIX com QR Code
                </p>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-lg">
                <h4 className="font-semibold text-white mb-2">Saques Bancários</h4>
                <p className="text-slate-300 text-sm">
                  Saques diretos para sua conta bancária
                </p>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-lg">
                <h4 className="font-semibold text-white mb-2">Cartão de Crédito</h4>
                <p className="text-slate-300 text-sm">
                  Depósitos via cartão de crédito
                </p>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-lg">
                <h4 className="font-semibold text-white mb-2">Suporte Prioritário</h4>
                <p className="text-slate-300 text-sm">
                  Atendimento prioritário 24/7
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </ProtectedRoute>
  );
}
