"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, FileText, Camera, Upload, CheckCircle, Shield, MapPin, User, Loader2 } from "lucide-react";
import { useKYC } from "@/contexts/kyc-context";
import { useToast } from "@/hooks/use-toast";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { AppLayout } from "@/components/layout/app-layout";
import { useKYCData } from "@/hooks/use-kyc-data";
import { useSmartWallet } from "@/hooks/use-smart-wallet";

export default function KYCLevel2Page() {
  const router = useRouter();
  const { completePhase2 } = useKYC();
  const { success, error } = useToast();
  const { updateKYCData } = useKYCData();
  const { wallet } = useSmartWallet();
  
  // Estado do fluxo KYC Level 2
  const [currentStep, setCurrentStep] = useState(1); // 1: Seleção documento, 2: Lado documento, 3: Upload, 4: Facial
  const [selectedDocument, setSelectedDocument] = useState("");
  const [selectedDocumentSide, setSelectedDocumentSide] = useState(""); // "front" ou "back"
  const [documentUploaded, setDocumentUploaded] = useState(false);
  const [facialVerificationCompleted, setFacialVerificationCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Estados para controlar documentos frente e verso
  const [frontDocumentUploaded, setFrontDocumentUploaded] = useState(false);
  const [backDocumentUploaded, setBackDocumentUploaded] = useState(false);
  const [frontDocumentFile, setFrontDocumentFile] = useState<File | null>(null);
  const [backDocumentFile, setBackDocumentFile] = useState<File | null>(null);
  
  // Dados do Level 1 carregados
  const [level1Data, setLevel1Data] = useState<any>(null);

  const documentTypes = [
    { value: "rg", label: "Carteira de Identidade (RG)", description: "Documento de identidade nacional" },
    { value: "cnh", label: "Carteira de Motorista (CNH)", description: "Carteira Nacional de Habilitação" },
    { value: "rnm", label: "Registro Nacional Migratório (RNM)", description: "Documento para estrangeiros" }
  ];

  // Carregar dados do Level 1
  useEffect(() => {
    const loadLevel1Data = async () => {
      if (!wallet?.accountAbstraction) return;
      
      try {
        // Buscar dados KYC existentes
        const response = await fetch(`/api/wallet/address?externallyOwnedAccount=0x7092C791436f7047956c42ABbD2aC67dedD7C511&factory=0x7a1dbab750f12a90eb1b60d2ae3ad17d4d81effe&salt=0`);
        const data = await response.json();
        
        if (data.wallet?.metadata?.kycData) {
          const kycData = JSON.parse(data.wallet.metadata.kycData);
          setLevel1Data(kycData);
        }
      } catch (err) {
        console.error('Erro ao carregar dados Level 1:', err);
      }
    };

    loadLevel1Data();
  }, [wallet?.accountAbstraction]);

  // Navegação entre steps
  const nextStep = () => {
    if (currentStep === 3) {
      // Step 3: Upload de documento
      if (selectedDocumentSide === 'front' && frontDocumentUploaded) {
        // Se enviou a frente, volta para selecionar o verso
        setCurrentStep(2);
        setSelectedDocumentSide('back');
        setDocumentUploaded(false);
      } else if (selectedDocumentSide === 'back' && backDocumentUploaded) {
        // Se enviou o verso, vai para verificação facial
        setCurrentStep(4);
      }
    } else if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Validação por step
  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedDocument !== "";
      case 2:
        return selectedDocumentSide !== "";
      case 3:
        return documentUploaded;
      case 4:
        return facialVerificationCompleted;
      default:
        return false;
    }
  };

  const handleDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        error('Erro!', 'Por favor, selecione apenas arquivos de imagem');
        return;
      }
      
      // Validar tamanho do arquivo (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        error('Erro!', 'O arquivo deve ter no máximo 5MB');
        return;
      }
      
      // Salvar arquivo baseado no lado selecionado
      if (selectedDocumentSide === 'front') {
        setFrontDocumentFile(file);
        setFrontDocumentUploaded(true);
        success('Sucesso!', 'Documento da frente carregado com sucesso');
      } else {
        setBackDocumentFile(file);
        setBackDocumentUploaded(true);
        success('Sucesso!', 'Documento do verso carregado com sucesso');
      }
      
      setDocumentUploaded(true);
    }
  };

  const handleFacialVerification = () => {
    // Simular verificação facial
    setFacialVerificationCompleted(true);
    success('Sucesso!', 'Verificação facial concluída com sucesso');
    nextStep();
  };

  const handleSubmit = async () => {
    if (!level1Data) {
      error('Erro', 'Dados do Level 1 não encontrados');
      return;
    }
    
    setLoading(true);
    
    try {
      // Preparar dados para API Notus KYC
      const kycData = {
        // Dados pessoais do Level 1
        fullName: level1Data.fullName,
        birthDate: level1Data.birthDate,
        cpf: level1Data.cpf,
        nationality: level1Data.nationality,
        
        // Dados do documento Level 2
        documentType: selectedDocument,
        documentSide: selectedDocumentSide,
        documentUploaded: documentUploaded,
        facialVerificationCompleted: facialVerificationCompleted,
        
        // Metadados
        completedAt: new Date().toISOString(),
        kycLevel: 2,
        limits: {
          monthlyDeposit: 50000.00,
          monthlyWithdrawal: 50000.00,
          features: {
            transfers: true,
            receipts: true,
            pix: true,
            onRamp: true,
            offRamp: true
          }
        }
      };
      
      // Salvar dados na wallet
      await updateKYCData(kycData);
      
      // Completar fase 2
      completePhase2();
      
      success('Sucesso!', 'Verificação Nível 2 concluída! Agora você pode usar PIX e fazer depósitos/saques até R$ 50.000,00 mensais.');
      
      // Redirecionar para página principal do KYC
      router.push('/wallet/kyc');
    } catch (err) {
      console.error('Erro ao salvar dados KYC Level 2:', err);
      error('Erro', 'Falha ao salvar dados de verificação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <AppLayout 
        title="Verificação Nível 2" 
        description="Complete sua verificação com documentos"
      >
        <div className="flex justify-center">
          <div className="w-full max-w-2xl space-y-6">
            {/* Header */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/wallet/kyc')}
                className="text-slate-400 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao KYC
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white">Verificação Nível 2</h1>
                <p className="text-slate-400">Complete sua verificação com documentos</p>
              </div>
            </div>

            {/* Progress Indicator */}
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-white font-medium">Dados Pessoais</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      currentStep >= 2 ? 'bg-blue-500' : 'bg-slate-600'
                    }`}>
                      <span className="text-white text-sm font-bold">2</span>
                    </div>
                    <span className="text-white font-medium">Documentos</span>
                  </div>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full w-full"></div>
                </div>
              </CardContent>
            </Card>

            {/* Step 1: Document Type Selection */}
            {currentStep === 1 && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg mr-3">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    Qual documento você irá utilizar?
                  </CardTitle>
                  <p className="text-slate-400">Verificação KYC de Nível 2</p>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={selectedDocument} onValueChange={setSelectedDocument}>
                    <div className="space-y-4">
                      {documentTypes.map((doc) => (
                        <div key={doc.value} className="flex items-start space-x-3 p-4 bg-slate-800/50 rounded-lg border border-slate-600">
                          <RadioGroupItem value={doc.value} id={doc.value} className="mt-1" />
                          <div className="flex-1">
                            <Label htmlFor={doc.value} className="text-white font-medium cursor-pointer">
                              {doc.label}
                            </Label>
                            <p className="text-slate-400 text-sm mt-1">{doc.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                  
                  {/* Warning */}
                  <div className="mt-4 p-4 bg-yellow-600/10 border border-yellow-500/30 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <div className="text-yellow-400 text-lg">⚠️</div>
                      <p className="text-slate-300 text-sm">
                        Utilize apenas documentos que contenham seu número de CPF.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-4 mt-6">
                    <Button
                      onClick={prevStep}
                      variant="outline"
                      className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white bg-slate-800/50"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Voltar
                    </Button>
                    <Button
                      onClick={nextStep}
                      disabled={!canProceed()}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
                    >
                      Continuar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Document Side Selection */}
            {currentStep === 2 && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg mr-3">
                      <Camera className="h-6 w-6 text-white" />
                    </div>
                    Selecione o lado do documento
                  </CardTitle>
                  <p className="text-slate-400">Verificação KYC de Nível 2</p>
                </CardHeader>
                <CardContent>
                  {/* Status dos documentos */}
                  <div className="mb-6 p-4 bg-slate-800/50 rounded-lg">
                    <h4 className="text-white font-medium mb-3">Status dos Documentos:</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300">Lado com foto (frente)</span>
                        <div className="flex items-center space-x-2">
                          {frontDocumentUploaded ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-400" />
                              <span className="text-green-400 text-sm">Enviado</span>
                            </>
                          ) : (
                            <span className="text-slate-400 text-sm">Pendente</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300">Lado sem foto (verso)</span>
                        <div className="flex items-center space-x-2">
                          {backDocumentUploaded ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-400" />
                              <span className="text-green-400 text-sm">Enviado</span>
                            </>
                          ) : (
                            <span className="text-slate-400 text-sm">Pendente</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div 
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedDocumentSide === 'front' 
                          ? 'border-blue-500 bg-blue-500/10' 
                          : 'border-slate-600 bg-slate-800/50'
                      } ${frontDocumentUploaded ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => !frontDocumentUploaded && setSelectedDocumentSide('front')}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-8 bg-yellow-400 rounded border-2 border-white flex items-center justify-center">
                          <User className="h-4 w-4 text-black" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-medium">Lado com foto</h4>
                          <p className="text-slate-400 text-sm">
                            {frontDocumentUploaded ? 'Já enviado' : 'Toque para tirar a foto'}
                          </p>
                        </div>
                        {frontDocumentUploaded && (
                          <CheckCircle className="h-5 w-5 text-green-400" />
                        )}
                      </div>
                    </div>
                    
                    <div 
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedDocumentSide === 'back' 
                          ? 'border-blue-500 bg-blue-500/10' 
                          : 'border-slate-600 bg-slate-800/50'
                      } ${backDocumentUploaded ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => !backDocumentUploaded && setSelectedDocumentSide('back')}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-8 bg-yellow-400 rounded border-2 border-white flex items-center justify-center">
                          <FileText className="h-4 w-4 text-black" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-medium">Lado sem foto</h4>
                          <p className="text-slate-400 text-sm">
                            {backDocumentUploaded ? 'Já enviado' : 'Toque para tirar a foto'}
                          </p>
                        </div>
                        {backDocumentUploaded && (
                          <CheckCircle className="h-5 w-5 text-green-400" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-4 mt-6">
                    <Button
                      onClick={prevStep}
                      variant="outline"
                      className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white bg-slate-800/50"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Voltar
                    </Button>
                    <Button
                      onClick={nextStep}
                      disabled={!canProceed()}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
                    >
                      Continuar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Document Upload */}
            {currentStep === 3 && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg mr-3">
                      <Upload className="h-6 w-6 text-white" />
                    </div>
                    Envie a foto do seu documento
                  </CardTitle>
                  <p className="text-slate-400">
                    Verificação KYC de Nível 2 - {selectedDocumentSide === 'front' ? 'Lado com foto (frente)' : 'Lado sem foto (verso)'}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    {/* Document Preview */}
                    {documentUploaded ? (
                      <div className="mb-6">
                        <div className="w-32 h-20 bg-slate-800 rounded border-2 border-green-400 mx-auto mb-4 flex items-center justify-center">
                          <div className="text-green-400 text-2xl">✓</div>
                        </div>
                        <p className="text-green-400 text-sm">Documento carregado com sucesso!</p>
                      </div>
                    ) : (
                      <div className="mb-6">
                        <div className="w-32 h-20 bg-slate-800 rounded border-2 border-yellow-400 mx-auto mb-4 flex items-center justify-center">
                          <Upload className="h-8 w-8 text-yellow-400" />
                        </div>
                        <p className="text-slate-300 text-sm">
                          Selecione uma foto do seu documento
                        </p>
                      </div>
                    )}
                    
                    {/* File Input */}
                    <div className="mb-6">
                      <input
                        type="file"
                        id="document-upload"
                        accept="image/*"
                        onChange={handleDocumentUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="document-upload"
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg cursor-pointer transition-all duration-200 hover:scale-105"
                      >
                        <Upload className="h-5 w-5 mr-2" />
                        {documentUploaded ? 'Trocar Documento' : 'Selecionar Arquivo'}
                      </label>
                    </div>
                    
                    <div className="flex space-x-4">
                      <Button
                        onClick={prevStep}
                        variant="outline"
                        className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white bg-slate-800/50"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Voltar
                      </Button>
                      <Button
                        onClick={nextStep}
                        disabled={!documentUploaded}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
                      >
                        {selectedDocumentSide === 'front' ? 'Enviar Verso' : 'Verificação Facial'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Facial Verification */}
            {currentStep === 4 && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg mr-3">
                      <Camera className="h-6 w-6 text-white" />
                    </div>
                    Iniciar verificação facial
                  </CardTitle>
                  <p className="text-slate-400">Verificação KYC de Nível 2</p>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="w-24 h-24 bg-yellow-400 rounded-full mx-auto mb-6 flex items-center justify-center">
                      <User className="h-12 w-12 text-black" />
                    </div>
                    
                    <div className="space-y-4 mb-6 text-left">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                          <span className="text-black text-xs">☀️</span>
                        </div>
                        <p className="text-slate-300 text-sm">
                          Esteja em um ambiente iluminado e sem pessoas e objetos ao fundo.
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                          <span className="text-black text-xs">👤</span>
                        </div>
                        <p className="text-slate-300 text-sm">
                          Deixe o rosto bem visível! Evite usar chapéu, óculos de sol, ou qualquer item que cubra parte do seu rosto.
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                          <span className="text-black text-xs">📱</span>
                        </div>
                        <p className="text-slate-300 text-sm">
                          Segure o celular na altura do rosto.
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-slate-300 mb-6">
                      Essa etapa da verificação serve para que possamos validar se seu documento pertence a você.
                    </p>
                    
                    <div className="flex space-x-4">
                      <Button
                        onClick={prevStep}
                        variant="outline"
                        className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white bg-slate-800/50"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Voltar
                      </Button>
                      <Button
                        onClick={handleFacialVerification}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        Iniciar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Final Submit */}
            {currentStep === 5 && (
              <Card className="glass-card">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <CheckCircle className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Verificação Concluída!</h3>
                    <p className="text-slate-300">
                      Todos os dados foram coletados. Clique em "Finalizar" para enviar para verificação.
                    </p>
                  </div>
                  
                  <div className="flex space-x-4">
                    <Button
                      onClick={prevStep}
                      variant="outline"
                      className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white bg-slate-800/50"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Voltar
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        "Finalizar Verificação Nível 2"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Info Card */}
            <Card className="glass-card bg-blue-600/10 border-blue-500/30">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Shield className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Segurança dos Documentos</h4>
                    <p className="text-slate-300 text-sm">
                      Seus documentos são criptografados e armazenados com segurança. 
                      Utilizamos tecnologia de ponta para proteger suas informações pessoais 
                      e cumprir todas as regulamentações de privacidade.
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
