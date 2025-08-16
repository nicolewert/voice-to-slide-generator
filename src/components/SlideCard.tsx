import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

// Define the slide interface matching the prop specification
export interface Slide {
  _id: string;
  title: string;
  content: string;
  speakerNotes?: string;
  order: number;
}

// Props interface for the SlideCard component
interface SlideCardProps {
  slide: Slide;
  isActive: boolean;
  showSpeakerNotes: boolean;
}

const SlideCard: React.FC<SlideCardProps> = ({ 
  slide, 
  isActive, 
  showSpeakerNotes 
}) => {
  return (
    <Card 
      className={cn(
        "transition-all duration-300 ease-in-out transform hover:scale-[1.02]",
        "bg-background border-2 rounded-xl shadow-xl",
        isActive 
          ? "border-[hsl(48,100%,67%)] ring-4 ring-opacity-50 ring-[hsl(48,100%,67%)]" 
          : "border-muted hover:border-primary"
      )}
    >
      <CardHeader>
        <CardTitle 
          className={cn(
            "text-xl font-['Playfair_Display'] font-semibold tracking-tight",
            isActive ? "text-primary" : "text-muted-foreground"
          )}
        >
          Slide {slide.order}: {slide.title}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="prose max-w-none">
        <ReactMarkdown 
          components={{
            h1: ({ ...props }) => (
              <h1 className="text-2xl font-bold text-primary" {...props} />
            ),
            h2: ({ ...props }) => (
              <h2 className="text-xl font-semibold text-accent" {...props} />
            ),
            p: ({ ...props }) => (
              <p className="text-base leading-relaxed" {...props} />
            ),
          }}
        >
          {slide.content}
        </ReactMarkdown>
      </CardContent>
      
      {slide.speakerNotes && showSpeakerNotes && (
        <CardFooter 
          className={cn(
            "bg-background/50 rounded-b-xl p-4 mt-2",
            "border-t border-muted transition-all duration-300",
            "text-sm italic text-muted-foreground"
          )}
        >
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-accent">Speaker Notes:</span>
            <ReactMarkdown>{slide.speakerNotes}</ReactMarkdown>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default SlideCard;