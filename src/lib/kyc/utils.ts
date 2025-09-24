/**
 * Utilitários para KYC
 * Funções auxiliares para formatação e manipulação de dados KYC
 */

/**
 * Formata dados para exibição
 */
export function formatKYCSessionData(session: any) {
  return {
    id: session.id,
    status: session.status,
    individualId: session.individualId,
    createdAt: new Date(session.createdAt).toLocaleString('pt-BR'),
    updatedAt: session.updatedAt ? new Date(session.updatedAt).toLocaleString('pt-BR') : null,
    livenessRequired: session.livenessRequired,
    document: session.document ? {
      id: session.document.id,
      type: session.document.type,
      category: session.document.category
    } : null
  };
}

/**
 * Verifica se uma sessão expirou
 */
export function isSessionExpired(expiresAt: string): boolean {
  return new Date(expiresAt) < new Date();
}

/**
 * Calcula tempo restante para expiração
 */
export function getTimeUntilExpiration(expiresAt: string): string {
  const now = new Date();
  const expiration = new Date(expiresAt);
  const diff = expiration.getTime() - now.getTime();

  if (diff <= 0) {
    return 'Expirado';
  }

  const minutes = Math.floor(diff / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }

  return `${seconds}s`;
}

/**
 * Obtém a descrição do status KYC
 */
export function getKYCStatusDescription(status: string): string {
  const descriptions = {
    'NOT_STARTED': 'KYC não iniciado',
    'IN_PROGRESS': 'KYC em andamento',
    'COMPLETED': 'KYC completado',
    'FAILED': 'KYC falhou',
    'PENDING': 'Aguardando processamento',
    'VERIFYING': 'Verificando documentos',
    'EXPIRED': 'Sessão expirada'
  };

  return descriptions[status as keyof typeof descriptions] || status;
}

/**
 * Obtém a cor do status KYC
 */
export function getKYCStatusColor(status: string): string {
  const colors = {
    'NOT_STARTED': 'text-gray-600',
    'IN_PROGRESS': 'text-yellow-600',
    'COMPLETED': 'text-green-600',
    'FAILED': 'text-red-600',
    'PENDING': 'text-yellow-600',
    'VERIFYING': 'text-blue-600',
    'EXPIRED': 'text-gray-600'
  };

  return colors[status as keyof typeof colors] || 'text-gray-600';
}

/**
 * Obtém o ícone do status KYC
 */
export function getKYCStatusIcon(status: string): string {
  const icons = {
    'NOT_STARTED': 'circle',
    'IN_PROGRESS': 'clock',
    'COMPLETED': 'check-circle',
    'FAILED': 'x-circle',
    'PENDING': 'clock',
    'VERIFYING': 'loader',
    'EXPIRED': 'clock'
  };

  return icons[status as keyof typeof icons] || 'circle';
}

/**
 * Converte bytes para formato legível
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Gera nome único para arquivo
 */
export function generateUniqueFileName(originalName: string, sessionId: string): string {
  const timestamp = Date.now();
  const extension = originalName.split('.').pop();
  return `kyc-${sessionId}-${timestamp}.${extension}`;
}
