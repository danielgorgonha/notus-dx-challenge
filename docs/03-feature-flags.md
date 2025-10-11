# Feature Flags

Este documento descreve o sistema de feature flags implementado no projeto Notus DX Challenge.

## Visão Geral

As feature flags permitem habilitar/desabilitar funcionalidades durante o desenvolvimento e em produção, facilitando o desenvolvimento incremental e o controle de releases.

## Configuração

As feature flags estão definidas em `src/lib/config/feature-flags.ts`:

```typescript
export const FEATURE_FLAGS = {
  // KYC Integration
  ENABLE_KYC_INTEGRATION: process.env.NODE_ENV === 'development' ? true : false,
  
  // Deposit with KYC validation
  ENABLE_DEPOSIT_KYC_VALIDATION: process.env.NODE_ENV === 'development' ? true : false,
  
  // Real Notus API calls
  ENABLE_REAL_NOTUS_API: process.env.NODE_ENV === 'development' ? true : false,
  
  // Mock data fallback
  ENABLE_MOCK_DATA_FALLBACK: process.env.NODE_ENV === 'development' ? true : false,
  
  // Debug mode
  ENABLE_DEBUG_LOGS: process.env.NODE_ENV === 'development' ? true : false,
} as const;
```

## Flags Disponíveis

### `ENABLE_KYC_INTEGRATION`
- **Descrição**: Habilita/desabilita a integração completa com o sistema KYC
- **Padrão**: `true` em desenvolvimento, `false` em produção
- **Uso**: Controla se o sistema deve usar dados reais do KYC ou dados mock

### `ENABLE_DEPOSIT_KYC_VALIDATION`
- **Descrição**: Habilita/desabilita a validação de KYC na tela de depósito
- **Padrão**: `true` em desenvolvimento, `false` em produção
- **Uso**: Controla se a tela de depósito deve verificar o status do KYC antes de permitir depósitos

### `ENABLE_REAL_NOTUS_API`
- **Descrição**: Habilita/desabilita chamadas reais para a API da Notus
- **Padrão**: `true` em desenvolvimento, `false` em produção
- **Uso**: Controla se o sistema deve fazer chamadas reais para a API ou usar dados mock

### `ENABLE_MOCK_DATA_FALLBACK`
- **Descrição**: Habilita/desabilita o fallback para dados mock quando a API falha
- **Padrão**: `true` em desenvolvimento, `false` em produção
- **Uso**: Controla se o sistema deve usar dados mock quando a API não está disponível

### `ENABLE_DEBUG_LOGS`
- **Descrição**: Habilita/desabilita logs de debug detalhados
- **Padrão**: `true` em desenvolvimento, `false` em produção
- **Uso**: Controla a verbosidade dos logs do sistema

## Como Usar

### Verificar uma Feature Flag

```typescript
import { isFeatureEnabled } from '@/lib/config/feature-flags';

// Verificar se uma feature está habilitada
if (isFeatureEnabled('ENABLE_KYC_INTEGRATION')) {
  // Lógica específica para quando KYC está habilitado
  console.log('KYC está habilitado');
} else {
  // Lógica para quando KYC está desabilitado
  console.log('KYC está desabilitado - usando dados mock');
}
```

### Obter Todas as Feature Flags

```typescript
import { getAllFeatureFlags } from '@/lib/config/feature-flags';

const flags = getAllFeatureFlags();
console.log('Todas as feature flags:', flags);
```

## Exemplo de Uso na Tela de Depósito

```typescript
export default function DepositPage() {
  // Verificar feature flags
  const isKYCEnabled = isFeatureEnabled('ENABLE_KYC_INTEGRATION');
  const isDepositKYCValidationEnabled = isFeatureEnabled('ENABLE_DEPOSIT_KYC_VALIDATION');
  
  // Lógica condicional baseada nas flags
  const getAvailableLimit = () => {
    if (!isKYCEnabled || !isDepositKYCValidationEnabled) {
      return 100000.00; // Limite alto para desenvolvimento
    }
    
    const level = kycManager.getCurrentStage();
    if (level === '2') return 50000.00;
    if (level === '1') return 2000.00;
    return 0;
  };
  
  // Renderização condicional
  return (
    <div>
      {isKYCEnabled && isDepositKYCValidationEnabled && kycManager.getCurrentStage() === '0' ? (
        <KYCRequiredBlock />
      ) : (
        <DepositForm />
      )}
    </div>
  );
}
```

## Indicador Visual

O componente `FeatureFlagIndicator` mostra o status atual das feature flags em desenvolvimento:

```typescript
import { FeatureFlagIndicator } from '@/components/dev/feature-flag-indicator';

// Adicionar ao componente
<FeatureFlagIndicator showDetails={true} />
```

## Configuração por Ambiente

### Desenvolvimento
- Todas as flags estão habilitadas por padrão
- Indicador visual é mostrado
- Logs de debug são ativados

### Produção
- Todas as flags estão desabilitadas por padrão
- Indicador visual é ocultado
- Logs de debug são desativados

## Modificando Feature Flags

Para modificar uma feature flag:

1. Edite o arquivo `src/lib/config/feature-flags.ts`
2. Altere o valor da flag desejada
3. Reinicie o servidor de desenvolvimento
4. A mudança será aplicada imediatamente

## Boas Práticas

1. **Sempre verificar feature flags** antes de executar código específico
2. **Fornecer fallbacks** para quando features estão desabilitadas
3. **Documentar** o comportamento de cada flag
4. **Testar** com flags habilitadas e desabilitadas
5. **Remover flags obsoletas** quando não são mais necessárias

## Migração para Produção

Quando uma feature estiver pronta para produção:

1. Altere a flag de `false` para `true` em produção
2. Teste em ambiente de staging
3. Faça o deploy para produção
4. Monitore o comportamento
5. Remova a flag se não for mais necessária

## Troubleshooting

### Feature Flag não está funcionando
- Verifique se o arquivo `feature-flags.ts` está sendo importado corretamente
- Confirme se o servidor foi reiniciado após mudanças
- Verifique se a flag está sendo usada corretamente no código

### Indicador visual não aparece
- Confirme que está em ambiente de desenvolvimento (`NODE_ENV === 'development'`)
- Verifique se o componente `FeatureFlagIndicator` está sendo renderizado
- Confirme se não há erros no console
