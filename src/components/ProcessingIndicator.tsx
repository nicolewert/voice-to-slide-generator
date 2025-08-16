import React from 'react';
import { FileAudio, ArrowRight, SlidersHorizontal, Check } from 'lucide-react';

/**
 * ProcessingIndicator Component
 * 
 * Shows step-by-step progress for the voice-to-slide generation pipeline
 * Provides a clean, modern design following luxury SaaS theme
 */
interface ProcessingIndicatorProps {
  currentStep: 'upload' | 'transcribing' | 'generating' | 'completed';
}

const STEPS = {
  upload: { 
    icon: FileAudio, 
    label: 'Upload Audio',
    description: 'Preparing your audio file' 
  },
  transcribing: { 
    icon: ArrowRight, 
    label: 'Transcribe', 
    description: 'Converting speech to text' 
  },
  generating: { 
    icon: SlidersHorizontal, 
    label: 'Generate Slides', 
    description: 'Creating slide content' 
  },
  completed: { 
    icon: Check, 
    label: 'Complete', 
    description: 'Deck generation finished' 
  }
};

const STEP_ORDER: Array<keyof typeof STEPS> = ['upload', 'transcribing', 'generating', 'completed'];

export const ProcessingIndicator: React.FC<ProcessingIndicatorProps> = ({ currentStep }) => {
  const currentStepIndex = STEP_ORDER.indexOf(currentStep);

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between space-x-4">
        {STEP_ORDER.map((step, index) => {
          const StepIcon = STEPS[step].icon;
          const isComplete = index <= currentStepIndex;
          const isCurrent = step === currentStep;

          return (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center space-y-2">
                <div 
                  className={`
                    rounded-full p-3 transition-all duration-300 ease-in-out
                    ${isComplete 
                      ? 'bg-primary/10 text-primary' 
                      : 'bg-muted/20 text-muted-foreground'}
                    ${isCurrent && 'ring-2 ring-primary/50 animate-pulse'}
                  `}
                >
                  <StepIcon className="h-5 w-5" />
                </div>
                <div className="text-center">
                  <p 
                    className={`
                      text-xs font-medium transition-colors
                      ${isComplete ? 'text-primary' : 'text-muted-foreground'}
                      ${isCurrent && 'font-semibold text-primary'}
                    `}
                  >
                    {STEPS[step].label}
                  </p>
                  {isCurrent && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {STEPS[step].description}
                    </p>
                  )}
                </div>
              </div>
              {index < STEP_ORDER.length - 1 && (
                <div 
                  className={`
                    flex-1 h-0.5 transition-colors
                    ${index < currentStepIndex ? 'bg-primary' : 'bg-muted/30'}
                  `}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};