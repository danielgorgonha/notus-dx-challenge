"use client";

import React from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { Toast as ToastType } from '@/contexts/toast-context';

interface ToastProps {
  toast: ToastType;
  onRemove: (id: string) => void;
}

const toastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const toastStyles = {
  success: {
    container: 'bg-green-500/10 border-green-500/20 text-green-400',
    icon: 'text-green-400',
    progress: 'bg-green-400',
  },
  error: {
    container: 'bg-red-500/10 border-red-500/20 text-red-400',
    icon: 'text-red-400',
    progress: 'bg-red-400',
  },
  warning: {
    container: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
    icon: 'text-yellow-400',
    progress: 'bg-yellow-400',
  },
  info: {
    container: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    icon: 'text-blue-400',
    progress: 'bg-blue-400',
  },
};

export const Toast: React.FC<ToastProps> = ({ toast, onRemove }) => {
  const Icon = toastIcons[toast.type];
  const styles = toastStyles[toast.type];

  return (
    <div
      className={`
        relative flex items-start space-x-3 p-4 rounded-lg border backdrop-blur-sm
        ${styles.container}
        animate-in slide-in-from-right-full duration-300
      `}
    >
      <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${styles.icon}`} />
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white">
          {toast.title}
        </p>
        {toast.description && (
          <p className="text-sm text-slate-300 mt-1">
            {toast.description}
          </p>
        )}
      </div>

      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 text-slate-400 hover:text-white transition-colors"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Progress bar */}
      {toast.duration && toast.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-700/50 rounded-b-lg overflow-hidden">
          <div
            className={`h-full ${styles.progress} transition-all ease-linear`}
            style={{
              animation: `shrink ${toast.duration}ms linear forwards`,
            }}
          />
        </div>
      )}
    </div>
  );
};

// CSS animation for progress bar
const style = document.createElement('style');
style.textContent = `
  @keyframes shrink {
    from { width: 100%; }
    to { width: 0%; }
  }
`;
document.head.appendChild(style);