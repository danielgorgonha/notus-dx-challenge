/**
 * Feature Flags Configuration
 * 
 * This file contains feature flags to enable/disable functionality during development.
 * In production, these should be managed through environment variables or a feature flag service.
 */

export const FEATURE_FLAGS = {
  // KYC Integration - DESABILITADO para continuar desenvolvimento
  ENABLE_KYC_INTEGRATION: false,
  
  // Deposit with KYC validation - DESABILITADO para continuar desenvolvimento
  ENABLE_DEPOSIT_KYC_VALIDATION: false,
  
  // Real Notus API calls - MANTIDO para outras funcionalidades
  ENABLE_REAL_NOTUS_API: process.env.NODE_ENV === 'development' ? true : false,
  
  // Mock data fallback - MANTIDO para desenvolvimento
  ENABLE_MOCK_DATA_FALLBACK: process.env.NODE_ENV === 'development' ? true : false,
  
  // Debug mode - MANTIDO para desenvolvimento
  ENABLE_DEBUG_LOGS: process.env.NODE_ENV === 'development' ? true : false,
} as const;

/**
 * Helper function to check if a feature flag is enabled
 */
export function isFeatureEnabled(flag: keyof typeof FEATURE_FLAGS): boolean {
  return FEATURE_FLAGS[flag];
}

/**
 * Helper function to get all feature flags (useful for debugging)
 */
export function getAllFeatureFlags() {
  return FEATURE_FLAGS;
}
