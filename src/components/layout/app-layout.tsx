"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { BottomNavigation } from "./bottom-navigation";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

interface AppLayoutProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  onDepositClick?: () => void;
  showHeader?: boolean;
}

export function AppLayout({ 
  title, 
  description, 
  children, 
  onDepositClick,
  showHeader = true
}: AppLayoutProps) {
  // Sidebar fechado por padrão no mobile, aberto no desktop
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div 
      className="flex min-h-screen h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden relative"
      data-sidebar-open={sidebarOpen ? "true" : "false"}
    >
      {/* Desktop Sidebar - renderizado fora do fluxo normal no mobile */}
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      
      {/* Main Content - z-index menor que sidebar/overlay */}
      <div className="flex-1 flex flex-col lg:ml-72 min-h-0 h-full overflow-hidden relative z-0">
        {showHeader && title && (
          <Header
            title={title}
            description={description}
          />
        )}
        
        {/* Main Content with bottom padding for mobile navigation */}
        <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
          <Breadcrumbs />
          <div className="w-full max-w-full overflow-x-hidden">
            {children}
          </div>
        </main>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
