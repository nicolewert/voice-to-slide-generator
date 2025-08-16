'use client';

import React from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Id } from '../../../../convex/_generated/dataModel';
import { SlideViewer } from '@/components/SlideViewer';

export default function DeckViewerPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  
  // Extract deckId from params and convert to Convex ID type
  const deckId = params.deckId as Id<'decks'>;
  
  // Extract initial slide from URL search params (default to 0)
  const slideParam = searchParams.get('slide');
  const initialSlide = slideParam 
    ? Math.max(0, parseInt(slideParam, 10) || 0) 
    : 0;

  // Validate deckId exists
  if (!deckId) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4">
        <div className="bg-red-50 text-red-600 p-6 rounded-xl text-center">
          Error: No deck ID provided
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <SlideViewer 
        deckId={deckId}
        initialSlide={Math.max(0, initialSlide)} // Ensure non-negative
      />
    </div>
  );
}