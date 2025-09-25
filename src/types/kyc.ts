/**
 * Tipos TypeScript para integração KYC + Wallet
 * Gerencia sessões KYC vinculadas à wallet do usuário
 */

// Status do KYC
export type KYCStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";

// Etapas do KYC
export type KYCStage = "0" | "1" | "2";

// Status da sessão KYC
export type KYCSessionStatus = "PENDING" | "VERIFYING" | "COMPLETED" | "FAILED" | "EXPIRED";

// Categorias de documentos aceitos
export type DocumentCategory = "PASSPORT" | "DRIVERS_LICENSE" | "IDENTITY_CARD";

// Países suportados
export type DocumentCountry = "BRAZIL" | "UNITED_STATES" | "ARGENTINA" | "MEXICO" | "COLOMBIA";

// Nacionalidades suportadas
export type Nationality = "BRAZILIAN" | "AMERICAN" | "ARGENTINEAN" | "MEXICAN" | "COLOMBIAN";

// Dados da Etapa 1 do KYC
export interface KYCStage1Data {
  firstName: string;
  lastName: string;
  birthDate: string; // YYYY-MM-DD
  documentCategory: DocumentCategory;
  documentCountry: DocumentCountry;
  documentId: string; // CPF, Passport Number, etc.
  nationality: Nationality;
  email: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
}

// Dados da Etapa 2 do KYC
export interface KYCStage2Data {
  documentType: DocumentCategory;
  documentCountry: DocumentCountry;
  individualId?: string; // Retornado pela API quando COMPLETED
  livenessVerified: boolean;
  documentUploaded: boolean;
}

// Sessão KYC ativa
export interface ActiveKYCSession {
  sessionId: string;
  stage: "STAGE_1" | "STAGE_2";
  createdAt: string;
  expiresAt: string;
  status: KYCSessionStatus;
  stage1Data?: KYCStage1Data;
  stage2Data?: KYCStage2Data;
}

// Histórico de sessões KYC
export interface KYCSessionHistory {
  sessionId: string;
  stage: "STAGE_1" | "STAGE_2";
  status: "COMPLETED" | "FAILED";
  completedAt: string;
  individualId?: string;
  stage1Data?: KYCStage1Data;
  stage2Data?: KYCStage2Data;
}

// Limites baseados no KYC
export interface KYCLimits {
  currentLimit: number;
  maxLimit: number;
  currency: "BRL";
  stage: KYCStage;
  stageDescription: string;
}

// Metadados KYC da wallet
export interface WalletKYCMetadata {
  // Status atual do KYC
  kycStatus: KYCStatus;
  
  // Sessão KYC ativa (se houver)
  activeKYCSession?: ActiveKYCSession;
  
  // Histórico de sessões KYC
  kycSessions: KYCSessionHistory[];
  
  // Limites baseados no KYC
  kycLimits: KYCLimits;
  
  // Dados completos do usuário (quando KYC completado)
  userData?: {
    stage1Data: KYCStage1Data;
    stage2Data?: KYCStage2Data;
    individualId: string;
    completedAt: string;
  };
}

// Dados para criar sessão KYC
export interface CreateKYCSessionData {
  stage: "STAGE_1" | "STAGE_2";
  stage1Data?: KYCStage1Data;
  livenessRequired?: boolean;
}

// Resposta da API ao criar sessão KYC
export interface KYCSessionResponse {
  session: {
    id: string;
    individualId?: string;
    status: KYCSessionStatus;
    livenessRequired: boolean;
    firstName?: string;
    lastName?: string;
    birthDate?: string;
    document?: {
      id: string;
      type: string;
      category: string;
    };
    createdAt: string;
    updatedAt?: string;
  };
  backDocument?: {
    url: string;
    fields: Record<string, string>;
  };
  frontDocument?: {
    url: string;
    fields: Record<string, string>;
  };
}

// Dados para upload de documentos
export interface DocumentUploadData {
  sessionId: string;
  documentType: "front" | "back";
  file: File;
  uploadUrl: string;
  fields: Record<string, string>;
}

// Status de upload
export type UploadStatus = "idle" | "uploading" | "success" | "error";

// Erro de KYC
export interface KYCError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Resultado de operação KYC
export interface KYCResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: KYCError;
}

// Configuração de limites por etapa
export const KYC_LIMITS_CONFIG = {
  STAGE_0: {
    currentLimit: 0,
    maxLimit: 0,
    stage: "0" as KYCStage,
    stageDescription: "KYC não iniciado"
  },
  STAGE_1: {
    currentLimit: 2000,
    maxLimit: 2000,
    stage: "1" as KYCStage,
    stageDescription: "Etapa 1 completada - Dados pessoais"
  },
  STAGE_2: {
    currentLimit: 50000,
    maxLimit: 50000,
    stage: "2" as KYCStage,
    stageDescription: "Etapa 2 completada - Documentação + Liveness"
  }
} as const;

// Mapeamento de status para cores
export const KYC_STATUS_COLORS = {
  NOT_STARTED: "text-gray-600",
  IN_PROGRESS: "text-yellow-600",
  COMPLETED: "text-green-600",
  FAILED: "text-red-600"
} as const;

// Mapeamento de status de sessão para cores
export const KYC_SESSION_STATUS_COLORS = {
  PENDING: "text-yellow-600",
  VERIFYING: "text-blue-600",
  COMPLETED: "text-green-600",
  FAILED: "text-red-600",
  EXPIRED: "text-gray-600"
} as const;
