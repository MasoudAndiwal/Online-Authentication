/**
 * Student Dashboard Error Handling Utilities
 * Provides comprehensive error handling for student-specific operations
 * Requirements: 15.2
 */

import { retryWithBackoff, RetryOptions } from '@/lib/utils/retry'

// ============================================================================
// Error Types
// ============================================================================

export class NetworkError extends Error {
  constructor(message: string = 'Network error. Please check your connection.') {
    super(message)
    this.name = 'NetworkError'
  }
}

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class PermissionError extends Error {
  constructor(message: string = 'You do not have permission to perform this action.') {
    super(message)
    this.name = 'PermissionError'
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = 'Please log in to continue.') {
    super(message)
    this.name = 'AuthenticationError'
  }
}

export class DataNotFoundError extends Error {
  constructor(message: string = 'The requested data was not found.') {
    super(message)
    this.name = 'DataNotFoundError'
  }
}

export class ServerError extends Error {
  constructor(message: string = 'Server error. Please try again later.') {
    super(message)
    this.name = 'ServerError'
  }
}

// ============================================================================
// Error Classification
// ============================================================================

/**
 * Classify error type from response or error object
 */
export function classifyError(error: any): Error {
  // Network errors
  if (
    error.message?.includes('fetch') ||
    error.message?.includes('network') ||
    error.name === 'TypeError' ||
    !navigator.onLine
  ) {
    return new NetworkError()
  }

  // Authentication errors
  if (error.status === 401 || error.message?.includes('unauthorized')) {
    return new AuthenticationError()
  }

  // Permission errors
  if (error.status === 403 || error.message?.includes('permission')) {
    return new PermissionError()
  }

  // Not found errors
  if (error.status === 404) {
    return new DataNotFoundError()
  }

  // Validation errors
  if (error.status === 400 || error.status === 422) {
    return new ValidationError(error.message || 'Invalid data provided')
  }

  // Server errors
  if (error.status >= 500) {
    return new ServerError()
  }

  // Default to original error
  return error instanceof Error ? error : new Error(String(error))
}

// ============================================================================
// User-Friendly Error Messages
// ============================================================================

/**
 * Get user-friendly error message for students
 */
export function getStudentErrorMessage(error: any): string {
  const classified = classifyError(error)

  switch (classified.name) {
    case 'NetworkError':
      return 'Unable to connect. Please check your internet connection and try again.'

    case 'AuthenticationError':
      return 'Your session has expired. Please log in again to continue.'

    case 'PermissionError':
      return 'You do not have permission to view this information. Please contact your teacher if you believe this is an error.'

    case 'DataNotFoundError':
      return 'The requested information could not be found. Please refresh the page or contact support.'

    case 'ValidationError':
      return classified.message || 'The information provided is invalid. Please check and try again.'

    case 'ServerError':
      return 'Our servers are experiencing issues. Please try again in a few moments.'

    default:
      return classified.message || 'An unexpected error occurred. Please try again or contact support if the problem persists.'
  }
}

/**
 * Get error action suggestions for students
 */
export function getErrorActionSuggestions(error: any): string[] {
  const classified = classifyError(error)

  switch (classified.name) {
    case 'NetworkError':
      return [
        'Check your internet connection',
        'Try refreshing the page',
        'Switch to a different network if available',
      ]

    case 'AuthenticationError':
      return [
        'Log in again',
        'Clear your browser cache',
        'Contact support if you cannot log in',
      ]

    case 'PermissionError':
      return [
        'Contact your teacher for assistance',
        'Verify you are logged in with the correct account',
        'Check if your account has the necessary permissions',
      ]

    case 'DataNotFoundError':
      return [
        'Refresh the page',
        'Go back to the dashboard',
        'Contact support if the issue persists',
      ]

    case 'ValidationError':
      return [
        'Check the information you entered',
        'Make sure all required fields are filled',
        'Try again with different information',
      ]

    case 'ServerError':
      return [
        'Wait a few moments and try again',
        'Refresh the page',
        'Contact support if the problem continues',
      ]

    default:
      return [
        'Try refreshing the page',
        'Log out and log back in',
        'Contact support if the issue persists',
      ]
  }
}

// ============================================================================
// Data Validation
// ============================================================================

/**
 * Validate student ID format
 */
export function validateStudentId(studentId: string | undefined): ValidationError | null {
  if (!studentId) {
    return new ValidationError('Student ID is required', 'studentId')
  }

  if (typeof studentId !== 'string') {
    return new ValidationError('Student ID must be a string', 'studentId')
  }

  if (studentId.trim().length === 0) {
    return new ValidationError('Student ID cannot be empty', 'studentId')
  }

  return null
}

/**
 * Validate date range for attendance queries
 */
export function validateDateRange(
  startDate: Date | undefined,
  endDate: Date | undefined
): ValidationError | null {
  if (!startDate || !endDate) {
    return new ValidationError('Start date and end date are required')
  }

  if (!(startDate instanceof Date) || isNaN(startDate.getTime())) {
    return new ValidationError('Invalid start date', 'startDate')
  }

  if (!(endDate instanceof Date) || isNaN(endDate.getTime())) {
    return new ValidationError('Invalid end date', 'endDate')
  }

  if (startDate > endDate) {
    return new ValidationError('Start date must be before end date')
  }

  // Check if date range is too large (more than 1 year)
  const oneYear = 365 * 24 * 60 * 60 * 1000
  if (endDate.getTime() - startDate.getTime() > oneYear) {
    return new ValidationError('Date range cannot exceed one year')
  }

  return null
}

/**
 * Validate attendance status
 */
export function validateAttendanceStatus(
  status: string | undefined
): ValidationError | null {
  if (!status) {
    return new ValidationError('Attendance status is required', 'status')
  }

  const validStatuses = ['present', 'absent', 'sick', 'leave']
  if (!validStatuses.includes(status.toLowerCase())) {
    return new ValidationError(
      `Invalid attendance status. Must be one of: ${validStatuses.join(', ')}`,
      'status'
    )
  }

  return null
}

/**
 * Validate export format
 */
export function validateExportFormat(
  format: string | undefined
): ValidationError | null {
  if (!format) {
    return new ValidationError('Export format is required', 'format')
  }

  const validFormats = ['pdf', 'csv']
  if (!validFormats.includes(format.toLowerCase())) {
    return new ValidationError(
      `Invalid export format. Must be one of: ${validFormats.join(', ')}`,
      'format'
    )
  }

  return null
}

// ============================================================================
// API Error Handling
// ============================================================================

/**
 * Handle API response errors
 */
export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`
    
    try {
      const errorData = await response.json()
      errorMessage = errorData.error || errorData.message || errorMessage
    } catch {
      // If response is not JSON, use status text
    }

    const error: any = new Error(errorMessage)
    error.status = response.status
    error.response = response

    throw classifyError(error)
  }

  try {
    return await response.json()
  } catch (error) {
    throw new Error('Invalid response format from server')
  }
}

/**
 * Fetch with comprehensive error handling and retry
 */
export async function fetchWithErrorHandling<T>(
  url: string,
  options?: RequestInit,
  retryOptions?: RetryOptions
): Promise<T> {
  try {
    const response = await retryWithBackoff(
      async () => {
        const res = await fetch(url, options)
        return await handleApiResponse<T>(res)
      },
      {
        maxAttempts: 3,
        initialDelay: 1000,
        shouldRetry: (error: any, attempt: number) => {
          // Don't retry on client errors (4xx)
          if (error.status >= 400 && error.status < 500) {
            return false
          }
          // Retry on network errors and server errors
          return attempt < 3
        },
        ...retryOptions,
      }
    )

    return response
  } catch (error) {
    throw classifyError(error)
  }
}

// ============================================================================
// Permission Checking
// ============================================================================

/**
 * Check if user has permission to access student data
 */
export function checkStudentDataPermission(
  currentUserId: string | undefined,
  requestedStudentId: string | undefined
): PermissionError | null {
  if (!currentUserId) {
    return new PermissionError('You must be logged in to access this data')
  }

  if (!requestedStudentId) {
    return new PermissionError('Student ID is required')
  }

  // Students can only access their own data
  if (currentUserId !== requestedStudentId) {
    return new PermissionError(
      'You can only access your own attendance data. If you need to view other data, please contact your teacher.'
    )
  }

  return null
}

/**
 * Check if user has permission to export data
 */
export function checkExportPermission(
  currentUserId: string | undefined
): PermissionError | null {
  if (!currentUserId) {
    return new PermissionError('You must be logged in to export data')
  }

  // Students can export their own data (read-only)
  return null
}

// ============================================================================
// Error Logging
// ============================================================================

/**
 * Log error for debugging (development only)
 */
export function logError(error: Error, context?: Record<string, any>) {
  if (process.env.NODE_ENV === 'development') {
    console.error('Student Dashboard Error:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
    })
  }
}

/**
 * Log error to external service (production)
 */
export function reportError(error: Error, context?: Record<string, any>) {
  // In production, send to error tracking service
  if (process.env.NODE_ENV === 'production') {
    // TODO: Integrate with error tracking service (e.g., Sentry)
    console.error('Error reported:', error.message)
  }
}

// ============================================================================
// Error Recovery
// ============================================================================

/**
 * Attempt to recover from error with fallback data
 */
export function recoverWithFallback<T>(
  error: Error,
  fallbackData: T,
  context?: string
): T {
  logError(error, { context, fallback: 'Using fallback data' })
  return fallbackData
}

/**
 * Attempt to recover from error by retrying
 */
export async function recoverWithRetry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3
): Promise<T> {
  return retryWithBackoff(fn, {
    maxAttempts,
    initialDelay: 1000,
    onRetry: (error, attempt, delay) => {
      logError(error as Error, {
        recovery: 'Retrying operation',
        attempt,
        delay,
      })
    },
  })
}
