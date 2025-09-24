/**
 * Módulo KYC - Exportações centralizadas
 */

// Sessões KYC
export {
  createKYCSession,
  getKYCSessionStatus,
  processKYCSession,
  uploadDocumentToS3
} from './session';

// Stage 1 - Dados do formulário
export {
  saveStage1DataToWallet,
  isStage1Completed,
  getStage1DataFromWallet
} from './stage1';

// Stage 2 - Sessão KYC completa
export {
  createStage2KYCSession,
  processStage2Verification,
  isStage2Completed
} from './stage2';

// Validações
export {
  validateStage1Data,
  validateDocumentFile,
  validateCPF,
  formatCPF,
  formatCEP
} from './validation';

// Utilitários
export {
  formatKYCSessionData,
  isSessionExpired,
  getTimeUntilExpiration,
  getKYCStatusDescription,
  getKYCStatusColor,
  getKYCStatusIcon,
  formatFileSize,
  generateUniqueFileName
} from './utils';
