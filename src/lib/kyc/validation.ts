/**
 * Validações para dados KYC
 * Centraliza todas as validações de formulários e arquivos
 */

import { KYCStage1Data, KYCResult } from '@/types/kyc';

/**
 * Valida dados da Etapa 1 do KYC
 */
export function validateStage1Data(data: KYCStage1Data): KYCResult<void> {
  const errors: string[] = [];

  // Validar campos obrigatórios
  if (!data.firstName?.trim()) {
    errors.push('Nome é obrigatório');
  }

  if (!data.lastName?.trim()) {
    errors.push('Sobrenome é obrigatório');
  }

  if (!data.birthDate) {
    errors.push('Data de nascimento é obrigatória');
  } else {
    // Validar formato da data
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(data.birthDate)) {
      errors.push('Data de nascimento deve estar no formato YYYY-MM-DD');
    }
  }

  if (!data.documentId?.trim()) {
    errors.push('CPF/Documento é obrigatório');
  }

  if (!data.email?.trim()) {
    errors.push('Email é obrigatório');
  } else {
    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push('Email deve ter um formato válido');
    }
  }

  if (!data.address?.trim()) {
    errors.push('Endereço é obrigatório');
  }

  if (!data.city?.trim()) {
    errors.push('Cidade é obrigatória');
  }

  if (!data.state?.trim()) {
    errors.push('Estado é obrigatório');
  }

  if (!data.postalCode?.trim()) {
    errors.push('CEP é obrigatório');
  }

  if (errors.length > 0) {
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: errors.join(', ')
      }
    };
  }

  return {
    success: true
  };
}

/**
 * Valida arquivo de documento
 */
export function validateDocumentFile(file: File): KYCResult<void> {
  const errors: string[] = [];

  // Validar tipo de arquivo
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (!allowedTypes.includes(file.type)) {
    errors.push('Arquivo deve ser uma imagem (JPEG, JPG ou PNG)');
  }

  // Validar tamanho (máximo 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    errors.push('Arquivo deve ter no máximo 5MB');
  }

  // Validar tamanho mínimo (mínimo 100KB)
  const minSize = 100 * 1024; // 100KB
  if (file.size < minSize) {
    errors.push('Arquivo deve ter no mínimo 100KB');
  }

  if (errors.length > 0) {
    return {
      success: false,
      error: {
        code: 'FILE_VALIDATION_ERROR',
        message: errors.join(', ')
      }
    };
  }

  return {
    success: true
  };
}

/**
 * Valida CPF brasileiro
 */
export function validateCPF(cpf: string): boolean {
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(9))) return false;
  
  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(10))) return false;
  
  return true;
}

/**
 * Formata CPF para exibição
 */
export function formatCPF(cpf: string): string {
  const cleanCPF = cpf.replace(/\D/g, '');
  return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Formata CEP para exibição
 */
export function formatCEP(cep: string): string {
  const cleanCEP = cep.replace(/\D/g, '');
  return cleanCEP.replace(/(\d{5})(\d{3})/, '$1-$2');
}
