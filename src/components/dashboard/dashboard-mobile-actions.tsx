/**
 * Dashboard Mobile Actions Component
 * Menu de ações rápidas: Depositar, Sacar, Converter, Receber, Enviar
 */

"use client";

import { useRouter } from "next/navigation";
import { Plus, Receipt, ArrowUpDown, Download, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

const actions = [
  {
    name: "Depositar",
    icon: Plus,
    color: "from-green-500 to-green-600",
    bgColor: "from-green-600/20 to-green-700/20",
    borderColor: "border-green-500/30",
    href: "/wallet/deposit",
  },
  {
    name: "Sacar",
    icon: Receipt,
    color: "from-blue-500 to-blue-600",
    bgColor: "from-blue-600/20 to-blue-700/20",
    borderColor: "border-blue-500/30",
    href: "/wallet/withdraw",
  },
  {
    name: "Converter",
    icon: ArrowUpDown,
    color: "from-purple-500 to-purple-600",
    bgColor: "from-purple-600/20 to-purple-700/20",
    borderColor: "border-purple-500/30",
    href: "/swap",
  },
  {
    name: "Receber",
    icon: Download,
    color: "from-yellow-500 to-yellow-600",
    bgColor: "from-yellow-600/20 to-yellow-700/20",
    borderColor: "border-yellow-500/30",
    href: "/wallet/receive",
  },
  {
    name: "Enviar",
    icon: Send,
    color: "from-red-500 to-red-600",
    bgColor: "from-red-600/20 to-red-700/20",
    borderColor: "border-red-500/30",
    href: "/transfer",
  },
];

export function DashboardMobileActions() {
  const router = useRouter();

  return (
    <div className="lg:hidden px-5 py-6 bg-gradient-to-b from-slate-900/50 to-slate-950">
      <div className="flex items-center justify-around">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.name}
              onClick={() => router.push(action.href)}
              className="flex flex-col items-center gap-2.5 group active:scale-95 transition-transform"
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${action.bgColor} border ${action.borderColor} rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 group-active:scale-95 transition-all duration-200`}>
                <Icon className="h-7 w-7 text-white" />
              </div>
              <span className="text-white text-xs font-semibold">{action.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

