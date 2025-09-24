/**
 * Componente principal para gerenciar o fluxo completo de KYC
 * Integra todas as etapas e componentes
 */

'use client';

import React, { useState } from 'react';
import { useKYCManager } from '@/hooks/useKYCManager';
import { KYCStage1Data, CreateKYCSessionData } from '@/types/kyc';
import { KYCStatusCard } from './KYCStatusCard';
import { KYCStage1Form } from './KYCStage1Form';
import { DocumentUpload } from './DocumentUpload';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  Clock, 
  Camera, 
  FileText,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface KYCManagerProps {
  walletAddress: string;
  className?: string;
}

export function KYCManager({ walletAddress, className = '' }: KYCManagerProps) {
  const {
    kycMetadata,
    isLoading,
    error,
    createKYCSession,
    checkSessionStatus,
    processVerification,
    uploadDocument,
    clearError,
    getCurrentStage,
    canProceedToNextStage,
    isSessionActive,
    getActiveSessionId,
    // Novas funções para fluxo correto
    saveStage1Data,
    createStage2Session,
    processStage2Verification
  } = useKYCManager(walletAddress);

  const [currentStep, setCurrentStep] = useState<'status' | 'stage1' | 'stage2'>('status');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);

  // Função para iniciar Etapa 1 - Salva dados na wallet (sem criar sessão KYC)
  const handleStartStage1 = async (stage1Data: KYCStage1Data) => {
    setIsProcessing(true);
    setProcessingError(null);
    clearError();

    try {
      // NOVO FLUXO: Salvar dados na wallet metadata (sem criar sessão KYC)
      const result = await saveStage1Data(stage1Data);
      
      if (result.success) {
        setCurrentStep('status');
      } else {
        setProcessingError(result.error?.message || 'Erro ao salvar dados da Etapa 1');
      }
    } catch (err) {
      setProcessingError(err instanceof Error ? err.message : 'Erro inesperado');
    } finally {
      setIsProcessing(false);
    }
  };

  // Função para iniciar Etapa 2 - Cria sessão KYC completa
  const handleStartStage2 = async (stage1Data: KYCStage1Data) => {
    setIsProcessing(true);
    setProcessingError(null);
    clearError();

    try {
      // NOVO FLUXO: Criar sessão KYC completa (com documentos e liveness)
      const result = await createStage2Session(stage1Data);
      
      if (result.success) {
        setCurrentStep('stage2');
      } else {
        setProcessingError(result.error?.message || 'Erro ao criar sessão da Etapa 2');
      }
    } catch (err) {
      setProcessingError(err instanceof Error ? err.message : 'Erro inesperado');
    } finally {
      setIsProcessing(false);
    }
  };

  // Função para fazer upload de documento
  const handleDocumentUpload = async (uploadData: any) => {
    const result = await uploadDocument(uploadData);
    
    if (!result.success) {
      setProcessingError(result.error?.message || 'Erro no upload');
      return;
    }

    // Verificar se ambos os documentos foram enviados
    const sessionId = getActiveSessionId();
    if (sessionId) {
      // Aguardar um pouco e verificar status
      setTimeout(async () => {
        await checkSessionStatus(sessionId);
      }, 1000);
    }
  };

  // Função para processar verificação Stage 2
  const handleProcessVerification = async () => {
    const sessionId = getActiveSessionId();
    if (!sessionId) return;

    setIsProcessing(true);
    setProcessingError(null);

    try {
      // NOVO FLUXO: Usar função específica para Stage 2
      const result = await processStage2Verification(sessionId);
      
      if (result.success) {
        setCurrentStep('status');
      } else {
        setProcessingError(result.error?.message || 'Erro ao processar verificação da Etapa 2');
      }
    } catch (err) {
      setProcessingError(err instanceof Error ? err.message : 'Erro inesperado');
    } finally {
      setIsProcessing(false);
    }
  };

  // Função para verificar status da sessão
  const handleCheckStatus = async () => {
    const sessionId = getActiveSessionId();
    if (sessionId) {
      await checkSessionStatus(sessionId);
    }
  };

  // Função para obter dados da Etapa 1 da sessão ativa
  const getActiveStage1Data = (): KYCStage1Data | null => {
    return kycMetadata?.activeKYCSession?.stage1Data || null;
  };

  // Função para verificar se pode processar verificação
  const canProcessVerification = () => {
    if (!kycMetadata?.activeKYCSession) return false;
    
    const session = kycMetadata.activeKYCSession;
    return session.status === 'PENDING' && session.stage === 'STAGE_2';
  };

  // Função para verificar se documentos foram enviados
  const areDocumentsUploaded = () => {
    // Esta lógica seria implementada baseada no status da sessão
    // Por enquanto, assumimos que se chegou na etapa 2, os documentos foram enviados
    return kycMetadata?.activeKYCSession?.stage === 'STAGE_2';
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Carregando dados KYC...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      {/* Erro Global */}
      {(error || processingError) && (
        <Alert className="mb-6" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || processingError}
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs para navegação */}
      <Tabs value={currentStep} onValueChange={(value) => setCurrentStep(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="status" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Status
          </TabsTrigger>
          <TabsTrigger 
            value="stage1" 
            className="flex items-center gap-2"
            disabled={getCurrentStage() !== '0'}
          >
            <FileText className="h-4 w-4" />
            Etapa 1
          </TabsTrigger>
          <TabsTrigger 
            value="stage2" 
            className="flex items-center gap-2"
            disabled={getCurrentStage() === '0' || getCurrentStage() === '2'}
          >
            <Camera className="h-4 w-4" />
            Etapa 2
          </TabsTrigger>
        </TabsList>

        {/* Tab: Status */}
        <TabsContent value="status">
          <KYCStatusCard
            walletAddress={walletAddress}
            onStartKYC={() => {
              const stage = getCurrentStage();
              if (stage === '0') {
                setCurrentStep('stage1');
              } else if (stage === '1') {
                setCurrentStep('stage2');
              }
            }}
            onCheckStatus={handleCheckStatus}
          />
        </TabsContent>

        {/* Tab: Etapa 1 */}
        <TabsContent value="stage1">
          <KYCStage1Form
            onSubmit={handleStartStage1}
            isLoading={isProcessing}
            error={processingError}
          />
        </TabsContent>

        {/* Tab: Etapa 2 */}
        <TabsContent value="stage2">
          <div className="space-y-6">
            {/* Informações da Sessão */}
            {kycMetadata?.activeKYCSession && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Sessão KYC Ativa
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">ID da Sessão:</span>
                      <span className="font-mono">
                        {kycMetadata.activeKYCSession.sessionId.slice(0, 8)}...
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-medium">
                        {kycMetadata.activeKYCSession.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expira em:</span>
                      <span>
                        {new Date(kycMetadata.activeKYCSession.expiresAt).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Upload de Documentos */}
            {kycMetadata?.activeKYCSession && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Frente do Documento */}
                <DocumentUpload
                  sessionId={kycMetadata.activeKYCSession.sessionId}
                  documentType="front"
                  uploadUrl={kycMetadata.activeKYCSession.stage1Data?.documentCategory === 'PASSPORT' ? 
                    'https://s3.amazonaws.com/example-bucket' : 
                    'https://s3.amazonaws.com/example-bucket'
                  }
                  uploadFields={{
                    bucket: 'example-bucket',
                    'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
                    'X-Amz-Credential': 'EXAMPLE/20250120/us-east-1/s3/aws4_request',
                    'X-Amz-Date': '20250120T103000Z',
                    key: `documents/front-${kycMetadata.activeKYCSession.sessionId}`,
                    Policy: 'eyJleHBpcmF0aW9uIjoiMjAyNS0wMS0yMFQxMDQ1OjAwWiIsImNvbmRpdGlvbnMiOltbImNvbnRlbnQtbGVuZ3RoLXJhbmdlIiwwLDI2MjE0NDAwXSxbInN0YXJ0cy13aXRoIiwiJGtleSIsImRvY3VtZW50cy9mcm9udC1kb2MtMTIzNDUiXSx7ImJ1Y2tldCI6ImV4YW1wbGUtYnVja2V0In1dfQ==',
                    'X-Amz-Signature': 'example-signature-front-document'
                  }}
                  onUpload={handleDocumentUpload}
                  required={true}
                />

                {/* Verso do Documento */}
                <DocumentUpload
                  sessionId={kycMetadata.activeKYCSession.sessionId}
                  documentType="back"
                  uploadUrl={kycMetadata.activeKYCSession.stage1Data?.documentCategory === 'PASSPORT' ? 
                    'https://s3.amazonaws.com/example-bucket' : 
                    'https://s3.amazonaws.com/example-bucket'
                  }
                  uploadFields={{
                    bucket: 'example-bucket',
                    'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
                    'X-Amz-Credential': 'EXAMPLE/20250120/us-east-1/s3/aws4_request',
                    'X-Amz-Date': '20250120T103000Z',
                    key: `documents/back-${kycMetadata.activeKYCSession.sessionId}`,
                    Policy: 'eyJleHBpcmF0aW9uIjoiMjAyNS0wMS0yMFQxMDQ1OjAwWiIsImNvbmRpdGlvbnMiOltbImNvbnRlbnQtbGVuZ3RoLXJhbmdlIiwwLDI2MjE0NDAwXSxbInN0YXJ0cy13aXRoIiwiJGtleSIsImRvY3VtZW50cy9iYWNrLWRvYy0xMjM0NSJdLHsiYnVja2V0IjoiZXhhbXBsZS1idWNrZXQifV19',
                    'X-Amz-Signature': 'example-signature-back-document'
                  }}
                  onUpload={handleDocumentUpload}
                  required={kycMetadata.activeKYCSession.stage1Data?.documentCategory !== 'PASSPORT'}
                />
              </div>
            )}

            {/* Botão de Processar Verificação */}
            {canProcessVerification() && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <p className="text-gray-600">
                      Após enviar os documentos, clique no botão abaixo para processar a verificação.
                    </p>
                    <Button
                      onClick={handleProcessVerification}
                      disabled={isProcessing}
                      className="w-full"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processando Verificação...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Processar Verificação KYC
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
