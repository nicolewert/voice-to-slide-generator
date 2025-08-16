'use client';

import React, { 
  createContext, 
  useState, 
  useContext, 
  useCallback, 
  ReactNode 
} from 'react';
import { v4 as uuidv4 } from 'uuid';

// Toast types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

// Toast interface
export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

// Context interface
interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

// Create context
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Provider component
export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((currentToasts) => 
      currentToasts.filter((toast) => toast.id !== id)
    );
  }, []);

  const showToast = useCallback((
    message: string, 
    type: ToastType = 'info', 
    duration = 5000
  ) => {
    const id = uuidv4();
    const newToast: Toast = { id, message, type, duration };
    
    setToasts((currentToasts) => [...currentToasts, newToast]);

    // Auto-remove toast after duration
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  // Convenience methods for different toast types
  const showSuccess = useCallback((message: string, duration?: number) => {
    showToast(message, 'success', duration);
  }, [showToast]);

  const showError = useCallback((message: string, duration?: number) => {
    showToast(message, 'error', duration);
  }, [showToast]);

  const showWarning = useCallback((message: string, duration?: number) => {
    showToast(message, 'warning', duration);
  }, [showToast]);

  const showInfo = useCallback((message: string, duration?: number) => {
    showToast(message, 'info', duration);
  }, [showToast]);

  return (
    <ToastContext.Provider 
      value={{ 
        toasts, 
        showToast, 
        showSuccess, 
        showError, 
        showWarning, 
        showInfo, 
        removeToast 
      }}
    >
      {children}
    </ToastContext.Provider>
  );
};

// Custom hook to use toast context
export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
};