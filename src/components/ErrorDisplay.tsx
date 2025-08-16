import React from 'react';
import { Button } from '@/components/ui/button';

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  error, 
  onRetry, 
  className = '',
  children
}) => {
  return (
    <div 
      className={`
        bg-background 
        border-2 
        border-red-500/20 
        rounded-xl 
        p-6 
        flex 
        flex-col 
        items-center 
        justify-center 
        space-y-4 
        text-center
        ${className}
      `}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-12 w-12 text-red-500/70" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
        />
      </svg>
      
      <h3 className="text-lg font-playfair font-semibold text-red-600">
        Upload Error
      </h3>
      
      <p className="text-muted font-inter text-sm">
        {error}
      </p>
      
      {onRetry && (
        <Button 
          variant="secondary" 
          onClick={onRetry} 
          className="mt-4 bg-secondary/20 hover:bg-secondary/30 text-secondary-foreground"
        >
          Retry Upload
        </Button>
      )}
      
      {children}
    </div>
  );
};