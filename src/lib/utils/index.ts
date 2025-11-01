/**
 * Utilitários gerais
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina classes CSS com Tailwind
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formata valor monetário
 * @param value - Valor numérico ou string
 * @param currency - Código da moeda ('BRL' ou 'USD')
 * @param locale - Localização ('pt-BR' ou 'en-US')
 */
export function formatCurrency(
  value: number | string, 
  currency: 'BRL' | 'USD' = 'BRL',
  locale?: string
): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  const localeValue = locale || (currency === 'BRL' ? 'pt-BR' : 'en-US');
  
  return new Intl.NumberFormat(localeValue, {
    style: 'currency',
    currency: currency
  }).format(numValue);
}

/**
 * Formata número com separadores
 */
export function formatNumber(value: number | string): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR').format(numValue);
}

/**
 * Formata data para exibição
 */
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj);
}

/**
 * Formata data apenas (sem hora)
 */
export function formatDateOnly(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(dateObj);
}

/**
 * Gera ID único
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Verifica se é um objeto vazio
 */
export function isEmpty(obj: Record<string, unknown>): boolean {
  return Object.keys(obj).length === 0;
}

/**
 * Remove propriedades undefined de um objeto
 */
export function removeUndefined<T extends Record<string, unknown>>(obj: T): T {
  const result = {} as T;
  for (const key in obj) {
    if (obj[key] !== undefined) {
      result[key] = obj[key];
    }
  }
  return result;
}

/**
 * Gera URL do explorer da blockchain baseado no chainId
 */
export function getExplorerUrl(address: string, chainId?: number): string | null {
  if (!address) return null;
  
  const chainIdNum = chainId || 137; // Default: Polygon
  const explorers: Record<number, string> = {
    1: 'https://etherscan.io',
    137: 'https://polygonscan.com',
    42161: 'https://arbiscan.io',
    43114: 'https://snowtrace.io',
    8453: 'https://basescan.org',
    10: 'https://optimistic.etherscan.io',
    56: 'https://bscscan.com',
    100: 'https://gnosisscan.io',
  };
  
  const baseUrl = explorers[chainIdNum] || 'https://polygonscan.com';
  return `${baseUrl}/address/${address}`;
}

/**
 * Formata balance de token considerando decimais
 * @param balance - Balance em wei (string)
 * @param decimals - Número de decimais do token (padrão: 18)
 * @param options - Opções de formatação
 */
export function formatTokenBalance(
  balance: string, 
  decimals: number = 18,
  options?: {
    showHidden?: boolean; // Se true, retorna '••••' quando balance está oculto
    formatLocale?: string; // 'pt-BR' ou 'en-US'
    minDecimals?: number;
    maxDecimals?: number;
  }
): string {
  if (options?.showHidden) return '••••';
  
  if (!balance || balance === '0') return '0';
  
  const num = parseFloat(balance) / Math.pow(10, decimals);
  if (num === 0) return '0';
  
  // Se especificados minDecimals/maxDecimals, usar Intl.NumberFormat
  if (options?.minDecimals !== undefined || options?.maxDecimals !== undefined) {
    const locale = options.formatLocale || 'pt-BR';
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: options.minDecimals ?? 2,
      maximumFractionDigits: options.maxDecimals ?? 6,
    }).format(num);
  }
  
  // Formatação padrão baseada em valor
  if (num < 0.0001) return num.toFixed(8).replace(/\.?0+$/, '');
  if (num < 1) return num.toFixed(6).replace(/\.?0+$/, '');
  return num.toFixed(2).replace(/\.?0+$/, '');
}
