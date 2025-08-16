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
    <div className="container mx-auto px-4 py-12 min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-6">
        <ErrorDisplay 
          error={error.message || 'Unable to load deck'}
          onRetry={() => reset()}
        />
        <div className="flex flex-col space-y-4">
          <Button 
            variant="secondary" 
            onClick={() => reset()} 
            className="w-full"
          >
            Reload Deck
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/'} 
            className="w-full"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}