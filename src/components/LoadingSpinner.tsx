import React from 'react';
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'subtle' | 'gradient';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  variant = 'default',
  className,
  ...props
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-4',
    lg: 'w-16 h-16 border-4',
    xl: 'w-24 h-24 border-6'
  };

  const variantStyles = {
    default: cn(
      "border-primary/20 border-t-primary",
      "dark:border-primary/30 dark:border-t-primary/80"
    ),
    subtle: cn(
      "border-muted/20 border-t-muted",
      "dark:border-muted/30 dark:border-t-muted/80"
    ),
    gradient: cn(
      "border-transparent",
      "border-t-primary border-r-secondary border-b-accent border-l-primary/20",
      "animate-spin-gradient"
    )
  };

  const additionalStyles = cn(
    "rounded-full",
    "animate-spin",
    "transition-all duration-300 ease-in-out",
    "will-change-transform",
    variant === 'gradient' && "bg-gradient-to-r from-primary/10 to-secondary/10",
    sizeClasses[size],
    variantStyles[variant],
    className
  );

  return (
    <div 
      className={additionalStyles}
      role="status"
      aria-label="Loading content"
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};