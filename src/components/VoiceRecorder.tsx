'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from './ui/button'
import { Mic, Square, Play, Pause, RotateCcw, Volume2 } from 'lucide-react'
import { LoadingSpinner } from './LoadingSpinner'
import { ErrorDisplay } from './ErrorDisplay'

interface VoiceRecorderProps {
  onRecordingComplete?: (file: File) => void
  onError?: (error: string) => void
  maxDuration?: number // in seconds, default 300 (5 minutes)
  className?: string
}

type RecorderState = 'idle' | 'requesting-permission' | 'recording' | 'paused' | 'completed' | 'error'

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onRecordingComplete,
  onError,
  maxDuration = 300,
  className
}) => {
  const [state, setState] = useState<RecorderState>('idle')
  const [duration, setDuration] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [audioLevels, setAudioLevels] = useState<number[]>([])

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const animationRef = useRef<number | null>(null)

  // Cleanup function
  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
  }, [audioUrl])

  // Cleanup on unmount
  useEffect(() => {
    return cleanup
  }, [cleanup])

  // Audio level visualization
  const updateAudioLevels = useCallback(() => {
    if (!analyserRef.current) return

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteFrequencyData(dataArray)
    
    // Calculate average amplitude
    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length
    const normalizedLevel = (average / 255) * 100

    setAudioLevels(prev => {
      const newLevels = [...prev, normalizedLevel].slice(-20) // Keep last 20 readings
      return newLevels
    })

    if (state === 'recording') {
      animationRef.current = requestAnimationFrame(updateAudioLevels)
    }
  }, [state])

  const startRecording = async () => {
    try {
      setState('requesting-permission')
      setError(null)
      setAudioLevels([])

      // Check if browser supports required APIs
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support audio recording. Please use a modern browser like Chrome, Firefox, or Safari.')
      }

      if (!window.MediaRecorder) {
        throw new Error('MediaRecorder is not supported in your browser. Please use a modern browser.')
      }

      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        } 
      })

      streamRef.current = stream

      // Set up audio context for visualization
      try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        audioContextRef.current = new AudioContextClass()
        const source = audioContextRef.current.createMediaStreamSource(stream)
        analyserRef.current = audioContextRef.current.createAnalyser()
        analyserRef.current.fftSize = 256
        source.connect(analyserRef.current)
        
        updateAudioLevels()
      } catch (audioContextError) {
        console.warn('Audio visualization not available:', audioContextError)
        // Continue without visualization
      }

      // Determine supported MIME type
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/mpeg'
      ]

      let selectedMimeType = ''
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType
          break
        }
      }

      if (!selectedMimeType) {
        selectedMimeType = 'audio/webm' // Fallback
      }

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: selectedMimeType,
        audioBitsPerSecond: 128000,
      })

      mediaRecorderRef.current = mediaRecorder
      const chunks: Blob[] = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: selectedMimeType })
        setAudioBlob(blob)
        
        // Create audio URL for preview
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        
        setState('completed')
        cleanup()
      }

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event)
        setError('Recording failed. Please try again.')
        setState('error')
        cleanup()
      }

      // Start recording
      mediaRecorder.start(100) // Collect data every 100ms
      setState('recording')
      setDuration(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration(prev => {
          const newDuration = prev + 1
          if (newDuration >= maxDuration) {
            stopRecording()
            return maxDuration
          }
          return newDuration
        })
      }, 1000)

    } catch (err) {
      console.error('Recording setup failed:', err)
      let errorMessage = 'Failed to start recording. '
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          errorMessage = 'Microphone permission denied. Please allow microphone access and try again.'
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          errorMessage = 'No microphone found. Please connect a microphone and try again.'
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          errorMessage = 'Microphone is being used by another application. Please close other apps using the microphone.'
        } else {
          errorMessage += err.message
        }
      } else {
        errorMessage += 'Please check your microphone and try again.'
      }

      setError(errorMessage)
      setState('error')
      onError?.(errorMessage)
      cleanup()
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause()
      setState('paused')
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume()
      setState('recording')
      
      // Resume timer
      timerRef.current = setInterval(() => {
        setDuration(prev => {
          const newDuration = prev + 1
          if (newDuration >= maxDuration) {
            stopRecording()
            return maxDuration
          }
          return newDuration
        })
      }, 1000)
    }
  }

  const playPreview = () => {
    if (audioRef.current && audioUrl) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  const resetRecording = () => {
    cleanup()
    setAudioBlob(null)
    setAudioUrl(null)
    setDuration(0)
    setState('idle')
    setError(null)
    setIsPlaying(false)
    setAudioLevels([])
  }

  const submitRecording = () => {
    if (audioBlob && onRecordingComplete) {
      // Create a File object from the Blob
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const file = new File([audioBlob], `voice-recording-${timestamp}.webm`, {
        type: audioBlob.type || 'audio/webm',
        lastModified: Date.now(),
      })
      
      onRecordingComplete(file)
      resetRecording()
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const maxDurationFormatted = formatDuration(maxDuration)

  // Error state
  if (state === 'error' && error) {
    return (
      <div className={className}>
        <ErrorDisplay 
          error={error}
          onRetry={() => {
            setError(null)
            setState('idle')
          }}
        />
      </div>
    )
  }

  // Recording interface
  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Audio preview element */}
      <audio 
        ref={audioRef}
        src={audioUrl || undefined}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />

      {/* Recording status and controls */}
      <div className="flex flex-col items-center justify-center space-y-6 p-8 bg-background rounded-xl border border-primary/10">
        
        {/* Recording indicator and timer */}
        <div className="flex flex-col items-center space-y-3">
          {state === 'requesting-permission' && (
            <div className="flex items-center space-x-3">
              <LoadingSpinner size="sm" />
              <p className="text-muted font-inter text-sm">Requesting microphone access...</p>
            </div>
          )}

          {(state === 'recording' || state === 'paused') && (
            <>
              <div className="flex items-center space-x-3">
                {state === 'recording' && (
                  <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                )}
                {state === 'paused' && (
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                )}
                <span className="text-lg font-playfair font-semibold text-primary">
                  {formatDuration(duration)}
                </span>
                <span className="text-sm text-muted">
                  / {maxDurationFormatted}
                </span>
              </div>

              {/* Audio level visualization */}
              {audioLevels.length > 0 && (
                <div className="flex items-center space-x-1 h-12">
                  {audioLevels.map((level, index) => (
                    <div
                      key={index}
                      className="w-2 bg-primary rounded-full transition-all duration-100"
                      style={{
                        height: `${Math.max(4, (level / 100) * 48)}px`,
                        opacity: 0.3 + (index / audioLevels.length) * 0.7
                      }}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {state === 'completed' && audioUrl && (
            <div className="flex flex-col items-center space-y-3">
              <div className="flex items-center space-x-2 text-success">
                <Volume2 className="w-5 h-5" />
                <span className="font-inter text-sm">
                  Recording completed ({formatDuration(duration)})
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Control buttons */}
        <div className="flex items-center space-x-4">
          {state === 'idle' && (
            <Button 
              onClick={startRecording}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-background flex items-center space-x-2"
            >
              <Mic className="w-5 h-5" />
              <span>Start Recording</span>
            </Button>
          )}

          {state === 'recording' && (
            <>
              <Button 
                onClick={pauseRecording}
                variant="outline"
                size="lg"
                className="border-primary text-primary hover:bg-primary/10"
              >
                <Pause className="w-5 h-5" />
              </Button>
              <Button 
                onClick={stopRecording}
                size="lg"
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                <Square className="w-5 h-5" />
              </Button>
            </>
          )}

          {state === 'paused' && (
            <>
              <Button 
                onClick={resumeRecording}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-background"
              >
                <Mic className="w-5 h-5" />
              </Button>
              <Button 
                onClick={stopRecording}
                size="lg"
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                <Square className="w-5 h-5" />
              </Button>
            </>
          )}

          {state === 'completed' && (
            <>
              <Button 
                onClick={playPreview}
                variant="outline"
                size="lg"
                className="border-primary text-primary hover:bg-primary/10"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>
              <Button 
                onClick={resetRecording}
                variant="outline"
                size="lg"
                className="border-muted text-muted hover:bg-muted/10"
              >
                <RotateCcw className="w-5 h-5" />
              </Button>
              <Button 
                onClick={submitRecording}
                size="lg"
                className="bg-success hover:bg-success/90 text-background"
              >
                Use Recording
              </Button>
            </>
          )}
        </div>

        {/* Instructions */}
        <div className="text-center text-sm text-muted space-y-1">
          {state === 'idle' && (
            <>
              <p>Click &quot;Start Recording&quot; to begin capturing your voice</p>
              <p className="text-xs text-muted/70">Maximum duration: {maxDurationFormatted}</p>
            </>
          )}
          {(state === 'recording' || state === 'paused') && (
            <p>Speak clearly into your microphone</p>
          )}
          {state === 'completed' && (
            <p>Preview your recording or use it to generate slides</p>
          )}
        </div>
      </div>
    </div>
  )
}