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
    <div className="glass-card relative overflow-hidden group">
      {/* Efeito de brilho decorativo */}
      <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-yellow-500/10 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl flex items-center justify-center border border-yellow-500/30">
            <span className="text-2xl">⚡</span>
          </div>
          <h2 className="text-xl font-bold text-white">Ações Rápidas</h2>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <Button 
            onClick={() => router.push('/wallet/deposit')}
            className="h-24 sm:h-28 flex flex-col items-center justify-center bg-gradient-to-br from-green-600/20 to-green-700/20 border border-green-500/30 hover:from-green-600/30 hover:to-green-700/30 hover:border-green-400/50 group/item relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/20"
            title="Adicionar saldo"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity" />
            <Plus className="h-7 w-7 text-green-400 mb-2 relative z-10 group-hover/item:scale-110 transition-transform" />
            <span className="font-bold text-white text-sm relative z-10">Depositar</span>
            <span className="text-xs text-slate-300 relative z-10">Adicionar fundos</span>
          </Button>

          <Button 
            onClick={() => router.push('/swap')}
            className="h-24 sm:h-28 flex flex-col items-center justify-center bg-gradient-to-br from-blue-600/20 to-blue-700/20 border border-blue-500/30 hover:from-blue-600/30 hover:to-blue-700/30 hover:border-blue-400/50 group/item relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20"
            title="Trocar uma cripto por outra"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity" />
            <ArrowRightLeft className="h-7 w-7 text-blue-400 mb-2 relative z-10 group-hover/item:scale-110 transition-transform" />
            <span className="font-bold text-white text-sm relative z-10">Swap</span>
            <span className="text-xs text-slate-300 relative z-10">Trocar tokens</span>
          </Button>

          <Button 
            onClick={() => router.push('/transfer')}
            className="h-24 sm:h-28 flex flex-col items-center justify-center bg-gradient-to-br from-emerald-600/20 to-emerald-700/20 border border-emerald-500/30 hover:from-emerald-600/30 hover:to-emerald-700/30 hover:border-emerald-400/50 group/item relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/20"
            title="Enviar para outra pessoa"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity" />
            <Wallet className="h-7 w-7 text-emerald-400 mb-2 relative z-10 group-hover/item:scale-110 transition-transform" />
            <span className="font-bold text-white text-sm relative z-10">Enviar</span>
            <span className="text-xs text-slate-300 relative z-10">Transferir tokens</span>
          </Button>

          <Button 
            onClick={() => router.push('/history')}
            className="h-24 sm:h-28 flex flex-col items-center justify-center bg-gradient-to-br from-purple-600/20 to-purple-700/20 border border-purple-500/30 hover:from-purple-600/30 hover:to-purple-700/30 hover:border-purple-400/50 group/item relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20"
            title="Ver histórico"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity" />
            <Activity className="h-7 w-7 text-purple-400 mb-2 relative z-10 group-hover/item:scale-110 transition-transform" />
            <span className="font-bold text-white text-sm relative z-10">Histórico</span>
            <span className="text-xs text-slate-300 relative z-10">Ver transações</span>
          </Button>

          <Button 
            onClick={() => router.push('/pools')}
            className="h-24 sm:h-28 flex flex-col items-center justify-center bg-gradient-to-br from-yellow-600/20 to-yellow-700/20 border border-yellow-500/30 hover:from-yellow-600/30 hover:to-yellow-700/30 hover:border-yellow-400/50 group/item relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/20"
            title="Ganhar rendimento"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity" />
            <Droplets className="h-7 w-7 text-yellow-400 mb-2 relative z-10 group-hover/item:scale-110 transition-transform" />
            <span className="font-bold text-white text-sm relative z-10">Pools</span>
            <span className="text-xs text-slate-300 relative z-10">Liquidez</span>
          </Button>

          <Button 
            onClick={() => router.push('/profile/kyc')}
            className="h-24 sm:h-28 flex flex-col items-center justify-center bg-gradient-to-br from-red-600/20 to-red-700/20 border border-red-500/30 hover:from-red-600/30 hover:to-red-700/30 hover:border-red-400/50 group/item relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/20"
            title="Verificar identidade"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity" />
            <Shield className="h-7 w-7 text-red-400 mb-2 relative z-10 group-hover/item:scale-110 transition-transform" />
            <span className="font-bold text-white text-sm relative z-10">KYC</span>
            <span className="text-xs text-slate-300 relative z-10">Verificar</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

