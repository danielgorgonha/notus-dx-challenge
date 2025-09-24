/**
 * Exemplo atualizado de uso do KYC Manager
 * Demonstra o fluxo correto: Stage 1 (dados) + Stage 2 (sessão KYC)
 */

'use client';

import React from 'react';
import { KYCManager } from '@/components/kyc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, CheckCircle } from 'lucide-react';

interface KYCExampleUpdatedProps {
  walletAddress: string;
}

export function KYCExampleUpdated({ walletAddress }: KYCExampleUpdatedProps) {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Informações sobre o novo fluxo */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Novo Fluxo KYC Implementado:</strong>
          <br />
          • <strong>Etapa 1:</strong> Salva dados do formulário na wallet metadata (limite R$ 2.000)
          <br />
          • <strong>Etapa 2:</strong> Cria sessão KYC completa com documentos + liveness (limite R$ 50.000)
          <br />
          • <strong>PIX/On-Ramp:</strong> Requer Etapa 2 completa (individualId)
        </AlertDescription>
      </Alert>

      {/* Status do Fluxo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Fluxo KYC Atualizado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Etapa 1 - Dados Pessoais</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Coleta dados do formulário</li>
                  <li>• Salva na wallet metadata</li>
                  <li>• <strong>NÃO</strong> cria sessão KYC</li>
                  <li>• Libera limite: R$ 2.000</li>
                </ul>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-medium text-green-900 mb-2">Etapa 2 - Documentação</h3>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Cria sessão KYC completa</li>
                  <li>• Upload de documentos</li>
                  <li>• Verificação de liveness</li>
                  <li>• Libera limite: R$ 50.000</li>
                  <li>• Habilita PIX/On-Ramp</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KYC Manager */}
      <KYCManager walletAddress={walletAddress} />
    </div>
  );
}
