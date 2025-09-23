"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { 
  LayoutDashboard, 
  Wallet, 
  ArrowRightLeft, 
  Zap, 
  History,
  Lock
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Smart Wallet",
    href: "/wallet",
    icon: Wallet,
  },
  {
    name: "Swap & Transfer",
    href: "/swap",
    icon: ArrowRightLeft,
  },
  {
    name: "Liquidity Pools",
    href: "/liquidity",
    icon: Zap,
  },
  {
    name: "History",
    href: "/history",
    icon: History,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <div className="fixed left-0 top-0 w-72 h-full bg-slate-900/95 backdrop-blur-xl border-r border-white/10 z-50">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-emerald-500 rounded-xl flex items-center justify-center mr-3">
            <Lock className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-white text-lg">Notus DX</div>
            <div className="text-slate-400 text-xs">Challenge</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-6">
        <div className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Status */}
      <div className="absolute bottom-6 left-6 right-6">
        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-full mr-3"></div>
            <div>
              <div className="font-semibold text-white text-sm">
                {user?.wallet?.address 
                  ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}`
                  : user?.email?.address 
                    ? user.email.address.slice(0, 10) + "..."
                    : "0x1234...5678"
                }
              </div>
              <div className="text-emerald-400 text-xs">
                {user?.wallet?.address ? "Wallet Connected" : "Email Connected"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
