"use client";

import { useState, useCallback } from 'react';
import { 
  notusAPI, 
  CreateStandardIndividualSessionRequest, 
  CreateStandardIndividualSessionResponse,
  KYCVerificationSession,
  DocumentUpload 
} from '@/lib/api/notus';
import { useAuth } from '@/contexts/auth-context';

export interface KYCManagerState {
  session: KYCVerificationSession | null;
  sessionResponse: CreateStandardIndividualSessionResponse | null;
  frontDocumentUpload: DocumentUpload | null;
  backDocumentUpload: DocumentUpload | null;
  isLoading: boolean;
  error: string | null;
  step: 'idle' | 'creating_session' | 'session_created' | 'uploading_documents' | 'processing' | 'completed' | 'error';
  currentLevel: 1 | 2;
}

export function useKYCManager() {
  const { user, individualId, walletAddress } = useAuth();
  const [state, setState] = useState<KYCManagerState>({
    session: null,
    sessionResponse: null,
    frontDocumentUpload: null,
    backDocumentUpload: null,
    isLoading: false,
    error: null,
    step: 'idle',
    currentLevel: 1
  });

  // Nível 1: Apenas dados pessoais (até R$ 2.000) - sem liveness
  const createLevel1Session = useCallback(async (kycData: CreateStandardIndividualSessionRequest) => {
    if (!user || !walletAddress) {
      throw new Error('Usuário não autenticado ou carteira não conectada');
    }

    setState(prev => ({ ...prev, isLoading: true, error: null, step: 'creating_session', currentLevel: 1 }));

    try {
      const response = await notusAPI.createStandardIndividualSession({
        ...kycData,
        livenessRequired: false // Nível 1 não requer liveness
      });
      
      setState(prev => ({
        ...prev,
        session: response.session,
        sessionResponse: response,
        frontDocumentUpload: response.frontDocumentUpload,
        backDocumentUpload: response.backDocumentUpload,
        isLoading: false,
        step: 'session_created'
      }));

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar sessão de verificação Nível 1';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
        step: 'error'
      }));
      throw error;
    }
  }, [user, walletAddress]);

  // Nível 2: Dados pessoais + documentos + liveness (acima de R$ 2.000)
  const createLevel2Session = useCallback(async (kycData: CreateStandardIndividualSessionRequest) => {
    if (!user || !walletAddress) {
      throw new Error('Usuário não autenticado ou carteira não conectada');
    }

    setState(prev => ({ ...prev, isLoading: true, error: null, step: 'creating_session', currentLevel: 2 }));

    try {
      const response = await notusAPI.createStandardIndividualSession({
        ...kycData,
        livenessRequired: true // Nível 2 requer liveness
      });
      
      setState(prev => ({
        ...prev,
        session: response.session,
        sessionResponse: response,
        frontDocumentUpload: response.frontDocumentUpload,
        backDocumentUpload: response.backDocumentUpload,
        isLoading: false,
        step: 'session_created'
      }));

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar sessão de verificação Nível 2';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
        step: 'error'
      }));
      throw error;
    }
  }, [user, walletAddress]);

  // Upload de documentos
  const uploadDocuments = useCallback(async (frontFile: File, backFile?: File) => {
    if (!state.frontDocumentUpload) {
      throw new Error('Sessão de upload não encontrada');
    }

    setState(prev => ({ ...prev, isLoading: true, error: null, step: 'uploading_documents' }));

    try {
      // Upload do documento da frente
      await notusAPI.uploadDocumentToS3(state.frontDocumentUpload, frontFile);
      
      // Upload do documento de trás (se fornecido e disponível)
      if (backFile && state.backDocumentUpload) {
        await notusAPI.uploadDocumentToS3(state.backDocumentUpload, backFile);
      }
      
      setState(prev => ({ ...prev, isLoading: false, step: 'processing' }));
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao fazer upload dos documentos';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
        step: 'error'
      }));
      throw error;
    }
  }, [state.frontDocumentUpload, state.backDocumentUpload]);

  // Processar sessão de verificação
  const processVerificationSession = useCallback(async (sessionId: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await notusAPI.processKYCVerificationSession(sessionId);
      
      setState(prev => ({ ...prev, isLoading: false, step: 'processing' }));
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao processar sessão';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
        step: 'error'
      }));
      throw error;
    }
  }, []);

  // Verificar status da sessão
  const checkSessionStatus = useCallback(async (sessionId: string) => {
    try {
      const response = await notusAPI.getKYCVerificationSession(sessionId);
      
      setState(prev => ({
        ...prev,
        session: response.session,
        step: response.session.status === 'COMPLETED' ? 'completed' : 'processing'
      }));
      
      return response.session;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao verificar status';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        step: 'error'
      }));
      throw error;
    }
  }, []);

  // Verificar se o usuário já tem KYC aprovado
  const hasApprovedKYC = useCallback(() => {
    return state.session?.status === 'COMPLETED' && !!state.session?.individualId;
  }, [state.session]);

  // Obter nível do KYC
  const getKYCLevel = useCallback(() => {
    if (!state.session) return 0;
    
    if (state.session.status === 'COMPLETED' && state.session.individualId) {
      // Se tem livenessRequired, é Nível 2, senão é Nível 1
      return state.session.livenessRequired ? 2 : 1;
    }
    
    return 0;
  }, [state.session]);

  // Verificar se pode depositar determinado valor
  const canDepositAmount = useCallback((amount: number) => {
    const level = getKYCLevel();
    
    if (level === 0) return { canDeposit: false, reason: 'KYC não aprovado' };
    if (level === 1 && amount > 2000) return { canDeposit: false, reason: 'Valor acima do limite do Nível 1. Complete o KYC Nível 2.' };
    
    return { canDeposit: true };
  }, [getKYCLevel]);

  // Reset do estado
  const reset = useCallback(() => {
    setState({
      session: null,
      sessionResponse: null,
      frontDocumentUpload: null,
      backDocumentUpload: null,
      isLoading: false,
      error: null,
      step: 'idle',
      currentLevel: 1
    });
  }, []);

  return {
    ...state,
    createLevel1Session,
    createLevel2Session,
    uploadDocuments,
    processVerificationSession,
    checkSessionStatus,
    hasApprovedKYC,
    getKYCLevel,
    canDepositAmount,
    reset
  };
}
