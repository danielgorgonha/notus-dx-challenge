"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

interface AppLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
  onDepositClick?: () => void;
}

export function AppLayout({ 
  title, 
  description, 
  children, 
  onDepositClick 
}: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      <div className="flex-1 flex flex-col lg:ml-72">
        <Header
          title={title}
          description={description}
          onMenuClick={toggleSidebar}
        />
        <main className="flex-1 p-8">
          <Breadcrumbs />
          {children}
        </main>
      </div>
    </div>
  );
}
