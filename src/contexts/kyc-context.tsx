"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface KYCContextType {
  // Fases do KYC
  kycPhase0Completed: boolean; // Email verificado
  kycPhase1Completed: boolean; // Dados pessoais completados
  kycPhase2Completed: boolean; // Documentos enviados
  
  // Funções para atualizar status
  setKycPhase0Completed: (completed: boolean) => void;
  setKycPhase1Completed: (completed: boolean) => void;
  setKycPhase2Completed: (completed: boolean) => void;
  
  // Funções para completar fases
  completePhase0: () => void;
  completePhase1: () => void;
  completePhase2: () => void;
  
  // Status derivados
  canDeposit: boolean;
  currentLevel: number;
}

const KYCContext = createContext<KYCContextType | undefined>(undefined);

export function KYCProvider({ children }: { children: ReactNode }) {
  // Estados simulados - em produção viriam da API
  const [kycPhase0Completed, setKycPhase0Completed] = useState(true); // Email verificado
  const [kycPhase1Completed, setKycPhase1Completed] = useState(false); // Dados pessoais não completados
  const [kycPhase2Completed, setKycPhase2Completed] = useState(false); // Documentos não enviados

  // Status derivados
  const canDeposit = kycPhase0Completed && kycPhase1Completed;
  
  const currentLevel = kycPhase2Completed ? 2 : kycPhase1Completed ? 1 : 0;

  // Funções para completar fases
  const completePhase0 = () => setKycPhase0Completed(true);
  const completePhase1 = () => setKycPhase1Completed(true);
  const completePhase2 = () => setKycPhase2Completed(true);

  return (
    <KYCContext.Provider
      value={{
        kycPhase0Completed,
        kycPhase1Completed,
        kycPhase2Completed,
        setKycPhase0Completed,
        setKycPhase1Completed,
        setKycPhase2Completed,
        completePhase0,
        completePhase1,
        completePhase2,
        canDeposit,
        currentLevel,
      }}
    >
      {children}
    </KYCContext.Provider>
  );
}

export function useKYC() {
  const context = useContext(KYCContext);
  if (context === undefined) {
    throw new Error("useKYC must be used within a KYCProvider");
  }
  return context;
}
