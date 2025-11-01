/**
 * Portfolio Tabs Component
 * Tabs para alternar entre Carteira e Atividades
 */

"use client";

import { cn } from "@/lib/utils";

interface PortfolioTabsProps {
  activeTab: 'wallet' | 'activities';
  onTabChange: (tab: 'wallet' | 'activities') => void;
}

export function PortfolioTabs({ activeTab, onTabChange }: PortfolioTabsProps) {
  return (
    <div className="border-b border-slate-700/50 px-4 lg:px-6">
      <div className="flex gap-6">
        <button
          onClick={() => onTabChange('wallet')}
          className={cn(
            "pb-3 text-base font-semibold transition-colors relative",
            activeTab === 'wallet'
              ? "text-yellow-400"
              : "text-white/60 hover:text-white"
          )}
        >
          Carteira
          {activeTab === 'wallet' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-400" />
          )}
        </button>
        
        <button
          onClick={() => onTabChange('activities')}
          className={cn(
            "pb-3 text-base font-semibold transition-colors relative",
            activeTab === 'activities'
              ? "text-yellow-400"
              : "text-white/60 hover:text-white"
          )}
        >
          Atividades
          {activeTab === 'activities' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-400" />
          )}
        </button>
      </div>
    </div>
  );
}

