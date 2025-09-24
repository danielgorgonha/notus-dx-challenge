"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { useAuth } from "@/contexts/auth-context";
import { useSmartWallet } from "@/hooks/use-smart-wallet";
import { useToast } from "@/hooks/use-toast";
import { ToastContainer } from "@/components/ui/toast";
import { usePrivy } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Wallet, 
  Copy, 
  ExternalLink, 
  Plus, 
  RefreshCw, 
  TrendingUp, 
  Activity,
  AlertCircle,
  CheckCircle,
  Loader2,
  Zap,
  DollarSign,
  Clock,
  Shield,
  Sparkles,
  BarChart3,
  Settings,
  QrCode,
  Smartphone
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function WalletPage() {
  const { user } = useAuth();
  const { createWallet } = usePrivy();
  const router = useRouter();
  
  const {
    portfolio,
    history,
    loading,
    error,
    isRegistered,
    walletAddress,
    registerWallet,
    loadPortfolio,
    loadHistory,
  } = useSmartWallet();

  const { toasts, removeToast, success, error: showError } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    success('Copiado!', 'Endereço da carteira copiado para a área de transferência');
  };


  const handleCreateWallet = async () => {
    try {
      await createWallet();
      success('Carteira Criada!', 'Carteira integrada criada com sucesso');
    } catch (error: unknown) {
      console.error('Failed to create wallet:', error);
      if (error instanceof Error && error.message?.includes('already has an embedded wallet')) {
        showError('Carteira Já Existe', 'Você já possui uma carteira integrada. Por favor, atualize a página.');
      } else {
        showError('Falha na Criação da Carteira', 'Falha ao criar carteira integrada');
      }
    }
  };

  return (
    <AppLayout 
      title="Carteira Inteligente"
      description="Gerencie sua carteira inteligente e visualize detalhes da carteira"
      onDepositClick={() => router.push('/wallet/deposit')}
    >
      <div className="space-y-8">
          {/* Error Display */}
          {error && (
          <Card className="glass-card border-red-500/20 bg-red-500/5">
              <CardContent className="pt-6">
                <div className="flex items-center text-red-400">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <span>{error}</span>
                </div>
              </CardContent>
            </Card>
          )}

        {/* Wallet Header with Stats */}
        {walletAddress && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Balance Card */}
            <Card className="glass-card bg-gradient-to-br from-blue-600/20 to-emerald-600/20 border-blue-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Saldo Total</p>
                    <p className="text-2xl font-bold text-white">
                      {portfolio ? `$${parseFloat(portfolio.totalBalanceUSD).toFixed(2)}` : '$0.00'}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-500/20 rounded-full">
                    <DollarSign className="h-6 w-6 text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Wallet Status Card */}
            <Card className="glass-card bg-gradient-to-br from-emerald-600/20 to-blue-600/20 border-emerald-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Status da Carteira</p>
                    <p className="text-lg font-semibold text-white">
                      {isRegistered ? 'Ativa' : 'Pendente'}
                    </p>
                  </div>
                  <div className="p-3 bg-emerald-500/20 rounded-full">
                    {isRegistered ? (
                      <CheckCircle className="h-6 w-6 text-emerald-400" />
                    ) : (
                      <Clock className="h-6 w-6 text-yellow-400" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transaction Count Card */}
            <Card className="glass-card bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-purple-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Transações</p>
                    <p className="text-lg font-semibold text-white">
                      {history?.transactions?.length || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-500/20 rounded-full">
                    <Activity className="h-6 w-6 text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Wallet Card */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <div className="flex items-center">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-lg mr-3">
                  <Wallet className="h-6 w-6 text-white" />
                </div>
                Carteira Inteligente
                </div>
                {loading && <Loader2 className="h-5 w-5 animate-spin text-blue-400" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {walletAddress ? (
              <div className="space-y-6">
                {/* Wallet Address Section */}
                <div className="p-6 bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-xl border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <QrCode className="h-5 w-5 text-slate-400 mr-2" />
                      <span className="text-slate-400 text-sm">Endereço da Carteira</span>
                    </div>
                    <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(walletAddress)}
                        className="text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-full p-2 transition-all duration-200"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-full p-2 transition-all duration-200"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="font-mono text-white text-lg break-all">
                    {walletAddress}
                  </div>
                  </div>

                {/* Status and Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-slate-400">Status da API Notus</div>
                        <div className="text-white font-semibold">
                        {isRegistered ? 'Registrada' : 'Não Registrada'}
                      </div>
                    </div>
                    <Badge 
                      variant="secondary" 
                        className={isRegistered ? "bg-emerald-600/20 text-emerald-400 border-emerald-500/30" : "bg-yellow-600/20 text-yellow-400 border-yellow-500/30"}
                    >
                      {isRegistered ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Ativa
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Pendente
                        </>
                      )}
                    </Badge>
                    </div>
                  </div>

                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-slate-400">Rede</div>
                        <div className="text-white font-semibold">
                          Ethereum
                        </div>
                      </div>
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <Shield className="h-4 w-4 text-blue-400" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                  {!isRegistered && walletAddress && (
                    <div className="text-center py-4">
                      <Button 
                      className="btn-primary bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 transition-all duration-200"
                        onClick={registerWallet}
                        disabled={loading}
                      >
                        {loading ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                        <Sparkles className="h-4 w-4 mr-2" />
                        )}
                        Registrar na API Notus
                      </Button>
                    </div>
                  )}

                  {!walletAddress && (
                  <div className="text-center py-8">
                    <div className="p-4 bg-gradient-to-r from-blue-600/20 to-emerald-600/20 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                      <Wallet className="h-10 w-10 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Nenhuma Carteira Conectada</h3>
                    <p className="text-slate-300 mb-6 max-w-md mx-auto">
                      Crie uma carteira integrada para acessar todos os recursos da Carteira Inteligente, incluindo abstração de conta e transações sem gas.
                    </p>
                      <Button 
                      className="btn-primary bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 transition-all duration-200"
                        onClick={handleCreateWallet}
                      >
                          <Plus className="h-4 w-4 mr-2" />
                        Criar Carteira Integrada
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
              <div className="text-center py-12">
                <div className="p-6 bg-gradient-to-r from-blue-600/20 to-emerald-600/20 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <Wallet className="h-12 w-12 text-blue-400" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3">Bem-vindo à Carteira Inteligente</h3>
                <p className="text-slate-300 mb-8 max-w-lg mx-auto">
                  Crie sua primeira carteira integrada para começar a usar abstração de conta, transações sem gas e recursos avançados de DeFi.
                  </p>
                  <Button 
                  className="btn-primary bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-lg px-8 py-3 transition-all duration-200"
                    onClick={handleCreateWallet}
                  >
                  <Plus className="h-5 w-5 mr-2" />
                  Criar Sua Carteira
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Portfolio Section */}
          {isRegistered && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <div className="flex items-center">
                  <div className="p-2 bg-gradient-to-r from-emerald-600 to-blue-600 rounded-lg mr-3">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  Visão Geral do Portfólio
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={loadPortfolio}
                    disabled={loading}
                  className="text-slate-400 hover:text-white"
                  >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {portfolio ? (
                <div className="space-y-6">
                  {/* Portfolio Summary */}
                  <div className="p-6 bg-gradient-to-r from-emerald-600/20 to-blue-600/20 rounded-xl border border-emerald-500/30">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-white mb-2">
                        ${parseFloat(portfolio.totalBalanceUSD).toFixed(2)}
                      </div>
                      <div className="text-slate-400 text-lg">Valor Total do Portfólio</div>
                      <div className="text-emerald-400 text-sm mt-2">
                        {portfolio.tokens.length} token{portfolio.tokens.length !== 1 ? 's' : ''} no portfólio
                      </div>
                    </div>
                    </div>

                  {/* Token List */}
                    <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-white mb-4">Tokens em Posse</h4>
                      {portfolio.tokens.map((token, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-slate-700/30 hover:border-slate-500/30 transition-all duration-200">
                          <div className="flex items-center">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-4">
                            {token.symbol.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                            <div className="font-semibold text-white text-lg">{token.name}</div>
                              <div className="text-slate-400 text-sm">{token.symbol}</div>
                            </div>
                          </div>
                          <div className="text-right">
                          <div className="font-semibold text-white text-lg">
                              {parseFloat(token.balance).toFixed(4)} {token.symbol}
                            </div>
                            <div className="text-slate-400 text-sm">
                              ${parseFloat(token.balanceUSD).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                <div className="text-center py-12">
                  <div className="p-6 bg-gradient-to-r from-emerald-600/20 to-blue-600/20 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                    <TrendingUp className="h-12 w-12 text-emerald-400" />
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-3">Portfólio Pronto</h3>
                  <p className="text-slate-300 mb-8 max-w-md mx-auto">
                    Os dados do seu portfólio aparecerão aqui assim que você carregá-los. Acompanhe seus saldos de tokens e o desempenho do portfólio.
                    </p>
                    <Button
                    className="btn-primary bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 transition-all duration-200"
                      onClick={loadPortfolio}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                      <BarChart3 className="h-4 w-4 mr-2" />
                      )}
                      Carregar Portfólio
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}


          {/* Transaction History */}
          {isRegistered && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <div className="flex items-center">
                  <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg mr-3">
                    <Activity className="h-6 w-6 text-white" />
                  </div>
                  Histórico de Transações
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => loadHistory()}
                    disabled={loading}
                  className="text-slate-400 hover:text-white"
                  >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {history && history.transactions.length > 0 ? (
                <div className="space-y-4">
                  {/* Transaction Summary */}
                  <div className="p-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl border border-purple-500/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-slate-400 text-sm">Total de Transações</div>
                        <div className="text-2xl font-bold text-white">{history.transactions.length}</div>
                      </div>
                      <div className="p-3 bg-purple-500/20 rounded-full">
                        <Activity className="h-6 w-6 text-purple-400" />
                      </div>
                    </div>
                  </div>

                  {/* Transaction List */}
                  <div className="space-y-3">
                    {history.transactions.map((transaction, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-slate-700/30 hover:border-slate-500/30 transition-all duration-200">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-green-600 rounded-full flex items-center justify-center mr-4">
                            <Activity className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-white text-lg capitalize">
                              {transaction.type}
                            </div>
                            <div className="text-slate-400 text-sm">
                              {new Date(transaction.timestamp * 1000).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-white text-lg">
                            {transaction.value} {transaction.token}
                          </div>
                          <div className="text-slate-400 text-sm">
                            {transaction.from.slice(0, 6)}...{transaction.from.slice(-4)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  </div>
                ) : (
                <div className="text-center py-12">
                  <div className="p-6 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                    <Activity className="h-12 w-12 text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-3">Nenhuma Transação Ainda</h3>
                  <p className="text-slate-300 mb-8 max-w-md mx-auto">
                    Seu histórico de transações aparecerá aqui assim que você começar a fazer transações com sua carteira inteligente.
                    </p>
                    <Button
                    className="btn-primary bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
                      onClick={() => loadHistory()}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                      <Activity className="h-4 w-4 mr-2" />
                      )}
                      Carregar Histórico
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}


        {/* Wallet Settings */}
        {isRegistered && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <div className="p-2 bg-gradient-to-r from-slate-600 to-slate-700 rounded-lg mr-3">
                  <Settings className="h-6 w-6 text-white" />
                </div>
                Configurações da Carteira
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-semibold">Rede</div>
                      <div className="text-slate-400 text-sm">Ethereum Mainnet</div>
                    </div>
                    <Badge variant="secondary" className="bg-blue-600/20 text-blue-400 border-blue-500/30">
                      Ativa
                    </Badge>
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-semibold">Abstração de Conta</div>
                      <div className="text-slate-400 text-sm">Carteira Inteligente ERC-4337</div>
                  </div>
                    <Badge variant="secondary" className="bg-emerald-600/20 text-emerald-400 border-emerald-500/30">
                      Habilitada
                    </Badge>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full border-slate-500/30 bg-slate-800/30 text-slate-200 hover:text-white hover:bg-slate-700/60 hover:border-slate-400/50 transition-all duration-200"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Configurações Avançadas
                </Button>
              </div>
            </CardContent>
          </Card>
        )}


        {/* Smart Wallet Features */}
          <Card className="glass-card">
            <CardHeader>
            <CardTitle className="text-white flex items-center">
              <div className="p-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg mr-3">
                <Zap className="h-6 w-6 text-white" />
              </div>
              Recursos da Carteira Inteligente
            </CardTitle>
            </CardHeader>
            <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="p-4 bg-gradient-to-br from-emerald-600/20 to-green-600/20 rounded-xl border border-emerald-500/30">
                <div className="flex items-center mb-3">
                  <div className="p-2 bg-emerald-500/20 rounded-lg mr-3">
                    <Shield className="h-5 w-5 text-emerald-400" />
                  </div>
                  <span className="text-white font-semibold">Abstração de Conta</span>
                </div>
                <p className="text-slate-300 text-sm">Carteira inteligente ERC-4337 com transações sem gas e segurança avançada</p>
              </div>

              <div className="p-4 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-xl border border-blue-500/30">
                <div className="flex items-center mb-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg mr-3">
                    <TrendingUp className="h-5 w-5 text-blue-400" />
                  </div>
                  <span className="text-white font-semibold">Acompanhamento de Portfólio</span>
                </div>
                <p className="text-slate-300 text-sm">Saldos de tokens em tempo real, valor do portfólio e análises de desempenho</p>
                </div>

              <div className="p-4 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-xl border border-purple-500/30">
                <div className="flex items-center mb-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg mr-3">
                    <Activity className="h-5 w-5 text-purple-400" />
                  </div>
                  <span className="text-white font-semibold">Histórico de Transações</span>
                </div>
                <p className="text-slate-300 text-sm">Histórico completo de transações com análises detalhadas e insights</p>
                </div>

              <div className="p-4 bg-gradient-to-br from-orange-600/20 to-red-600/20 rounded-xl border border-orange-500/30">
                <div className="flex items-center mb-3">
                  <div className="p-2 bg-orange-500/20 rounded-lg mr-3">
                    <Plus className="h-5 w-5 text-orange-400" />
                  </div>
                  <span className="text-white font-semibold">Entrada de Fiat</span>
                </div>
                <p className="text-slate-300 text-sm">Depósitos fiat (BRL) para USDC via PIX e cartão de crédito com KYC integrado</p>
              </div>

              <div className="p-4 bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-xl border border-green-500/30">
                <div className="flex items-center mb-3">
                  <div className="p-2 bg-green-500/20 rounded-lg mr-3">
                    <Smartphone className="h-5 w-5 text-green-400" />
                  </div>
                  <span className="text-white font-semibold">Saída de Fiat</span>
                </div>
                <p className="text-slate-300 text-sm">Saques USDC para fiat (BRL) com liquidação automática na conta bancária</p>
              </div>
            </div>
            </CardContent>
          </Card>
      </div>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </AppLayout>
  );
}