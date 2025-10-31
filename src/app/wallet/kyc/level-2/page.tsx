"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, FileText, Camera, Upload, CheckCircle, Shield, MapPin, User, Loader2, CreditCard } from "lucide-react";
import { useKYC } from "@/contexts/kyc-context";
import { useToast } from "@/hooks/use-toast";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { AppLayout } from "@/components/layout/app-layout";
import { useKYCData } from "@/hooks/use-kyc-data";
import { useSmartWallet } from "@/hooks/use-smart-wallet";
// Importar Server Actions para KYC
import { createStandardSession, saveKYCSessionId, processSession } from '@/lib/actions/kyc';
import { getWalletAddress } from '@/lib/actions/dashboard';

  // Client-side API functions for document upload
  const uploadAPI = {
    uploadDocument: async (uploadData: { url: string; fields: any }, file: File) => {
      try {
        
        const formData = new FormData();
        
        // Adicionar todos os campos obrigatórios primeiro
        Object.keys(uploadData.fields).forEach(key => {
          formData.append(key, uploadData.fields[key]);
        });
        
        // Adicionar o arquivo por último (obrigatório para S3)
        formData.append('file', file);
        
        const response = await fetch(uploadData.url, {
          method: 'POST',
          body: formData,
        });
        
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Erro no upload S3:', response.status, errorText);
          throw new Error(`Erro ao fazer upload do documento: ${response.status} ${response.statusText}`);
        }
        
        return response;
      } catch (error) {
        console.error('❌ Erro no upload do documento:', error);
        throw error;
      }
    }
  };


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
  
  // Estados para verificação facial
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Estados para dados obrigatórios da API Notus
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [kycSessionId, setKycSessionId] = useState<string | null>(null);
  const [uploadUrls, setUploadUrls] = useState<any>(null);
  
  // Estados para validação de campos
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
  // Dados do Level 1 carregados
  const [level1Data, setLevel1Data] = useState<any>(null);

  const documentTypes = [
    { value: "rg", label: "Carteira de Identidade (RG)", description: "Documento de identidade nacional" },
    { value: "cnh", label: "Carteira de Motorista (CNH)", description: "Carteira Nacional de Habilitação" },
    { value: "rnm", label: "Registro Nacional Migratório (RNM)", description: "Documento para estrangeiros" }
  ];

  // Funções de validação

  const validatePostalCode = (postalCode: string): boolean => {
    const cepRegex = /^\d{5}-?\d{3}$/;
    return cepRegex.test(postalCode);
  };

  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'address':
        if (!value) return 'Endereço é obrigatório';
        if (value.length < 10) return 'Endereço deve ter pelo menos 10 caracteres';
        return '';
      case 'city':
        if (!value) return 'Cidade é obrigatória';
        if (value.length < 2) return 'Cidade deve ter pelo menos 2 caracteres';
        return '';
      case 'state':
        if (!value) return 'Estado é obrigatório';
        if (value.length < 2) return 'Estado deve ter pelo menos 2 caracteres';
        return '';
      case 'postalCode':
        if (!value) return 'CEP é obrigatório';
        if (!validatePostalCode(value)) return 'CEP inválido (formato: 00000-000)';
        return '';
      case 'documentNumber':
        if (!value) return 'Número do documento é obrigatório';
        if (value.length < 5) return 'Número do documento deve ter pelo menos 5 caracteres';
        return '';
      default:
        return '';
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    // Atualizar valor do campo
    switch (field) {
      case 'address':
        setAddress(value);
        break;
      case 'city':
        setCity(value);
        break;
      case 'state':
        setState(value);
        break;
      case 'postalCode':
        setPostalCode(value);
        break;
      case 'documentNumber':
        setDocumentNumber(value);
        break;
    }

    // Validar campo e limpar erro se válido
    const error = validateField(field, value);
    setFieldErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  // Carregar dados do Level 1
  useEffect(() => {
    const loadLevel1Data = async () => {
      if (!wallet?.walletAddress) {
        return;
      }
      
      try {
        
        // Buscar dados KYC existentes usando o Server Action
        // Usar o EOA (walletAddress) para encontrar a smart wallet
        const response = await getWalletAddress({ 
          externallyOwnedAccount: wallet.walletAddress 
        });
        
        if (response?.wallet?.metadata?.kycData) {
          const kycData = JSON.parse(response.wallet.metadata.kycData as string);
          setLevel1Data(kycData);
        } else {
        }
      } catch (err) {
        console.error('❌ Erro ao carregar dados Level 1:', err);
      }
    };

    loadLevel1Data();
  }, [wallet?.walletAddress]);

  // Limpar câmera quando componente for desmontado
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Configurar vídeo quando stream for definido
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      
      // Forçar o vídeo a carregar
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play();
      };
    }
  }, [stream]);

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
    } else if (currentStep === 4 && capturedPhoto) {
      // Step 4: Após capturar foto, processa automaticamente
      handleSubmit();
    } else if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Validação por step
  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedDocument !== "" && documentNumber !== "" && !fieldErrors.documentNumber;
      case 2:
        return selectedDocumentSide !== "";
      case 3:
        return documentUploaded;
      case 4:
        return capturedPhoto;
      default:
        return false;
    }
  };

  const handleDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        error('Erro!', 'Por favor, selecione apenas arquivos JPG, PNG ou WebP');
        return;
      }
      
      // Validar tamanho do arquivo (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        error('Erro!', 'O arquivo deve ter no máximo 5MB');
        return;
      }
      
      // Validar dimensões mínimas (opcional)
      const img = new Image();
      img.onload = () => {
        if (img.width < 300 || img.height < 200) {
          error('Erro!', 'A imagem deve ter pelo menos 300x200 pixels');
          return;
        }
        processFileUpload(file);
      };
      img.src = URL.createObjectURL(file);
    }
  };

  const processFileUpload = (file: File) => {
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
  };

  // Funções para gerenciar a câmera
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });
      
      setStream(mediaStream);
      setCameraActive(true);
      
      success('Câmera ativada!', 'Posicione seu rosto na tela');
    } catch (err) {
      console.error('Erro ao acessar câmera:', err);
      error('Erro!', 'Não foi possível acessar a câmera. Verifique as permissões.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setCameraActive(false);
    }
  };

  const capturePhoto = () => {
    
    if (videoRef.current && cameraActive) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        
        const photoDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedPhoto(photoDataUrl);
        stopCamera();
        
        success('Foto capturada!', 'Verificação facial concluída com sucesso');
        setFacialVerificationCompleted(true);
      }
    }
  };

  const handleFacialVerification = () => {
    
    if (!cameraActive) {
      startCamera();
    } else {
      capturePhoto();
    }
  };

  const handleSubmit = async () => {
    
    if (!level1Data) {
      error('Erro', 'Dados do Level 1 não encontrados');
      return;
    }

    if (!frontDocumentFile || !backDocumentFile || !capturedPhoto) {
        frontDocumentFile: !!frontDocumentFile, 
        backDocumentFile: !!backDocumentFile, 
        capturedPhoto: !!capturedPhoto 
      });
      error('Erro', 'Todos os documentos e foto facial são obrigatórios');
      return;
    }

    // Usar dados do metadata da wallet em vez do formulário
    // Os dados de endereço já estão salvos no metadata da wallet

    setLoading(true);
    
    try {
      
      // PASSO 1: Preparar dados do Level 1
      const fullName = level1Data.fullName.split(' ');
      const firstName = fullName[0] || '';
      const lastName = fullName.slice(1).join(' ') || '';
      
      // Mapear documento selecionado para categoria da API
      const documentCategoryMap = {
        'rg': 'IDENTITY_CARD',
        'cnh': 'DRIVERS_LICENSE',
        'rnm': 'IDENTITY_CARD'
      };
      
      // PASSO 2: Preparar dados para a API Notus usando dados do metadata da wallet
      const kycSessionData = {
        firstName: level1Data.firstName || firstName,
        lastName: level1Data.lastName || lastName,
        birthDate: level1Data.birthDateFormatted || level1Data.birthDate, // Usar formato YYYY-MM-DD
        documentCategory: documentCategoryMap[selectedDocument as keyof typeof documentCategoryMap] as 'IDENTITY_CARD' | 'DRIVERS_LICENSE' | 'PASSPORT',
        documentCountry: level1Data.documentCountry || 'BRAZIL', // Usar país mapeado da nacionalidade
        documentId: documentNumber || level1Data.cpf, // Usar número do documento ou CPF como fallback
        nationality: level1Data.nationality === 'Brasil' ? 'BRAZILIAN' : level1Data.nationality.toUpperCase(),
        livenessRequired: true,
        email: level1Data.email || 'user@example.com', // Adicionar email obrigatório
        // Usar dados de endereço do metadata da wallet
        address: level1Data.address || '',
        city: level1Data.city || '',
        state: level1Data.state || '',
        postalCode: level1Data.postalCode || ''
      };
      
      
      // PASSO 3: Criar sessão na API Notus
      const sessionResponse = await createStandardSession(kycSessionData) as any;
      
      const sessionId = sessionResponse.session.id;
      const frontDocumentUpload = sessionResponse.frontDocumentUpload;
      const backDocumentUpload = sessionResponse.backDocumentUpload;
      
      
      // Salvar sessionId e individualId na metadata da wallet
      const updatedKycData = await saveKYCSessionId(sessionId, sessionResponse.session?.individualId || null, level1Data, wallet?.accountAbstraction || '');
      
      setKycSessionId(sessionId);
      setUploadUrls({ frontDocumentUpload, backDocumentUpload });
      
      // PASSO 5: Upload dos documentos
      if (frontDocumentUpload && frontDocumentFile) {
        try {
          await uploadAPI.uploadDocument(frontDocumentUpload, frontDocumentFile);
        } catch (err) {
          console.error('❌ Erro no upload documento frente:', err);
          throw new Error(`Falha no upload do documento frente: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
        }
      } else {
      }
      
      if (backDocumentUpload && backDocumentFile) {
        try {
          await uploadAPI.uploadDocument(backDocumentUpload, backDocumentFile);
        } catch (err) {
          console.error('❌ Erro no upload documento verso:', err);
          throw new Error(`Falha no upload do documento verso: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
        }
      } else {
      }
      
      // PASSO 6: Processar sessão
      await processSession(sessionId);
      
      // Não marcar como completo ainda - aguardar validação real na página principal
      
      success('Sucesso!', 'Documentos enviados para verificação! Aguarde a validação.');
      router.push('/wallet/kyc');
    } catch (err) {
      console.error('❌ Erro ao processar KYC Level 2:', err);
      console.error('❌ Stack trace:', err instanceof Error ? err.stack : 'No stack trace');
      error('Erro', `Falha ao processar verificação KYC: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
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

            {/* Número do Documento */}
            {selectedDocument && (
              <div className="mt-6 space-y-2">
                <Label htmlFor="documentNumber" className="text-slate-300 flex items-center">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Número do Documento
                </Label>
                <Input
                  id="documentNumber"
                  value={documentNumber}
                  onChange={(e) => handleFieldChange('documentNumber', e.target.value)}
                  placeholder={
                    selectedDocument === 'rg' ? 'Número do RG' :
                    selectedDocument === 'cnh' ? 'Número da CNH' :
                    'Número do RNM'
                  }
                  className={`bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 ${
                    fieldErrors.documentNumber ? 'border-red-500 focus:border-red-500' : ''
                  }`}
                />
                {fieldErrors.documentNumber && (
                  <p className="text-red-400 text-sm">{fieldErrors.documentNumber}</p>
                )}
                <p className="text-slate-400 text-xs">
                  Digite o número do documento que será fotografado
                </p>
              </div>
            )}
                  
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
                Verificação Facial
              </CardTitle>
                  <p className="text-slate-400">Verificação KYC de Nível 2</p>
            </CardHeader>
            <CardContent>
                  {!cameraActive && !capturedPhoto && (
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
                            Posicione-se na frente da câmera.
                          </p>
                        </div>
                      </div>
                      
                      <p className="text-slate-300 mb-6">
                        Essa etapa da verificação serve para que possamos validar se seu documento pertence a você.
                      </p>
                    </div>
                  )}

                  {cameraActive && !capturedPhoto && (
              <div className="text-center">
                      <div className="relative mb-6">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full max-w-md mx-auto rounded-lg border-2 border-blue-400"
                          style={{ transform: 'scaleX(-1)' }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-32 h-32 border-2 border-yellow-400 rounded-full opacity-50"></div>
                        </div>
                      </div>
                      
                      <p className="text-slate-300 mb-6">
                        Posicione seu rosto dentro do círculo e mantenha-se parado.
                      </p>
                  </div>
                  )}

                  {capturedPhoto && (
                    <div className="text-center">
                  <div className="mb-6">
                        <img
                          src={capturedPhoto}
                          alt="Foto capturada"
                          className="w-full max-w-md mx-auto rounded-lg border-2 border-green-400"
                        />
                      </div>
                      
                      <div className="flex items-center justify-center space-x-2 mb-6">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                        <p className="text-green-400 font-medium">Foto capturada com sucesso!</p>
                      </div>
                    </div>
                  )}
                  
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
                      onClick={capturedPhoto ? nextStep : handleFacialVerification}
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Processando...</span>
                        </div>
                      ) : (
                        <>
                          {!cameraActive && !capturedPhoto ? 'Iniciar Câmera' : 
                           cameraActive && !capturedPhoto ? 'Capturar Foto' : 
                           'Continuar'}
                        </>
                      )}
                    </Button>
              </div>
            </CardContent>
          </Card>
        )}

            {/* Step 5: Dados de Endereço - REMOVIDO: dados vêm do metadata da wallet */}
            {false && currentStep === 5 && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg mr-3">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    Dados de Endereço
                  </CardTitle>
                  <p className="text-slate-400">Informações necessárias para verificação KYC</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="documentNumber" className="text-white">Número do Documento *</Label>
                      <Input
                        id="documentNumber"
                        value={documentNumber}
                        onChange={(e) => handleFieldChange('documentNumber', e.target.value)}
                        placeholder="Número do seu documento"
                        className={`mt-1 ${fieldErrors.documentNumber ? 'border-red-500' : ''}`}
                      />
                      {fieldErrors.documentNumber && (
                        <p className="text-red-400 text-sm mt-1">{fieldErrors.documentNumber}</p>
                      )}
                    </div>
                    
                    
                    <div>
                      <Label htmlFor="address" className="text-white">Endereço *</Label>
                      <Input
                        id="address"
                        value={address}
                        onChange={(e) => handleFieldChange('address', e.target.value)}
                        placeholder="Rua, número, complemento"
                        className={`mt-1 ${fieldErrors.address ? 'border-red-500' : ''}`}
                      />
                      {fieldErrors.address && (
                        <p className="text-red-400 text-sm mt-1">{fieldErrors.address}</p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city" className="text-white">Cidade *</Label>
                        <Input
                          id="city"
                          value={city}
                          onChange={(e) => handleFieldChange('city', e.target.value)}
                          placeholder="Sua cidade"
                          className={`mt-1 ${fieldErrors.city ? 'border-red-500' : ''}`}
                        />
                        {fieldErrors.city && (
                          <p className="text-red-400 text-sm mt-1">{fieldErrors.city}</p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="state" className="text-white">Estado *</Label>
                        <Input
                          id="state"
                          value={state}
                          onChange={(e) => handleFieldChange('state', e.target.value)}
                          placeholder="Seu estado"
                          className={`mt-1 ${fieldErrors.state ? 'border-red-500' : ''}`}
                        />
                        {fieldErrors.state && (
                          <p className="text-red-400 text-sm mt-1">{fieldErrors.state}</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="postalCode" className="text-white">CEP *</Label>
                      <Input
                        id="postalCode"
                        value={postalCode}
                        onChange={(e) => handleFieldChange('postalCode', e.target.value)}
                        placeholder="00000-000"
                        className={`mt-1 ${fieldErrors.postalCode ? 'border-red-500' : ''}`}
                      />
                      {fieldErrors.postalCode && (
                        <p className="text-red-400 text-sm mt-1">{fieldErrors.postalCode}</p>
                      )}
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
                      onClick={handleSubmit}
                      disabled={!address || !city || !state || !postalCode || !documentNumber || loading}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
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

            {/* Step 6: Finalização - REMOVIDO: processamento automático após foto */}
            {false && currentStep === 6 && (
          <Card className="glass-card">
            <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <CheckCircle className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Verificação Concluída!</h3>
                    <p className="text-slate-300">
                      Todos os dados foram coletados e validados. Os dados de endereço serão obtidos do metadata da wallet. Clique em "Finalizar" para enviar para verificação.
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
