/**
 * Exemplo de uso do KYCManager
 * Demonstra como integrar o sistema KYC em uma aplicação
 */

'use client';

import React, { useState } from 'react';
import { KYCManager } from '@/components/kyc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wallet, User } from 'lucide-react';

export function KYCExample() {
  const [walletAddress, setWalletAddress] = useState('');
  const [showKYC, setShowKYC] = useState(false);

  const handleStartKYC = () => {
    if (!walletAddress.trim()) {
      alert('Por favor, insira um endereço de wallet válido');
      return;
    }
    setShowKYC(true);
  };

  const handleReset = () => {
    setShowKYC(false);
    setWalletAddress('');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Exemplo de Integração KYC
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <AlertDescription>
              Este é um exemplo de como usar o sistema KYC integrado com wallets.
              Insira um endereço de wallet para começar.
            </AlertDescription>
          </Alert>

          {!showKYC ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="walletAddress">Endereço da Wallet</Label>
                <Input
                  id="walletAddress"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="0x..."
                  className="font-mono"
                />
              </div>
              
              <Button onClick={handleStartKYC} className="w-full">
                <Wallet className="h-4 w-4 mr-2" />
                Iniciar Verificação KYC
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Wallet:</span>
                  <span className="font-mono text-sm">{walletAddress}</span>
                </div>
                <Button onClick={handleReset} variant="outline" size="sm">
                  Trocar Wallet
                </Button>
              </div>

              <KYCManager walletAddress={walletAddress} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instruções de Uso */}
      <Card>
        <CardHeader>
          <CardTitle>Como Usar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">1. Etapa 0 - Cadastro Inicial</h4>
            <p className="text-sm text-gray-600">
              Usuário acessa "Get Started" e cadastra email. Conta criada no sistema.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">2. Etapa 1 - Dados Pessoais (Limite: R$ 2.000,00)</h4>
            <p className="text-sm text-gray-600">
              Preencher nome completo, data de nascimento, CPF e nacionalidade.
              Libera limite de até R$ 2.000,00 para movimentação.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">3. Etapa 2 - Documentação + Liveness (Limite: R$ 50.000,00)</h4>
            <p className="text-sm text-gray-600">
              Enviar documentos (RG, CNH ou Passaporte) e fazer verificação de liveness.
              Libera limite de até R$ 50.000,00 para movimentação.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Funcionalidades Implementadas</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✅ Vinculação de sessionId à wallet via metadados</li>
              <li>✅ Rastreamento de progresso KYC em tempo real</li>
              <li>✅ Consulta de status da sessão KYC</li>
              <li>✅ Upload de documentos com URLs S3 pré-assinadas</li>
              <li>✅ Atualização de limites baseado na etapa completada</li>
              <li>✅ Interface intuitiva para acompanhar o processo</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
