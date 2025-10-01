/**
 * Validação de Dados Pessoais - Nível 1 KYC
 * Validações básicas para CPF, idade, nome e nacionalidade
 */

/**
 * Valida CPF usando algoritmo de dígitos verificadores
 */
export function validateCPF(cpf: string): boolean {
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais (CPF inválido)
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  // Calcula primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = sum % 11;
  let firstDigit = remainder < 2 ? 0 : 11 - remainder;
  
  if (parseInt(cleanCPF.charAt(9)) !== firstDigit) return false;
  
  // Calcula segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = sum % 11;
  let secondDigit = remainder < 2 ? 0 : 11 - remainder;
  
  return parseInt(cleanCPF.charAt(10)) === secondDigit;
}

/**
 * Valida se a data de nascimento indica idade mínima de 18 anos
 */
export function validateAge(birthDate: string): boolean {
  const today = new Date();
  const birth = new Date(birthDate.split('/').reverse().join('-'));
  
  // Calcula idade
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age >= 18;
}

/**
 * Valida se o nome completo tem pelo menos 2 palavras
 */
export function validateFullName(fullName: string): boolean {
  const trimmedName = fullName.trim();
  const words = trimmedName.split(/\s+/);
  
  return words.length >= 2 && words.every(word => word.length > 0);
}

/**
 * Valida se a nacionalidade é válida
 */
export function validateNationality(nationality: string): boolean {
  const validNationalities = [
    'Brasil', 'Argentina', 'Chile', 'Colômbia', 'Peru', 'Uruguai',
    'Paraguai', 'Bolívia', 'Venezuela', 'Equador', 'Guiana', 'Suriname'
  ];
  
  return validNationalities.includes(nationality);
}

/**
 * Valida todos os dados pessoais do Nível 1
 */
export function validateLevel1Data(data: {
  fullName: string;
  birthDate: string;
  cpf: string;
  nationality: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validar nome completo
  if (!validateFullName(data.fullName)) {
    errors.push('Nome completo deve ter pelo menos 2 palavras');
  }
  
  // Validar data de nascimento
  if (!validateAge(data.birthDate)) {
    errors.push('Você deve ter pelo menos 18 anos para usar o serviço');
  }
  
  // Validar CPF
  if (!validateCPF(data.cpf)) {
    errors.push('CPF inválido');
  }
  
  // Validar nacionalidade
  if (!validateNationality(data.nationality)) {
    errors.push('Nacionalidade não suportada');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Formata CPF para exibição
 */
export function formatCPF(cpf: string): string {
  const numbers = cpf.replace(/\D/g, '');
  return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Formata data para exibição
 */
export function formatDate(date: string): string {
  const numbers = date.replace(/\D/g, '');
  return numbers.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3');
}
