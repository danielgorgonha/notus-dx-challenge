/**
 * Componente para exibir status KYC da wallet
 * Mostra etapa atual, limite disponível e sessão ativa
 */

'use client';

import React from 'react';
import { useKYCManager } from '@/hooks/useKYCManager';
import { KYC_STATUS_COLORS, KYC_SESSION_STATUS_COLORS } from '@/types/kyc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  XCircle, 
  RefreshCw,
  User,
  FileText,
  Camera,
  DollarSign
} from 'lucide-react';

interface KYCStatusCardProps {
  walletAddress: string;
  onStartKYC?: () => void;
  onCheckStatus?: () => void;
  className?: string;
}

export function KYCStatusCard({ 
  walletAddress, 
  onStartKYC, 
  onCheckStatus,
  className = '' 
}: KYCStatusCardProps) {
  const {
    kycMetadata,
    isLoading,
    error,
    checkSessionStatus,
    getCurrentLimit,
    getCurrentStage,
    canProceedToNextStage,
    isSessionActive,
    getActiveSessionId
  } = useKYCManager(walletAddress);

  // Função para obter ícone baseado no status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'IN_PROGRESS':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'FAILED':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  // Função para obter cor do badge
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'default' as const;
      case 'IN_PROGRESS':
        return 'secondary' as const;
      case 'FAILED':
        return 'destructive' as const;
      default:
        return 'outline' as const;
    }
  };

  // Função para formatar limite
  const formatLimit = (limit: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(limit);
  };

  // Função para obter descrição da etapa
  const getStageDescription = (stage: string) => {
    switch (stage) {
      case '0':
        return 'KYC não iniciado';
      case '1':
        return 'Etapa 1 - Dados pessoais completados';
      case '2':
        return 'Etapa 2 - Documentação + Liveness completados';
      default:
        return 'Status desconhecido';
    }
  };

  // Função para obter progresso
  const getProgress = () => {
    const stage = getCurrentStage();
    switch (stage) {
      case '0':
        return 0;
      case '1':
        return 50;
      case '2':
        return 100;
      default:
        return 0;
    }
  };

  // Função para verificar status da sessão ativa
  const handleCheckStatus = async () => {
    const sessionId = getActiveSessionId();
    if (sessionId) {
      await checkSessionStatus(sessionId);
      onCheckStatus?.();
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            Carregando Status KYC...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            Erro ao Carregar KYC
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 mb-4">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline" 
            size="sm"
          >
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!kycMetadata) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Status KYC
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Nenhum dado KYC encontrado para esta wallet.
          </p>
          <Button onClick={onStartKYC} className="w-full">
            Iniciar Verificação KYC
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentStage = getCurrentStage();
  const currentLimit = getCurrentLimit();
  const progress = getProgress();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(kycMetadata.kycStatus)}
            Status KYC
          </div>
          <Badge variant={getStatusBadgeVariant(kycMetadata.kycStatus)}>
            {kycMetadata.kycStatus}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Progresso Geral */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progresso KYC</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-gray-600">
            {getStageDescription(currentStage)}
          </p>
        </div>

        {/* Limite Atual */}
        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <span className="font-medium">Limite Atual</span>
          </div>
          <span className="text-2xl font-bold text-green-600">
            {formatLimit(currentLimit)}
          </span>
        </div>

        {/* Detalhes da Etapa */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Detalhes da Etapa
          </h4>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Etapa Atual:</span>
              <div className="font-medium">{currentStage}</div>
            </div>
            <div>
              <span className="text-gray-600">Próxima Etapa:</span>
              <div className="font-medium">
                {currentStage === '0' ? 'Etapa 1' : 
                 currentStage === '1' ? 'Etapa 2' : 
                 'Completo'}
              </div>
            </div>
          </div>
        </div>

        {/* Sessão Ativa */}
        {isSessionActive() && kycMetadata.activeKYCSession && (
          <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Sessão KYC Ativa
            </h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">ID da Sessão:</span>
                <span className="font-mono text-xs">
                  {kycMetadata.activeKYCSession.sessionId.slice(0, 8)}...
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <Badge 
                  variant="outline" 
                  className={KYC_SESSION_STATUS_COLORS[kycMetadata.activeKYCSession.status]}
                >
                  {kycMetadata.activeKYCSession.status}
                </Badge>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Etapa:</span>
                <span>{kycMetadata.activeKYCSession.stage}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Expira em:</span>
                <span>
                  {new Date(kycMetadata.activeKYCSession.expiresAt).toLocaleString('pt-BR')}
                </span>
              </div>
            </div>
            
            <Button 
              onClick={handleCheckStatus}
              variant="outline" 
              size="sm" 
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Verificar Status
            </Button>
          </div>
        )}

        {/* Histórico de Sessões */}
        {kycMetadata.kycSessions && kycMetadata.kycSessions.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Histórico de Sessões
            </h4>
            
            <div className="space-y-2">
              {kycMetadata.kycSessions.map((session, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    {session.status === 'COMPLETED' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="text-sm font-medium">{session.stage}</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    {new Date(session.completedAt).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ações */}
        <div className="space-y-2">
          {currentStage === '0' && (
            <Button onClick={onStartKYC} className="w-full">
              <User className="h-4 w-4 mr-2" />
              Iniciar Verificação KYC
            </Button>
          )}
          
          {currentStage === '1' && canProceedToNextStage() && (
            <Button onClick={onStartKYC} className="w-full">
              <Camera className="h-4 w-4 mr-2" />
              Completar Etapa 2 - Documentação
            </Button>
          )}
          
          {currentStage === '2' && (
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-green-600 font-medium">
                KYC Completo! Limite máximo liberado.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
