import { useToastContext } from '../components/Toast/ToastContext';

export const useToast = () => {
  const {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  } = useToastContext();

  return {
    /**
     * Show a generic toast notification
     * @param message The message to display
     * @param type Optional toast type (defaults to 'info')
     * @param duration Optional duration in milliseconds (defaults to 5000)
     */
    toast: (
      message: string, 
      type: 'success' | 'error' | 'warning' | 'info' = 'info', 
      duration?: number
    ) => showToast(message, type, duration),
    
    /**
     * Show a success toast notification
     * @param message The success message to display
     * @param duration Optional duration in milliseconds
     */
    success: (message: string, duration?: number) => showSuccess(message, duration),
    
    /**
     * Show an error toast notification
     * @param message The error message to display
     * @param duration Optional duration in milliseconds
     */
    error: (message: string, duration?: number) => showError(message, duration),
    
    /**
     * Show a warning toast notification
     * @param message The warning message to display
     * @param duration Optional duration in milliseconds
     */
    warning: (message: string, duration?: number) => showWarning(message, duration),
    
    /**
     * Show an informational toast notification
     * @param message The info message to display
     * @param duration Optional duration in milliseconds
     */
    info: (message: string, duration?: number) => showInfo(message, duration),
  };
};