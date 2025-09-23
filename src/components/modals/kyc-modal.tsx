"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  X, 
  Upload, 
  CheckCircle, 
  AlertCircle,
  User,
  FileText,
  Camera
} from "lucide-react";

interface KYCModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKYCComplete: (individualId: string) => void;
}

type KYCStatus = 'pending' | 'uploading' | 'verifying' | 'completed' | 'failed';

export function KYCModal({ isOpen, onClose, onKYCComplete }: KYCModalProps) {
  const [status, setStatus] = useState<KYCStatus>('pending');
  const [individualId, setIndividualId] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<{
    front?: File;
    back?: File;
  }>({});

  if (!isOpen) return null;

  const handleFileUpload = (type: 'front' | 'back', file: File) => {
    setUploadedFiles(prev => ({ ...prev, [type]: file }));
  };

  const handleSubmitKYC = async () => {
    if (!uploadedFiles.front) {
      alert('Por favor, faça upload do documento frente');
      return;
    }

    setStatus('uploading');
    
    // Simula upload e verificação
    await new Promise(resolve => setTimeout(resolve, 2000));
    setStatus('verifying');
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    setStatus('completed');
    
    // Simula individualId
    const mockIndividualId = `ind_${Date.now()}`;
    setIndividualId(mockIndividualId);
    
    setTimeout(() => {
      onKYCComplete(mockIndividualId);
      onClose();
    }, 2000);
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return <User className="h-6 w-6 text-blue-400" />;
      case 'uploading':
        return <Upload className="h-6 w-6 text-yellow-400 animate-pulse" />;
      case 'verifying':
        return <FileText className="h-6 w-6 text-orange-400 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-green-400" />;
      case 'failed':
        return <AlertCircle className="h-6 w-6 text-red-400" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'pending':
        return 'Aguardando upload de documentos';
      case 'uploading':
        return 'Enviando documentos...';
      case 'verifying':
        return 'Verificando identidade...';
      case 'completed':
        return 'KYC aprovado com sucesso!';
      case 'failed':
        return 'KYC rejeitado. Tente novamente.';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg glass-card border-white/20">
        <CardContent className="p-0">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white">
              Verificação de Identidade (KYC)
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-full p-2 transition-all duration-200"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Status */}
            <div className="text-center">
              <div className="flex justify-center mb-2">
                {getStatusIcon()}
              </div>
              <h3 className="text-white font-semibold text-base mb-1">
                {getStatusText()}
              </h3>
              {status === 'completed' && (
                <p className="text-slate-400 text-sm">
                  Individual ID: {individualId}
                </p>
              )}
            </div>

            {/* Document Upload */}
            {status === 'pending' && (
              <div className="space-y-3">
                <div className="p-3 bg-blue-600/20 rounded-lg border border-blue-500/30">
                  <div className="flex items-start">
                    <div className="p-2 bg-blue-500/20 rounded-lg mr-3 mt-1">
                      <FileText className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-white font-semibold mb-2">Documentos Aceitos</div>
                      <ul className="text-slate-300 text-sm space-y-1 list-disc list-inside">
                        <li>RG (frente e verso)</li>
                        <li>CNH (frente e verso)</li>
                        <li>Passaporte (página principal)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Front Document */}
                <div>
                  <label className="text-white font-medium mb-2 block text-sm">
                    Documento Frente *
                  </label>
                  <div className="border-2 border-dashed border-white/20 rounded-lg p-4 text-center hover:border-blue-500/50 transition-colors">
                    <Camera className="h-6 w-6 text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm mb-2">
                      {uploadedFiles.front ? uploadedFiles.front.name : 'Clique para fazer upload'}
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload('front', e.target.files[0])}
                      className="hidden"
                      id="front-upload"
                    />
                    <label
                      htmlFor="front-upload"
                      className="cursor-pointer text-blue-400 hover:text-blue-300 text-sm"
                    >
                      Selecionar arquivo
                    </label>
                  </div>
                </div>

                {/* Back Document (optional for passport) */}
                <div>
                  <label className="text-white font-medium mb-2 block text-sm">
                    Documento Verso (opcional)
                  </label>
                  <div className="border-2 border-dashed border-white/20 rounded-lg p-4 text-center hover:border-blue-500/50 transition-colors">
                    <Camera className="h-6 w-6 text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm mb-2">
                      {uploadedFiles.back ? uploadedFiles.back.name : 'Clique para fazer upload'}
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload('back', e.target.files[0])}
                      className="hidden"
                      id="back-upload"
                    />
                    <label
                      htmlFor="back-upload"
                      className="cursor-pointer text-blue-400 hover:text-blue-300 text-sm"
                    >
                      Selecionar arquivo
                    </label>
                  </div>
                </div>

                {/* Requirements */}
                <div className="p-3 bg-yellow-600/20 rounded-lg border border-yellow-500/30">
                  <div className="flex items-start">
                    <div className="p-2 bg-yellow-500/20 rounded-lg mr-3 mt-1">
                      <AlertCircle className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div>
                      <div className="text-white font-semibold mb-2">Requisitos</div>
                      <ul className="text-slate-300 text-sm space-y-1 list-disc list-inside">
                        <li>Documento deve estar legível e bem iluminado</li>
                        <li>Foto do documento original (não digitalizada)</li>
                        <li>Documento não pode estar expirado</li>
                        <li>Sem reflexos ou sombras</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1 border-slate-500/30 bg-slate-800/30 text-slate-200 hover:text-white hover:bg-slate-700/60 hover:border-slate-400/50 transition-all duration-200"
                onClick={onClose}
              >
                Cancelar
              </Button>
              {status === 'pending' && (
                <Button
                  className="flex-1 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700"
                  onClick={handleSubmitKYC}
                  disabled={!uploadedFiles.front}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Enviar para Verificação
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
