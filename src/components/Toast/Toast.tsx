'use client';

import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Info, 
  X 
} from 'lucide-react';
import { Toast as ToastType } from './ToastContext';

// Icon mapping for different toast types
const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info
};

// Color mapping for toast types
const COLOR_CLASSES = {
  success: 'bg-success/10 border-success/30 text-success',
  error: 'bg-red-500/10 border-red-500/30 text-red-500',
  warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500',
  info: 'bg-accent/10 border-accent/30 text-accent'
};

interface ToastProps extends ToastType {
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ 
  message, 
  type = 'info', 
  onClose 
}) => {
  const Icon = ICONS[type];
  const colorClasses = COLOR_CLASSES[type];

  return (
    <div 
      role="alert" 
      aria-live="polite"
      className={`
        flex items-center justify-between 
        w-full max-w-md p-4 
        rounded-lg border 
        shadow-lg 
        ${colorClasses}
        transition-all duration-300 ease-in-out
        transform translate-x-0 opacity-100
        hover:shadow-xl
      `}
    >
      <div className="flex items-center space-x-3">
        <Icon className="w-6 h-6" />
        <span className="text-sm font-medium">{message}</span>
      </div>
      <button 
        onClick={onClose}
        aria-label="Close notification"
        className="
          hover:bg-primary/10 
          rounded-full 
          p-1 
          transition-colors 
          focus:outline-none 
          focus:ring-2 
          focus:ring-primary/50
        "
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};