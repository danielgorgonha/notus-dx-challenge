"use client";

import { Badge } from "@/components/ui/badge";
import { Shield, Settings, Bug } from "lucide-react";
import { getAllFeatureFlags } from "@/lib/config/feature-flags";

interface FeatureFlagIndicatorProps {
  showDetails?: boolean;
}

export function FeatureFlagIndicator({ showDetails = false }: FeatureFlagIndicatorProps) {
  const flags = getAllFeatureFlags();
  
  if (process.env.NODE_ENV === 'production') {
    return null; // Não mostrar em produção
  }

  const enabledFlags = Object.entries(flags).filter(([_, enabled]) => enabled);
  const disabledFlags = Object.entries(flags).filter(([_, enabled]) => !enabled);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-lg p-3 shadow-lg max-w-xs">
        <div className="flex items-center space-x-2 mb-2">
          <Settings className="h-4 w-4 text-blue-400" />
          <span className="text-sm font-medium text-white">Feature Flags</span>
        </div>
        
        <div className="space-y-1">
          {enabledFlags.map(([flag, _]) => (
            <div key={flag} className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-xs text-green-400 font-mono">{flag}</span>
            </div>
          ))}
          
          {disabledFlags.map(([flag, _]) => (
            <div key={flag} className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
              <span className="text-xs text-gray-400 font-mono">{flag}</span>
            </div>
          ))}
        </div>
        
        {showDetails && (
          <div className="mt-2 pt-2 border-t border-slate-700">
            <div className="flex items-center space-x-1">
              <Bug className="h-3 w-3 text-yellow-400" />
              <span className="text-xs text-yellow-400">Modo Desenvolvimento</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
