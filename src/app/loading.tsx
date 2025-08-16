import React from 'react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center space-y-4">
        <LoadingSpinner size="lg" className="text-primary" />
        <h2 className="font-playfair text-xl font-semibold text-primary">
          Loading Slide Deck
        </h2>
        <p className="font-inter text-muted text-sm">
          Preparing your premium presentation experience
        </p>
      </div>
    </div>
  );
}