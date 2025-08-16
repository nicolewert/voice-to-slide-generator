'use client'

import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { AudioUploader } from './AudioUploader'
import { LoadingSpinner } from './LoadingSpinner'
import { ErrorDisplay } from './ErrorDisplay'

interface VoiceToSlideUploaderProps {
  onDeckCreated?: (deckId: string) => void
}

export function VoiceToSlideUploader({ onDeckCreated }: VoiceToSlideUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [deckTitle, setDeckTitle] = useState('')

  const generateUploadUrl = useMutation(api.files.generateUploadUrl)
  const createDeckWithAudio = useMutation(api.files.createDeckWithAudio)

  const handleUploadStart = () => {
    setIsUploading(true)
    setError(null)
    setUploadProgress(0)
  }

  const handleUploadComplete = async (file: File) => {
    try {
      // Step 1: Generate upload URL from Convex
      const uploadUrl = await generateUploadUrl({})
      
      // Step 2: Upload file to Convex storage
      const result = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      })
      
      if (!result.ok) {
        throw new Error('Failed to upload file to storage')
      }
      
      const { storageId } = await result.json()
      
      // Step 3: Create deck with audio file
      const title = deckTitle || file.name.replace(/\.[^/.]+$/, '')
      const { deckId } = await createDeckWithAudio({
        title,
        audioFileId: storageId,
      })
      
      setIsUploading(false)
      setUploadProgress(100)
      
      // Notify parent component
      if (onDeckCreated) {
        onDeckCreated(deckId)
      }
      
    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
      setIsUploading(false)
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
    <div className="space-y-6">
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