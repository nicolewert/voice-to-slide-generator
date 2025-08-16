import React from 'react';
import { 
  FileAudio, 
  Check, 
  Waves, 
  ScrollText 
} from 'lucide-react';
import { cn } from "@/lib/utils";

/**
 * ProcessingIndicator Component
 * 
 * Advanced step-by-step progress for voice-to-slide generation pipeline
 * Follows luxury SaaS theme with sophisticated animations and transitions
 */
interface ProcessingIndicatorProps {
  currentStep: 'upload' | 'transcribing' | 'generating' | 'completed';
  onStepClick?: (step: string) => void;
  showDetails?: boolean;
}

const STEPS = {
  upload: { 
    icon: FileAudio, 
    label: 'Upload Audio',
    description: 'Preparing and validating your audio file',
    detailedDescription: 'Analyzing file format, checking audio quality, and ensuring optimal processing conditions'
  },
  transcribing: { 
    icon: Waves, 
    label: 'Transcribe', 
    description: 'Converting speech to structured text',
    detailedDescription: 'Using advanced AI to accurately transcribe audio, preserving nuance and context'
  },
  generating: { 
    icon: ScrollText, 
    label: 'Generate Slides', 
    description: 'Creating intelligent slide content',
    detailedDescription: 'Transforming transcribed text into visually engaging, semantically rich presentation slides'
  },
  completed: { 
    icon: Check, 
    label: 'Complete', 
    description: 'Deck generation finished successfully',
    detailedDescription: 'Your presentation is ready. Review, customize, and deliver with confidence.'
  }
};

const STEP_ORDER: Array<keyof typeof STEPS> = ['upload', 'transcribing', 'generating', 'completed'];

export const ProcessingIndicator: React.FC<ProcessingIndicatorProps> = ({ 
  currentStep, 
  onStepClick, 
  showDetails = false 
}) => {
  const currentStepIndex = STEP_ORDER.indexOf(currentStep);

  return (
    <div 
      className="w-full py-6 bg-background rounded-xl shadow-sm"
      aria-label="Presentation Generation Progress"
    >
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between space-x-4 lg:space-x-8">
          {STEP_ORDER.map((step, index) => {
            const StepIcon = STEPS[step].icon;
            const isComplete = index <= currentStepIndex;
            const isCurrent = step === currentStep;

            return (
              <React.Fragment key={step}>
                <div 
                  className={cn(
                    "flex flex-col items-center space-y-2 group cursor-pointer",
                    onStepClick && "hover:opacity-80 transition-opacity"
                  )}
                  onClick={() => onStepClick && onStepClick(step)}
                >
                  <div 
                    className={cn(
                      "rounded-full p-3 transition-all duration-500 ease-in-out",
                      "border-2 border-transparent",
                      isComplete 
                        ? "bg-primary/10 text-primary border-primary/20" 
                        : "bg-muted/20 text-muted-foreground border-muted/30",
                      isCurrent && "ring-2 ring-primary/50 animate-pulse bg-primary/20",
                      "group-hover:scale-105 group-hover:shadow-md"
                    )}
                    role="status"
                    aria-current={isCurrent ? "step" : "false"}
                  >
                    <StepIcon className="h-6 w-6" />
                  </div>
                  
                  <div className="text-center">
                    <p 
                      className={cn(
                        "text-xs font-medium transition-colors",
                        isComplete ? "text-primary" : "text-muted-foreground",
                        isCurrent && "font-semibold text-primary"
                      )}
                    >
                      {STEPS[step].label}
                    </p>
                    
                    {isCurrent && (
                      <div className="mt-1">
                        <p className="text-xs text-muted-foreground">
                          {STEPS[step].description}
                        </p>
                        {showDetails && (
                          <p className="text-[10px] text-muted-foreground/70 mt-1 max-w-[200px]">
                            {STEPS[step].detailedDescription}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {index < STEP_ORDER.length - 1 && (
                  <div 
                    className={cn(
                      "flex-1 h-0.5 transition-colors duration-500 ease-in-out",
                      index < currentStepIndex 
                        ? "bg-gradient-to-r from-primary to-secondary" 
                        : "bg-muted/30"
                    )}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};