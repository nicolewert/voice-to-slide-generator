'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Toast } from './Toast';
import { useToastContext } from './ToastContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastContext();

  return (
    <div 
      className="
        fixed top-4 right-4 z-[9999] 
        flex flex-col 
        items-end 
        space-y-3 
        pointer-events-none
        max-w-md 
        w-full
      "
      aria-live="polite"
      aria-atomic="true"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ 
              type: 'tween', 
              duration: 0.3 
            }}
            className="w-full"
          >
            <Toast 
              {...toast} 
              onClose={() => removeToast(toast.id)} 
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};