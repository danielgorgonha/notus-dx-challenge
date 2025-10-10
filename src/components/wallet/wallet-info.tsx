"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Wallet, 
  Copy, 
  ExternalLink, 
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useState } from "react";

interface WalletInfoProps {
  user: {
    id: string;
    wallet?: {
      address: string;
    };
    accountAbstractionAddress?: string;
  };
}

export function WalletInfo({ user }: WalletInfoProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const formatAddress = (address: string) => {
    if (!address) return 'N/A';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <div className="p-2 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-lg mr-3">
            <Wallet className="h-6 w-6 text-white" />
          </div>
          Informações da Carteira
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* User ID */}
          <div className="p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-400">ID do Usuário</div>
                <div className="text-white font-semibold">{user.id}</div>
              </div>
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                Privy ID
              </Badge>
            </div>
          </div>

          {/* EOA Wallet Address */}
          <div className="p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-slate-400">Endereço da Wallet (EOA)</div>
              <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-300">
                Externally Owned Account
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-white font-mono text-sm">
                {user.wallet?.address ? formatAddress(user.wallet.address) : 'N/A'}
              </div>
              {user.wallet?.address && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(user.wallet!.address, 'eoa')}
                    className="h-8 w-8 p-0"
                  >
                    {copiedField === 'eoa' ? (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(`https://etherscan.io/address/${user.wallet!.address}`, '_blank')}
                    className="h-8 w-8 p-0"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Smart Wallet Address */}
          <div className="p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-slate-400">Smart Wallet Address</div>
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                Account Abstraction
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-white font-mono text-sm">
                {user.accountAbstractionAddress ? formatAddress(user.accountAbstractionAddress) : 'N/A'}
              </div>
              {user.accountAbstractionAddress && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(user.accountAbstractionAddress, 'smart')}
                    className="h-8 w-8 p-0"
                  >
                    {copiedField === 'smart' ? (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => user.accountAbstractionAddress && window.open(`https://etherscan.io/address/${user.accountAbstractionAddress}`, '_blank')}
                    className="h-8 w-8 p-0"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-400">Status da Carteira</div>
                <div className="text-white font-semibold flex items-center gap-2">
                  {user.accountAbstractionAddress ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      Ativa
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-yellow-400" />
                      Não Configurada
                    </>
                  )}
                </div>
              </div>
              <Badge 
                variant="secondary" 
                className={user.accountAbstractionAddress 
                  ? "bg-green-500/20 text-green-300" 
                  : "bg-yellow-500/20 text-yellow-300"
                }
              >
                {user.accountAbstractionAddress ? 'Deployed' : 'Pending'}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
