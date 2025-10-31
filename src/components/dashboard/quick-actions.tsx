/**
 * Quick Actions Component (Client)
 * Botões de ações rápidas
 */

"use client";

import { Button } from "@/components/ui/button";
import { ArrowRightLeft, Wallet, Droplets, Shield, Activity, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export function QuickActions() {
  const router = useRouter();

  return (
    <div className="glass-card">
      <h2 className="text-xl font-bold text-white mb-6">Ações Rápidas</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <Button 
          onClick={() => router.push('/wallet/deposit')}
          className="h-20 sm:h-24 flex flex-col items-center justify-center bg-green-600/10 border border-green-500/20 hover:bg-green-600/20 group relative"
          title="Adicionar saldo"
        >
          <Plus className="h-8 w-8 text-green-400 mb-2" />
          <span className="font-semibold text-white">Depositar</span>
          <span className="text-xs text-slate-400">Adicionar fundos</span>
        </Button>

        <Button 
          onClick={() => router.push('/swap')}
          className="h-24 flex flex-col items-center justify-center bg-blue-600/10 border border-blue-500/20 hover:bg-blue-600/20 group relative"
          title="Trocar uma cripto por outra"
        >
          <ArrowRightLeft className="h-8 w-8 text-blue-400 mb-2" />
          <span className="font-semibold text-white">Swap</span>
          <span className="text-xs text-slate-400">Trocar tokens</span>
        </Button>

        <Button 
          onClick={() => router.push('/transfer')}
          className="h-24 flex flex-col items-center justify-center bg-emerald-600/10 border border-emerald-500/20 hover:bg-emerald-600/20 group relative"
          title="Enviar para outra pessoa"
        >
          <Wallet className="h-8 w-8 text-emerald-400 mb-2" />
          <span className="font-semibold text-white">Enviar</span>
          <span className="text-xs text-slate-400">Transferir tokens</span>
        </Button>

        <Button 
          onClick={() => router.push('/history')}
          className="h-24 flex flex-col items-center justify-center bg-purple-600/10 border border-purple-500/20 hover:bg-purple-600/20 group relative"
          title="Ver histórico"
        >
          <Activity className="h-8 w-8 text-purple-400 mb-2" />
          <span className="font-semibold text-white">Histórico</span>
          <span className="text-xs text-slate-400">Ver transações</span>
        </Button>

        <Button 
          onClick={() => router.push('/pools')}
          className="h-24 flex flex-col items-center justify-center bg-yellow-600/10 border border-yellow-500/20 hover:bg-yellow-600/20 group relative"
          title="Ganhar rendimento"
        >
          <Droplets className="h-8 w-8 text-yellow-400 mb-2" />
          <span className="font-semibold text-white">Pools</span>
          <span className="text-xs text-slate-400">Liquidez</span>
        </Button>

        <Button 
          onClick={() => router.push('/profile/kyc')}
          className="h-24 flex flex-col items-center justify-center bg-red-600/10 border border-red-500/20 hover:bg-red-600/20 group relative"
          title="Verificar identidade"
        >
          <Shield className="h-8 w-8 text-red-400 mb-2" />
          <span className="font-semibold text-white">KYC</span>
          <span className="text-xs text-slate-400">Verificar</span>
        </Button>
      </div>
    </div>
  );
}

