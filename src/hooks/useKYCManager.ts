/**
 * Hook para gerenciar sessões KYC vinculadas à wallet
 * Integra com API Notus e metadados da wallet
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  WalletKYCMetadata, 
  CreateKYCSessionData, 
  KYCSessionResponse, 
  KYCResult,
  KYCStage1Data,
  DocumentUploadData,
  UploadStatus
} from '@/types/kyc';
import {
  getWalletKYCMetadata,
  addActiveKYCSession,
  updateActiveKYCSessionStatus,
  finalizeKYCSession,
  updateWalletKYCStatus
} from '@/lib/wallet';
import {
  saveStage1DataToWallet,
  createStage2KYCSession,
  processStage2Verification
} from '@/lib/kyc';

import { notusAPI } from '@/lib/api/client';

interface UseKYCManagerReturn {
  // Estado
  kycMetadata: WalletKYCMetadata | null;
  isLoading: boolean;
  error: string | null;
  uploadStatus: UploadStatus;
  
  // Ações
  loadKYCMetadata: () => Promise<void>;
  createKYCSession: (data: CreateKYCSessionData) => Promise<KYCResult<KYCSessionResponse>>;
  checkSessionStatus: (sessionId: string) => Promise<KYCResult<any>>;
  processVerification: (sessionId: string) => Promise<KYCResult<void>>;
  uploadDocument: (uploadData: DocumentUploadData) => Promise<KYCResult<void>>;
  clearError: () => void;
  
  // Novas funções para fluxo correto
  saveStage1Data: (stage1Data: KYCStage1Data) => Promise<KYCResult<void>>;
  createStage2Session: (stage1Data: KYCStage1Data) => Promise<KYCResult<KYCSessionResponse>>;
  processStage2Verification: (sessionId: string) => Promise<KYCResult<void>>;
  
  // Utilitários
  getCurrentLimit: () => number;
  getCurrentStage: () => '0' | '1' | '2';
  canProceedToNextStage: () => boolean;
  isSessionActive: () => boolean;
  getActiveSessionId: () => string | null;
}

export function useKYCManager(walletAddress: string): UseKYCManagerReturn {
  const [kycMetadata, setKycMetadata] = useState<WalletKYCMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');

  // Carregar metadados KYC da wallet
  const loadKYCMetadata = useCallback(async () => {
    if (!walletAddress) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const metadata = await getWalletKYCMetadata(walletAddress);
      setKycMetadata(metadata);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar metadados KYC';
      setError(errorMessage);
      console.error('Erro ao carregar metadados KYC:', err);
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  // Criar nova sessão KYC
  const createKYCSession = useCallback(async (data: CreateKYCSessionData): Promise<KYCResult<KYCSessionResponse>> => {
    if (!walletAddress) {
      return { success: false, error: { code: 'NO_WALLET', message: 'Endereço da wallet não fornecido' } };
    }

    setIsLoading(true);
    setError(null);

    try {
      // Preparar dados para a API Notus
      const sessionData = {
        firstName: data.stage1Data?.firstName || '',
        lastName: data.stage1Data?.lastName || '',
        birthDate: data.stage1Data?.birthDate || '',
        documentCategory: data.stage1Data?.documentCategory || 'PASSPORT',
        documentCountry: data.stage1Data?.documentCountry || 'BRAZIL',
        documentId: data.stage1Data?.documentId || '',
        nationality: data.stage1Data?.nationality || 'BRAZILIAN',
        livenessRequired: data.livenessRequired || false,
        email: data.stage1Data?.email || '',
        address: data.stage1Data?.address || '',
        city: data.stage1Data?.city || '',
        state: data.stage1Data?.state || '',
        postalCode: data.stage1Data?.postalCode || ''
      };

      // Criar sessão na API Notus
      const sessionResponse = await notusAPI.post<KYCSessionResponse>(
        '/kyc/individual-verification-sessions/standard',
        sessionData
      );

      // Vincular sessionId à wallet
      await addActiveKYCSession(walletAddress, {
        sessionId: sessionResponse.session.id,
        stage: data.stage,
        createdAt: sessionResponse.session.createdAt,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutos
        status: sessionResponse.session.status,
        stage1Data: data.stage1Data,
        stage2Data: data.stage === "STAGE_2" ? {
          documentType: data.stage1Data?.documentCategory || 'PASSPORT',
          documentCountry: data.stage1Data?.documentCountry || 'BRAZIL',
          livenessVerified: false,
          documentUploaded: false
        } : undefined
      });

      // Recarregar metadados
      await loadKYCMetadata();

      return { success: true, data: sessionResponse };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar sessão KYC';
      setError(errorMessage);
      console.error('Erro ao criar sessão KYC:', err);
      return { success: false, error: { code: 'CREATE_SESSION_ERROR', message: errorMessage } };
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress, loadKYCMetadata]);

  // Verificar status da sessão KYC
  const checkSessionStatus = useCallback(async (sessionId: string): Promise<KYCResult<any>> => {
    try {
      const sessionData = await notusAPI.get<any>(
        `/kyc/individual-verification-sessions/standard/${sessionId}`
      );

      // Atualizar status da sessão ativa
      if (kycMetadata?.activeKYCSession?.sessionId === sessionId) {
        await updateActiveKYCSessionStatus(walletAddress, sessionId, sessionData.session.status);
        await loadKYCMetadata();
      }

      return { success: true, data: sessionData };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao verificar status da sessão';
      setError(errorMessage);
      console.error('Erro ao verificar status da sessão:', err);
      return { success: false, error: { code: 'CHECK_STATUS_ERROR', message: errorMessage } };
    }
  }, [walletAddress, kycMetadata?.activeKYCSession?.sessionId, loadKYCMetadata]);

  // Processar verificação KYC
  const processVerification = useCallback(async (sessionId: string): Promise<KYCResult<void>> => {
    try {
      await notusAPI.post<void>(
        `/kyc/individual-verification-sessions/standard/${sessionId}/process`
      );

      // Aguardar um pouco para o processamento
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Verificar status final
      const statusResult = await checkSessionStatus(sessionId);
      if (statusResult.success && statusResult.data?.session?.status === 'COMPLETED') {
        // Finalizar sessão e mover para histórico
        await finalizeKYCSession(
          walletAddress,
          sessionId,
          'COMPLETED',
          statusResult.data.session.individualId,
          kycMetadata?.activeKYCSession?.stage1Data,
          kycMetadata?.activeKYCSession?.stage2Data
        );
        await loadKYCMetadata();
      }

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao processar verificação';
      setError(errorMessage);
      console.error('Erro ao processar verificação:', err);
      return { success: false, error: { code: 'PROCESS_VERIFICATION_ERROR', message: errorMessage } };
    }
  }, [walletAddress, checkSessionStatus, kycMetadata?.activeKYCSession, loadKYCMetadata]);

  // Upload de documento
  const uploadDocument = useCallback(async (uploadData: DocumentUploadData): Promise<KYCResult<void>> => {
    setUploadStatus('uploading');
    setError(null);

    try {
      // Criar FormData para upload S3
      const formData = new FormData();
      
      // Adicionar campos obrigatórios do S3
      Object.entries(uploadData.fields).forEach(([key, value]) => {
        formData.append(key, value);
      });
      
      // Adicionar o arquivo
      formData.append('file', uploadData.file);

      // Upload para S3
      const uploadResponse = await fetch(uploadData.uploadUrl, {
        method: 'POST',
        body: formData
      });

      if (!uploadResponse.ok) {
        throw new Error(`Erro no upload: ${uploadResponse.statusText}`);
      }

      setUploadStatus('success');
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro no upload do documento';
      setError(errorMessage);
      setUploadStatus('error');
      console.error('Erro no upload:', err);
      return { success: false, error: { code: 'UPLOAD_ERROR', message: errorMessage } };
    }
  }, []);

  // Limpar erro
  const clearError = useCallback(() => {
    setError(null);
    setUploadStatus('idle');
  }, []);

  // NOVA FUNÇÃO: Salvar dados Stage 1 na wallet (sem criar sessão KYC)
  const saveStage1Data = useCallback(async (stage1Data: KYCStage1Data): Promise<KYCResult<void>> => {
    if (!walletAddress) {
      return { success: false, error: { code: 'NO_WALLET', message: 'Endereço da wallet não fornecido' } };
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await saveStage1DataToWallet(walletAddress, stage1Data);
      
      if (result.success) {
        // Recarregar metadados
        await loadKYCMetadata();
      } else {
        setError(result.error?.message || 'Erro ao salvar dados da Etapa 1');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao salvar dados da Etapa 1';
      setError(errorMessage);
      return { success: false, error: { code: 'SAVE_STAGE1_ERROR', message: errorMessage } };
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress, loadKYCMetadata]);

  // NOVA FUNÇÃO: Criar sessão Stage 2 (com sessão KYC completa)
  const createStage2Session = useCallback(async (stage1Data: KYCStage1Data): Promise<KYCResult<KYCSessionResponse>> => {
    if (!walletAddress) {
      return { success: false, error: { code: 'NO_WALLET', message: 'Endereço da wallet não fornecido' } };
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await createStage2KYCSession(walletAddress, stage1Data);
      
      if (result.success) {
        // Recarregar metadados
        await loadKYCMetadata();
      } else {
        setError(result.error?.message || 'Erro ao criar sessão da Etapa 2');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar sessão da Etapa 2';
      setError(errorMessage);
      return { success: false, error: { code: 'CREATE_STAGE2_ERROR', message: errorMessage } };
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress, loadKYCMetadata]);

  // NOVA FUNÇÃO: Processar verificação Stage 2
  const processStage2Verification = useCallback(async (sessionId: string): Promise<KYCResult<void>> => {
    if (!walletAddress) {
      return { success: false, error: { code: 'NO_WALLET', message: 'Endereço da wallet não fornecido' } };
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await processStage2Verification(walletAddress, sessionId);
      
      if (result.success) {
        // Recarregar metadados
        await loadKYCMetadata();
      } else {
        setError(result.error?.message || 'Erro ao processar verificação da Etapa 2');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao processar verificação da Etapa 2';
      setError(errorMessage);
      return { success: false, error: { code: 'PROCESS_STAGE2_ERROR', message: errorMessage } };
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress, loadKYCMetadata]);

  // Utilitários
  const getCurrentLimit = useCallback(() => {
    return kycMetadata?.kycLimits?.currentLimit || 0;
  }, [kycMetadata]);

  const getCurrentStage = useCallback(() => {
    return kycMetadata?.kycLimits?.stage || '0';
  }, [kycMetadata]);

  const canProceedToNextStage = useCallback(() => {
    if (!kycMetadata) return false;
    
    const currentStage = getCurrentStage();
    if (currentStage === '0') return true; // Pode começar etapa 1
    if (currentStage === '1') return true; // Pode ir para etapa 2
    return false; // Já completou tudo
  }, [kycMetadata, getCurrentStage]);

  const isSessionActive = useCallback(() => {
    return !!kycMetadata?.activeKYCSession;
  }, [kycMetadata]);

  const getActiveSessionId = useCallback(() => {
    return kycMetadata?.activeKYCSession?.sessionId || null;
  }, [kycMetadata]);

  // Carregar metadados na inicialização
  useEffect(() => {
    loadKYCMetadata();
  }, [loadKYCMetadata]);

  return {
    // Estado
    kycMetadata,
    isLoading,
    error,
    uploadStatus,
    
    // Ações
    loadKYCMetadata,
    createKYCSession,
    checkSessionStatus,
    processVerification,
    uploadDocument,
    clearError,
    
    // Novas funções para fluxo correto
    saveStage1Data,
    createStage2Session,
    processStage2Verification,
    
    // Utilitários
    getCurrentLimit,
    getCurrentStage,
    canProceedToNextStage,
    isSessionActive,
    getActiveSessionId
  };
}
