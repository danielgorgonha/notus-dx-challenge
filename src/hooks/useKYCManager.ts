/**
 * Hook simplificado para gerenciar KYC
 * Usa apenas as 3 funções essenciais da API Notus
 */

import { useState, useCallback, useEffect } from 'react';
import {
  createKYCSession,
  getKYCSessionStatus,
  processKYCSession
} from '@/lib/kyc';
import {
  CreateKYCSessionData,
  KYCSessionResponse,
  KYCResult,
  KYCStage1Data,
  DocumentUploadData
} from '@/types/kyc';
import { walletActions } from '@/lib/actions';

interface UseKYCManagerReturn {
  // Estado
  isLoading: boolean;
  error: string | null;
  
  // Ações principais
  createKYCSession: (data: CreateKYCSessionData) => Promise<KYCResult<KYCSessionResponse>>;
  getKYCSessionStatus: (sessionId: string) => Promise<KYCResult<any>>;
  processKYCSession: (sessionId: string) => Promise<KYCResult<void>>;
  
  // Utilitários
  clearError: () => void;
}

export function useKYCManager(walletAddress: string): UseKYCManagerReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const result = await createKYCSession(data);
      
      if (!result.success) {
        setError(result.error?.message || 'Erro ao criar sessão KYC');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar sessão KYC';
      setError(errorMessage);
      return { success: false, error: { code: 'CREATE_SESSION_ERROR', message: errorMessage } };
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  // Consultar status da sessão
  const getKYCSessionStatusHandler = useCallback(async (sessionId: string): Promise<KYCResult<any>> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getKYCSessionStatus(sessionId);
      
      if (!result.success) {
        setError(result.error?.message || 'Erro ao consultar status da sessão');
      }

      return result;
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
      const result = await processKYCSession(sessionId);
      
      if (!result.success) {
        setError(result.error?.message || 'Erro ao processar sessão KYC');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao processar sessão KYC';
      setError(errorMessage);
      return { success: false, error: { code: 'PROCESS_SESSION_ERROR', message: errorMessage } };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    // Estado
    isLoading,
    error,
    
    // Ações
    createKYCSession: createKYCSessionHandler,
    getKYCSessionStatus: getKYCSessionStatusHandler,
    processKYCSession: processKYCSessionHandler,
    
    // Utilitários
    clearError,
  };
}