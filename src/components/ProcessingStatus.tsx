import React from 'react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { useQuery } from 'convex/react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

/**
 * ProcessingStatus Component
 * 
 * Displays real-time processing status for a deck generation pipeline
 * Uses Convex useQuery to get live updates on deck processing
 */
interface ProcessingStatusProps {
  deckId: Id<'decks'>;
}

export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({ deckId }) => {
  // Fetch deck status from Convex
  const deck = useQuery(api.decks.getDeckById, { deckId });

  // Status styling based on luxury SaaS theme
  const getStatusStyles = (status?: 'processing' | 'completed' | 'error') => {
    switch (status) {
      case 'processing':
        return {
          icon: <Loader2 className="h-5 w-5 animate-spin text-accent" />,
          badgeVariant: 'secondary' as const,
          cardClass: 'border-accent/30 bg-background/80'
        };
      case 'completed':
        return {
          icon: <CheckCircle2 className="h-5 w-5 text-success" />,
          badgeVariant: 'default' as const,
          cardClass: 'border-success/20 bg-success/5'
        };
      case 'error':
        return {
          icon: <AlertCircle className="h-5 w-5 text-destructive" />,
          badgeVariant: 'destructive' as const,
          cardClass: 'border-destructive/30 bg-destructive/10'
        };
      default:
        return {
          icon: null,
          badgeVariant: 'outline' as const,
          cardClass: ''
        };
    }
  };

  // If deck is loading
  if (!deck) {
    return (
      <Card className="p-4 flex items-center space-x-3 animate-pulse">
        <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
        <span className="text-muted-foreground">Loading deck status...</span>
      </Card>
    );
  }

  const { status, transcript, errorMessage } = deck;
  const { icon, badgeVariant, cardClass } = getStatusStyles(status);

  return (
    <Card className={`p-4 space-y-3 ${cardClass}`}>
      <div className="flex items-center space-x-3">
        {icon}
        <Badge variant={badgeVariant}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      </div>

      {status === 'processing' && (
        <p className="text-sm text-muted-foreground">
          Your slides are being generated. This may take a few moments.
        </p>
      )}

      {status === 'completed' && transcript && (
        <div>
          <h3 className="text-sm font-semibold text-primary mb-2">Transcript</h3>
          <p className="text-sm text-foreground line-clamp-3">{transcript}</p>
        </div>
      )}

      {status === 'error' && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Deck Generation Failed</AlertTitle>
          <AlertDescription>
            {errorMessage || 'An unexpected error occurred during slide generation.'}
          </AlertDescription>
        </Alert>
      )}
    </Card>
  );
};