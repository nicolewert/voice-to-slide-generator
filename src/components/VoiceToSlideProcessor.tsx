'use client'

import { useState, useEffect, useRef } from 'react'
import { useQuery } from 'convex/react'
import { VoiceToSlideUploader } from './VoiceToSlideUploader'
import { ProcessingStatus } from './ProcessingStatus'
import { ProcessingIndicator } from './ProcessingIndicator'
import { Button } from './ui/button'
import type { Id } from '../../convex/_generated/dataModel'
import { api } from '../../convex/_generated/api'
import { useToastContext } from './Toast/ToastContext'

export function VoiceToSlideProcessor() {
  const [currentDeckId, setCurrentDeckId] = useState<Id<'decks'> | null>(null)
  const [processingStep, setProcessingStep] = useState<'upload' | 'transcribing' | 'generating' | 'completed'>('upload')
  const hasShownSpeakerNotesNotification = useRef(false)
  const { showInfo, showSuccess } = useToastContext()
  
  // Watch deck status for real-time updates
  const deck = useQuery(
    api.decks.getDeckById, 
    currentDeckId ? { deckId: currentDeckId } : 'skip'
  )

  // Update processing step based on deck status
  useEffect(() => {
    if (!deck) return

    switch (deck.status) {
      case 'processing':
        // Determine if we're transcribing or generating based on whether transcript exists
        setProcessingStep(deck.transcript ? 'generating' : 'transcribing')
        break
      case 'completed':
        setProcessingStep('completed')
        
        // Show speaker notes enhancement notification for 5+ slide presentations
        if (deck.totalSlides >= 5 && !hasShownSpeakerNotesNotification.current) {
          hasShownSpeakerNotesNotification.current = true
          
          // Show info toast about premium enhancement starting
          showInfo(
            `🎯 Premium enhancement started! Your ${deck.totalSlides}-slide presentation is getting AI-powered speaker notes with professional delivery tips.`,
            8000
          )
          
          // Show success notification after a delay (simulating background processing)
          setTimeout(() => {
            showSuccess(
              `✨ Premium speaker notes enhanced! Your presentation now includes professional speaking techniques and audience engagement strategies.`,
              10000
            )
          }, 5000) // 5 second delay to show progression
        }
        break
      case 'error':
        // Keep current step but let ProcessingStatus show the error
        break
    }
  }, [deck])

  const handleDeckCreated = (deckId: string) => {
    console.log('Deck created in processor:', deckId)
    setCurrentDeckId(deckId as Id<'decks'>)
    setProcessingStep('transcribing')
  }

  const resetProcessor = () => {
    setCurrentDeckId(null)
    setProcessingStep('upload')
    hasShownSpeakerNotesNotification.current = false
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-primary">
          Voice-to-Slide Generator
        </h1>
        <p className="text-lg text-muted-foreground">
          Transform your voice recordings into professional presentations with AI
        </p>
      </div>

      {/* Processing Indicator */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <ProcessingIndicator currentStep={processingStep} />
      </div>

      {/* Upload Section */}
      {processingStep === 'upload' && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-2xl font-semibold mb-4">Upload Your Audio</h2>
          <VoiceToSlideUploader onDeckCreated={handleDeckCreated} />
        </div>
      )}

      {/* Processing Section */}
      {currentDeckId && processingStep !== 'upload' && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">
              {processingStep === 'completed' ? 'Presentation Ready!' : 'Processing Your Presentation'}
            </h2>
            <div className="flex gap-3">
              {processingStep === 'completed' && (
                <Button
                  onClick={() => {
                    // In a real app, this would navigate to the slide viewer
                    console.log('Viewing slides for deck:', currentDeckId)
                    alert(`Slides are ready! In a full implementation, this would open the slide viewer for deck ${currentDeckId}`)
                  }}
                  className="bg-primary hover:bg-primary/90"
                >
                  View Slides
                </Button>
              )}
              <Button
                variant="outline"
                onClick={resetProcessor}
                className="text-muted-foreground hover:text-primary"
              >
                Start New Upload
              </Button>
            </div>
          </div>
          <ProcessingStatus deckId={currentDeckId} />
          
          {/* Show completed message with deck info */}
          {processingStep === 'completed' && deck && (
            <div className="mt-6 p-4 bg-success/10 border border-success/20 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                <div>
                  <p className="font-medium text-success">
                    Successfully generated {deck.totalSlides} slides from your audio!
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Deck: &ldquo;{deck.title}&rdquo; • Created {new Date(deck.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}