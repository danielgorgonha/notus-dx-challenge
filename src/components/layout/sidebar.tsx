"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Wallet, 
  ArrowRightLeft, 
  Zap, 
  History,
  Lock,
  Shield,
  Plus,
  ChevronDown,
  ChevronRight,
  X,
  Menu,
  BarChart3
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
    submenu: [
      {
        name: "Overview",
        href: "/wallet",
        icon: BarChart3,
      },
      {
        name: "KYC",
        href: "/wallet/kyc",
        icon: Shield,
      },
      {
        name: "Depósito",
        href: "/wallet/deposit",
        icon: Plus,
      },
    ]
  },
  {
    name: "Swap & Transfer",
    href: "/swap",
    icon: ArrowRightLeft,
    disabled: true,
  },
  {
    name: "Liquidity Pools",
    href: "/liquidity",
    icon: Zap,
    disabled: true,
  },
  {
    name: "History",
    href: "/history",
    icon: History,
    disabled: true,
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>(['Smart Wallet']);

  const toggleExpanded = (itemName: string) => {
    // Smart Wallet sempre deve ficar aberto
    if (itemName === 'Smart Wallet') {
      return;
    }
    
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  // Garantir que Smart Wallet sempre fique aberto
  useEffect(() => {
    if (!expandedItems.includes('Smart Wallet')) {
      setExpandedItems(prev => [...prev, 'Smart Wallet']);
    }
  }, [expandedItems]);

  const isSubmenuActive = (submenu: { href: string }[]) => {
    return submenu.some(subItem => pathname === subItem.href);
  };

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 w-72 h-full bg-slate-900/95 backdrop-blur-xl border-r border-white/10 z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-emerald-500 rounded-xl flex items-center justify-center mr-3">
                <Lock className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-white text-lg">Notus DX</div>
                <div className="text-slate-400 text-xs">Challenge</div>
              </div>
            </div>
            
            {/* Botão fechar para mobile */}
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>

      {/* Navigation */}
      <nav className="p-6">
        <div className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const hasSubmenu = item.submenu && item.submenu.length > 0;
            const isExpanded = expandedItems.includes(item.name);
            const isSubmenuItemActive = hasSubmenu ? isSubmenuActive(item.submenu) : false;

            if (hasSubmenu) {
              return (
                <div key={item.name}>
                  <div className="flex items-center">
                    <Link
                      href={item.href}
                      className={`nav-item flex-1 flex items-center ${isActive ? 'active' : ''}`}
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      {item.name}
                    </Link>
                    <button
                      onClick={() => toggleExpanded(item.name)}
                      className="p-1 rounded hover:bg-white/10 transition-colors"
                    >
                      {item.name !== 'Smart Wallet' && (
                        isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )
                      )}
                    </button>
                  </div>
                  
                  {isExpanded && (
                    <div className="ml-6 mt-2 space-y-1">
                      {item.submenu.map((subItem) => {
                        const isSubActive = pathname === subItem.href;
                        return (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            className={`nav-item text-sm ${isSubActive ? 'active' : ''}`}
                            onClick={onClose}
                          >
                            <subItem.icon className="h-4 w-4 mr-3" />
                            {subItem.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div
                key={item.name}
                className={`nav-item ${isActive ? 'active' : ''} ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={item.disabled ? (e) => e.preventDefault() : undefined}
              >
                {item.disabled ? (
                  <div className="flex items-center">
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </div>
                ) : (
                  <Link href={item.href} className="flex items-center">
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </Link>
                )}
              </div>
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
                {(user as any)?.wallet?.address 
                  ? `${(user as any).wallet.address.slice(0, 6)}...${(user as any).wallet.address.slice(-4)}`
                  : (user as any)?.email?.address 
                    ? (user as any).email.address.slice(0, 10) + "..."
                    : "0x1234...5678"
                }
              </div>
              <div className="text-emerald-400 text-xs">
                {(user as any)?.wallet?.address ? "Wallet Connected" : "Email Connected"}
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
