"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  BarChart3,
  Send
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Transações",
    href: "/swap",
    icon: ArrowRightLeft,
    submenu: [
      {
        name: "Swap",
        href: "/swap",
        icon: ArrowRightLeft,
      },
      {
        name: "Transfer",
        href: "/transfer",
        icon: Send,
      },
      {
        name: "Histórico",
        href: "/history",
        icon: History,
      },
    ]
  },
  {
    name: "Liquidity Pools",
    href: "/pools",
    icon: Zap,
  },
  {
    name: "Perfil",
    href: "/profile",
    icon: Lock,
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  const isSubmenuActive = (submenu: { href: string }[]) => {
    return submenu.some(subItem => pathname === subItem.href || pathname.startsWith(subItem.href + '/'));
  };

  const isParentActive = (item: any) => {
    // Verifica se é a rota exata ou se é uma rota filha
    return pathname === item.href || pathname.startsWith(item.href + '/');
  };


  return (
    <>
      {/* Overlay para mobile - deve estar acima do conteúdo mas abaixo do sidebar */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar - z-index mais alto que overlay */}
      <div className={`
        fixed left-0 top-0 w-72 h-screen bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 z-[50]
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:relative lg:h-full lg:z-auto
        overflow-y-auto
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-500/80 to-yellow-600/80 rounded-xl flex items-center justify-center mr-3">
                <Lock className="h-5 w-5 text-slate-900" />
              </div>
              <div>
                <div className="font-bold text-white text-lg">Notus DX</div>
                <div className="text-slate-400 text-xs">Challenge</div>
              </div>
            </div>
            
            {/* Botão fechar para mobile */}
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg hover:bg-yellow-400/10 transition-colors"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>

      {/* Navigation */}
      <nav className="p-6">
        <div className="space-y-2">
          {navigation.map((item) => {
            const isActive = isParentActive(item);
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
                        // Para KYC, verificar se está em qualquer rota que comece com /profile/kyc
                        let isSubActive = false;
                        if (subItem.href === '/profile/kyc') {
                          isSubActive = pathname.startsWith('/profile/kyc');
                        } else {
                          isSubActive = pathname === subItem.href;
                        }
                        
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
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <Link href={item.href} className="flex items-center">
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              </div>
            );
          })}
        </div>
      </nav>

      {/* User Status */}
      <div className="absolute bottom-6 left-6 right-6">
        <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-yellow-500/60 to-yellow-600/60 rounded-full mr-3 flex items-center justify-center">
              <div className="w-4 h-4 bg-slate-900 rounded-full"></div>
            </div>
            <div>
              <div className="font-semibold text-white text-sm">
                Usuário Conectado
              </div>
              <div className="text-slate-400 text-xs">
                🇧🇷 Carteira Brasileira
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
