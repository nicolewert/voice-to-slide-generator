'use client'

import { useEffect } from 'react';
import { SlideViewer } from '@/components/SlideViewer';
import { ExportPanel } from '@/components/ExportPanel';
import { ErrorDisplay } from '@/components/ErrorDisplay';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Card } from '@/components/ui/card';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';
import { useQuery } from 'convex/react';

function DeckContent({ id }: { id: string }) {
  const deck = useQuery(api.decks.getDeckWithSlides, { 
    deckId: id as Id<'decks'> 
  });

  // Update document title dynamically
  useEffect(() => {
    if (deck?.title) {
      document.title = `${deck.title} | Voice to Slide`;
    }
  }, [deck?.title]);

  if (deck === undefined) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <LoadingSpinner />
      </div>
    );
  }

  if (deck === null) {
    return <ErrorDisplay error="Deck not found" />;
  }

  return (
    <div className="min-h-screen bg-background text-primary-foreground">
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6 mb-6 bg-white/80 shadow-lg border-none">
          <h1 className="text-3xl md:text-4xl font-playfair font-bold text-primary mb-4 truncate">
            {deck.title}
          </h1>
          
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm">
              {deck.slides.length} slides
            </span>
            
            <div className="flex space-x-2">
              <ExportPanel 
                deckId={id as Id<'decks'>} 
                className="ml-auto"
              />
            </div>
          </div>
        </Card>

        <SlideViewer 
          deckId={id as Id<'decks'>}
        />
      </div>
    </div>
  );
}

export default DeckContent;