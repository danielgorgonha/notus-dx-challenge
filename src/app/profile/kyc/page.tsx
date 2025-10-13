"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertCircle, User, FileText, Camera, Shield } from "lucide-react";
import { useKYC } from "@/contexts/kyc-context";
import { useKYCManager } from "@/hooks/use-kyc-manager";
import { useSmartWallet } from "@/hooks/use-smart-wallet";
import { useToast } from "@/hooks/use-toast";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { getWalletAddress } from "@/lib/actions/dashboard";
import { getSessionResult } from "@/lib/actions/kyc";

export default function KYCPage() {
  const router = useRouter();
  const { currentLevel, kycPhase0Completed, kycPhase1Completed, kycPhase2Completed, completePhase1, completePhase2 } = useKYC();
  const { wallet } = useSmartWallet();
  const toast = useToast();
  
  const walletAddress = wallet?.accountAbstraction;
  const kycManager = useKYCManager(walletAddress || '');
  
  // Estado para dados KYC carregados da API
  const [kycData, setKycData] = useState<any>(null);
  const [isLoadingKYC, setIsLoadingKYC] = useState(true);
  const [kycLevel2Failed, setKycLevel2Failed] = useState(false);
  const toastShownRef = useRef<Set<string>>(new Set()); // Controlar toasts mostrados por sessionId
  const isProcessingRef = useRef(false); // Evitar processamento simultâneo

  // Função para resetar o estado de falha
  const resetKycFailure = () => {
    setKycLevel2Failed(false);
    toastShownRef.current.clear(); // Limpar toasts mostrados
  };

  // Carregar dados KYC da wallet quando a página carrega
  useEffect(() => {
    console.log('🔍 useEffect executado - dependências:', { walletAddress, completePhase1: !!completePhase1, completePhase2: !!completePhase2 });
    
    const loadKYCData = async () => {
      // Evitar processamento simultâneo
      if (isProcessingRef.current) {
        console.log('🔍 Processamento já em andamento, pulando...');
        return;
      }
      
      try {
        isProcessingRef.current = true;
        console.log('🔍 Carregando dados KYC...');
        setIsLoadingKYC(true);
        
        // Não resetar aqui - queremos manter o controle por sessionId
        
        // Usar o EOA (externally owned account) que sabemos que existe
        const eoaAddress = '0x7092C791436f7047956c42ABbD2aC67dedD7C511';
        
        console.log('🔍 Usando EOA:', eoaAddress);
        
        // Buscar dados da wallet usando o EOA
        const response = await getWalletAddress({ externallyOwnedAccount: eoaAddress });
        
        console.log('🔍 Resposta da API:', response);
        console.log('🔍 Wallet metadata:', response.wallet?.metadata);
        console.log('🔍 KYC Data string:', response.wallet?.metadata?.kycData);
        
        if (response.wallet?.metadata?.kycData) {
          const parsedData = JSON.parse(response.wallet.metadata.kycData as string);
          console.log('🔍 Dados KYC encontrados:', parsedData);
          
          // Verificar Level 1 primeiro
          if (parsedData.kycLevel >= 1) {
            console.log('🔍 Marcando Nível 1 como completo');
            completePhase1();
            // Não mostrar toast no carregamento - usuário já vê o status na tela
          }
          
          // Verificar Level 2 se houver sessionId
          if (parsedData.sessionId) {
            console.log('🔍 Validando Level 2 com sessionId:', parsedData.sessionId);
            
            try {
              const sessionResult = await getSessionResult(parsedData.sessionId) as any;
              console.log('🔍 Resultado da sessão KYC:', sessionResult);
              
              // Verificar o status da sessão KYC
              const sessionStatus = sessionResult.session?.status;
              console.log('🔍 Status da sessão KYC:', sessionStatus);
              
              if (sessionStatus === 'COMPLETED') {
                console.log('✅ Level 2 aprovado pela API Notus');
                completePhase2();
                // Não mostrar toast no carregamento - usuário já vê o status na tela
                // Definir dados com status aprovado
                setKycData({
                  ...parsedData,
                  kycLevel: 2,
                  status: 'APPROVED',
                  individualId: sessionResult.session?.individualId
                });
              } else if (sessionStatus === 'PENDING' || sessionStatus === 'PROCESSING' || sessionStatus === 'VERIFYING') {
                console.log('⏳ Level 2 ainda em processamento na API Notus:', sessionStatus);
                // Não mostrar toast no carregamento - usuário já vê o status na tela
                // Manter como Level 1 com status de processamento
                setKycData({
                  ...parsedData,
                  kycLevel: 1,
                  status: sessionStatus,
                  processingMessage: 'Documentos em análise pela Notus'
                });
              } else if (sessionStatus === 'FAILED') {
                console.log('❌ Level 2 falhou na API Notus - documentos rejeitados');
                
                // Só mostrar toast se ainda não foi mostrado para esta sessão
                const sessionId = parsedData.sessionId;
                console.log('🔍 SessionId:', sessionId);
                console.log('🔍 Toasts já mostrados:', Array.from(toastShownRef.current));
                
                if (sessionId && !toastShownRef.current.has(sessionId)) {
                  console.log('🔍 Mostrando toast para sessionId:', sessionId);
                  toast.error(
                    'KYC Rejeitado',
                    'Seus documentos foram rejeitados. Por favor, tente novamente.',
                    6000
                  );
                  toastShownRef.current.add(sessionId);
                } else {
                  console.log('🔍 Toast já foi mostrado para esta sessão, pulando...');
                }
                
                // Resetar para permitir nova tentativa
                setKycData({
                  ...parsedData,
                  kycLevel: 1,
                  status: 'FAILED'
                });
                setKycLevel2Failed(true);
              } else if (sessionStatus === 'EXPIRED') {
                console.log('⏰ Level 2 expirado na API Notus');
                // Resetar para permitir nova tentativa
                setKycData({
                  ...parsedData,
                  kycLevel: 1,
                  status: 'EXPIRED'
                });
                setKycLevel2Failed(true);
              } else {
                console.log('⚠️ Status desconhecido da sessão KYC:', sessionStatus);
                // Para status desconhecidos, manter dados originais
                setKycData(parsedData);
              }
            } catch (error) {
              console.error('🔍 Erro ao validar sessão KYC:', error);
              // Se houver erro, usar dados locais como fallback
              setKycData(parsedData);
              if (parsedData.kycLevel >= 2) {
                completePhase2();
              }
            }
          } else {
            // Sem sessionId, usar dados locais
            setKycData(parsedData);
            if (parsedData.kycLevel >= 2) {
              console.log('🔍 Marcando Nível 2 como completo (dados locais)');
              completePhase2();
            }
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
        console.log('✅ Carregamento KYC concluído');
        setIsLoadingKYC(false);
        isProcessingRef.current = false; // Liberar processamento
      }
    };

    loadKYCData();
  }, [walletAddress]); // Removendo dependências que causam re-execuções

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

  // Loading screen melhorado
  if (isLoadingKYC) {
    return (
      <ProtectedRoute>
        <AppLayout 
          title="Verificação KYC"
          description="Complete sua verificação de identidade para aumentar limites"
        >
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 bg-blue-600 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">Verificando Status KYC</h3>
                <p className="text-slate-400 text-sm">
                  Carregando dados da verificação e validando com a Notus...
                </p>
                <div className="flex justify-center space-x-1 mt-4">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          </div>
        </AppLayout>
      </ProtectedRoute>
    );
  }

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
          {isLevel1Completed && !isLevel2Completed && !kycLevel2Failed && (
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

          {/* Error Message for Level 2 Failed */}
          {kycLevel2Failed && (
            <Card className="glass-card bg-gradient-to-r from-red-600/20 to-orange-600/20 border-red-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-500/20 rounded-lg">
                      <AlertCircle className="h-6 w-6 text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">Verificação Nível 2 Falhou</h3>
                      <p className="text-slate-300 text-sm">
                        Sua verificação de documentos foi rejeitada. Verifique se os documentos estão legíveis e tente novamente.
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={resetKycFailure}
                    variant="outline"
                    className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                  >
                    Tentar Novamente
                  </Button>
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
                          onClick={() => router.push('/profile/kyc/level-1')}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                          Iniciar Verificação
                        </Button>
                      )}
                      {level.status === "pending" && level.id === 2 && (
                        <Button 
                          onClick={() => router.push('/profile/kyc/level-2')}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                          Iniciar Verificação
                        </Button>
                      )}
                      {level.status === "locked" && level.id === 3 && (
                        <Button 
                          onClick={() => window.open('mailto:contato@deegalabs.com.br?subject=Suporte%20KYC%20Nível%203&body=Olá,%20gostaria%20de%20solicitar%20o%20acesso%20ao%20KYC%20Nível%203.%20Por%20favor,%20entre%20em%20contato%20comigo.', '_blank')}
                          disabled={!isLevel2Completed}
                          className={`font-semibold px-6 py-3 rounded-lg shadow-lg transition-all duration-300 transform border-0 ${
                            isLevel2Completed 
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:shadow-xl hover:scale-105 cursor-pointer' 
                              : 'bg-slate-600 text-slate-400 cursor-not-allowed opacity-50'
                          }`}
                        >
                          {isLevel2Completed ? 'Contatar Suporte' : 'Complete o Nível 2 primeiro'}
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