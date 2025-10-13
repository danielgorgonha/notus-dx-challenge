"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Droplets, 
  TrendingUp,
  Plus,
  Minus,
  Info
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useState } from "react";

// Mock data para pools - será substituído por dados reais da API
const MOCK_POOLS = [
  {
    id: 1,
    name: "USDC/USDT",
    protocol: "Uniswap V3",
    apr: 12.5,
    tvl: 1250000,
    volume24h: 850000,
    yourLiquidity: 0,
    token0: { symbol: "USDC", balance: "0" },
    token1: { symbol: "USDT", balance: "0" }
  },
  {
    id: 2,
    name: "BRZ/USDC",
    protocol: "Uniswap V3",
    apr: 8.3,
    tvl: 450000,
    volume24h: 125000,
    yourLiquidity: 0,
    token0: { symbol: "BRZ", balance: "0" },
    token1: { symbol: "USDC", balance: "0" }
  },
  {
    id: 3,
    name: "WMATIC/USDC",
    protocol: "Uniswap V3",
    apr: 15.7,
    tvl: 2100000,
    volume24h: 1250000,
    yourLiquidity: 0,
    token0: { symbol: "WMATIC", balance: "0" },
    token1: { symbol: "USDC", balance: "0" }
  }
];

export default function PoolsPage() {
  const [selectedPool, setSelectedPool] = useState<typeof MOCK_POOLS[0] | null>(null);
  const [action, setAction] = useState<'add' | 'remove' | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatCompactCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return formatCurrency(value);
  };

  return (
    <ProtectedRoute>
      <AppLayout 
        title="Liquidity Pools"
        description="Forneça liquidez e ganhe rendimento"
      >
        <div className="space-y-6">
          {/* Info Banner */}
          <Card className="glass-card bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Info className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-2">Sobre Liquidity Pools</h3>
                  <p className="text-slate-300 text-sm">
                    Forneça liquidez para pools de trading e ganhe taxas proporcionais ao volume de transações. 
                    Quanto maior o APR, maior o retorno potencial.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pools List */}
          <div className="grid gap-4">
            {MOCK_POOLS.map((pool) => (
              <Card key={pool.id} className="glass-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    {/* Pool Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center -space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-slate-800">
                            {pool.token0.symbol.slice(0, 2)}
                          </div>
                          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-slate-800">
                            {pool.token1.symbol.slice(0, 2)}
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-white font-bold text-lg">{pool.name}</h3>
                          <p className="text-slate-400 text-sm">{pool.protocol}</p>
                        </div>

                        <Badge className="bg-purple-500/20 text-purple-400 border border-purple-500/30">
                          APR {pool.apr}%
                        </Badge>
                      </div>

                      {/* Pool Stats */}
                      <div className="grid grid-cols-3 gap-6 pl-12">
                        <div>
                          <div className="text-slate-400 text-sm">TVL</div>
                          <div className="text-white font-semibold">{formatCompactCurrency(pool.tvl)}</div>
                        </div>
                        
                        <div>
                          <div className="text-slate-400 text-sm">Volume 24h</div>
                          <div className="text-white font-semibold">{formatCompactCurrency(pool.volume24h)}</div>
                        </div>
                        
                        <div>
                          <div className="text-slate-400 text-sm">Sua Liquidez</div>
                          <div className="text-white font-semibold">
                            {pool.yourLiquidity > 0 ? formatCurrency(pool.yourLiquidity) : '-'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Button
                        onClick={() => {
                          setSelectedPool(pool);
                          setAction('add');
                        }}
                        className="bg-green-600/20 border border-green-500/30 text-green-400 hover:bg-green-600/30 px-6"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar
                      </Button>
                      
                      {pool.yourLiquidity > 0 && (
                        <Button
                          onClick={() => {
                            setSelectedPool(pool);
                            setAction('remove');
                          }}
                          className="bg-red-600/20 border border-red-500/30 text-red-400 hover:bg-red-600/30 px-6"
                          variant="outline"
                        >
                          <Minus className="h-4 w-4 mr-2" />
                          Remover
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Stats Overview */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="glass-card">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <Droplets className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {MOCK_POOLS.length}
                </div>
                <div className="text-slate-400 text-sm">Pools Disponíveis</div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {Math.max(...MOCK_POOLS.map(p => p.apr))}%
                </div>
                <div className="text-slate-400 text-sm">Maior APR</div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <Droplets className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  $0
                </div>
                <div className="text-slate-400 text-sm">Sua Liquidez Total</div>
              </CardContent>
            </Card>
          </div>

          {/* Action Modal Placeholder */}
          {selectedPool && action && (
            <Card className="glass-card border-2 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white">
                  {action === 'add' ? 'Adicionar' : 'Remover'} Liquidez - {selectedPool.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center p-12">
                  <Droplets className="h-16 w-16 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-white font-semibold text-lg mb-2">
                    Funcionalidade em Implementação
                  </h3>
                  <p className="text-slate-400 mb-6">
                    A integração com a API da Notus para {action === 'add' ? 'adicionar' : 'remover'} liquidez 
                    será implementada na próxima fase do projeto.
                  </p>
                  <Button
                    onClick={() => {
                      setSelectedPool(null);
                      setAction(null);
                    }}
                    variant="outline"
                    className="border-slate-600"
                  >
                    Fechar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}

