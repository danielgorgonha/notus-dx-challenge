"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { Shield, LogOut, User, Plus } from "lucide-react";

interface HeaderProps {
  title: string;
  description?: string;
  onDepositClick?: () => void;
}

export function Header({ title, description, onDepositClick }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
      <div className="px-8 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
            {description && (
              <p className="text-slate-300">{description}</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            {onDepositClick && (
              <Button 
                className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white"
                onClick={onDepositClick}
              >
                <Plus className="mr-2 h-4 w-4" />
                Depositar
              </Button>
            )}
            {user && (
              <div className="flex items-center gap-2 text-slate-300">
                <User className="h-4 w-4" />
                <span className="text-sm">
                  {user.email?.address || user.wallet?.address?.slice(0, 6)}...
                </span>
              </div>
            )}
            <Button 
              variant="ghost" 
              className="text-slate-300 hover:text-white hover:bg-white/10"
              onClick={logout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
