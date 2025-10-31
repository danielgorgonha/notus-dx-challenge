/**
 * Hook para gerenciar dados KYC da wallet
 * Permite consultar e atualizar dados de verificação
 */

import { useState, useEffect, useCallback } from 'react';
import { useSmartWallet } from './use-smart-wallet';
import { walletActions } from '@/lib/actions/wallet-compat';

export interface KYCData {
  fullName: string;
  birthDate: string;
  cpf: string;
  nationality: string;
  completedAt: string;
  kycLevel: number;
  limits: {
    monthlyDeposit: number;
    monthlyWithdrawal: number;
    features: {
      transfers: boolean;
      receipts: boolean;
      pix: boolean;
      onRamp: boolean;
      offRamp: boolean;
    };
  };
}

export interface UseKYCDataReturn {
  kycData: KYCData | null;
  isLoading: boolean;
  error: string | null;
  canTransfer: boolean;
  canReceive: boolean;
  canUsePix: boolean;
  canDeposit: boolean;
  canWithdraw: boolean;
  monthlyLimit: number;
  updateKYCData: (data: Partial<KYCData>) => Promise<void>;
  refreshKYCData: () => Promise<void>;
}

export function useKYCData(): UseKYCDataReturn {
  const { wallet } = useSmartWallet();
  const [kycData, setKycData] = useState<KYCData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar dados KYC da wallet
  const loadKYCData = useCallback(async () => {
    if (!wallet?.accountAbstraction) {
      setKycData(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // TODO: Implementar endpoint para buscar metadados da wallet
      // const response = await clientWalletActions.getMetadata(wallet.accountAbstraction);
      // const kycDataString = response.kycData;
      // if (kycDataString) {
      //   setKycData(JSON.parse(kycDataString));
      // } else {
      //   setKycData(null);
      // }
      
      // Por enquanto, simular dados vazios
      setKycData(null);
    } catch (err) {
      console.error('Erro ao carregar dados KYC:', err);
      setError('Falha ao carregar dados de verificação');
    } finally {
      setIsLoading(false);
    }
  }, [wallet?.accountAbstraction]);

  // Atualizar dados KYC
  const updateKYCData = useCallback(async (data: Partial<KYCData>) => {
    if (!wallet?.accountAbstraction) {
      throw new Error('Endereço da wallet não encontrado');
    }

    setIsLoading(true);
    setError(null);

    try {
      // A API Notus espera metadados como strings, não objetos
      await walletActions.updateMetadata(wallet.accountAbstraction, {
        kycData: JSON.stringify(data) // Serializar para string
      });
      
      setKycData(prev => prev ? { ...prev, ...data } : null);
    } catch (err) {
      console.error('Erro ao atualizar dados KYC:', err);
      setError('Falha ao salvar dados de verificação');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [wallet?.accountAbstraction]);

  // Recarregar dados KYC
  const refreshKYCData = useCallback(async () => {
    await loadKYCData();
  }, [loadKYCData]);

  // Carregar dados quando a wallet mudar
  useEffect(() => {
    loadKYCData();
  }, [loadKYCData]);

  // Status derivados
  const canTransfer = kycData?.limits.features.transfers || false;
  const canReceive = kycData?.limits.features.receipts || false;
  const canUsePix = kycData?.limits.features.pix || false;
  const canDeposit = kycData?.limits.features.onRamp || false;
  const canWithdraw = kycData?.limits.features.offRamp || false;
  const monthlyLimit = kycData?.limits.monthlyDeposit || 0;

  return {
    kycData,
    isLoading,
    error,
    canTransfer,
    canReceive,
    canUsePix,
    canDeposit,
    canWithdraw,
    monthlyLimit,
    updateKYCData,
    refreshKYCData,
  };
}
