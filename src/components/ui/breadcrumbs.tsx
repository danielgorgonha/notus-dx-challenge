"use client";

import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  const pathname = usePathname();

  // Mapear rotas para breadcrumbs automáticos
  const getBreadcrumbsFromPath = (): BreadcrumbItem[] => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Breadcrumbs apenas para Smart Wallet e seus submenus
    if (pathname === '/wallet') {
      breadcrumbs.push({ label: "Smart Wallet", href: "/wallet" });
      breadcrumbs.push({ label: "Overview", href: "/wallet" });
    }
    // KYC - submenu da Smart Wallet
    else if (pathname.startsWith('/wallet/kyc')) {
      breadcrumbs.push({ label: "Smart Wallet", href: "/wallet" });
      breadcrumbs.push({ label: "KYC", href: "/wallet/kyc" });
      
      // Adicionar sub-rotas do KYC
      if (pathname === '/wallet/kyc/level-1') {
        breadcrumbs.push({ label: "Nível 1", href: "/wallet/kyc/level-1" });
      } else if (pathname === '/wallet/kyc/level-2') {
        breadcrumbs.push({ label: "Nível 2", href: "/wallet/kyc/level-2" });
      } else if (pathname.startsWith('/wallet/kyc/level-1/')) {
        breadcrumbs.push({ label: "Nível 1", href: "/wallet/kyc/level-1" });
        if (pathname.includes('/success')) {
          breadcrumbs.push({ label: "Sucesso", href: "/wallet/kyc/level-1/success" });
        }
      } else if (pathname.startsWith('/wallet/kyc/level-2/')) {
        breadcrumbs.push({ label: "Nível 2", href: "/wallet/kyc/level-2" });
        if (pathname.includes('/success')) {
          breadcrumbs.push({ label: "Sucesso", href: "/wallet/kyc/level-2/success" });
        }
      }
    }
    // Depósito - submenu da Smart Wallet
    else if (pathname.startsWith('/wallet/deposit')) {
      breadcrumbs.push({ label: "Smart Wallet", href: "/wallet" });
      breadcrumbs.push({ label: "Depósito", href: "/wallet/deposit" });
    }
    // Outras páginas não mostram breadcrumbs (acessadas diretamente pelo menu)

    return breadcrumbs;
  };

  const breadcrumbItems = items || getBreadcrumbsFromPath();

  // Não renderizar se não há breadcrumbs
  if (breadcrumbItems.length === 0) {
    return null;
  }

  return (
    <nav className={`flex items-center space-x-2 text-sm mb-6 ${className}`}>
      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1;
        const isActive = pathname === item.href;

        return (
          <div key={index} className="flex items-center space-x-2">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-slate-400" />
            )}
            
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="flex items-center space-x-1 text-slate-400 hover:text-white transition-colors"
              >
                {item.icon && <item.icon className="h-4 w-4" />}
                <span>{item.label}</span>
              </Link>
            ) : (
              <div className={`flex items-center space-x-1 ${
                isActive ? 'text-white' : 'text-slate-300'
              }`}>
                {item.icon && <item.icon className="h-4 w-4" />}
                <span className="font-medium">{item.label}</span>
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
