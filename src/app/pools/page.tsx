"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Info,
  Filter,
  DollarSign,
  Clock,
  Home,
  Wallet,
  Coins,
  LineChart
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSmartWallet } from "@/hooks/use-smart-wallet";
import { useToast } from "@/hooks/use-toast";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { liquidityActions } from "@/lib/actions/liquidity";
import { useQuery } from "@tanstack/react-query";
import { calculatePoolRentability } from "@/lib/utils/rentability-calculator";
import { getFilterConfig, filterActivePools, sortPoolsByActivity } from "@/lib/utils/pool-filters";

export default function PoolsPage() {
  const router = useRouter();
  const { wallet } = useSmartWallet();
  const toast = useToast();
  
  // Estados principais
  const [selectedPool, setSelectedPool] = useState<any>(null);
  const [sortBy, setSortBy] = useState<"rentabilidade" | "tvl" | "tarifa" | "volume">("rentabilidade");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [showSortModal, setShowSortModal] = useState(false);
  
  // Estados temporários para o modal
  const [tempSortBy, setTempSortBy] = useState<"rentabilidade" | "tvl" | "tarifa" | "volume">("rentabilidade");
  const [tempSortDirection, setTempSortDirection] = useState<"asc" | "desc">("desc");
  
  // Estado para tooltip de APR
  const [showAprTooltip, setShowAprTooltip] = useState(false);
  
  // Estados para FAQs
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState<string | null>(null);

  const walletAddress = wallet?.accountAbstraction;

  // Buscar pools específicas da API interna
  const { data: poolsData, isLoading: poolsLoading, error: poolsError } = useQuery({
    queryKey: ['specific-pools', sortBy, sortDirection],
    queryFn: async () => {
      try {
        console.log('🚀 Buscando pools específicas da API interna...');
        
        const response = await fetch('/api/liquidity/pools');
        if (!response.ok) {
          throw new Error(`Erro na API: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Dados recebidos:', data);
        
        if (!data.pools || data.pools.length === 0) {
          console.log('⚠️ Nenhuma pool encontrada');
          return [];
        }
        
        // Processar pools com métricas calculadas
        const processedPools = data.pools.map((pool: any) => {
          const metrics = pool.metrics;
          
          return {
            id: pool.id,
            protocol: pool.provider?.name || "Uniswap V3",
            tokenPair: pool.tokenPair,
            token1: { 
              symbol: pool.tokens[0]?.symbol?.toUpperCase() || 'TOKEN1', 
              logo: pool.tokens[0]?.logo || "💙", 
              color: "blue" 
            },
            token2: { 
              symbol: pool.tokens[1]?.symbol?.toUpperCase() || 'TOKEN2', 
              logo: pool.tokens[1]?.logo || "💚", 
              color: "green" 
            },
            rentabilidade: metrics.formatted.apr,
            tvl: metrics.formatted.tvl,
            tarifa: `${pool.fee}%`,
            volume24h: metrics.formatted.volume24h,
            composition: metrics.formatted.composition,
            // Dados adicionais
            address: pool.address,
            chain: pool.chain,
            provider: pool.provider,
            stats: pool.stats,
            tokens: pool.tokens,
            fee: pool.fee,
            metrics: metrics
          };
        });
        
        // Aplicar ordenação baseada no sortBy e sortDirection
        const sortedPools = [...processedPools].sort((a, b) => {
          let comparison = 0;
          
          switch (sortBy) {
            case 'rentabilidade':
              comparison = a.metrics.apr - b.metrics.apr;
              break;
            case 'tvl':
              comparison = a.metrics.tvl - b.metrics.tvl;
              break;
            case 'tarifa':
              comparison = a.fee - b.fee;
              break;
            case 'volume':
              comparison = a.metrics.volume24h - b.metrics.volume24h;
              break;
            default:
              return 0;
          }
          
          // Aplicar direção da ordenação
          return sortDirection === 'desc' ? -comparison : comparison;
        });
        
        console.log('✅ Pools processados:', sortedPools.length);
        return sortedPools;
        
      } catch (error) {
        console.error('❌ Erro ao buscar pools:', error);
        throw error;
      }
    },
    staleTime: 30000, // 30 segundos
  });

  const handlePoolClick = (pool: any) => {
    setSelectedPool(pool);
    router.push(`/pools/${pool.id}`);
  };

  const handleOpenModal = () => {
    setTempSortBy(sortBy);
    setTempSortDirection(sortDirection);
    setShowSortModal(true);
  };

  const renderPoolsList = () => (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-white text-sm">Disponíveis - {poolsData?.length || 0}</p>
        </div>
        <Button
          onClick={handleOpenModal}
          variant="outline"
          className="border-yellow-500/30 text-yellow-400 hover:text-yellow-300 hover:border-yellow-400 text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-300 bg-yellow-500/10 hover:bg-yellow-500/20"
        >
          {sortBy === 'rentabilidade' ? 'Rent. estimada' : 
           sortBy === 'tvl' ? 'TVL' :
           sortBy === 'tarifa' ? 'Tarifa' : 'Volume (24h)'} {sortDirection === 'desc' ? '↓' : '↑'}
        </Button>
      </div>

      {/* Lista de Pools */}
      <div className="space-y-3">
        {(() => {
          if (poolsLoading) {
            return (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
                <span className="ml-2 text-slate-300">Carregando pools...</span>
              </div>
            );
          }
          
          if (poolsError) {
            return (
              <div className="text-center py-8">
                <p className="text-red-400">Erro ao carregar pools da API</p>
                <p className="text-slate-400 text-sm mt-1">Verifique a conexão com a API da Notus</p>
                <p className="text-slate-500 text-xs mt-2">Erro: {poolsError.message}</p>
              </div>
            );
          }
          
          if (!poolsData || poolsData.length === 0) {
            return (
              <div className="text-center py-8">
                <p className="text-slate-400">Nenhum pool encontrado</p>
                <p className="text-slate-500 text-sm mt-1">Tente novamente mais tarde</p>
              </div>
            );
          }
          
          return poolsData?.map((pool: any) => {
            if (!pool || typeof pool !== 'object') {
              return null;
            }
            
            return (
            <Card 
              key={pool.id}
              className="bg-slate-700/40 border border-slate-600/40 rounded-xl cursor-pointer hover:bg-slate-600/40 hover:border-slate-500/60 transition-all duration-300 shadow-md hover:shadow-lg"
              onClick={() => handlePoolClick(pool)}
            >
              <CardContent className="p-4">
                {/* Top Row: Protocol and Rent. estimada */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white text-sm font-medium">{String(pool.protocol || 'Uniswap V3')}</span>
                  <div className="flex items-center space-x-1">
                    <span className="text-white text-sm font-medium">Rent. estimada</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAprTooltip(true);
                      }}
                      className="hover:bg-slate-600 rounded-full p-1 transition-colors"
                    >
                      <Info className="h-3 w-3 text-slate-400 hover:text-white" />
                    </button>
                  </div>
                </div>

                {/* Second Row: Token Pair and APR */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {/* Token Icons */}
                    <div className="relative flex items-center">
                      {pool.token1?.logo && typeof pool.token1.logo === 'string' && pool.token1.logo.startsWith('http') ? (
                        <img 
                          src={pool.token1.logo} 
                          alt={pool.token1?.symbol || 'Token1'} 
                          className="w-8 h-8 rounded-full object-cover z-10"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                            if (nextElement) {
                              nextElement.style.display = 'block';
                            }
                          }}
                        />
                      ) : null}
                      <span className="text-lg z-10" style={{ display: pool.token1?.logo && typeof pool.token1.logo === 'string' && pool.token1.logo.startsWith('http') ? 'none' : 'block' }}>
                        {String(pool.token1?.logo || '💙')}
                      </span>
                      {pool.token2?.logo && typeof pool.token2.logo === 'string' && pool.token2.logo.startsWith('http') ? (
                        <img 
                          src={pool.token2.logo} 
                          alt={pool.token2?.symbol || 'Token2'} 
                          className="w-8 h-8 rounded-full object-cover -ml-2 z-20"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                            if (nextElement) {
                              nextElement.style.display = 'block';
                            }
                          }}
                        />
                      ) : null}
                      <span className="text-lg -ml-2 z-20" style={{ display: pool.token2?.logo && typeof pool.token2.logo === 'string' && pool.token2.logo.startsWith('http') ? 'none' : 'block' }}>
                        {String(pool.token2?.logo || '💚')}
                      </span>
                    </div>
                    
                    {/* Token Pair Name */}
                    <h3 className="text-white font-bold text-base">{String(pool.tokenPair || 'N/A')}</h3>
                  </div>
                  
                  {/* APR */}
                  <p className="text-green-400 font-bold text-base">{String(pool.rentabilidade || 'N/A')}</p>
                </div>

                {/* Third Row: Labels */}
                <div className="grid grid-cols-3 gap-4 mb-2">
                  <div className="text-center">
                    <p className="text-white text-sm font-medium">TVL</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white text-sm font-medium">Tarifa</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white text-sm font-medium">Volume (24h)</p>
                  </div>
                </div>

                {/* Fourth Row: Values */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-white font-bold text-base">{String(pool.tvl || 'N/A')}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white font-bold text-base">{String(pool.tarifa || 'N/A')}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white font-bold text-base">{String(pool.volume24h || 'N/A')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            );
          });
        })()}
      </div>

    </div>
  );

  const renderSortModal = () => {
    const sortOptions = [
      { key: "rentabilidade", label: "Rentabilidade estimada" },
      { key: "tvl", label: "TVL" },
      { key: "tarifa", label: "Tarifa" },
      { key: "volume", label: "Volume (24h)" }
    ];

    const handleSortOptionClick = (optionKey: string) => {
      if (tempSortBy === optionKey) {
        // Se já está selecionado, alternar direção
        setTempSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
      } else {
        // Se é nova opção, definir como descendente por padrão
        setTempSortBy(optionKey as any);
        setTempSortDirection('desc');
      }
    };

    const handleApplySort = () => {
      setSortBy(tempSortBy);
      setSortDirection(tempSortDirection);
      setShowSortModal(false);
    };


    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white font-bold text-lg">Classificação</h2>
            <Button
              onClick={() => setShowSortModal(false)}
              variant="ghost"
              className="text-slate-400"
            >
              ✕
            </Button>
          </div>
          
          <div className="space-y-3">
            {sortOptions.map((option) => {
              const isSelected = tempSortBy === option.key;
              const arrowIcon = isSelected ? (tempSortDirection === 'desc' ? '↓' : '↑') : null;
              
              return (
                <div
                  key={option.key}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    isSelected ? "bg-slate-700/50" : "hover:bg-slate-700/30"
                  }`}
                  onClick={() => handleSortOptionClick(option.key)}
                >
                  <span className="text-white">{option.label}</span>
                  {arrowIcon && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-red-400">
                        {arrowIcon}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <Button
            onClick={handleApplySort}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold py-3 rounded-xl mt-6"
          >
            Aplicar
          </Button>
        </div>
      </div>
    );
  };

  const renderAprTooltip = () => (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={() => setShowAprTooltip(false)}
    >
      <div 
        className="bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-6">
          <h3 className="text-white font-bold text-lg mb-3">Rentabilidade estimada (APR)</h3>
          <p className="text-white text-sm mb-6">
            Calculada com base nas recompensas diárias e no TVL da pool.
          </p>
          
          <Button
            onClick={() => setShowAprTooltip(false)}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold py-3 rounded-xl"
          >
            Ok, entendi
          </Button>
        </div>
      </div>
    </div>
  );

  const faqData = [
    {
      id: 'o-que-sao-pools',
      title: 'O que são pools de liquidez?',
      icon: '💰',
      content: {
        title: 'O que são pools de liquidez?',
        description: 'São como cofres coletivos com dois tipos de criptomoedas (par de ativos).',
        subtitle: 'Os cofres fornecem liquidez para que trocas entre o par de ativos possam acontecer no mercado cripto.',
        highlight: 'Ao colocar seu dinheiro nesse cofre, você se torna um provedor de liquidez, ganhando recompensas para cada troca realizada.'
      }
    },
    {
      id: 'como-funcionam-pools',
      title: 'Como funcionam as pools de liquidez na Notus DX?',
      icon: '💰',
      content: {
        title: 'Como funcionam as pools de liquidez na Notus DX?',
        description: 'Nossa funcionalidade simplifica a Uniswap V3 para você. O processo é simples:',
        steps: [
          { label: 'Escolha', text: 'um par de moedas no catálogo.' },
          { label: 'Defina', text: 'o intervalo de preço em que deseja atuar.' },
          { label: 'Invista', text: 'com seu saldo em USDC ou BRZ.' }
        ],
        footer: 'Para facilitar, o app usa seu saldo para comprar e balancear os dois ativos da pool automaticamente.',
        extra: 'Enquanto o preço de mercado para seu par de ativos estiver no intervalo definido, você ganha rendimentos.'
      }
    },
    {
      id: 'como-funcionam-rendimentos',
      title: 'Como funcionam os rendimentos da pool?',
      icon: '💰',
      content: {
        title: 'Como funcionam os rendimentos da pool?',
        description: 'Você ganha uma parte das taxas de todas as trocas que usam a sua liquidez.',
        subtitle: 'Seu ganho depende principalmente de 4 fatores:',
        list: [
          'Volume de negociações na pool;',
          'O nível de tarifa da pool;',
          'O intervalo de preço que você definiu;',
          'A quantidade de liquidez que você proveu.'
        ],
        footer: 'Não há ganhos garantidos. O app exibe uma estimativa de rendimento anual (APR) para te ajudar a decidir.'
      }
    },
    {
      id: 'taxas-envolvidas',
      title: 'Quais são as taxas envolvidas?',
      icon: '💰',
      content: {
        title: 'Quais são as taxas envolvidas?',
        sections: [
          {
            label: 'Taxa Notus DX:',
            text: 'Não cobramos taxas para adicionar ou remover liquidez, nem para resgatar rendimentos.'
          },
          {
            text: 'A única taxa é a de swap (0,5%), cobrada no momento em que o app converte seu saldo (USDC/BRZ) para os ativos do par.'
          },
          {
            label: 'Taxa da Rede:',
            text: 'É um custo externo e variável, pago à rede blockchain para processar suas operações.'
          },
          {
            label: 'Transparência total:',
            text: 'O valor exato de todos os custos sempre será exibido para você antes da confirmação.'
          }
        ]
      }
    },
    {
      id: 'pool-inativa',
      title: 'O que acontece quando minha pool fica inativa?',
      icon: '💰',
      content: {
        title: 'O que acontece quando minha pool fica inativa?',
        description: 'Quando o preço do par sai do intervalo que você definiu, sua pool fica inativa.',
        subtitle: 'O que significa:',
        list: [
          'Sua pool para de gerar rendimentos.',
          'Sua posição pode ser convertida 100% para um dos ativos do par (o que causa a Perda Impermanente).'
        ],
        actionTitle: 'O que você pode fazer:',
        actions: [
          { label: 'Esperar', text: 'o preço voltar ao intervalo; ou' },
          { label: 'Resgatar', text: 'a liquidez e criar uma nova pool com um novo intervalo.' }
        ]
      }
    },
    {
      id: 'perda-impermanente',
      title: 'O que é Perda Impermanente?',
      icon: '💰',
      content: {
        title: 'O que é Perda Impermanente?',
        description: 'É o risco de que o valor total que você retira da pool seja menor do que se você tivesse simplesmente guardado os dois ativos na carteira.',
        paragraph1: 'Ao fornecer liquidez, você está permitindo que a Uniswap venda aos poucos o ativo que está subindo e compre o que está caindo.',
        paragraph2: 'Essa "venda na subida" pode causar uma diferença de valor em relação a simplesmente segurar os ativos.',
        warning: 'Se o preço sair completamente do seu intervalo, sua posição pode ser totalmente convertida para o ativo que menos valorizou.'
      }
    },
    {
      id: 'intervalo-pool',
      title: 'O que é o intervalo de uma pool de liquidez?',
      icon: '💰',
      content: {
        title: 'O que é o intervalo de uma pool de liquidez?',
        description: 'É a faixa de preço (entre um mínimo e um máximo) no qual sua liquidez ficará disponível ao mercado.',
        rules: [
          { condition: 'dentro', text: 'Pool ativa', detail: 'gerando rendimentos.' },
          { condition: 'fora', text: 'Pool inativa', detail: 'não gera rendimentos.' }
        ],
        summary: 'Em geral, intervalos mais amplos reduzem o risco de inatividade, mas têm rendimentos menores.',
        extra: 'Intervalos mais estreitos, por outro lado, concentram liquidez e podem render mais, mas têm maiores riscos de inatividade e Perda Impermanente.'
      }
    }
  ];

  const renderFaqSection = () => (
    <div className="mt-12">
      <h2 className="text-white text-2xl font-bold mb-6">FAQ</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {faqData.map((faq) => (
          <Card
            key={faq.id}
            className="bg-slate-800/60 border border-slate-700/60 rounded-2xl cursor-pointer hover:bg-slate-700/60 hover:border-slate-600/60 transition-all duration-300 shadow-md hover:shadow-lg"
            onClick={() => {
              setSelectedFaq(faq.id);
              setShowFaqModal(true);
            }}
          >
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-gradient-to-b from-slate-600 to-slate-700 rounded-full flex items-center justify-center mb-4 relative">
                <div className="absolute -top-2 -right-2 w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-2xl">💰</span>
                </div>
                <div className="w-full h-full bg-slate-600 rounded-full" />
              </div>
              <p className="text-white text-sm font-medium leading-snug">
                {faq.title}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderFaqModal = () => {
    if (!selectedFaq) return null;
    
    const faq = faqData.find(f => f.id === selectedFaq);
    if (!faq) return null;

    return (
      <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={() => {
          setShowFaqModal(false);
          setSelectedFaq(null);
        }}
      >
        <div 
          className="bg-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[80vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6 py-6">
            <h3 className="text-white font-bold text-xl mb-4">{faq.content.title}</h3>
            
            {/* O que são pools de liquidez? */}
            {faq.id === 'o-que-sao-pools' && (
              <>
                <p className="text-white text-sm mb-4">{faq.content.description}</p>
                <p className="text-white text-sm mb-4">{faq.content.subtitle}</p>
                <p className="text-white text-sm mb-6">{faq.content.highlight}</p>
              </>
            )}

            {/* Como funcionam as pools na Notus DX? */}
            {faq.id === 'como-funcionam-pools' && (
              <>
                <p className="text-white text-sm mb-4">{faq.content.description}</p>
                <div className="mb-4 space-y-2">
                  {faq.content.steps?.map((step, index) => (
                    <p key={index} className="text-white text-sm">
                      • <span className="font-bold">{step.label}</span> {step.text}
                    </p>
                  ))}
                </div>
                <p className="text-white text-sm mb-4">{faq.content.footer}</p>
                <p className="text-white text-sm mb-6">{faq.content.extra}</p>
              </>
            )}

            {/* Como funcionam os rendimentos? */}
            {faq.id === 'como-funcionam-rendimentos' && (
              <>
                <p className="text-white text-sm mb-4">{faq.content.description}</p>
                <p className="text-white text-sm font-bold mb-2">{faq.content.subtitle}</p>
                <div className="mb-4 space-y-1">
                  {faq.content.list?.map((item, index) => (
                    <p key={index} className="text-white text-sm">• {item}</p>
                  ))}
                </div>
                <p className="text-white text-sm mb-6">{faq.content.footer}</p>
              </>
            )}

            {/* Quais são as taxas? */}
            {faq.id === 'taxas-envolvidas' && (
              <div className="space-y-4 mb-6">
                {faq.content.sections?.map((section, index) => (
                  <p key={index} className="text-white text-sm">
                    {section.label && <span className="font-bold">{section.label}</span>} {section.text}
                  </p>
                ))}
              </div>
            )}

            {/* Pool inativa */}
            {faq.id === 'pool-inativa' && (
              <>
                <p className="text-white text-sm mb-4">{faq.content.description}</p>
                <p className="text-white text-sm font-bold mb-2">{faq.content.subtitle}</p>
                <div className="mb-4 space-y-1">
                  {faq.content.list?.map((item, index) => (
                    <p key={index} className="text-white text-sm">• {item}</p>
                  ))}
                </div>
                <p className="text-white text-sm font-bold mb-2">{faq.content.actionTitle}</p>
                <div className="mb-6 space-y-2">
                  {faq.content.actions?.map((action, index) => (
                    <p key={index} className="text-white text-sm">
                      • <span className="font-bold">{action.label}</span> {action.text}
                    </p>
                  ))}
                </div>
              </>
            )}

            {/* Perda Impermanente */}
            {faq.id === 'perda-impermanente' && (
              <>
                <p className="text-white text-sm mb-4">{faq.content.description}</p>
                <p className="text-white text-sm mb-4">{faq.content.paragraph1}</p>
                <p className="text-white text-sm mb-4">{faq.content.paragraph2}</p>
                <p className="text-white text-sm mb-6">{faq.content.warning}</p>
              </>
            )}

            {/* Intervalo da pool */}
            {faq.id === 'intervalo-pool' && (
              <>
                <p className="text-white text-sm mb-4">{faq.content.description}</p>
                <div className="mb-4 space-y-2">
                  {faq.content.rules?.map((rule, index) => (
                    <p key={index} className="text-white text-sm">
                      • Preço <span className="font-bold">{rule.condition}</span> do intervalo = <span className="font-bold">{rule.text}</span>, {rule.detail}
                    </p>
                  ))}
                </div>
                <p className="text-white text-sm mb-4">{faq.content.summary}</p>
                <p className="text-white text-sm mb-6">{faq.content.extra}</p>
              </>
            )}
            
            <Button
              onClick={() => {
                setShowFaqModal(false);
                setSelectedFaq(null);
              }}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold py-3 rounded-xl"
            >
              Ok, entendi
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ProtectedRoute>
      <AppLayout 
        title="Pools de Liquidez"
        description="Adicione liquidez aos pools e ganhe recompensas"
      >
        <div className="w-full max-w-4xl mx-auto px-6">
          {renderPoolsList()}
          {renderFaqSection()}
        </div>
        
        {showSortModal && renderSortModal()}
        {showAprTooltip && renderAprTooltip()}
        {showFaqModal && renderFaqModal()}
      </AppLayout>
    </ProtectedRoute>
  );
}