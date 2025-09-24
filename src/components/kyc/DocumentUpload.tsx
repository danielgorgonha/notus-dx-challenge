/**
 * Componente para upload de documentos KYC
 * Gerencia upload para S3 usando URLs pré-assinadas
 */

'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Camera,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { DocumentUploadData, UploadStatus } from '@/types/kyc';
import { validateDocumentFile } from '@/lib/kyc';

interface DocumentUploadProps {
  sessionId: string;
  documentType: 'front' | 'back';
  uploadUrl: string;
  uploadFields: Record<string, string>;
  onUpload: (uploadData: DocumentUploadData) => Promise<void>;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
  required?: boolean;
}

export function DocumentUpload({
  sessionId,
  documentType,
  uploadUrl,
  uploadFields,
  onUpload,
  onSuccess,
  onError,
  className = '',
  required = true
}: DocumentUploadProps) {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Função para obter título do documento
  const getDocumentTitle = () => {
    switch (documentType) {
      case 'front':
        return 'Frente do Documento';
      case 'back':
        return 'Verso do Documento';
      default:
        return 'Documento';
    }
  };

  // Função para obter descrição
  const getDocumentDescription = () => {
    switch (documentType) {
      case 'front':
        return 'Foto da frente do documento (com foto e dados pessoais)';
      case 'back':
        return 'Foto do verso do documento (quando aplicável)';
      default:
        return 'Foto do documento';
    }
  };

  // Função para obter ícone
  const getDocumentIcon = () => {
    switch (documentType) {
      case 'front':
        return <FileText className="h-8 w-8 text-blue-600" />;
      case 'back':
        return <FileText className="h-8 w-8 text-green-600" />;
      default:
        return <FileText className="h-8 w-8 text-gray-600" />;
    }
  };

  // Função para obter cor do status
  const getStatusColor = (status: UploadStatus) => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'uploading':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  // Função para obter ícone do status
  const getStatusIcon = (status: UploadStatus) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'uploading':
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />;
      default:
        return <Upload className="h-5 w-5 text-gray-600" />;
    }
  };

  // Função para lidar com seleção de arquivo
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar arquivo
    const validation = validateDocumentFile(file);
    if (!validation.success) {
      setError(validation.error?.message || 'Arquivo inválido');
      setUploadStatus('error');
      onError?.(validation.error?.message || 'Arquivo inválido');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setUploadStatus('idle');
  };

  // Função para fazer upload
  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploadStatus('uploading');
    setUploadProgress(0);
    setError(null);

    try {
      // Simular progresso
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Preparar dados de upload
      const uploadData: DocumentUploadData = {
        sessionId,
        documentType,
        file: selectedFile,
        uploadUrl,
        fields: uploadFields
      };

      // Fazer upload
      await onUpload(uploadData);

      // Completar progresso
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadStatus('success');
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro no upload';
      setError(errorMessage);
      setUploadStatus('error');
      onError?.(errorMessage);
    }
  };

  // Função para limpar arquivo
  const handleClearFile = () => {
    setSelectedFile(null);
    setUploadStatus('idle');
    setUploadProgress(0);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Função para abrir seletor de arquivo
  const handleSelectFile = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getDocumentIcon()}
          {getDocumentTitle()}
          {required && <span className="text-red-500">*</span>}
        </CardTitle>
        <p className="text-sm text-gray-600">
          {getDocumentDescription()}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status do Upload */}
        {uploadStatus !== 'idle' && (
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            {getStatusIcon(uploadStatus)}
            <span className={`font-medium ${getStatusColor(uploadStatus)}`}>
              {uploadStatus === 'success' && 'Upload concluído com sucesso!'}
              {uploadStatus === 'error' && 'Erro no upload'}
              {uploadStatus === 'uploading' && 'Fazendo upload...'}
            </span>
          </div>
        )}

        {/* Progresso do Upload */}
        {uploadStatus === 'uploading' && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso do upload</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        {/* Erro */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Arquivo Selecionado */}
        {selectedFile && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">{selectedFile.name}</span>
                <span className="text-xs text-gray-500">
                  ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFile}
                disabled={uploadStatus === 'uploading'}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Input de Arquivo (Hidden) */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Botões de Ação */}
        <div className="flex gap-2">
          {!selectedFile ? (
            <Button
              onClick={handleSelectFile}
              variant="outline"
              className="flex-1"
              disabled={uploadStatus === 'uploading'}
            >
              <Upload className="h-4 w-4 mr-2" />
              Selecionar Arquivo
            </Button>
          ) : (
            <>
              <Button
                onClick={handleSelectFile}
                variant="outline"
                disabled={uploadStatus === 'uploading'}
              >
                <Camera className="h-4 w-4 mr-2" />
                Trocar Arquivo
              </Button>
              <Button
                onClick={handleUpload}
                disabled={uploadStatus === 'uploading' || uploadStatus === 'success'}
                className="flex-1"
              >
                {uploadStatus === 'uploading' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Fazer Upload
                  </>
                )}
              </Button>
            </>
          )}
        </div>

        {/* Instruções */}
        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>Formatos aceitos:</strong> JPEG, JPG, PNG</p>
          <p><strong>Tamanho máximo:</strong> 5MB</p>
          <p><strong>Tamanho mínimo:</strong> 100KB</p>
          <p><strong>Dica:</strong> Certifique-se de que o documento está bem iluminado e legível</p>
        </div>
      </CardContent>
    </Card>
  );
}
