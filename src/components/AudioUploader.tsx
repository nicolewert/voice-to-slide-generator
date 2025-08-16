import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorDisplay } from './ErrorDisplay';

// Supported audio file types
const SUPPORTED_AUDIO_TYPES = [
  'audio/mpeg',   // mp3
  'audio/wav',    // wav
  'audio/m4a',    // m4a
  'audio/x-m4a',  // alternative m4a mime type
  'audio/aac',    // aac
  'audio/ogg'     // ogg
];

// Maximum file size (50MB)
const MAX_FILE_SIZE = 50 * 1024 * 1024;

interface AudioUploaderProps {
  onUploadStart?: () => void;
  onUploadComplete?: (file: File) => void;
  onError?: (error: string) => void;
  maxSizeBytes?: number;
}

export const AudioUploader: React.FC<AudioUploaderProps> = ({
  onUploadStart,
  onUploadComplete,
  onError,
  maxSizeBytes = MAX_FILE_SIZE
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    // Check file type
    if (!SUPPORTED_AUDIO_TYPES.includes(file.type)) {
      setError('Unsupported file type. Please upload an audio file (mp3, wav, m4a).');
      return false;
    }

    // Check file size
    if (file.size > maxSizeBytes) {
      setError(`File is too large. Maximum size is ${maxSizeBytes / (1024 * 1024)}MB.`);
      return false;
    }

    return true;
  };

  const handleFileUpload = (file: File) => {
    // Reset previous states
    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    // Validate file before upload
    if (!validateFile(file)) {
      setIsUploading(false);
      onError?.(error || 'Upload failed');
      return;
    }

    // Trigger upload start callback
    onUploadStart?.();

    // Pass file directly to parent component for handling
    // The parent (VoiceToSlideUploader) will handle the actual Convex upload
    onUploadComplete?.(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (isUploading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-6 bg-background rounded-xl shadow-lg">
        <LoadingSpinner size="lg" />
        <p className="text-muted font-inter text-sm">
          Uploading... {uploadProgress}%
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-primary h-2.5 rounded-full" 
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorDisplay 
        error={error} 
        onRetry={() => {
          setError(null);
          fileInputRef.current?.click();
        }} 
      />
    );
  }

  return (
    <div 
      className={`
        relative p-8 border-2 border-dashed rounded-xl transition-all duration-300
        ${isDragOver 
          ? 'border-primary bg-primary/10' 
          : 'border-muted/50 hover:border-primary/50'
        }
        flex flex-col items-center justify-center space-y-4
        text-center cursor-pointer
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={triggerFileInput}
    >
      <input 
        type="file" 
        ref={fileInputRef}
        className="hidden" 
        accept={SUPPORTED_AUDIO_TYPES.join(',')}
        onChange={handleFileInputChange}
      />
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-12 w-12 text-primary/70" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
        />
      </svg>
      <h3 className="text-lg font-playfair font-semibold text-primary">
        Upload Audio File
      </h3>
      <p className="text-muted font-inter text-sm">
        Drag and drop or click to select an audio file (mp3, wav, m4a)
      </p>
      <p className="text-xs text-muted/70">
        Max file size: {maxSizeBytes / (1024 * 1024)}MB
      </p>
    </div>
  );
};