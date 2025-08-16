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

// Helper function to detect premium-enhanced speaker notes
const isPremiumEnhanced = (speakerNotes?: string): boolean => {
  if (!speakerNotes) return false
  
  // Premium notes contain specific formatting markers and professional coaching terms
  const premiumIndicators = [
    '**[', // Timing indicators like **[2-3 minutes]**
    'Key Emphasis:',
    'Professional Tip:',
    'Engagement Strategy:',
    'Executive Presence:',
    'Audience Connection:',
    'Backup Content:'
  ]
  
  return premiumIndicators.some(indicator => speakerNotes.includes(indicator))
}

const SlideCard: React.FC<SlideCardProps> = ({ 
  slide, 
  isActive, 
  showSpeakerNotes 
}) => {
  const isEnhanced = isPremiumEnhanced(slide.speakerNotes)
  return (
    <Card 
      className={cn(
        "min-h-[400px] transition-all duration-300 ease-in-out transform hover:scale-[1.02]",
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
      
      <CardContent className="prose max-w-none flex-1 flex flex-col justify-start py-6">
        <ReactMarkdown 
          components={{
            h1: ({ ...props }) => (
              <h1 className="text-2xl font-bold text-primary mb-4" {...props} />
            ),
            h2: ({ ...props }) => (
              <h2 className="text-xl font-semibold text-accent mb-3" {...props} />
            ),
            p: ({ ...props }) => (
              <p className="text-base leading-relaxed mb-3" {...props} />
            ),
          }}
        >
          {slide.content}
        </ReactMarkdown>
      </CardContent>
      
      {slide.speakerNotes && showSpeakerNotes && (
        <CardFooter 
          className={cn(
            "rounded-b-xl p-4 mt-2 transition-all duration-300",
            "border-t border-muted text-sm",
            // Premium enhanced styling
            isEnhanced 
              ? "bg-gradient-to-r from-[hsl(48,100%,67%)]/10 to-[hsl(259,94%,51%)]/10 border-[hsl(48,100%,67%)]/30" 
              : "bg-background/50 text-muted-foreground italic"
          )}
        >
          <div className="space-y-2 w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-accent">
                  {isEnhanced ? '✨ Premium Speaker Notes:' : 'Speaker Notes:'}
                </span>
                {isEnhanced && (
                  <span className="px-2 py-1 text-xs font-medium bg-[hsl(48,100%,67%)]/20 text-[hsl(259,94%,51%)] rounded-full border border-[hsl(48,100%,67%)]/40">
                    AI Enhanced
                  </span>
                )}
              </div>
            </div>
            <div className={cn(
              "prose prose-sm max-w-none",
              isEnhanced ? "text-slate-700" : "text-muted-foreground"
            )}>
              <ReactMarkdown
                components={{
                  p: ({ ...props }) => (
                    <p className={cn(
                      "leading-relaxed mb-2",
                      isEnhanced ? "text-slate-700" : "text-muted-foreground"
                    )} {...props} />
                  ),
                  strong: ({ ...props }) => (
                    <strong className="text-[hsl(259,94%,51%)] font-semibold" {...props} />
                  ),
                  em: ({ ...props }) => (
                    <em className="text-[hsl(200,98%,39%)] not-italic font-medium" {...props} />
                  ),
                }}
              >
                {slide.speakerNotes}
              </ReactMarkdown>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default SlideCard;