/**
 * Hook simplificado para gerenciar KYC
 * Usa apenas as 3 funções essenciais da API Notus
 */

import { useState, useCallback } from 'react';
import { kycActions } from '@/lib/actions';
import {
  CreateKYCSessionData,
  KYCSessionResponse,
  KYCResult,
  WalletKYCMetadata,
  KYCSessionStatus
} from '@/types/kyc';

interface UseKYCManagerReturn {
  // Estado
  isLoading: boolean;
  error: string | null;
  kycMetadata: WalletKYCMetadata | null;
  
  // Ações principais
  createKYCSession: (data: CreateKYCSessionData) => Promise<KYCResult<KYCSessionResponse>>;
  getKYCSessionStatus: (sessionId: string) => Promise<KYCResult<KYCSessionResponse>>;
  processKYCSession: (sessionId: string) => Promise<KYCResult<void>>;
  
  // Utilitários
  clearError: () => void;
  getCurrentStage: () => '0' | '1' | '2';
  getCurrentLimit: () => number;
  canProceedToNextStage: () => boolean;
  isSessionActive: () => boolean;
  getActiveSessionId: () => string | null;
  checkSessionStatus: (sessionId: string) => Promise<void>;
}

export function useKYCManager(walletAddress: string): UseKYCManagerReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kycMetadata, setKycMetadata] = useState<WalletKYCMetadata | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Criar sessão KYC
  const createKYCSessionHandler = useCallback(async (data: CreateKYCSessionData): Promise<KYCResult<KYCSessionResponse>> => {
    if (!walletAddress) {
      return { success: false, error: { code: 'NO_WALLET', message: 'Endereço da wallet não fornecido' } };
    }

    setIsLoading(true);
    setError(null);

    try {
      const sessionResponse = await kycActions.createStandardSession({
        firstName: data.stage1Data?.firstName || '',
        lastName: data.stage1Data?.lastName || '',
        birthDate: data.stage1Data?.birthDate || '',
        documentCategory: data.stage1Data?.documentCategory || 'IDENTITY_CARD',
        documentCountry: data.stage1Data?.documentCountry || 'BRAZIL',
        documentId: data.stage1Data?.documentId || '',
        nationality: data.stage1Data?.nationality || 'BRAZILIAN',
        livenessRequired: data.livenessRequired || false,
        email: data.stage1Data?.email,
        address: data.stage1Data?.address,
        city: data.stage1Data?.city,
        state: data.stage1Data?.state,
        postalCode: data.stage1Data?.postalCode
      });

      return { success: true, data: sessionResponse as KYCSessionResponse };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar sessão KYC';
      setError(errorMessage);
      return { success: false, error: { code: 'CREATE_SESSION_ERROR', message: errorMessage } };
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  // Consultar status da sessão
  const getKYCSessionStatusHandler = useCallback(async (sessionId: string): Promise<KYCResult<KYCSessionResponse>> => {
    setIsLoading(true);
    setError(null);

    try {
      const sessionData = await kycActions.getSessionResult(sessionId);
      return { success: true, data: sessionData as KYCSessionResponse };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao consultar status da sessão';
      setError(errorMessage);
      return { success: false, error: { code: 'GET_STATUS_ERROR', message: errorMessage } };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Processar sessão KYC
  const processKYCSessionHandler = useCallback(async (sessionId: string): Promise<KYCResult<void>> => {
    setIsLoading(true);
    setError(null);

    try {
      await kycActions.processSession(sessionId);
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao processar sessão KYC';
      setError(errorMessage);
      return { success: false, error: { code: 'PROCESS_SESSION_ERROR', message: errorMessage } };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Métodos utilitários
  const getCurrentStage = useCallback((): '0' | '1' | '2' => {
    return kycMetadata?.kycLimits?.stage || '0';
  }, [kycMetadata]);

  const getCurrentLimit = useCallback((): number => {
    return kycMetadata?.kycLimits?.currentLimit || 0;
  }, [kycMetadata]);

  const canProceedToNextStage = useCallback((): boolean => {
    const currentStage = getCurrentStage();
    const kycStatus = kycMetadata?.kycStatus;
    
    if (currentStage === '0' && kycStatus === 'NOT_STARTED') return true;
    if (currentStage === '1' && kycStatus === 'IN_PROGRESS') return true;
    return false;
  }, [getCurrentStage, kycMetadata]);

  const isSessionActive = useCallback((): boolean => {
    return !!kycMetadata?.activeKYCSession;
  }, [kycMetadata]);

  const getActiveSessionId = useCallback((): string | null => {
    return kycMetadata?.activeKYCSession?.sessionId || null;
  }, [kycMetadata]);

  const checkSessionStatus = useCallback(async (sessionId: string): Promise<void> => {
    const result = await getKYCSessionStatusHandler(sessionId);
    if (result.success && result.data?.session) {
      // Atualizar kycMetadata com os dados da sessão
      setKycMetadata(prev => {
        if (!prev) return null;
        return {
          ...prev,
          activeKYCSession: prev.activeKYCSession ? {
            ...prev.activeKYCSession,
            status: result.data!.session.status as KYCSessionStatus
          } : undefined
        };
      });
    }
  }, [getKYCSessionStatusHandler]);

  return {
    // Estado
    isLoading,
    error,
    kycMetadata,
    
    // Ações
    createKYCSession: createKYCSessionHandler,
    getKYCSessionStatus: getKYCSessionStatusHandler,
    processKYCSession: processKYCSessionHandler,
    
    // Utilitários
    clearError,
    getCurrentStage,
    getCurrentLimit,
    canProceedToNextStage,
    isSessionActive,
    getActiveSessionId,
    checkSessionStatus,
  };
}