/**
 * Componente KYC Manager Simplificado
 * Usa apenas as 3 funções essenciais da API Notus
 */

import React, { useState } from 'react';
import { useKYCManager } from '@/hooks/use-kyc-manager';
import { CreateKYCSessionData, KYCStage1Data, KYCSessionResponse } from '@/types/kyc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface KYCManagerProps {
  walletAddress: string;
}

export function KYCManager({ walletAddress }: KYCManagerProps) {
  const {
    isLoading,
    error,
    createKYCSession,
    getKYCSessionStatus,
    processKYCSession,
    clearError
  } = useKYCManager(walletAddress);

  const [currentStep, setCurrentStep] = useState<'status' | 'stage1' | 'stage2'>('status');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStatus, setSessionStatus] = useState<KYCSessionResponse | null>(null);

  // Criar sessão KYC
  const handleCreateSession = async (stage1Data: KYCStage1Data) => {
    const sessionData: CreateKYCSessionData = {
      stage: 'STAGE_2',
      stage1Data,
      livenessRequired: true
    };

    const result = await createKYCSession(sessionData);
    
    if (result.success && result.data) {
      setSessionId(result.data.session.id);
      setCurrentStep('stage2');
    }
  };

  // Consultar status da sessão
  const handleCheckStatus = async () => {
    if (!sessionId) return;
    
    const result = await getKYCSessionStatus(sessionId);
    
    if (result.success && result.data) {
      setSessionStatus(result.data);
    }
  };

  // Processar sessão KYC
  const handleProcessSession = async () => {
    if (!sessionId) return;
    
    const result = await processKYCSession(sessionId);
    
    if (result.success) {
      // Aguardar um pouco e verificar status
      setTimeout(() => {
        handleCheckStatus();
      }, 2000);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>KYC Manager - Simplificado</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={currentStep} onValueChange={(value) => setCurrentStep(value as 'status' | 'stage1' | 'stage2')}>
            <TabsList>
              <TabsTrigger value="status">Status</TabsTrigger>
              <TabsTrigger value="stage1">Etapa 1</TabsTrigger>
              <TabsTrigger value="stage2">Etapa 2</TabsTrigger>
            </TabsList>

            <TabsContent value="status" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Status da Sessão</h3>
                {sessionId && (
                  <div className="mt-4 space-y-2">
                    <p><strong>Session ID:</strong> {sessionId}</p>
                    <Button onClick={handleCheckStatus} disabled={isLoading}>
                      Verificar Status
                    </Button>
                    {sessionStatus && (
                      <div className="mt-4 p-4 bg-gray-100 rounded">
                        <pre>{JSON.stringify(sessionStatus, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="stage1" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Etapa 1 - Dados Pessoais</h3>
                <p className="text-gray-600">Preencha os dados pessoais para iniciar o KYC</p>
                <Button 
                  onClick={() => {
                    // Dados de exemplo para teste
                    const exampleData: KYCStage1Data = {
                      firstName: 'João',
                      lastName: 'Silva',
                      birthDate: '1990-01-01',
                      documentCategory: 'IDENTITY_CARD',
                      documentCountry: 'BRAZIL',
                      documentId: '12345678901',
                      nationality: 'BRAZILIAN',
                      email: 'joao@example.com',
                      address: 'Rua das Flores, 123',
                      city: 'São Paulo',
                      state: 'SP',
                      postalCode: '01234-567'
                    };
                    handleCreateSession(exampleData);
                  }}
                  disabled={isLoading}
                  className="mt-4"
                >
                  Criar Sessão KYC (Exemplo)
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="stage2" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Etapa 2 - Verificação</h3>
                {sessionId ? (
                  <div className="space-y-4">
                    <p>Session ID: {sessionId}</p>
                    <Button onClick={handleProcessSession} disabled={isLoading}>
                      Processar Verificação
                    </Button>
                  </div>
                ) : (
                  <p>Nenhuma sessão ativa. Crie uma sessão na Etapa 1.</p>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {error && (
            <Alert className="mt-4">
              <AlertDescription>
                {error}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearError}
                  className="ml-2"
                >
                  Limpar
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {isLoading && (
            <div className="mt-4 text-center">
              <p>Carregando...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}