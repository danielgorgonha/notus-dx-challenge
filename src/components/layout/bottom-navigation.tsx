/**
 * Bottom Navigation Component (Mobile)
 * Navegação inferior para dispositivos móveis
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard,
  ArrowRightLeft,
  Zap,
  Wallet,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    name: "Início",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Portfólio",
    href: "/portfolio",
    icon: Wallet,
  },
  {
    name: "Cripto",
    href: "/crypto",
    icon: DollarSign,
  },
  {
    name: "Renda",
    href: "/pools",
    icon: TrendingUp,
  },
  {
    name: "Pools",
    href: "/pools",
    icon: Zap,
  },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[50] bg-slate-900/95 backdrop-blur-xl border-t border-slate-700/50 lg:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navigationItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          
          return (
            <Link
              key={`${item.href}-${index}`}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full min-w-0 px-2 rounded-lg transition-colors",
                isActive
                  ? "text-yellow-400 bg-yellow-500/10"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              )}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium truncate w-full text-center">
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
      
      {/* Safe area for devices with notch */}
      <div className="h-safe-area-inset-bottom bg-slate-900/95" />
    </nav>
  );
}

