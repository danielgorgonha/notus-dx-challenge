"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Calendar, CreditCard, Globe, Loader2, MapPin, Home, Building } from "lucide-react";
import { useKYC } from "@/contexts/kyc-context";
import { useToast } from "@/hooks/use-toast";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { validateLevel1Data, formatCPF, formatDate } from "@/lib/validation/personal-data";
import { updateWalletMetadata } from "@/lib/actions/dashboard";
import { useSmartWallet } from "@/hooks/use-smart-wallet";

export default function KYCLevel1Page() {
  const router = useRouter();
  const { completePhase1 } = useKYC();
  const { success, error } = useToast();
  const { wallet } = useSmartWallet();
  
  const [formData, setFormData] = useState({
    fullName: "",
    birthDate: "",
    cpf: "",
    nationality: "Brasil",
    address: "",
    city: "",
    state: "",
    postalCode: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpar erro do campo quando usuário começar a digitar
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  // Funções auxiliares para formatação de dados
  const splitFullName = (fullName: string) => {
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    return { firstName, lastName };
  };

  const convertDateFormat = (date: string) => {
    // Converte de DD/MM/YYYY para YYYY-MM-DD
    const [day, month, year] = date.split('/');
    return `${year}-${month}-${day}`;
  };

  const mapNationalityToCountry = (nationality: string) => {
    const nationalityMap: Record<string, string> = {
      'Brasil': 'BRAZIL',
      'Brazil': 'BRAZIL',
      'Argentina': 'ARGENTINA',
      'Chile': 'CHILE',
      'Colômbia': 'COLOMBIA',
      'Peru': 'PERU',
      'Uruguai': 'URUGUAY'
    };
    return nationalityMap[nationality] || 'BRAZIL';
  };

  const validateForm = () => {
    const validation = validateLevel1Data(formData);
    const newFieldErrors: Record<string, string> = {};
    
    if (!validation.valid) {
      // Mapear erros para campos específicos
      validation.errors.forEach(err => {
        if (err.includes('Nome completo')) {
          newFieldErrors.fullName = err;
        } else if (err.includes('idade') || err.includes('nascimento')) {
          newFieldErrors.birthDate = err;
        } else if (err.includes('CPF')) {
          newFieldErrors.cpf = err;
        } else if (err.includes('Nacionalidade')) {
          newFieldErrors.nationality = err;
        } else {
          error('Erro', err);
        }
      });
      
      setFieldErrors(newFieldErrors);
      return false;
    }
    
    setFieldErrors({});
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Separar nome completo em primeiro e último nome
      const { firstName, lastName } = splitFullName(formData.fullName);
      
      // Preparar dados do Nível 1 com todos os campos necessários
      const level1Data = {
        // Dados pessoais básicos
        fullName: formData.fullName.trim(),
        firstName,
        lastName,
        birthDate: formData.birthDate,
        birthDateFormatted: convertDateFormat(formData.birthDate), // Formato YYYY-MM-DD para API
        cpf: formData.cpf.replace(/\D/g, ''), // Salvar apenas números
        nationality: formData.nationality,
        documentCountry: mapNationalityToCountry(formData.nationality), // Mapear para formato da API
        
        // Dados de endereço
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        postalCode: formData.postalCode.replace(/\D/g, ''), // Apenas números
        
        // Metadados
        completedAt: new Date().toISOString(),
        kycLevel: 1,
        limits: {
          monthlyDeposit: 2000.00,
          monthlyWithdrawal: 2000.00,
          features: {
            transfers: true,
            receipts: true,
            pix: false, // Bloqueado até Nível 2
            onRamp: false, // Bloqueado até Nível 2
            offRamp: false // Bloqueado até Nível 2
          }
        }
      };
      
      // Salvar dados na metadata da wallet usando Server Action
      const saveResult = await updateWalletMetadata(
        wallet?.accountAbstraction || '',
        {
          kycData: JSON.stringify(level1Data)
        }
      );
      
      // Simular delay mínimo para feedback visual
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Completar fase 1 (contexto local)
      completePhase1();
      
      success('Sucesso!', 'Nível 1 concluído! Você pode transferir e receber entre wallets até R$ 2.000,00 mensais. Continue para o Nível 2 para liberar PIX e depósitos.');
      
      // Pequeno delay antes de redirecionar
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Redirecionar para página principal do KYC para continuar para Nível 2
      router.push('/wallet/kyc');
    } catch (err) {
      console.error('Erro ao salvar dados KYC:', err);
      error('Erro', 'Falha ao salvar dados pessoais na wallet');
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
        <Card className={`glass-card ${loading ? 'opacity-75' : ''}`}>
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg mr-3">
                {loading ? (
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                ) : (
                  <User className="h-6 w-6 text-white" />
                )}
              </div>
              Dados Pessoais
              {loading && (
                <div className="ml-auto">
                  <div className="flex items-center space-x-2 text-blue-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Processando...</span>
                  </div>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 relative">
            {/* Loading Overlay */}
            {loading && (
              <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 text-blue-400 animate-spin mx-auto mb-2" />
                  <p className="text-white font-medium">Validando dados...</p>
                  <p className="text-slate-300 text-sm">Salvando na sua wallet</p>
                </div>
              </div>
            )}
            
            {/* Nome Completo */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-slate-300">Nome Completo</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="Digite seu nome completo"
                className={`bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 ${
                  fieldErrors.fullName ? 'border-red-500 focus:border-red-500' : ''
                }`}
                disabled={loading}
              />
              {fieldErrors.fullName && (
                <p className="text-red-400 text-sm">{fieldErrors.fullName}</p>
              )}
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
                className={`bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 ${
                  fieldErrors.birthDate ? 'border-red-500 focus:border-red-500' : ''
                }`}
                disabled={loading}
              />
              {fieldErrors.birthDate && (
                <p className="text-red-400 text-sm">{fieldErrors.birthDate}</p>
              )}
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
                className={`bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 ${
                  fieldErrors.cpf ? 'border-red-500 focus:border-red-500' : ''
                }`}
                disabled={loading}
              />
              {fieldErrors.cpf && (
                <p className="text-red-400 text-sm">{fieldErrors.cpf}</p>
              )}
            </div>

            {/* Nacionalidade */}
            <div className="space-y-2">
              <Label htmlFor="nationality" className="text-slate-300 flex items-center">
                <Globe className="h-4 w-4 mr-2" />
                Nacionalidade
              </Label>
              <Select 
                value={formData.nationality} 
                onValueChange={(value) => handleInputChange('nationality', value)}
                disabled={loading}
              >
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


            {/* Endereço */}
            <div className="space-y-2">
              <Label htmlFor="address" className="text-slate-300 flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                Endereço Completo
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Rua, número, complemento"
                className={`bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 ${
                  fieldErrors.address ? 'border-red-500 focus:border-red-500' : ''
                }`}
                disabled={loading}
              />
              {fieldErrors.address && (
                <p className="text-red-400 text-sm">{fieldErrors.address}</p>
              )}
            </div>

            {/* Cidade e Estado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-slate-300 flex items-center">
                  <Home className="h-4 w-4 mr-2" />
                  Cidade
                </Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Sua cidade"
                  className={`bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 ${
                    fieldErrors.city ? 'border-red-500 focus:border-red-500' : ''
                  }`}
                  disabled={loading}
                />
                {fieldErrors.city && (
                  <p className="text-red-400 text-sm">{fieldErrors.city}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state" className="text-slate-300 flex items-center">
                  <Building className="h-4 w-4 mr-2" />
                  Estado
                </Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="UF (ex: SP, RJ)"
                  maxLength={2}
                  className={`bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 ${
                    fieldErrors.state ? 'border-red-500 focus:border-red-500' : ''
                  }`}
                  disabled={loading}
                />
                {fieldErrors.state && (
                  <p className="text-red-400 text-sm">{fieldErrors.state}</p>
                )}
              </div>
            </div>

            {/* CEP */}
            <div className="space-y-2">
              <Label htmlFor="postalCode" className="text-slate-300 flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                CEP
              </Label>
              <Input
                id="postalCode"
                value={formData.postalCode}
                onChange={(e) => handleInputChange('postalCode', e.target.value.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2'))}
                placeholder="00000-000"
                maxLength={9}
                className={`bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 ${
                  fieldErrors.postalCode ? 'border-red-500 focus:border-red-500' : ''
                }`}
                disabled={loading}
              />
              {fieldErrors.postalCode && (
                <p className="text-red-400 text-sm">{fieldErrors.postalCode}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Validando e salvando dados...</span>
                  </div>
                ) : (
                  "Continuar para Nível 2"
                )}
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
