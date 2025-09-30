"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Calendar, CreditCard, Globe } from "lucide-react";
import { useKYC } from "@/contexts/kyc-context";
import { useToast } from "@/hooks/use-toast";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function KYCLevel1Page() {
  const router = useRouter();
  const { completePhase1 } = useKYC();
  const { success, error } = useToast();
  
  const [formData, setFormData] = useState({
    fullName: "",
    birthDate: "",
    cpf: "",
    nationality: "Brasil"
  });
  
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatDate = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3');
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      error('Erro', 'Nome completo é obrigatório');
      return false;
    }
    if (formData.fullName.trim().split(' ').length < 2) {
      error('Erro', 'Por favor, digite seu nome completo (nome e sobrenome)');
      return false;
    }
    if (!formData.birthDate.trim()) {
      error('Erro', 'Data de nascimento é obrigatória');
      return false;
    }
    if (!formData.cpf.trim()) {
      error('Erro', 'CPF é obrigatório');
      return false;
    }
    if (formData.cpf.replace(/\D/g, '').length !== 11) {
      error('Erro', 'CPF deve ter 11 dígitos');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Simular processamento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Completar fase 1
      completePhase1();
      
      success('Sucesso!', 'Dados pessoais verificados com sucesso');
      
      // Redirecionar para página de sucesso
      router.push('/wallet/kyc/level-1/success');
    } catch (err) {
      error('Erro', 'Falha ao processar verificação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <AppLayout 
        title="Verificação Nível 1"
        description="Complete seus dados pessoais para aumentar seus limites"
      >
      <div className="flex justify-center">
        <div className="w-full max-w-2xl space-y-6">
          {/* Header */}
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Verificação Nível 1</h1>
              <p className="text-slate-400">Complete seus dados pessoais para aumentar seus limites</p>
            </div>
          </div>

        {/* Progress */}
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">1</span>
                </div>
                <span className="text-white font-medium">Dados Pessoais</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">2</span>
                </div>
                <span className="text-slate-400">Documentos</span>
              </div>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full w-1/2"></div>
            </div>
          </CardContent>
        </Card>

        {/* Form */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg mr-3">
                <User className="h-6 w-6 text-white" />
              </div>
              Dados Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Nome Completo */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-slate-300">Nome Completo</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="Digite seu nome completo"
                className="bg-slate-800/50 border-slate-600 text-white placeholder-slate-400"
              />
            </div>

            {/* Data de Nascimento */}
            <div className="space-y-2">
              <Label htmlFor="birthDate" className="text-slate-300 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Data de Nascimento
              </Label>
              <Input
                id="birthDate"
                value={formData.birthDate}
                onChange={(e) => handleInputChange('birthDate', formatDate(e.target.value))}
                placeholder="DD/MM/AAAA"
                maxLength={10}
                className="bg-slate-800/50 border-slate-600 text-white placeholder-slate-400"
              />
            </div>

            {/* CPF */}
            <div className="space-y-2">
              <Label htmlFor="cpf" className="text-slate-300 flex items-center">
                <CreditCard className="h-4 w-4 mr-2" />
                CPF
              </Label>
              <Input
                id="cpf"
                value={formData.cpf}
                onChange={(e) => handleInputChange('cpf', formatCPF(e.target.value))}
                placeholder="000.000.000-00"
                maxLength={14}
                className="bg-slate-800/50 border-slate-600 text-white placeholder-slate-400"
              />
            </div>

            {/* Nacionalidade */}
            <div className="space-y-2">
              <Label htmlFor="nationality" className="text-slate-300 flex items-center">
                <Globe className="h-4 w-4 mr-2" />
                Nacionalidade
              </Label>
              <Select value={formData.nationality} onValueChange={(value) => handleInputChange('nationality', value)}>
                <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                  <SelectValue placeholder="Selecione sua nacionalidade" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="Brasil" className="text-white hover:bg-slate-700">Brasil</SelectItem>
                  <SelectItem value="Argentina" className="text-white hover:bg-slate-700">Argentina</SelectItem>
                  <SelectItem value="Chile" className="text-white hover:bg-slate-700">Chile</SelectItem>
                  <SelectItem value="Colômbia" className="text-white hover:bg-slate-700">Colômbia</SelectItem>
                  <SelectItem value="Peru" className="text-white hover:bg-slate-700">Peru</SelectItem>
                  <SelectItem value="Uruguai" className="text-white hover:bg-slate-700">Uruguai</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {loading ? "Processando..." : "Continuar para Nível 2"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="glass-card bg-blue-600/10 border-blue-500/30">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <User className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Por que precisamos desses dados?</h4>
                <p className="text-slate-300 text-sm">
                  Essas informações são necessárias para cumprir regulamentações de compliance e 
                  verificar sua identidade. Seus dados são protegidos e utilizados apenas para 
                  fins de verificação.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
