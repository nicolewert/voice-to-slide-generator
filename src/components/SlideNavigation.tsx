'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  SpeakerIcon,
  Fullscreen
} from 'lucide-react';

interface SlideNavigationProps {
  currentSlide: number;
  totalSlides: number;
  onPrevious: () => void;
  onNext: () => void;
  showSpeakerNotes: boolean;
  onToggleSpeakerNotes: () => void;
}

export const SlideNavigation: React.FC<SlideNavigationProps> = ({ 
  currentSlide,
  totalSlides,
  onPrevious,
  onNext,
  showSpeakerNotes,
  onToggleSpeakerNotes
}) => {
  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="
        bg-background/90 backdrop-blur-md
        border border-border/50
        rounded-2xl px-6 py-3
        shadow-2xl shadow-primary/5
        flex items-center space-x-4
      ">
        {/* Previous Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onPrevious}
          disabled={currentSlide === 0}
          className="hover:bg-primary/10"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>

        {/* Slide Counter */}
        <div className="text-sm font-medium text-muted-foreground min-w-[60px] text-center">
          {currentSlide + 1} / {totalSlides}
        </div>

        {/* Next Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onNext}
          disabled={currentSlide === totalSlides - 1}
          className="hover:bg-primary/10"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>

        {/* Divider */}
        <div className="w-px h-6 bg-border/50" />

        {/* Speaker Notes Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSpeakerNotes}
          className={`hover:bg-primary/10 ${showSpeakerNotes ? 'bg-primary/10 text-primary' : ''}`}
        >
          <SpeakerIcon className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};