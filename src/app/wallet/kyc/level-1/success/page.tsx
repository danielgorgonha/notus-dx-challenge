"use client";

import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Shield } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function KYCLevel1SuccessPage() {
  const router = useRouter();

  return (
    <ProtectedRoute>
      <AppLayout 
        title="Verificação Aprovada"
        description="Seus dados pessoais foram verificados com sucesso"
      >
      <div className="flex justify-center">
        <div className="w-full max-w-2xl space-y-6">
        {/* Success Card */}
        <Card className="glass-card bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-green-500/30">
          <CardContent className="p-8 text-center">
            <div className="p-4 bg-green-500/20 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-400" />
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-4">
              Verificação Nível 1 Aprovada!
            </h1>
            
            <p className="text-slate-300 text-lg mb-6">
              Seus dados pessoais foram validados e salvos com sucesso! Agora você pode 
              <span className="text-green-400 font-semibold"> transferir e receber até R$ 2.000,00</span> mensais.
            </p>

            <div className="bg-slate-800/50 rounded-lg p-6 mb-6">
              <h3 className="text-white font-semibold mb-4">Funcionalidades Liberadas</h3>
              <div className="space-y-3 text-left">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-slate-300">Transferências entre wallets</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-slate-300">Recebimentos</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-slate-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">🔒</span>
                  </div>
                  <span className="text-slate-400">PIX (precisa Nível 2)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-slate-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">🔒</span>
                  </div>
                  <span className="text-slate-400">Depósitos/Saques (precisa Nível 2)</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => router.push('/wallet/kyc')}
                variant="outline"
                className="flex-1 border-blue-500/50 text-blue-400 hover:bg-blue-500/10 hover:border-blue-400 hover:text-blue-300 transition-all duration-200"
              >
                Ver Status KYC
              </Button>
              <Button
                onClick={() => router.push('/wallet/deposit')}
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
                <Shield className="h-6 w-6 text-white" />
              </div>
              Limites do Nível 1
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-600/10 rounded-lg border border-green-500/30">
                <h4 className="font-semibold text-white mb-2">Transferências</h4>
                <p className="text-2xl font-bold text-green-400">R$ 2.000,00</p>
                <p className="text-slate-400 text-sm">por mês</p>
              </div>
              <div className="p-4 bg-green-600/10 rounded-lg border border-green-500/30">
                <h4 className="font-semibold text-white mb-2">Recebimentos</h4>
                <p className="text-2xl font-bold text-green-400">R$ 2.000,00</p>
                <p className="text-slate-400 text-sm">por mês</p>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-slate-800/50 rounded-lg">
              <h4 className="font-semibold text-white mb-2">Para liberar PIX e depósitos:</h4>
              <p className="text-slate-300 text-sm">
                Complete o <span className="text-blue-400 font-semibold">Nível 2</span> enviando seus documentos 
                para aumentar os limites e liberar funcionalidades bancárias.
              </p>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
