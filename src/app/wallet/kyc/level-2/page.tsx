"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, FileText, Camera, Upload, CheckCircle, Shield } from "lucide-react";
import { useKYC } from "@/contexts/kyc-context";
import { useToast } from "@/hooks/use-toast";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function KYCLevel2Page() {
  const router = useRouter();
  const { completePhase2 } = useKYC();
  const { success, error } = useToast();
  
  const [selectedDocument, setSelectedDocument] = useState("");
  const [frontDocumentUploaded, setFrontDocumentUploaded] = useState(false);
  const [backDocumentUploaded, setBackDocumentUploaded] = useState(false);
  const [facialVerificationCompleted, setFacialVerificationCompleted] = useState(false);
  const [loading, setLoading] = useState(false);

  const documentTypes = [
    { value: "cnh", label: "CNH (Carteira Nacional de Habilitação)", description: "Documento mais comum e aceito" },
    { value: "rg", label: "RG (Registro Geral)", description: "Documento de identidade nacional" },
    { value: "passport", label: "Passaporte", description: "Documento internacional" }
  ];

  const handleDocumentUpload = (type: 'front' | 'back') => {
    // Simular upload de documento
    if (type === 'front') {
      setFrontDocumentUploaded(true);
      success('Sucesso!', 'Frente do documento enviada com sucesso');
    } else {
      setBackDocumentUploaded(true);
      success('Sucesso!', 'Verso do documento enviado com sucesso');
    }
  };

  const handleFacialVerification = () => {
    // Simular verificação facial
    setFacialVerificationCompleted(true);
    success('Sucesso!', 'Verificação facial concluída com sucesso');
  };

  const handleSubmit = async () => {
    if (!selectedDocument) {
      error('Erro', 'Selecione um tipo de documento');
      return;
    }
    if (!frontDocumentUploaded) {
      error('Erro', 'Envie a frente do documento');
      return;
    }
    if (!backDocumentUploaded) {
      error('Erro', 'Envie o verso do documento');
      return;
    }
    if (!facialVerificationCompleted) {
      error('Erro', 'Complete a verificação facial');
      return;
    }
    
    setLoading(true);
    
    try {
      // Simular processamento
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Completar fase 2
      completePhase2();
      
      success('Sucesso!', 'Verificação de documentos concluída com sucesso');
      
      // Redirecionar para página de sucesso
      router.push('/wallet/kyc/level-2/success');
    } catch (err) {
      error('Erro', 'Falha ao processar verificação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex justify-center">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">Verificação Nível 2</h1>
            <p className="text-slate-400">Envie seus documentos para aumentar seus limites</p>
          </div>
        </div>

        {/* Progress */}
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <span className="text-white font-medium">Dados Pessoais</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">2</span>
                </div>
                <span className="text-white font-medium">Documentos</span>
              </div>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full w-full"></div>
            </div>
          </CardContent>
        </Card>

        {/* Document Type Selection */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg mr-3">
                <FileText className="h-6 w-6 text-white" />
              </div>
              Tipo de Documento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedDocument} onValueChange={setSelectedDocument}>
              <div className="space-y-4">
                {documentTypes.map((doc) => (
                  <div key={doc.value} className="flex items-start space-x-3 p-4 bg-slate-800/50 rounded-lg border border-slate-600">
                    <RadioGroupItem value={doc.value} id={doc.value} className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor={doc.value} className="text-white font-medium cursor-pointer">
                        {doc.label}
                      </Label>
                      <p className="text-slate-400 text-sm mt-1">{doc.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Document Upload */}
        {selectedDocument && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg mr-3">
                  <Upload className="h-6 w-6 text-white" />
                </div>
                Envio de Documentos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Front Document */}
              <div className="space-y-4">
                <h4 className="text-white font-medium">Frente do Documento</h4>
                <div className="p-6 border-2 border-dashed border-slate-600 rounded-lg text-center">
                  {frontDocumentUploaded ? (
                    <div className="flex items-center justify-center space-x-2 text-green-400">
                      <CheckCircle className="h-5 w-5" />
                      <span>Documento enviado com sucesso</span>
                    </div>
                  ) : (
                    <div>
                      <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-300 mb-4">Clique para enviar a frente do documento</p>
                      <Button
                        onClick={() => handleDocumentUpload('front')}
                        variant="outline"
                        className="border-slate-600 text-slate-300 hover:bg-slate-800"
                      >
                        Selecionar Arquivo
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Back Document */}
              <div className="space-y-4">
                <h4 className="text-white font-medium">Verso do Documento</h4>
                <div className="p-6 border-2 border-dashed border-slate-600 rounded-lg text-center">
                  {backDocumentUploaded ? (
                    <div className="flex items-center justify-center space-x-2 text-green-400">
                      <CheckCircle className="h-5 w-5" />
                      <span>Documento enviado com sucesso</span>
                    </div>
                  ) : (
                    <div>
                      <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-300 mb-4">Clique para enviar o verso do documento</p>
                      <Button
                        onClick={() => handleDocumentUpload('back')}
                        variant="outline"
                        className="border-slate-600 text-slate-300 hover:bg-slate-800"
                      >
                        Selecionar Arquivo
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Facial Verification */}
        {selectedDocument && frontDocumentUploaded && backDocumentUploaded && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg mr-3">
                  <Camera className="h-6 w-6 text-white" />
                </div>
                Verificação Facial
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                {facialVerificationCompleted ? (
                  <div className="flex items-center justify-center space-x-2 text-green-400 mb-4">
                    <CheckCircle className="h-5 w-5" />
                    <span>Verificação facial concluída</span>
                  </div>
                ) : (
                  <div className="mb-6">
                    <Camera className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-300 mb-4">
                      Para completar a verificação, precisamos confirmar que você é a pessoa 
                      do documento enviado.
                    </p>
                    <Button
                      onClick={handleFacialVerification}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      Iniciar Verificação Facial
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        {selectedDocument && frontDocumentUploaded && backDocumentUploaded && facialVerificationCompleted && (
          <Card className="glass-card">
            <CardContent className="p-6">
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {loading ? "Processando Verificação..." : "Finalizar Verificação Nível 2"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card className="glass-card bg-blue-600/10 border-blue-500/30">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Shield className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Segurança dos Documentos</h4>
                <p className="text-slate-300 text-sm">
                  Seus documentos são criptografados e armazenados com segurança. 
                  Utilizamos tecnologia de ponta para proteger suas informações pessoais 
                  e cumprir todas as regulamentações de privacidade.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </ProtectedRoute>
  );
}
