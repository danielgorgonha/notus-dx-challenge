import { useToast as useToastContext } from '@/contexts/toast-context';

export const useToast = () => {
  const { addToast, removeToast, clearAllToasts } = useToastContext();

  const success = (title: string, description?: string, duration?: number) => {
    addToast({
      type: 'success',
      title,
      description,
      duration,
    });
  };

  const error = (title: string, description?: string, duration?: number) => {
    addToast({
      type: 'error',
      title,
      description,
      duration,
    });
  };

  const warning = (title: string, description?: string, duration?: number) => {
    addToast({
      type: 'warning',
      title,
      description,
      duration,
    });
  };

  const info = (title: string, description?: string, duration?: number) => {
    addToast({
      type: 'info',
      title,
      description,
      duration,
    });
  };

  return {
    success,
    error,
    warning,
    info,
    removeToast,
    clearAllToasts,
  };
};