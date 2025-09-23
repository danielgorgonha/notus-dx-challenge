"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useAuth } from "@/contexts/auth-context";
import { useSmartWallet } from "@/hooks/use-smart-wallet";
import { useToast } from "@/hooks/use-toast";
import { ToastContainer } from "@/components/ui/toast";
import { usePrivy } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Wallet, 
  Copy, 
  ExternalLink, 
  Plus, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  TrendingUp, 
  Activity,
  AlertCircle,
  CheckCircle,
  Loader2,
  Zap,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  Shield,
  Sparkles,
  BarChart3,
  Settings,
  QrCode,
  Smartphone,
  CreditCard,
  Banknote,
  ArrowDown,
  User
} from "lucide-react";
import { useState, useEffect } from "react";
import QRCodeLib from 'qrcode';
import { DepositModal } from "@/components/modals/deposit-modal";

export default function WalletPage() {
  const { user } = useAuth();
  const { createWallet } = usePrivy();
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositToken, setDepositToken] = useState('USDC');
  const [depositType, setDepositType] = useState<'crypto' | 'pix'>('crypto');
  
  // PIX States
  const [pixDescription, setPixDescription] = useState('');
  const [pixQrCode, setPixQrCode] = useState('');
  const [pixKey, setPixKey] = useState('pix@notus.team');
  const [showPixQr, setShowPixQr] = useState(false);
  
  // Deposit Modal States
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [kycCompleted, setKycCompleted] = useState(false);
  const [individualId, setIndividualId] = useState<string>('');
  
  const {
    wallet,
    portfolio,
    history,
    loading,
    error,
    isRegistered,
    walletAddress,
    registerWallet,
    loadPortfolio,
    loadHistory,
    createDeposit,
    updateMetadata,
  } = useSmartWallet();

  const { toasts, removeToast, success, error: showError } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    success('Copied!', 'Wallet address copied to clipboard');
  };

  const handleCreateDeposit = async () => {
    if (!depositAmount || !depositToken) return;
    
    try {
      await createDeposit(depositAmount, depositToken);
      setDepositAmount('');
      success('Deposit Created!', `Created deposit of ${depositAmount} ${depositToken}`);
    } catch (error) {
      console.error('Failed to create deposit:', error);
      showError('Deposit Failed', 'Failed to create deposit transaction');
    }
  };

  const handleCreateWallet = async () => {
    try {
      await createWallet();
      success('Wallet Created!', 'Embedded wallet created successfully');
    } catch (error: any) {
      console.error('Failed to create wallet:', error);
      if (error.message?.includes('already has an embedded wallet')) {
        showError('Wallet Already Exists', 'You already have an embedded wallet. Please refresh the page.');
      } else {
        showError('Wallet Creation Failed', 'Failed to create embedded wallet');
      }
    }
  };

  // PIX Functions
  const generatePixQrCode = async () => {
    if (!depositAmount) {
      showError('Valor Obrigatório', 'Por favor, informe o valor do PIX');
      return;
    }

    try {
      // Simula geração de PIX (em produção, isso viria de uma API)
      const pixData = {
        pixKey: pixKey,
        amount: parseFloat(depositAmount),
        description: pixDescription || 'Depósito via PIX - Notus Wallet',
        merchantName: 'Notus Wallet',
        merchantCity: 'São Paulo',
        txid: `PIX${Date.now()}${Math.random().toString(36).substr(2, 9)}`
      };

      // Gera QR Code PIX (formato simplificado para demo)
      const qrData = `pix://${pixKey}?amount=${depositAmount}&description=${encodeURIComponent(pixData.description)}`;
      
      const qrCodeDataUrl = await QRCodeLib.toDataURL(qrData, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      setPixQrCode(qrCodeDataUrl);
      setShowPixQr(true);
      success('PIX Gerado!', 'QR Code PIX gerado com sucesso');
    } catch (error) {
      console.error('Erro ao gerar PIX:', error);
      showError('Erro PIX', 'Falha ao gerar QR Code PIX');
    }
  };

  const copyPixKey = () => {
    navigator.clipboard.writeText(pixKey);
    success('Chave Copiada!', 'Chave PIX copiada para a área de transferência');
  };

  const resetPix = () => {
    setDepositAmount('');
    setPixDescription('');
    setPixQrCode('');
    setShowPixQr(false);
  };

  // KYC Functions
  const handleKYCComplete = (id: string) => {
    setIndividualId(id);
    setKycCompleted(true);
    success('KYC Aprovado!', 'Verificação de identidade concluída com sucesso');
  };

  // Withdraw Functions
  const handleWithdrawComplete = (amount: string, method: string) => {
    success('Saque Solicitado!', `Saque de ${amount} USDC via ${method} processado com sucesso`);
  };

  return (
    <DashboardLayout 
      title="Smart Wallet"
      description="Manage your smart wallet and view wallet details"
      onDepositClick={() => setShowDepositModal(true)}
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
                    <p className="text-slate-400 text-sm">Total Balance</p>
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
                    <p className="text-slate-400 text-sm">Wallet Status</p>
                    <p className="text-lg font-semibold text-white">
                      {isRegistered ? 'Active' : 'Pending'}
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
                    <p className="text-slate-400 text-sm">Transactions</p>
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
                Smart Wallet
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
                      <span className="text-slate-400 text-sm">Wallet Address</span>
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
                      <div className="text-sm text-slate-400">Notus API Status</div>
                        <div className="text-white font-semibold">
                        {isRegistered ? 'Registered' : 'Not Registered'}
                      </div>
                    </div>
                    <Badge 
                      variant="secondary" 
                        className={isRegistered ? "bg-emerald-600/20 text-emerald-400 border-emerald-500/30" : "bg-yellow-600/20 text-yellow-400 border-yellow-500/30"}
                    >
                      {isRegistered ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Pending
                        </>
                      )}
                    </Badge>
                    </div>
                  </div>

                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-slate-400">Network</div>
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
                        Register with Notus API
                      </Button>
                    </div>
                  )}

                  {!walletAddress && (
                  <div className="text-center py-8">
                    <div className="p-4 bg-gradient-to-r from-blue-600/20 to-emerald-600/20 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                      <Wallet className="h-10 w-10 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No Wallet Connected</h3>
                    <p className="text-slate-300 mb-6 max-w-md mx-auto">
                      Create an embedded wallet to access all Smart Wallet features including account abstraction and gasless transactions.
                    </p>
                      <Button 
                      className="btn-primary bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 transition-all duration-200"
                        onClick={handleCreateWallet}
                      >
                          <Plus className="h-4 w-4 mr-2" />
                        Create Embedded Wallet
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
              <div className="text-center py-12">
                <div className="p-6 bg-gradient-to-r from-blue-600/20 to-emerald-600/20 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <Wallet className="h-12 w-12 text-blue-400" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3">Welcome to Smart Wallet</h3>
                <p className="text-slate-300 mb-8 max-w-lg mx-auto">
                  Create your first embedded wallet to start using account abstraction, gasless transactions, and advanced DeFi features.
                  </p>
                  <Button 
                  className="btn-primary bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-lg px-8 py-3 transition-all duration-200"
                    onClick={handleCreateWallet}
                  >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Your Wallet
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
                  Portfolio Overview
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
                      <div className="text-slate-400 text-lg">Total Portfolio Value</div>
                      <div className="text-emerald-400 text-sm mt-2">
                        {portfolio.tokens.length} token{portfolio.tokens.length !== 1 ? 's' : ''} in portfolio
                      </div>
                    </div>
                    </div>

                  {/* Token List */}
                    <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-white mb-4">Token Holdings</h4>
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
                  <h3 className="text-2xl font-semibold text-white mb-3">Portfolio Ready</h3>
                  <p className="text-slate-300 mb-8 max-w-md mx-auto">
                    Your portfolio data will appear here once you load it. Track your token balances and portfolio performance.
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
                      Load Portfolio
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
                  Transaction History
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
                        <div className="text-slate-400 text-sm">Total Transactions</div>
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
                  <h3 className="text-2xl font-semibold text-white mb-3">No Transactions Yet</h3>
                  <p className="text-slate-300 mb-8 max-w-md mx-auto">
                    Your transaction history will appear here once you start making transactions with your smart wallet.
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
                      Load History
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
                Wallet Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-semibold">Network</div>
                      <div className="text-slate-400 text-sm">Ethereum Mainnet</div>
                    </div>
                    <Badge variant="secondary" className="bg-blue-600/20 text-blue-400 border-blue-500/30">
                      Active
                    </Badge>
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-semibold">Account Abstraction</div>
                      <div className="text-slate-400 text-sm">ERC-4337 Smart Wallet</div>
                  </div>
                    <Badge variant="secondary" className="bg-emerald-600/20 text-emerald-400 border-emerald-500/30">
                      Enabled
                    </Badge>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full border-slate-500/30 bg-slate-800/30 text-slate-200 hover:text-white hover:bg-slate-700/60 hover:border-slate-400/50 transition-all duration-200"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Advanced Settings
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
              Smart Wallet Features
            </CardTitle>
            </CardHeader>
            <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="p-4 bg-gradient-to-br from-emerald-600/20 to-green-600/20 rounded-xl border border-emerald-500/30">
                <div className="flex items-center mb-3">
                  <div className="p-2 bg-emerald-500/20 rounded-lg mr-3">
                    <Shield className="h-5 w-5 text-emerald-400" />
                  </div>
                  <span className="text-white font-semibold">Account Abstraction</span>
                </div>
                <p className="text-slate-300 text-sm">ERC-4337 smart wallet with gasless transactions and advanced security</p>
              </div>

              <div className="p-4 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-xl border border-blue-500/30">
                <div className="flex items-center mb-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg mr-3">
                    <TrendingUp className="h-5 w-5 text-blue-400" />
                  </div>
                  <span className="text-white font-semibold">Portfolio Tracking</span>
                </div>
                <p className="text-slate-300 text-sm">Real-time token balances, portfolio value, and performance analytics</p>
                </div>

              <div className="p-4 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-xl border border-purple-500/30">
                <div className="flex items-center mb-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg mr-3">
                    <Activity className="h-5 w-5 text-purple-400" />
                  </div>
                  <span className="text-white font-semibold">Transaction History</span>
                </div>
                <p className="text-slate-300 text-sm">Complete transaction history with detailed analytics and insights</p>
                </div>

              <div className="p-4 bg-gradient-to-br from-orange-600/20 to-red-600/20 rounded-xl border border-orange-500/30">
                <div className="flex items-center mb-3">
                  <div className="p-2 bg-orange-500/20 rounded-lg mr-3">
                    <Plus className="h-5 w-5 text-orange-400" />
                  </div>
                  <span className="text-white font-semibold">On-Ramp Fiat</span>
                </div>
                <p className="text-slate-300 text-sm">Depósitos fiat (BRL) para USDC via PIX e cartão de crédito com KYC integrado</p>
              </div>

              <div className="p-4 bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-xl border border-green-500/30">
                <div className="flex items-center mb-3">
                  <div className="p-2 bg-green-500/20 rounded-lg mr-3">
                    <Smartphone className="h-5 w-5 text-green-400" />
                    </div>
                  <span className="text-white font-semibold">Off-Ramp Fiat</span>
                </div>
                <p className="text-slate-300 text-sm">Saques USDC para fiat (BRL) com liquidação automática na conta bancária</p>
                </div>
              </div>
            </CardContent>
          </Card>
      </div>

      {/* Deposit Modal */}
      <DepositModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        onKYCComplete={handleKYCComplete}
        onWithdrawComplete={handleWithdrawComplete}
        kycCompleted={kycCompleted}
        individualId={individualId}
      />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </DashboardLayout>
  );
}