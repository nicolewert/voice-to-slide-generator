'use client'

import { useState } from 'react'
import { useMutation, useAction } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { AudioUploader } from './AudioUploader'
import { LoadingSpinner } from './LoadingSpinner'
import { ErrorDisplay } from './ErrorDisplay'

interface VoiceToSlideUploaderProps {
  onDeckCreated?: (deckId: string) => void
  className?: string
}

export function VoiceToSlideUploader({ onDeckCreated, className }: VoiceToSlideUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [deckTitle, setDeckTitle] = useState('')

  const generateUploadUrl = useMutation(api.files.generateUploadUrl)
  const createDeckWithAudio = useMutation(api.files.createDeckWithAudio)
  const transcribeAudio = useAction(api.ai.transcribeAudio)

  const handleUploadStart = () => {
    setIsUploading(true)
    setError(null)
    setUploadProgress(0)
  }

  const handleUploadComplete = async (file: File) => {
    try {
      console.log('Starting upload process for:', file.name)
      
      // Step 1: Generate upload URL from Convex with retry logic
      let uploadUrl: string
      let retryCount = 0
      const maxRetries = 3
      
      while (retryCount < maxRetries) {
        try {
          const result = await generateUploadUrl({})
          uploadUrl = result
          break
        } catch {
          retryCount++
          if (retryCount >= maxRetries) {
            throw new Error('Failed to generate upload URL after multiple attempts')
          }
          console.log(`Retrying upload URL generation (attempt ${retryCount}/${maxRetries})`)
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
        }
      }
      
      setUploadProgress(25)
      
      // Step 2: Upload file to Convex storage with timeout
      const uploadPromise = fetch(uploadUrl!, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      })
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('File upload timeout - please try with a smaller file')), 60000)
      )
      
      const result = await Promise.race([uploadPromise, timeoutPromise]) as Response
      
      if (!result.ok) {
        const errorText = await result.text().catch(() => 'Unknown error')
        throw new Error(`Failed to upload file: ${result.status} ${errorText}`)
      }
      
      const { storageId } = await result.json()
      setUploadProgress(50)
      
      console.log('File uploaded successfully, storageId:', storageId)
      
      // Step 3: Create deck with audio file
      const title = deckTitle.trim() || file.name.replace(/\.[^/.]+$/, '')
      const { deckId } = await createDeckWithAudio({
        title,
        audioFileId: storageId,
      })
      
      setUploadProgress(75)
      console.log('Deck created successfully, deckId:', deckId)
      
      // Step 4: Start AI processing (transcription and slide generation)
      try {
        await transcribeAudio({
          deckId,
          audioFileId: storageId,
        })
        console.log('AI processing completed successfully')
      } catch (aiError) {
        console.error('AI processing error:', aiError)
        // Don't throw here - let the ProcessingStatus component handle display
        // The deck is already created and the error status is set in the AI action
      }
      
      setUploadProgress(100)
      setIsUploading(false)
      
      // Notify parent component
      if (onDeckCreated) {
        onDeckCreated(deckId)
      }
      
    } catch (err) {
      console.error('Upload error:', err)
      
      let errorMessage = 'Upload failed. Please try again.'
      
      if (err instanceof Error) {
        if (err.message.includes('timeout')) {
          errorMessage = 'Upload timeout. Please try with a smaller file or check your internet connection.'
        } else if (err.message.includes('generate upload URL')) {
          errorMessage = 'Unable to prepare file upload. Please check your connection and try again.'
        } else if (err.message.includes('Failed to upload file')) {
          errorMessage = 'File upload failed. Please try again or use a different file format.'
        } else {
          errorMessage = err.message
        }
      }
      
      setError(errorMessage)
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleError = (errorMessage: string) => {
    setError(errorMessage)
    setIsUploading(false)
  }

  const handleRetry = () => {
    setError(null)
    setIsUploading(false)
    setUploadProgress(0)
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={handleRetry} />
  }

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Deck Title Input */}
      <div className="space-y-2">
        <label htmlFor="deck-title" className="text-sm font-medium text-gray-700">
          Presentation Title (Optional)
        </label>
        <input
          id="deck-title"
          type="text"
          value={deckTitle}
          onChange={(e) => setDeckTitle(e.target.value)}
          placeholder="Enter a title for your presentation..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          disabled={isUploading}
        />
      </div>

      {/* Audio Uploader */}
      {isUploading ? (
        <div className="flex flex-col items-center justify-center p-12 space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-muted-foreground">
            Uploading and processing your audio...
          </p>
          {uploadProgress > 0 && (
            <div className="w-full max-w-xs">
              <div className="bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-center mt-1">{uploadProgress}%</p>
            </div>
          )}
        </div>
      ) : (
        <AudioUploader
          onUploadStart={handleUploadStart}
          onUploadComplete={handleUploadComplete}
          onError={handleError}
        />
      )}
    </div>
  )
}