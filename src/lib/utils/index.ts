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
 * Formata valor monetário em BRL
 */
export function formatCurrency(value: number | string): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
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
