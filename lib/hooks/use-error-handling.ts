/**
 * Comprehensive Error Handling Hook
 * Combines retry logic, error boundaries, and user feedback
 */

import * as React from 'react'
import { retryWithBackoff, RetryOptions } from '@/lib/utils/retry'
import { useOnlineStatus } from '@/lib/utils/offline-support'

export interface ErrorState {
  error: Error | null
  isError: boolean
  errorCount: number
  lastErrorTime: number | null
}

export interface ErrorHandlingOptions extends RetryOptions {
  showToast?: boolean
  logError?: boolean
  fallbackData?: any
}

/**
 * Hook for comprehensive error handling
 */
export function useErrorHandling<T = any>(options: ErrorHandlingOptions = {}) {
  const [errorState, setErrorState] = React.useState<ErrorState>({
    error: null,
    isError: false,
    errorCount: 0,
    lastErrorTime: null
  })

  const [isLoading, setIsLoading] = React.useState(false)
  const [data, setData] = React.useState<T | null>(null)
  const isOnline = useOnlineStatus()

  /**
   * Execute function with error handling and retry
   */
  const execute = React.useCallback(
    async (fn: () => Promise<T>): Promise<T | null> => {
      setIsLoading(true)
      setErrorState(prev => ({ ...prev, isError: false, error: null }))

      try {
        const result = await retryWithBackoff(fn, {
          ...options,
          onRetry: (error, attempt, delay) => {
            if (options.logError) {
              console.warn(`Retry attempt ${attempt}:`, error)
            }
            options.onRetry?.(error, attempt, delay)
          }
        })

        setData(result)
        setIsLoading(false)
        
        // Reset error count on success
        setErrorState(prev => ({ ...prev, errorCount: 0 }))
        
        return result
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error))
        
        setErrorState(prev => ({
          error: err,
          isError: true,
          errorCount: prev.errorCount + 1,
          lastErrorTime: Date.now()
        }))

        if (options.logError) {
          console.error('Error after retries:', err)
        }

        setIsLoading(false)
        
        // Return fallback data if provided
        if (options.fallbackData !== undefined) {
          setData(options.fallbackData)
          return options.fallbackData
        }

        return null
      }
    },
    [options, isOnline]
  )

  /**
   * Reset error state
   */
  const resetError = React.useCallback(() => {
    setErrorState({
      error: null,
      isError: false,
      errorCount: 0,
      lastErrorTime: null
    })
  }, [])

  /**
   * Clear data
   */
  const clearData = React.useCallback(() => {
    setData(null)
  }, [])

  return {
    execute,
    data,
    isLoading,
    error: errorState.error,
    isError: errorState.isError,
    errorCount: errorState.errorCount,
    resetError,
    clearData,
    isOnline
  }
}

/**
 * Hook for handling async operations with loading and error states
 */
export function useAsyncOperation<T = any>() {
  const [state, setState] = React.useState<{
    data: T | null
    loading: boolean
    error: Error | null
  }>({
    data: null,
    loading: false,
    error: null
  })

  const execute = React.useCallback(
    async (operation: () => Promise<T>, options: ErrorHandlingOptions = {}) => {
      setState({ data: null, loading: true, error: null })

      try {
        const result = await retryWithBackoff(operation, options)
        setState({ data: result, loading: false, error: null })
        return result
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error))
        setState({ data: null, loading: false, error: err })
        throw err
      }
    },
    []
  )

  const reset = React.useCallback(() => {
    setState({ data: null, loading: false, error: null })
  }, [])

  return {
    ...state,
    execute,
    reset
  }
}

/**
 * Hook for handling form submissions with error handling
 */
export function useFormSubmission<T = any>() {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<Error | null>(null)
  const [submitSuccess, setSubmitSuccess] = React.useState(false)

  const submit = React.useCallback(
    async (
      submitFn: () => Promise<T>,
      options: ErrorHandlingOptions = {}
    ): Promise<T | null> => {
      setIsSubmitting(true)
      setSubmitError(null)
      setSubmitSuccess(false)

      try {
        const result = await retryWithBackoff(submitFn, {
          maxAttempts: 2, // Fewer retries for form submissions
          ...options
        })

        setSubmitSuccess(true)
        setIsSubmitting(false)
        return result
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error))
        setSubmitError(err)
        setIsSubmitting(false)
        return null
      }
    },
    []
  )

  const reset = React.useCallback(() => {
    setIsSubmitting(false)
    setSubmitError(null)
    setSubmitSuccess(false)
  }, [])

  return {
    submit,
    isSubmitting,
    submitError,
    submitSuccess,
    reset
  }
}

/**
 * Hook for handling data fetching with caching
 */
export function useDataFetch<T = any>(
  fetchFn: () => Promise<T>,
  options: {
    cacheKey?: string
    cacheTTL?: number
    retry?: RetryOptions
    enabled?: boolean
  } = {}
) {
  const [data, setData] = React.useState<T | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)
  const [isFetching, setIsFetching] = React.useState(false)
  const isOnline = useOnlineStatus()

  const { enabled = true } = options

  const fetch = React.useCallback(async () => {
    if (!enabled) return

    setIsFetching(true)
    setError(null)

    try {
      // Check cache first
      if (options.cacheKey) {
        const cached = localStorage.getItem(`cache:${options.cacheKey}`)
        if (cached) {
          const { data: cachedData, timestamp } = JSON.parse(cached)
          const isExpired = options.cacheTTL && Date.now() - timestamp > options.cacheTTL
          
          if (!isExpired) {
            setData(cachedData)
            setIsFetching(false)
            return cachedData
          }
        }
      }

      const result = await retryWithBackoff(fetchFn, options.retry)
      
      // Cache result
      if (options.cacheKey) {
        localStorage.setItem(
          `cache:${options.cacheKey}`,
          JSON.stringify({ data: result, timestamp: Date.now() })
        )
      }

      setData(result)
      setIsFetching(false)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      setIsFetching(false)
      throw error
    }
  }, [fetchFn, enabled, options.cacheKey, options.cacheTTL, options.retry])

  React.useEffect(() => {
    if (enabled && isOnline) {
      setIsLoading(true)
      fetch().finally(() => setIsLoading(false))
    }
  }, [enabled, isOnline, fetch])

  const refetch = React.useCallback(() => {
    return fetch()
  }, [fetch])

  return {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
    isOnline
  }
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: any): string {
  if (!error) return 'An unknown error occurred'

  // Network errors
  if (error.message?.includes('fetch') || error.message?.includes('network')) {
    return 'Network error. Please check your connection and try again.'
  }

  // Timeout errors
  if (error.code === 'ETIMEDOUT' || error.message?.includes('timeout')) {
    return 'Request timed out. Please try again.'
  }

  // Server errors
  if (error.status >= 500) {
    return 'Server error. Please try again later.'
  }

  // Client errors
  if (error.status >= 400 && error.status < 500) {
    return error.message || 'Invalid request. Please check your input.'
  }

  // Permission errors
  if (error.status === 403 || error.message?.includes('permission')) {
    return 'You do not have permission to perform this action.'
  }

  // Authentication errors
  if (error.status === 401 || error.message?.includes('unauthorized')) {
    return 'Please log in to continue.'
  }

  // Default to error message
  return error.message || 'An error occurred. Please try again.'
}
