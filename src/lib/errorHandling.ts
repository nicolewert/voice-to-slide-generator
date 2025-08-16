import { ConvexError } from 'convex/values'

export interface RetryConfig {
  maxAttempts: number
  baseDelay: number
  maxDelay: number
  backoffMultiplier: number
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
}

export type ErrorType = 'network' | 'server' | 'validation' | 'claude_api' | 'transcription' | 'generation' | 'export' | 'unknown'

export class AppError extends Error {
  public readonly type: ErrorType
  public readonly recoverable: boolean
  public readonly userMessage: string
  public readonly code?: string
  public readonly originalError?: unknown

  constructor(
    type: ErrorType,
    message: string,
    userMessage: string,
    recoverable: boolean = true,
    code?: string,
    originalError?: unknown
  ) {
    super(message)
    this.name = 'AppError'
    this.type = type
    this.recoverable = recoverable
    this.userMessage = userMessage
    this.code = code
    this.originalError = originalError
  }

  static fromUnknown(error: unknown, fallbackMessage: string = 'An unexpected error occurred'): AppError {
    if (error instanceof AppError) {
      return error
    }

    if (error instanceof ConvexError) {
      return new AppError(
        'server',
        error.message,
        'A server error occurred. Please try again.',
        true,
        error.data?.code,
        error
      )
    }

    if (error instanceof Error) {
      // Network errors
      if (error.message.toLowerCase().includes('network') || 
          error.message.toLowerCase().includes('fetch')) {
        return new AppError(
          'network',
          error.message,
          'Network connection failed. Please check your connection and try again.',
          true,
          undefined,
          error
        )
      }

      // Claude API errors
      if (error.message.toLowerCase().includes('claude') || 
          error.message.toLowerCase().includes('anthropic')) {
        return new AppError(
          'claude_api',
          error.message,
          'AI service is temporarily unavailable. Please try again in a moment.',
          true,
          undefined,
          error
        )
      }

      return new AppError(
        'unknown',
        error.message,
        fallbackMessage,
        true,
        undefined,
        error
      )
    }

    return new AppError(
      'unknown',
      String(error),
      fallbackMessage,
      true,
      undefined,
      error
    )
  }
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {},
  errorContext: string = 'Operation'
): Promise<T> {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config }
  let lastError: unknown

  for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      
      // Don't retry on validation errors or non-recoverable errors
      const appError = AppError.fromUnknown(error)
      if (!appError.recoverable || appError.type === 'validation') {
        throw appError
      }

      // Don't retry on the last attempt
      if (attempt === finalConfig.maxAttempts) {
        break
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        finalConfig.baseDelay * Math.pow(finalConfig.backoffMultiplier, attempt - 1),
        finalConfig.maxDelay
      )

      // Add jitter to prevent thundering herd
      const jitteredDelay = delay * (0.5 + Math.random() * 0.5)

      console.warn(`${errorContext} failed (attempt ${attempt}/${finalConfig.maxAttempts}). Retrying in ${Math.round(jitteredDelay)}ms...`, error)

      await new Promise(resolve => setTimeout(resolve, jitteredDelay))
    }
  }

  throw AppError.fromUnknown(lastError, `${errorContext} failed after ${finalConfig.maxAttempts} attempts`)
}

export function logError(error: unknown, context: string, additionalData?: Record<string, unknown>) {
  const appError = AppError.fromUnknown(error)
  
  console.error(`[${context}] ${appError.type.toUpperCase()}: ${appError.message}`, {
    type: appError.type,
    recoverable: appError.recoverable,
    code: appError.code,
    userMessage: appError.userMessage,
    originalError: appError.originalError,
    ...additionalData
  })
}

export function getErrorDisplayConfig(error: AppError) {
  const config = {
    title: 'Error',
    message: error.userMessage,
    showRetry: error.recoverable,
    variant: 'destructive' as const,
    duration: 5000,
  }

  switch (error.type) {
    case 'network':
      return {
        ...config,
        title: 'Connection Error',
        duration: 8000,
      }
    
    case 'claude_api':
      return {
        ...config,
        title: 'AI Service Error',
        duration: 6000,
      }
    
    case 'transcription':
      return {
        ...config,
        title: 'Transcription Error',
        message: 'Failed to transcribe audio. Please ensure your audio file is clear and try again.',
      }
    
    case 'generation':
      return {
        ...config,
        title: 'Slide Generation Error',
        message: 'Failed to generate slides. Please check your transcript and try again.',
      }
    
    case 'export':
      return {
        ...config,
        title: 'Export Error',
        message: 'Failed to export presentation. Please try again or contact support.',
      }
    
    case 'validation':
      return {
        ...config,
        title: 'Validation Error',
        showRetry: false,
        duration: 4000,
      }
    
    case 'server':
      return {
        ...config,
        title: 'Server Error',
        duration: 6000,
      }
    
    default:
      return config
  }
}

export const ErrorHandlingUtils = {
  AppError,
  withRetry,
  logError,
  getErrorDisplayConfig,
  DEFAULT_RETRY_CONFIG,
}