/**
 * Banner de Status KYC
 * Mostra o nível atual e funcionalidades liberadas
 */

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, CheckCircle, Lock, ArrowRight } from 'lucide-react';
import { useKYCData } from '@/hooks/use-kyc-data';
import { useRouter } from 'next/navigation';

export function KYCStatusBanner() {
  const { kycData, canTransfer, canReceive, canUsePix, canDeposit, canWithdraw, monthlyLimit } = useKYCData();
  const router = useRouter();

  if (!kycData) {
    return (
      <Card className="glass-card bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border-yellow-500/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Shield className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Verificação KYC Pendente</h3>
                <p className="text-slate-300 text-sm">Complete sua verificação para liberar funcionalidades</p>
              </div>
            </div>
            <Button
              onClick={() => router.push('/wallet/kyc')}
              className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
            >
              Iniciar KYC
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getLevelBadge = (level: number) => {
    switch (level) {
      case 1:
        return <Badge className="bg-blue-500 text-white">Nível 1</Badge>;
      case 2:
        return <Badge className="bg-green-500 text-white">Nível 2</Badge>;
      case 3:
        return <Badge className="bg-purple-500 text-white">Nível 3</Badge>;
      default:
        return <Badge variant="outline">Nível {level}</Badge>;
    }
  };

  const getStatusColor = (level: number) => {
    switch (level) {
      case 1:
        return 'from-blue-600/20 to-cyan-600/20 border-blue-500/30';
      case 2:
        return 'from-green-600/20 to-emerald-600/20 border-green-500/30';
      case 3:
        return 'from-purple-600/20 to-pink-600/20 border-purple-500/30';
      default:
        return 'from-slate-600/20 to-gray-600/20 border-slate-500/30';
    }
  };

  return (
    <Card className={`glass-card bg-gradient-to-r ${getStatusColor(kycData.kycLevel)}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-white font-semibold">Status KYC</h3>
                {getLevelBadge(kycData.kycLevel)}
              </div>
              <p className="text-slate-300 text-sm">
                Limite mensal: <span className="text-green-400 font-semibold">R$ {monthlyLimit.toLocaleString('pt-BR')}</span>
              </p>
            </div>
          </div>
          <Button
            onClick={() => router.push('/wallet/kyc')}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            Ver Detalhes
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="flex items-center space-x-2">
            {canTransfer ? (
              <CheckCircle className="h-4 w-4 text-green-400" />
            ) : (
              <Lock className="h-4 w-4 text-slate-400" />
            )}
            <span className={`text-sm ${canTransfer ? 'text-green-400' : 'text-slate-400'}`}>
              Transferências
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {canReceive ? (
              <CheckCircle className="h-4 w-4 text-green-400" />
            ) : (
              <Lock className="h-4 w-4 text-slate-400" />
            )}
            <span className={`text-sm ${canReceive ? 'text-green-400' : 'text-slate-400'}`}>
              Recebimentos
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {canUsePix ? (
              <CheckCircle className="h-4 w-4 text-green-400" />
            ) : (
              <Lock className="h-4 w-4 text-slate-400" />
            )}
            <span className={`text-sm ${canUsePix ? 'text-green-400' : 'text-slate-400'}`}>
              PIX
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {canDeposit ? (
              <CheckCircle className="h-4 w-4 text-green-400" />
            ) : (
              <Lock className="h-4 w-4 text-slate-400" />
            )}
            <span className={`text-sm ${canDeposit ? 'text-green-400' : 'text-slate-400'}`}>
              Depósitos
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {canWithdraw ? (
              <CheckCircle className="h-4 w-4 text-green-400" />
            ) : (
              <Lock className="h-4 w-4 text-slate-400" />
            )}
            <span className={`text-sm ${canWithdraw ? 'text-green-400' : 'text-slate-400'}`}>
              Saques
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
