"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertCircle, User, FileText, Camera, Shield } from "lucide-react";
import { useKYC } from "@/contexts/kyc-context";
import { useKYCManager } from "@/hooks/use-kyc-manager";
import { useSmartWallet } from "@/hooks/use-smart-wallet";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { clientWalletActions } from "@/lib/api/client-side";

export default function KYCPage() {
  const router = useRouter();
  const { currentLevel, kycPhase0Completed, kycPhase1Completed, kycPhase2Completed, completePhase1, completePhase2 } = useKYC();
  const { wallet } = useSmartWallet();
  
  const walletAddress = wallet?.accountAbstraction;
  const kycManager = useKYCManager(walletAddress || '');
  
  // Estado para dados KYC carregados da API
  const [kycData, setKycData] = useState<any>(null);
  const [isLoadingKYC, setIsLoadingKYC] = useState(true);

  // Carregar dados KYC da wallet quando a página carrega
  useEffect(() => {
    const loadKYCData = async () => {
      try {
        console.log('🔍 Carregando dados KYC...');
        
        // Usar o EOA (externally owned account) que sabemos que existe
        const eoaAddress = '0x7092C791436f7047956c42ABbD2aC67dedD7C511';
        
        console.log('🔍 Usando EOA:', eoaAddress);
        
        // Buscar dados da wallet usando o EOA
        const response = await clientWalletActions.getAddress({
          externallyOwnedAccount: eoaAddress,
          factory: '0x7a1dbab750f12a90eb1b60d2ae3ad17d4d81effe',
          salt: '0'
        });
        
        console.log('🔍 Resposta da API:', response);
        console.log('🔍 Wallet metadata:', response.wallet?.metadata);
        console.log('🔍 KYC Data string:', response.wallet?.metadata?.kycData);
        
        if (response.wallet?.metadata?.kycData) {
          const parsedData = JSON.parse(response.wallet.metadata.kycData);
          console.log('🔍 Dados KYC encontrados:', parsedData);
          setKycData(parsedData);
          
          // Atualizar contexto baseado nos dados reais
          if (parsedData.kycLevel >= 1) {
            console.log('🔍 Marcando Nível 1 como completo');
            completePhase1();
          }
          if (parsedData.kycLevel >= 2) {
            console.log('🔍 Marcando Nível 2 como completo');
            completePhase2();
          }
        } else {
          console.log('🔍 Nenhum dado KYC encontrado');
          console.log('🔍 Estrutura completa da resposta:', JSON.stringify(response, null, 2));
          setKycData(null);
        }
      } catch (error) {
        console.error('🔍 Erro ao carregar dados KYC:', error);
        setKycData(null);
      } finally {
        setIsLoadingKYC(false);
      }
    };

    loadKYCData();
  }, [walletAddress, completePhase1, completePhase2]);

  // Usar o nível real da API Notus
  const realKYCLevel = kycManager.getCurrentStage();
  
  // Determinar status baseado nos dados carregados
  const isLevel1Completed = kycData?.kycLevel >= 1 || kycPhase1Completed;
  const isLevel2Completed = kycData?.kycLevel >= 2 || kycPhase2Completed;
  
  // Debug logs
  console.log('🔍 KYC Page Debug:', {
    kycData,
    isLoadingKYC,
    isLevel1Completed,
    isLevel2Completed,
    kycPhase1Completed,
    kycPhase2Completed,
    walletAddress
  });
  
  const levels = [
    {
      id: 0,
      name: "Nível 0",
      status: kycPhase0Completed ? "completed" : "pending",
      limit: "Pix indisponível",
      requirements: ["Email"],
      description: "Verificação básica de email"
    },
    {
      id: 1,
      name: "Nível 1", 
      status: isLevel1Completed ? "completed" : (kycPhase0Completed ? "pending" : "locked"),
      limit: "Até R$ 2.000,00 mensais",
      requirements: [
        "Nome Completo",
        "Data de nascimento", 
        "CPF (+18 anos)",
        "Nacionalidade"
      ],
      description: "Verificação de dados pessoais (sem liveness)"
    },
    {
      id: 2,
      name: "Nível 2",
      status: isLevel2Completed ? "completed" : (isLevel1Completed ? "pending" : "locked"),
      limit: "Até R$ 50.000,00 mensais", 
      requirements: [
        "Documento de Identificação (ID Nacional, CNH ou RNM)",
        "Reconhecimento facial (prova de vida)"
      ],
      description: "Verificação completa com documentos + liveness"
    },
    {
      id: 3,
      name: "Nível 3",
      status: "locked",
      limit: "Acima de R$ 50.000,00 mensais",
      requirements: ["Contato com suporte"],
      description: "Limites personalizados"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "locked":
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500 text-white">Aprovado</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500 text-white">Pendente</Badge>;
      case "locked":
        return <Badge variant="outline">Bloqueado</Badge>;
      default:
        return null;
    }
  };

  return (
    <ProtectedRoute>
      <AppLayout 
        title="Verificação KYC"
        description="Complete sua verificação de identidade para aumentar limites"
      >
      <div className="flex justify-center">
        <div className="w-full max-w-2xl space-y-6">
          {/* Current Level Status */}
          <Card className="glass-card bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg mr-3">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <span>Nível Atual: {realKYCLevel}</span>
                </div>
                 <span className="text-2xl font-bold text-blue-400">
                   {isLevel2Completed ? "R$ 50.000,00" : 
                    isLevel1Completed ? "R$ 2.000,00" : 
                    "R$ 0,00"}
                 </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">Limite de depósito:</p>
                   <p className="text-white font-semibold">
                     {isLevel2Completed ? "R$ 50.000,00" : 
                      isLevel1Completed ? "R$ 2.000,00" : 
                      "R$ 0,00"}
                   </p>
                 </div>
                 <div>
                   <p className="text-slate-400">Limite de saque:</p>
                   <p className="text-white font-semibold">
                     {isLevel2Completed ? "R$ 50.000,00" : 
                      isLevel1Completed ? "R$ 2.000,00" : 
                      "R$ 0,00"}
                   </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Success Message for Level 1 */}
          {isLevel1Completed && !isLevel2Completed && (
            <Card className="glass-card bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-green-500/30">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Nível 1 Concluído!</h3>
                    <p className="text-slate-300 text-sm">
                      Você pode transferir e receber entre wallets até R$ 2.000,00 mensais. 
                      Continue para o Nível 2 para liberar PIX e depósitos.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Levels */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Níveis da Conta</h2>
            
            {levels.map((level) => (
              <Card key={level.id} className="glass-card">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      {getStatusIcon(level.status)}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold text-white">{level.name}</h3>
                          {getStatusBadge(level.status)}
                        </div>
                        <p className="text-slate-300">{level.limit}</p>
                        <p className="text-sm text-slate-400">{level.description}</p>
                        
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-slate-300">Dados necessários:</p>
                          <ul className="space-y-1">
                            {level.requirements.map((req, index) => (
                              <li key={index} className="text-sm text-slate-400 flex items-center space-x-2">
                                <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                                <span>{req}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      {level.status === "pending" && level.id === 1 && (
                        <Button 
                          onClick={() => router.push('/wallet/kyc/level-1')}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                          Iniciar Verificação
                        </Button>
                      )}
                      {level.status === "pending" && level.id === 2 && (
                        <Button 
                          onClick={() => router.push('/wallet/kyc/level-2')}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                          Iniciar Verificação
                        </Button>
                      )}
                      {level.status === "locked" && level.id === 3 && (
                        <Button variant="outline" disabled>
                          Contatar Suporte
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* FAQ Section */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white">Perguntas Frequentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center space-x-3 mb-2">
                    <FileText className="h-5 w-5 text-yellow-400" />
                    <h4 className="font-semibold text-white">Por que o KYC é necessário?</h4>
                  </div>
                  <p className="text-sm text-slate-400">
                    Para cumprir regulamentações e garantir a segurança das transações.
                  </p>
                </div>
                
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center space-x-3 mb-2">
                    <User className="h-5 w-5 text-yellow-400" />
                    <h4 className="font-semibold text-white">Para que servem meus dados?</h4>
                  </div>
                  <p className="text-sm text-slate-400">
                    Apenas para verificação de identidade e compliance regulatório.
                  </p>
                </div>
                
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center space-x-3 mb-2">
                    <Camera className="h-5 w-5 text-yellow-400" />
                    <h4 className="font-semibold text-white">Meu KYC para reportar</h4>
                  </div>
                  <p className="text-sm text-slate-400">
                    Processo seguro e criptografado para proteção dos seus dados.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </AppLayout>
    </ProtectedRoute>
  );
}