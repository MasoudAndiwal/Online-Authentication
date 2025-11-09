/**
 * Retry Utility with Exponential Backoff
 * Provides robust error handling for network requests and async operations
 */

export interface RetryOptions {
  maxAttempts?: number
  initialDelay?: number
  maxDelay?: number
  backoffMultiplier?: number
  shouldRetry?: (error: any, attempt: number) => boolean
  onRetry?: (error: any, attempt: number, delay: number) => void
}

export interface RetryResult<T> {
  success: boolean
  data?: T
  error?: Error
  attempts: number
}

/**
 * Default retry condition - retries on network errors and 5xx status codes
 */
function defaultShouldRetry(error: any, attempt: number): boolean {
  // Don't retry if max attempts reached
  if (attempt >= 3) return false

  // Retry on network errors
  if (error.name === 'NetworkError' || error.message?.includes('network')) {
    return true
  }

  // Retry on fetch errors
  if (error.name === 'TypeError' && error.message?.includes('fetch')) {
    return true
  }

  // Retry on 5xx server errors
  if (error.status >= 500 && error.status < 600) {
    return true
  }

  // Retry on specific error codes
  if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
    return true
  }

  return false
}

/**
 * Calculate delay with exponential backoff and jitter
 */
function calculateDelay(
  attempt: number,
  initialDelay: number,
  maxDelay: number,
  backoffMultiplier: number
): number {
  const exponentialDelay = initialDelay * Math.pow(backoffMultiplier, attempt - 1)
  const delayWithCap = Math.min(exponentialDelay, maxDelay)
  
  // Add jitter (random variation) to prevent thundering herd
  const jitter = delayWithCap * 0.1 * Math.random()
  
  return delayWithCap + jitter
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Retry an async function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    shouldRetry = defaultShouldRetry,
    onRetry
  } = options

  let lastError: Error | null = null
  let attempt = 0

  while (attempt < maxAttempts) {
    attempt++

    try {
      const result = await fn()
      return result
    } catch (error: any) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Check if we should retry
      if (attempt >= maxAttempts || !shouldRetry(error, attempt)) {
        throw lastError
      }

      // Calculate delay for next attempt
      const delay = calculateDelay(attempt, initialDelay, maxDelay, backoffMultiplier)

      // Call retry callback if provided
      onRetry?.(error, attempt, delay)

      // Log retry attempt in development
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          `Retry attempt ${attempt}/${maxAttempts} after ${Math.round(delay)}ms`,
          error
        )
      }

      // Wait before retrying
      await sleep(delay)
    }
  }

  throw lastError || new Error('Retry failed with unknown error')
}

/**
 * Retry with result object (doesn't throw)
 */
export async function retryWithResult<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<RetryResult<T>> {
  let attempts = 0

  try {
    const data = await retryWithBackoff(fn, {
      ...options,
      onRetry: (error, attempt, delay) => {
        attempts = attempt
        options.onRetry?.(error, attempt, delay)
      }
    })

    return {
      success: true,
      data,
      attempts: attempts || 1
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
      attempts
    }
  }
}

/**
 * Fetch with retry
 */
export async function fetchWithRetry(
  url: string,
  init?: RequestInit,
  options: RetryOptions = {}
): Promise<Response> {
  return retryWithBackoff(
    async () => {
      const response = await fetch(url, init)
      
      // Throw on non-ok responses to trigger retry
      if (!response.ok) {
        const error: any = new Error(`HTTP ${response.status}: ${response.statusText}`)
        error.status = response.status
        error.response = response
        throw error
      }
      
      return response
    },
    {
      ...options,
      shouldRetry: (error, attempt) => {
        // Use custom shouldRetry if provided
        if (options.shouldRetry) {
          return options.shouldRetry(error, attempt)
        }
        
        // Default: retry on network errors and 5xx
        return defaultShouldRetry(error, attempt)
      }
    }
  )
}

/**
 * React Hook for retry functionality
 */
export function useRetry() {
  const [isRetrying, setIsRetrying] = React.useState(false)
  const [retryCount, setRetryCount] = React.useState(0)
  const [lastError, setLastError] = React.useState<Error | null>(null)

  const retry = React.useCallback(
    async <T,>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> => {
      setIsRetrying(true)
      setLastError(null)

      try {
        const result = await retryWithBackoff(fn, {
          ...options,
          onRetry: (error, attempt, delay) => {
            setRetryCount(attempt)
            options.onRetry?.(error, attempt, delay)
          }
        })

        setIsRetrying(false)
        return result
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error))
        setLastError(err)
        setIsRetrying(false)
        throw err
      }
    },
    []
  )

  const reset = React.useCallback(() => {
    setIsRetrying(false)
    setRetryCount(0)
    setLastError(null)
  }, [])

  return {
    retry,
    isRetrying,
    retryCount,
    lastError,
    reset
  }
}

// Import React for the hook
import * as React from 'react'
