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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Desktop Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-72">
        {showHeader && title && (
          <Header
            title={title}
            description={description}
            onMenuClick={toggleSidebar}
          />
        )}
        
        {/* Main Content with bottom padding for mobile navigation */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
          <Breadcrumbs />
          {children}
        </main>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
