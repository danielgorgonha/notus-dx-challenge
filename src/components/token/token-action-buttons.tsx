/**
 * Token Action Buttons Component
 * Botões de ação: Depositar, Sacar, Receber, Enviar, Converter
 */

"use client";

import { useRouter } from "next/navigation";
import { Building2, DollarSign, ArrowDown, ArrowUp, ArrowRightLeft } from "lucide-react";

interface TokenActionButtonsProps {
  token: any;
}

export function TokenActionButtons({ token }: TokenActionButtonsProps) {
  const router = useRouter();

  const actions = [
    {
      label: 'Depositar',
      icon: Building2,
      action: () => router.push('/wallet/deposit'),
    },
    {
      label: 'Sacar',
      icon: DollarSign,
      action: () => router.push('/wallet/withdraw'),
    },
    {
      label: 'Receber',
      icon: ArrowDown,
      action: () => router.push('/wallet/receive'),
    },
    {
      label: 'Enviar',
      icon: ArrowUp,
      action: () => router.push('/transfer'),
    },
    {
      label: 'Converter',
      icon: ArrowRightLeft,
      action: () => router.push('/swap'),
    },
  ];

  return (
    <div className="px-4 lg:px-6">
      <div className="flex items-center justify-around gap-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              onClick={action.action}
              className="flex flex-col items-center justify-center gap-2 w-full max-w-[70px] p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 transition-colors active:scale-95"
            >
              <div className="w-10 h-10 rounded-full bg-slate-700/50 flex items-center justify-center">
                <Icon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xs text-white font-medium text-center">
                {action.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

