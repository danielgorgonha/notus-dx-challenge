/**
 * Formulário para Etapa 1 do KYC - Dados Pessoais
 * Coleta informações básicas do usuário
 */

'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { KYCStage1Data, DocumentCategory, DocumentCountry, Nationality } from '@/types/kyc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, User, Mail, MapPin, Calendar, FileText } from 'lucide-react';

// Schema de validação
const stage1Schema = z.object({
  firstName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  lastName: z.string().min(2, 'Sobrenome deve ter pelo menos 2 caracteres'),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
  documentCategory: z.enum(['PASSPORT', 'DRIVERS_LICENSE', 'IDENTITY_CARD']),
  documentCountry: z.enum(['BRAZIL', 'UNITED_STATES', 'ARGENTINA', 'MEXICO', 'COLOMBIA']),
  documentId: z.string().min(1, 'CPF/Documento é obrigatório'),
  nationality: z.enum(['BRAZILIAN', 'AMERICAN', 'ARGENTINEAN', 'MEXICAN', 'COLOMBIAN']),
  email: z.string().email('Email deve ter um formato válido'),
  address: z.string().min(5, 'Endereço deve ter pelo menos 5 caracteres'),
  city: z.string().min(2, 'Cidade deve ter pelo menos 2 caracteres'),
  state: z.string().min(2, 'Estado deve ter pelo menos 2 caracteres'),
  postalCode: z.string().min(5, 'CEP deve ter pelo menos 5 caracteres')
});

type Stage1FormData = z.infer<typeof stage1Schema>;

interface KYCStage1FormProps {
  onSubmit: (data: KYCStage1Data) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
}

export function KYCStage1Form({ 
  onSubmit, 
  isLoading = false, 
  error,
  className = '' 
}: KYCStage1FormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid }
  } = useForm<Stage1FormData>({
    resolver: zodResolver(stage1Schema),
    mode: 'onChange'
  });

  const documentCountry = watch('documentCountry');
  const documentCategory = watch('documentCategory');

  // Função para formatar CPF
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  // Função para formatar CEP
  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  // Função para obter placeholder do documento
  const getDocumentPlaceholder = () => {
    if (documentCountry === 'BRAZIL') {
      return '000.000.000-00';
    }
    return 'Número do documento';
  };

  // Função para obter label do documento
  const getDocumentLabel = () => {
    if (documentCountry === 'BRAZIL') {
      return 'CPF';
    }
    return 'Número do Documento';
  };

  const handleFormSubmit = async (data: Stage1FormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Etapa 1 - Dados Pessoais
        </CardTitle>
        <p className="text-sm text-gray-600">
          Preencha seus dados pessoais para iniciar a verificação KYC.
          <br />
          <strong>Limite após completar:</strong> R$ 2.000,00
        </p>
      </CardHeader>

      <CardContent>
        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Informações Pessoais */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Informações Pessoais
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nome *</Label>
                <Input
                  id="firstName"
                  {...register('firstName')}
                  placeholder="Seu nome"
                  className={errors.firstName ? 'border-red-500' : ''}
                />
                {errors.firstName && (
                  <p className="text-sm text-red-500">{errors.firstName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Sobrenome *</Label>
                <Input
                  id="lastName"
                  {...register('lastName')}
                  placeholder="Seu sobrenome"
                  className={errors.lastName ? 'border-red-500' : ''}
                />
                {errors.lastName && (
                  <p className="text-sm text-red-500">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birthDate">Data de Nascimento *</Label>
                <Input
                  id="birthDate"
                  type="date"
                  {...register('birthDate')}
                  className={errors.birthDate ? 'border-red-500' : ''}
                />
                {errors.birthDate && (
                  <p className="text-sm text-red-500">{errors.birthDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="nationality">Nacionalidade *</Label>
                <Select onValueChange={(value) => setValue('nationality', value as Nationality)}>
                  <SelectTrigger className={errors.nationality ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecione sua nacionalidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BRAZILIAN">Brasileira</SelectItem>
                    <SelectItem value="AMERICAN">Americana</SelectItem>
                    <SelectItem value="ARGENTINEAN">Argentina</SelectItem>
                    <SelectItem value="MEXICAN">Mexicana</SelectItem>
                    <SelectItem value="COLOMBIAN">Colombiana</SelectItem>
                  </SelectContent>
                </Select>
                {errors.nationality && (
                  <p className="text-sm text-red-500">{errors.nationality.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Documento */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documento de Identidade
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="documentCountry">País do Documento *</Label>
                <Select onValueChange={(value) => setValue('documentCountry', value as DocumentCountry)}>
                  <SelectTrigger className={errors.documentCountry ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecione o país" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BRAZIL">Brasil</SelectItem>
                    <SelectItem value="UNITED_STATES">Estados Unidos</SelectItem>
                    <SelectItem value="ARGENTINA">Argentina</SelectItem>
                    <SelectItem value="MEXICO">México</SelectItem>
                    <SelectItem value="COLOMBIA">Colômbia</SelectItem>
                  </SelectContent>
                </Select>
                {errors.documentCountry && (
                  <p className="text-sm text-red-500">{errors.documentCountry.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="documentCategory">Tipo de Documento *</Label>
                <Select onValueChange={(value) => setValue('documentCategory', value as DocumentCategory)}>
                  <SelectTrigger className={errors.documentCategory ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PASSPORT">Passaporte</SelectItem>
                    <SelectItem value="DRIVERS_LICENSE">Carteira de Motorista</SelectItem>
                    <SelectItem value="IDENTITY_CARD">Carteira de Identidade</SelectItem>
                  </SelectContent>
                </Select>
                {errors.documentCategory && (
                  <p className="text-sm text-red-500">{errors.documentCategory.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="documentId">{getDocumentLabel()} *</Label>
              <Input
                id="documentId"
                {...register('documentId')}
                placeholder={getDocumentPlaceholder()}
                className={errors.documentId ? 'border-red-500' : ''}
                onChange={(e) => {
                  const value = documentCountry === 'BRAZIL' ? formatCPF(e.target.value) : e.target.value;
                  setValue('documentId', value);
                }}
              />
              {errors.documentId && (
                <p className="text-sm text-red-500">{errors.documentId.message}</p>
              )}
            </div>
          </div>

          {/* Contato */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Informações de Contato
            </h3>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="seu@email.com"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Endereço
            </h3>

            <div className="space-y-2">
              <Label htmlFor="address">Endereço Completo *</Label>
              <Input
                id="address"
                {...register('address')}
                placeholder="Rua, número, complemento"
                className={errors.address ? 'border-red-500' : ''}
              />
              {errors.address && (
                <p className="text-sm text-red-500">{errors.address.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Cidade *</Label>
                <Input
                  id="city"
                  {...register('city')}
                  placeholder="Sua cidade"
                  className={errors.city ? 'border-red-500' : ''}
                />
                {errors.city && (
                  <p className="text-sm text-red-500">{errors.city.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">Estado *</Label>
                <Input
                  id="state"
                  {...register('state')}
                  placeholder="Seu estado"
                  className={errors.state ? 'border-red-500' : ''}
                />
                {errors.state && (
                  <p className="text-sm text-red-500">{errors.state.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="postalCode">CEP *</Label>
                <Input
                  id="postalCode"
                  {...register('postalCode')}
                  placeholder="00000-000"
                  className={errors.postalCode ? 'border-red-500' : ''}
                  onChange={(e) => {
                    const value = formatCEP(e.target.value);
                    setValue('postalCode', value);
                  }}
                />
                {errors.postalCode && (
                  <p className="text-sm text-red-500">{errors.postalCode.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Botão de Submit */}
          <div className="pt-4">
            <Button
              type="submit"
              className="w-full"
              disabled={!isValid || isSubmitting || isLoading}
            >
              {isSubmitting || isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <User className="h-4 w-4 mr-2" />
                  Iniciar Verificação KYC
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
