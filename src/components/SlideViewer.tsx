import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery } from 'convex/react';
import { Id } from '../../convex/_generated/dataModel';
import { api } from '../../convex/_generated/api';
import { useRouter } from 'next/navigation';

import { Card } from './ui/card';
import SlideCard from './SlideCard';
import { Navigation } from './Navigation';
import { Skeleton } from './ui/skeleton';
import { ExportPanel } from './ExportPanel';

interface SlideViewerProps {
  deckId: Id<'decks'>;
  initialSlide?: number;
}

export const SlideViewer: React.FC<SlideViewerProps> = ({ 
  deckId, 
  initialSlide = 0 
}) => {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(initialSlide);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState(false);
  const [showExportPanel, setShowExportPanel] = useState(false);
  const viewerRef = useRef<HTMLDivElement>(null);

  // Fetch deck with slides from Convex
  const deck = useQuery(api.decks.getDeckWithSlides, { deckId });

  // Update URL with current slide index
  const updateUrlState = useCallback((slideIndex: number) => {
    router.replace(`/decks/${deckId}?slide=${slideIndex}`);
  }, [router, deckId]);

  // Slide navigation functions
  const goToNextSlide = useCallback(() => {
    if (deck?.slides && currentSlide < deck.slides.length - 1) {
      const nextSlide = currentSlide + 1;
      setCurrentSlide(nextSlide);
      updateUrlState(nextSlide);
    }
  }, [deck?.slides, currentSlide, updateUrlState]);

  const goToPreviousSlide = useCallback(() => {
    if (currentSlide > 0) {
      const prevSlide = currentSlide - 1;
      setCurrentSlide(prevSlide);
      updateUrlState(prevSlide);
    }
  }, [currentSlide, updateUrlState]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!deck?.slides?.length) return;

    switch (event.key) {
      case 'ArrowRight':
      case ' ':
        event.preventDefault();
        goToNextSlide();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        goToPreviousSlide();
        break;
      case 'Escape':
        event.preventDefault();
        router.push('/decks');
        break;
      case 's':
      case 'S':
        event.preventDefault();
        setShowSpeakerNotes(prev => !prev);
        break;
      case 'e':
      case 'E':
        event.preventDefault();
        setShowExportPanel(prev => !prev);
        break;
    }
  }, [deck?.slides?.length, router, goToNextSlide, goToPreviousSlide]);


  // Add keyboard event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    
    // Focus the viewer for keyboard navigation
    viewerRef.current?.focus();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Handle initial slide from URL
  useEffect(() => {
    if (deck?.slides?.length) {
      const initialIndex = Math.min(
        Math.max(initialSlide, 0), 
        deck.slides.length - 1
      );
      setCurrentSlide(initialIndex);
    }
  }, [deck?.slides?.length, initialSlide]);

  // Loading state
  if (!deck) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
        <Skeleton className="w-full h-[500px] rounded-xl" />
        <div className="flex justify-between">
          <Skeleton className="w-24 h-10 rounded-md" />
          <Skeleton className="w-24 h-10 rounded-md" />
        </div>
      </div>
    );
  }

  // Error state
  if (!deck.slides?.length) {
    return (
      <Card className="p-6 text-center bg-red-50 text-red-600">
        No slides found in this deck.
      </Card>
    );
  }

  const currentSlideData = deck.slides[currentSlide];

  return (
    <div 
      ref={viewerRef} 
      tabIndex={0} 
      className="w-full max-w-4xl mx-auto p-4 space-y-4 focus:outline-none"
      aria-label="Slide Viewer"
    >
      {/* Slide Display */}
      <SlideCard 
        slide={currentSlideData} 
        isActive={true}
        showSpeakerNotes={showSpeakerNotes}
      />

      {/* Navigation Controls */}
      <Navigation
        currentSlide={currentSlide}
        totalSlides={deck.slides.length}
        onPrevious={goToPreviousSlide}
        onNext={goToNextSlide}
        showSpeakerNotes={showSpeakerNotes}
        onToggleSpeakerNotes={() => setShowSpeakerNotes(!showSpeakerNotes)}
        showExportPanel={showExportPanel}
        onToggleExportPanel={() => setShowExportPanel(!showExportPanel)}
      />

      {/* Export Panel */}
      {showExportPanel && (
        <ExportPanel
          deckId={deckId}
          onExport={(type, success) => {
            console.log(`${type} export ${success ? 'successful' : 'failed'}`)
          }}
        />
      )}
    </div>
  );
};