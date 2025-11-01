/**
 * Transaction Detail Modal Component
 * Exibe detalhes completos de uma transação
 */

"use client";

import { X, Share2, Copy, CheckCircle2, ExternalLink } from "lucide-react";
import { useState } from "react";
import { getExplorerUrl } from "@/lib/utils";

interface TransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: any;
}

export function TransactionDetailModal({
  isOpen,
  onClose,
  transaction,
}: TransactionDetailModalProps) {
  const [copiedHash, setCopiedHash] = useState(false);

  if (!transaction || !isOpen) return null;

  // Extrair dados da transação conforme estrutura da API Notus
  const txType = transaction.type?.toLowerCase() || '';
  const isLiquidity = txType === 'liquidity' || txType === 'invest' || txType?.includes('liquidity');
  const status = transaction.status?.toLowerCase() || 'success';
  const isSuccess = status === 'success' || status === 'completed';

  // Dados da API Notus: receivedAmount contém informações do token recebido
  const receivedAmount = (transaction as any).receivedAmount;
  const receivedToken = receivedAmount?.token || receivedAmount?.cryptoCurrency;
  
  // Operation para transações de liquidez/swap
  const operation = transaction.metadata?.operation;
  
  // Token 0: do receivedAmount (transações de recebimento) ou operation (liquidez/swap)
  const token0 = receivedToken || 
                 operation?.token0 || 
                 transaction.metadata?.token0 || 
                 transaction.metadata?.tokenIn;
  const token0Symbol = typeof token0 === 'object' ? token0?.symbol : token0;
  const token0Decimals = typeof token0 === 'object' ? token0?.decimals : transaction.metadata?.token0Decimals || 18;
  const token0Address = typeof token0 === 'object' ? token0?.address : transaction.metadata?.token0Address || transaction.metadata?.token0?.address;
  const token0Logo = typeof token0 === 'object' ? (token0?.logoURL || token0?.logo) : null;
  
  // Token 1: apenas para swap/liquidity
  const token1 = operation?.token1 || 
                 transaction.metadata?.token1 || 
                 transaction.metadata?.tokenOut;
  const token1Symbol = typeof token1 === 'object' ? token1?.symbol : token1;
  const token1Decimals = typeof token1 === 'object' ? token1?.decimals : transaction.metadata?.token1Decimals || 18;
  const token1Address = typeof token1 === 'object' ? token1?.address : transaction.metadata?.token1Address || transaction.metadata?.token1?.address;
  const token1Logo = typeof token1 === 'object' ? (token1?.logoURL || token1?.logo) : null;
  
  // Amount 0: do receivedAmount ou operation
  const amount0 = receivedAmount?.amount ||
                  operation?.token0Amount ||
                  operation?.amountIn ||
                  transaction.metadata?.amount0 || 
                  transaction.metadata?.amountIn || 
                  (transaction as any).amount || '0';
  
  // Amount 1: apenas para swap/liquidity
  const amount1 = operation?.token1Amount ||
                  operation?.amountOut ||
                  transaction.metadata?.amount1 || 
                  transaction.metadata?.amountOut;
  
  // Valores USD: do amountIn.usd ou operation
  const amount0USD = receivedAmount?.amountIn?.usd ||
                     receivedAmount?.amountIn?.USD ||
                     operation?.amountInUSD ||
                     operation?.token0ValueUSD ||
                     transaction.metadata?.amount0USD || 
                     transaction.metadata?.token0ValueUSD ||
                     transaction.metadata?.amountUsd;
  const amount1USD = operation?.amountOutUSD ||
                     operation?.token1ValueUSD ||
                     transaction.metadata?.amount1USD || 
                     transaction.metadata?.token1ValueUSD;
  
  // Sempre usar Polygon (chainId: 137)
  const chainId = 137;
  const chainName = 'POLYGON';
  
  // Hash: do transactionHash.hash ou userOperationHash
  const txHashObj = (transaction as any).transactionHash;
  const txHash = txHashObj?.hash || 
                 transaction.userOperationHash || 
                 transaction.hash || 
                 (transaction as any).txHash || 
                 transaction.id || '';
  
  // Operation type e provider
  const operationType = operation?.type || 
                        transaction.metadata?.operation?.type || 
                        transaction.metadata?.operationType || 
                        (isLiquidity ? 'Add Liquidity' : transaction.type || 'Transaction');
  const provider = operation?.liquidityProvider ||
                   operation?.swapProvider ||
                   transaction.metadata?.provider || 
                   transaction.metadata?.liquidityProvider || 
                   transaction.metadata?.swapProvider ||
                   'UNISWAP_V3';
  
  // NFT info (para liquidez)
  const nftId = transaction.metadata?.nftId || 
                transaction.metadata?.tokenId || 
                transaction.metadata?.nftTokenId ||
                transaction.metadata?.operation?.nftId;
  const nftContractAddress = transaction.metadata?.nftContractAddress || 
                              transaction.metadata?.nftContract || 
                              '0xC36442b4a4522E871399CD717aBDD847AB11FE88';

  // Formatar data
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDatePT = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatAmount = (amount: string | number, decimals: number = 18) => {
    const amountNum = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(amountNum) || amountNum === 0) return '0';
    
    // Se o número é muito grande, provavelmente está em smallest unit (wei)
    // Converter dividindo por 10^decimals
    const num = amountNum > 1e10 ? amountNum / Math.pow(10, decimals) : amountNum;
    if (num === 0) return '0';
    if (num < 0.0001) return num.toFixed(8).replace(/\.?0+$/, '');
    if (num < 1) return num.toFixed(6).replace(/\.?0+$/, '');
    return num.toFixed(2).replace(/\.?0+$/, '');
  };

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num) || num === 0) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const handleCopyHash = async () => {
    if (txHash && navigator.clipboard) {
      await navigator.clipboard.writeText(txHash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  const getTransactionLabel = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'liquidity':
      case 'invest':
        return 'Adição de Liquidez';
      case 'swap':
        return 'Swap';
      case 'transfer':
      case 'send':
        return 'Envio';
      case 'receive':
      case 'deposit':
        return 'Recebimento';
      default:
        return type || 'Transação';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'success':
      case 'completed':
        return 'Sucesso';
      case 'pending':
        return 'Pendente';
      case 'failed':
      case 'error':
        return 'Falhou';
      default:
        return 'Sucesso';
    }
  };

  const explorerUrl = txHash ? getExplorerUrl(txHash, chainId) : null;
  
  // URLs para tokens (precisam usar /token/ ao invés de /address/)
  const getTokenExplorerUrl = (address: string) => {
    if (!address) return null;
    const baseUrl = getExplorerUrl(address, chainId);
    return baseUrl ? baseUrl?.replace('/address/', '/token/') : null;
  };
  
  const token0ExplorerUrl = token0Address ? getTokenExplorerUrl(token0Address) : null;
  const token1ExplorerUrl = token1Address ? getTokenExplorerUrl(token1Address) : null;
  const nftExplorerUrl = getExplorerUrl(nftContractAddress, chainId);

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed bottom-0 left-0 right-0 z-[101] bg-slate-900 text-white h-full max-h-[95vh] overflow-y-auto lg:top-1/2 lg:left-1/2 lg:right-auto lg:bottom-auto lg:-translate-x-1/2 lg:-translate-y-1/2 lg:w-full lg:max-w-2xl lg:h-auto lg:max-h-[90vh] lg:rounded-xl lg:border lg:border-slate-700">
        {/* Handle de arraste (mobile) */}
        <div className="lg:hidden absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-white/20 rounded-full" />
        
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 border-b border-slate-700/50 z-10 px-4 py-3 flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-white hover:text-slate-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
          <button
            className="text-white hover:text-slate-300 transition-colors"
            onClick={() => {
              // TODO: Implementar compartilhamento
              console.log('Compartilhar transação');
            }}
          >
            <Share2 className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 pb-6 space-y-6">
          {/* Ícone de sucesso e data */}
          <div className="flex flex-col items-center pt-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
              isSuccess ? 'bg-green-500/20 border-2 border-green-500/30' : 'bg-yellow-500/20 border-2 border-yellow-500/30'
            }`}>
              <CheckCircle2 className={`h-8 w-8 ${isSuccess ? 'text-green-400' : 'text-yellow-400'}`} />
            </div>
            <div className="text-slate-400 text-sm mb-1">
              {formatDate(transaction.createdAt || transaction.timestamp)} - {formatTime(transaction.createdAt || transaction.timestamp)}
            </div>
            <div className="text-white text-2xl font-bold text-center mb-1">
              {amount0 && formatAmount(amount0.toString(), token0Decimals)} {token1Symbol && amount1 && `+ ${formatAmount(amount1.toString(), token1Decimals)}`}
            </div>
            <div className="text-slate-400 text-sm mb-4">
              {token0Symbol} {token1Symbol && token1Symbol}
            </div>
            <div className="text-white font-medium mb-4">
              {getTransactionLabel(transaction.type || '')}
            </div>
            
            {/* Hash da transação */}
            {txHash && (
              <div className="w-full bg-slate-800/50 rounded-lg p-3 flex items-center justify-between border border-slate-700/50">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-slate-400 text-sm">txhash</span>
                  <span className="text-white text-sm font-mono truncate">
                    {txHash.length > 12 ? `${txHash.slice(0, 6)}...${txHash.slice(-6)}` : txHash}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyHash}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    <Copy className={`h-4 w-4 ${copiedHash ? 'text-green-400' : ''}`} />
                  </button>
                  {explorerUrl && (
                    <a
                      href={explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Seção "Você enviou" */}
          {(amount0 || amount1) && (
            <div className="space-y-3">
              <div className="text-white font-semibold mb-3">Você enviou</div>
              
              {amount0 && token0Symbol && (
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                  <div className="text-white text-lg font-medium">
                    {formatAmount(amount0.toString(), token0Decimals)} {token0Symbol}
                  </div>
                  {amount0USD && (
                    <div className="text-slate-400 text-sm mt-1">
                      {formatCurrency(amount0USD)}
                    </div>
                  )}
                </div>
              )}
              
              {amount1 && token1Symbol && (
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                  <div className="text-white text-lg font-medium">
                    {formatAmount(amount1.toString(), token1Decimals)} {token1Symbol}
                  </div>
                  {amount1USD && (
                    <div className="text-slate-400 text-sm mt-1">
                      {formatCurrency(amount1USD)}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Informações dos tokens */}
          <div className="space-y-3">
            {token0Symbol && (
              <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
                <span className="text-white">Token 1</span>
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center overflow-hidden ${
                    token0Symbol === 'WBTC' || token0Symbol === 'BTC'
                      ? 'bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30'
                      : 'bg-slate-700/50 border border-slate-600/50'
                  }`}>
                    {token0Logo ? (
                      <img src={token0Logo} alt={token0Symbol} className="w-full h-full object-cover" />
                    ) : (
                      <span className={`text-xs font-bold ${
                        token0Symbol === 'WBTC' || token0Symbol === 'BTC'
                          ? 'text-white'
                          : 'text-white'
                      }`}>
                        {token0Symbol === 'WBTC' ? 'B' : token0Symbol?.charAt(0)}
                      </span>
                    )}
                  </div>
                  <span className="text-white font-semibold">{token0Symbol}</span>
                </div>
              </div>
            )}

            {token1Symbol && (
              <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
                <span className="text-white">Token 2</span>
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center overflow-hidden ${
                    token1Symbol === 'WETH' || token1Symbol === 'ETH'
                      ? 'bg-white/10 border border-white/20'
                      : 'bg-slate-700/50 border border-slate-600/50'
                  }`}>
                    {token1Logo ? (
                      <img src={token1Logo} alt={token1Symbol} className="w-full h-full object-cover" />
                    ) : (
                      <span className={`text-xs font-bold ${
                        token1Symbol === 'WETH' || token1Symbol === 'ETH'
                          ? 'text-purple-400'
                          : 'text-white'
                      }`}>
                        {token1Symbol === 'WETH' ? 'WETH' : token1Symbol?.charAt(0)}
                      </span>
                    )}
                  </div>
                  <span className="text-white font-semibold">{token1Symbol}</span>
                </div>
              </div>
            )}

            {/* Rede */}
            <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
              <span className="text-white">Rede</span>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                  <span className="text-purple-400 font-bold text-xs">P</span>
                </div>
                <span className="text-white font-semibold">{chainName}</span>
              </div>
            </div>

            {/* Contratos dos tokens */}
            {token0Address && (
              <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
                <span className="text-white">Contrato do token 1</span>
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm font-mono">
                    {token0Address.length > 12 ? `${token0Address.slice(0, 6)}...${token0Address.slice(-6)}` : token0Address}
                  </span>
                  {token0ExplorerUrl && (
                    <a
                      href={token0ExplorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {token1Address && (
              <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
                <span className="text-white">Contrato do token 2</span>
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm font-mono">
                    {token1Address.length > 12 ? `${token1Address.slice(0, 6)}...${token1Address.slice(-6)}` : token1Address}
                  </span>
                  {token1ExplorerUrl && (
                    <a
                      href={token1ExplorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Seção "Você recebeu" (para liquidez) */}
          {isLiquidity && (
            <div className="space-y-3">
              <div className="text-white font-semibold mb-3">Você recebeu</div>
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                <div className="text-white text-lg font-medium">
                  Uniswap V3 Positions NFT {nftId ? `#${nftId}` : ''}
                </div>
              </div>
              
              {/* Rede do NFT */}
              <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
                <span className="text-white">Rede</span>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                    <span className="text-purple-400 font-bold text-xs">P</span>
                  </div>
                  <span className="text-white font-semibold">{chainName}</span>
                </div>
              </div>

              {/* Contrato do NFT */}
              <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
                <span className="text-white">Contrato do NFT</span>
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm font-mono">
                    {nftContractAddress.length > 12 ? `${nftContractAddress.slice(0, 6)}...${nftContractAddress.slice(-6)}` : nftContractAddress}
                  </span>
                  {nftExplorerUrl && (
                    <a
                      href={nftExplorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Informações da operação */}
          <div className="space-y-3 pt-3">
            <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
              <span className="text-white">Operação</span>
              <span className="text-white font-semibold">{operationType}</span>
            </div>

            {provider && (
              <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
                <span className="text-white">Provedor</span>
                <span className="text-white font-semibold">{provider}</span>
              </div>
            )}

            <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
              <span className="text-white">Status da transação</span>
              <span className={`font-semibold ${isSuccess ? 'text-green-400' : status === 'pending' ? 'text-yellow-400' : 'text-red-400'}`}>
                {getStatusLabel(status)}
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
              <span className="text-white">Data da transação</span>
              <span className="text-white font-semibold">
                {formatDatePT(transaction.createdAt || transaction.timestamp)}
              </span>
            </div>

            {txHash && (
              <div className="flex items-center justify-between py-3">
                <span className="text-white">ID da transação</span>
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm font-mono">
                    {txHash.length > 14 ? `${txHash.slice(0, 6)}...${txHash.slice(-8)}` : txHash}
                  </span>
                  {explorerUrl && (
                    <a
                      href={explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

