/**
 * KYC - Exportações simplificadas
 * Apenas as 3 funções essenciais para integração com a API Notus
 */

// Funções principais de sessão KYC
export { 
  createKYCSession, 
  getKYCSessionStatus, 
  processKYCSession 
} from './session';

// Actions diretas da API (se necessário)
export { kycActions } from '../actions/kyc';

// Tipos
export type {
  CreateKYCSessionData,
  KYCSessionResponse,
  KYCResult,
  KYCStage1Data,
  DocumentUploadData
} from '@/types/kyc';