import React from 'react';
import { Button } from '@/components/ui/button';
import { 
    ChevronLeftIcon, 
    ChevronRightIcon, 
    MessageSquareIcon 
} from 'lucide-react';

interface NavigationProps {
    currentSlide: number;
    totalSlides: number;
    onPrevious: () => void;
    onNext: () => void;
    showSpeakerNotes: boolean;
    onToggleSpeakerNotes: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
    currentSlide,
    totalSlides,
    onPrevious,
    onNext,
    showSpeakerNotes,
    onToggleSpeakerNotes
}) => {
    // Ensure 1-based slide numbering for display
    const displayCurrentSlide = currentSlide + 1;

    return (
        <nav 
            className="fixed bottom-0 left-0 right-0 p-4 bg-background/90 backdrop-blur-sm border-t border-muted/20 flex items-center justify-center space-x-6 z-50"
            aria-label="Slide Navigation"
        >
            {/* Previous Button */}
            <Button 
                variant="outline" 
                size="icon" 
                onClick={onPrevious} 
                disabled={currentSlide === 0}
                className="group hover:bg-primary/10 transition-colors"
                aria-label="Previous Slide"
            >
                <ChevronLeftIcon 
                    className="h-5 w-5 text-primary group-disabled:text-muted/40" 
                />
                <span className="sr-only">Previous Slide (Shortcut: Left Arrow)</span>
            </Button>

            {/* Slide Counter */}
            <div 
                className="text-sm font-medium text-primary/80 tracking-wider"
                aria-live="polite"
                aria-atomic="true"
            >
                Slide {displayCurrentSlide} of {totalSlides}
            </div>

            {/* Next Button */}
            <Button 
                variant="outline" 
                size="icon" 
                onClick={onNext} 
                disabled={currentSlide === totalSlides - 1}
                className="group hover:bg-primary/10 transition-colors"
                aria-label="Next Slide"
            >
                <ChevronRightIcon 
                    className="h-5 w-5 text-primary group-disabled:text-muted/40" 
                />
                <span className="sr-only">Next Slide (Shortcut: Right Arrow)</span>
            </Button>

            {/* Speaker Notes Toggle */}
            <Button 
                variant={showSpeakerNotes ? 'default' : 'outline'}
                size="icon"
                onClick={onToggleSpeakerNotes}
                className="group transition-colors"
                aria-pressed={showSpeakerNotes}
                aria-label={showSpeakerNotes ? 'Hide Speaker Notes' : 'Show Speaker Notes'}
            >
                <MessageSquareIcon 
                    className={`h-5 w-5 ${
                        showSpeakerNotes 
                        ? 'text-background' 
                        : 'text-primary group-hover:text-primary/80'
                    }`} 
                />
            </Button>

            {/* Keyboard Shortcut Hints */}
            <div 
                className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-xs text-muted/60 hidden md:block"
                aria-hidden="true"
            >
                Tip: Use ← → keys to navigate
            </div>
        </nav>
    );
};

export default Navigation;