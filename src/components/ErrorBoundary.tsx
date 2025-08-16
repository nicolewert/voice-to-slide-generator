'use client';

import React, { ErrorInfo, ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  Wifi, 
  Server, 
  RefreshCw, 
  Home 
} from 'lucide-react';

// Error types for more specific handling
enum ErrorType {
  Network = 'network',
  Server = 'server',
  Render = 'render',
  Unknown = 'unknown'
}

// Determine error type based on error details
function getErrorType(error: Error): ErrorType {
  const errorMessage = error.message.toLowerCase();
  
  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return ErrorType.Network;
  }
  
  if (errorMessage.includes('500') || errorMessage.includes('server')) {
    return ErrorType.Server;
  }
  
  return ErrorType.Unknown;
}

// Error details interface for more robust error handling
interface ErrorDetails {
  error: Error;
  errorInfo: ErrorInfo;
}

// Props for ErrorBoundary component
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (props: ErrorDetails) => ReactNode;
}

// State for ErrorBoundary
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to an error reporting service
    console.error('Uncaught error:', error, errorInfo);
  }

  // Method to reset error state and retry
  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  }

  render() {
    if (this.state.hasError) {
      const { error, errorInfo } = this.state;
      const errorType = error ? getErrorType(error) : ErrorType.Unknown;

      // Default fallback UI if no custom fallback provided
      return (
        <div 
          className="
            min-h-screen 
            flex 
            flex-col 
            items-center 
            justify-center 
            p-6 
            bg-background 
            text-center
            space-y-6
          "
          aria-live="polite"
          role="alert"
        >
          {/* Error Icon based on error type */}
          <div className="mb-4">
            {errorType === ErrorType.Network && (
              <Wifi className="w-16 h-16 text-red-500/70 mx-auto" />
            )}
            {errorType === ErrorType.Server && (
              <Server className="w-16 h-16 text-red-500/70 mx-auto" />
            )}
            {errorType === ErrorType.Unknown && (
              <AlertTriangle className="w-16 h-16 text-red-500/70 mx-auto" />
            )}
          </div>

          {/* Error Title */}
          <h1 
            className="
              text-3xl 
              font-playfair 
              font-bold 
              text-primary 
              mb-4
            "
          >
            {errorType === ErrorType.Network && 'Network Error'}
            {errorType === ErrorType.Server && 'Server Error'}
            {errorType === ErrorType.Unknown && 'Unexpected Error'}
          </h1>

          {/* Error Description */}
          <p 
            className="
              text-base 
              font-inter 
              text-muted-foreground 
              max-w-md 
              mb-6
            "
          >
            {errorType === ErrorType.Network && 
              'We could not connect to the server. Please check your internet connection and try again.'}
            {errorType === ErrorType.Server && 
              'Our servers are experiencing issues. We are working to resolve this as quickly as possible.'}
            {errorType === ErrorType.Unknown && 
              'An unexpected error occurred. Our team has been notified.'}
          </p>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <Button 
              variant="secondary" 
              onClick={this.handleRetry}
              className="
                flex 
                items-center 
                space-x-2 
                bg-secondary/20 
                hover:bg-secondary/30 
                text-secondary-foreground
              "
              aria-label="Retry the previous action"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>

            <Link href="/" passHref>
              <Button 
                variant="outline"
                className="
                  flex 
                  items-center 
                  space-x-2 
                  border-primary/20 
                  hover:bg-primary/10
                "
                aria-label="Return to homepage"
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            </Link>
          </div>

          {/* Optional: Technical Error Details (development only) */}
          {process.env.NODE_ENV === 'development' && error && (
            <details 
              className="
                mt-6 
                text-xs 
                text-muted-foreground 
                max-w-full 
                overflow-auto 
                p-4 
                bg-muted/10 
                rounded-lg
              "
            >
              <summary>Technical Details</summary>
              <pre className="whitespace-pre-wrap break-words">
                {error.toString()}
                {errorInfo?.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;