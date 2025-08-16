'use client'

import React, { useState } from 'react'
import { Button } from './ui/button'
import { Upload, Mic } from 'lucide-react'
import { AudioUploader } from './AudioUploader'
import { VoiceRecorder } from './VoiceRecorder'

interface AudioInputSelectorProps {
  onUploadStart?: () => void
  onUploadComplete?: (file: File) => void
  onError?: (error: string) => void
  maxSizeBytes?: number
  maxDurationSeconds?: number
  className?: string
}

type InputMode = 'upload' | 'record'

export const AudioInputSelector: React.FC<AudioInputSelectorProps> = ({
  onUploadStart,
  onUploadComplete,
  onError,
  maxSizeBytes,
  maxDurationSeconds = 300,
  className
}) => {
  const [activeMode, setActiveMode] = useState<InputMode>('upload')

  const handleModeChange = (mode: InputMode) => {
    setActiveMode(mode)
  }

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Mode Selection Tabs */}
      <div className="flex items-center justify-center">
        <div className="bg-muted/30 p-1 rounded-lg border border-primary/10">
          <Button
            variant={activeMode === 'upload' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleModeChange('upload')}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200
              ${activeMode === 'upload' 
                ? 'bg-primary text-background shadow-sm' 
                : 'text-muted hover:text-primary hover:bg-primary/10'
              }
            `}
          >
            <Upload className="w-4 h-4" />
            <span className="font-inter text-sm">Upload File</span>
          </Button>
          <Button
            variant={activeMode === 'record' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleModeChange('record')}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200
              ${activeMode === 'record' 
                ? 'bg-primary text-background shadow-sm' 
                : 'text-muted hover:text-primary hover:bg-primary/10'
              }
            `}
          >
            <Mic className="w-4 h-4" />
            <span className="font-inter text-sm">Record Voice</span>
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="min-h-[200px]">
        {activeMode === 'upload' && (
          <div className="animate-in fade-in-0 duration-200">
            <AudioUploader
              onUploadStart={onUploadStart}
              onUploadComplete={onUploadComplete}
              onError={onError}
              maxSizeBytes={maxSizeBytes}
            />
          </div>
        )}

        {activeMode === 'record' && (
          <div className="animate-in fade-in-0 duration-200">
            <VoiceRecorder
              onRecordingComplete={onUploadComplete}
              onError={onError}
              maxDuration={maxDurationSeconds}
            />
          </div>
        )}
      </div>

      {/* Mode-specific hints */}
      <div className="text-center text-xs text-muted/70 space-y-1">
        {activeMode === 'upload' && (
          <>
            <p>Drag & drop or click to select an audio file</p>
            <p>Supports: MP3, WAV, M4A, AAC, OGG</p>
          </>
        )}
        {activeMode === 'record' && (
          <>
            <p>Record your voice directly in the browser</p>
            <p>Maximum duration: {Math.floor(maxDurationSeconds / 60)} minutes</p>
          </>
        )}
      </div>
    </div>
  )
}