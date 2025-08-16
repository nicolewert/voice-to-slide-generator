import React from 'react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-12 min-h-screen flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md w-full">
        <LoadingSpinner size="lg" className="mx-auto text-primary" />
        <div className="space-y-2">
          <h2 className="font-playfair text-2xl font-semibold text-primary">
            Preparing Your Deck
          </h2>
          <p className="font-inter text-muted text-sm">
            Synchronizing slides, optimizing presentation layout
          </p>
        </div>
        <div className="animate-pulse h-2 w-full bg-primary/10 rounded-full">
          <div className="h-full bg-primary/30 rounded-full w-2/3"></div>
        </div>
      </div>
    </div>
  );
}