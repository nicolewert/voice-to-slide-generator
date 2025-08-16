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
        <Card className="p-8 mb-8 bg-gradient-to-r from-white/90 to-white/80 shadow-luxury border border-primary/10 rounded-2xl backdrop-blur-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-playfair font-bold text-gradient-luxury mb-3">
                {deck.title}
              </h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  {deck.slides.length} slides
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <ExportPanel 
                deckId={id as Id<'decks'>}
                slideCount={deck.slides.length}
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