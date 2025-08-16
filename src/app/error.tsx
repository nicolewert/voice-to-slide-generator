'use client';

import React from 'react';
import { ErrorDisplay } from '@/components/ErrorDisplay';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <ErrorDisplay 
        error={error.message || 'An unexpected error occurred'}
        className="max-w-md w-full"
        onRetry={() => reset()}
      >
        <div className="mt-6 flex flex-col space-y-4">
          <Button 
            variant="secondary" 
            onClick={() => reset()} 
            className="w-full"
          >
            Try Again
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/'} 
            className="w-full"
          >
            Return to Home
          </Button>
        </div>
      </ErrorDisplay>
    </div>
  );
}