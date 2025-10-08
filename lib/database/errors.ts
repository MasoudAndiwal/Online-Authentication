import { PostgrestError } from '@supabase/supabase-js'

// Prisma-equivalent error codes for compatibility
export enum PrismaErrorCode {
  UNIQUE_CONSTRAINT_VIOLATION = 'P2002',
  FOREIGN_KEY_CONSTRAINT_VIOLATION = 'P2003',
  RECORD_NOT_FOUND = 'P2025',
  CONNECTION_ERROR = 'P1001',
  TIMEOUT_ERROR = 'P1008',
  INVALID_DATA = 'P2000'
}

// Supabase PostgreSQL error codes
export enum PostgreSQLErrorCode {
  UNIQUE_VIOLATION = '23505',
  FOREIGN_KEY_VIOLATION = '23503',
  NOT_NULL_VIOLATION = '23502',
  CHECK_VIOLATION = '23514',
  CONNECTION_FAILURE = '08000',
  INVALID_TEXT_REPRESENTATION = '22P02'
}

// Custom error class for database operations
export class DatabaseError extends Error {
  public readonly code: string
  public readonly meta?: Record<string, any>
  public readonly originalError?: any

  constructor(
    message: string,
    code: string,
    meta?: Record<string, any>,
    originalError?: any
  ) {
    super(message)
    this.name = 'DatabaseError'
    this.code = code
    this.meta = meta
    this.originalError = originalError
  }
}

// Error response format interface
export interface ErrorResponse {
  error: string
  details?: {
    field: string
    message: string
  } | Array<{
    field: string
    message: string
  }>
}

// Map Supabase errors to Prisma-equivalent error codes
export function mapSupabaseError(error: PostgrestError | any): DatabaseError {
  // Handle PostgrestError (Supabase API errors)
  if (error.code) {
    switch (error.code) {
      case PostgreSQLErrorCode.UNIQUE_VIOLATION:
        return new DatabaseError(
          'Unique constraint violation',
          PrismaErrorCode.UNIQUE_CONSTRAINT_VIOLATION,
          {
            target: extractUniqueConstraintTarget(error.message),
            constraint: extractConstraintName(error.message)
          },
          error
        )

      case PostgreSQLErrorCode.FOREIGN_KEY_VIOLATION:
        return new DatabaseError(
          'Foreign key constraint violation',
          PrismaErrorCode.FOREIGN_KEY_CONSTRAINT_VIOLATION,
          {
            constraint: extractConstraintName(error.message)
          },
          error
        )

      case PostgreSQLErrorCode.NOT_NULL_VIOLATION:
        return new DatabaseError(
          'Required field missing',
          PrismaErrorCode.INVALID_DATA,
          {
            field: extractFieldName(error.message)
          },
          error
        )

      case PostgreSQLErrorCode.CHECK_VIOLATION:
        return new DatabaseError(
          'Data validation failed',
          PrismaErrorCode.INVALID_DATA,
          {
            constraint: extractConstraintName(error.message)
          },
          error
        )

      case PostgreSQLErrorCode.INVALID_TEXT_REPRESENTATION:
        return new DatabaseError(
          'Invalid data format',
          PrismaErrorCode.INVALID_DATA,
          {
            field: extractFieldName(error.message)
          },
          error
        )

      case 'PGRST116': // PostgREST: no rows returned
        return new DatabaseError(
          'Record not found',
          PrismaErrorCode.RECORD_NOT_FOUND,
          {},
          error
        )

      default:
        return new DatabaseError(
          error.message || 'Database operation failed',
          error.code,
          {},
          error
        )
    }
  }

  // Handle connection errors
  if (error.message && (
    error.message.includes('connection') ||
    error.message.includes('network') ||
    error.message.includes('timeout')
  )) {
    return new DatabaseError(
      'Database connection failed',
      PrismaErrorCode.CONNECTION_ERROR,
      {},
      error
    )
  }

  // Handle generic errors
  return new DatabaseError(
    error.message || 'Unknown database error',
    'UNKNOWN',
    {},
    error
  )
}

// Check if error is a unique constraint violation
export function isUniqueConstraintViolation(error: any): boolean {
  if (error instanceof DatabaseError) {
    return error.code === PrismaErrorCode.UNIQUE_CONSTRAINT_VIOLATION
  }
  
  return error?.code === PostgreSQLErrorCode.UNIQUE_VIOLATION
}

// Check if error is a foreign key constraint violation
export function isForeignKeyConstraintViolation(error: any): boolean {
  if (error instanceof DatabaseError) {
    return error.code === PrismaErrorCode.FOREIGN_KEY_CONSTRAINT_VIOLATION
  }
  
  return error?.code === PostgreSQLErrorCode.FOREIGN_KEY_VIOLATION
}

// Check if error is a record not found error
export function isRecordNotFoundError(error: any): boolean {
  if (error instanceof DatabaseError) {
    return error.code === PrismaErrorCode.RECORD_NOT_FOUND
  }
  
  return error?.code === 'PGRST116'
}

// Format error response for API consistency
export function formatErrorResponse(error: DatabaseError | any): ErrorResponse {
  if (error instanceof DatabaseError) {
    switch (error.code) {
      case PrismaErrorCode.UNIQUE_CONSTRAINT_VIOLATION:
        return {
          error: 'Unique constraint violation',
          details: {
            field: error.meta?.target || 'unknown',
            message: `A record with this ${error.meta?.target || 'value'} already exists`
          }
        }

      case PrismaErrorCode.FOREIGN_KEY_CONSTRAINT_VIOLATION:
        return {
          error: 'Invalid reference',
          details: {
            field: error.meta?.constraint || 'unknown',
            message: 'Referenced record does not exist'
          }
        }

      case PrismaErrorCode.RECORD_NOT_FOUND:
        return {
          error: 'Record not found',
          details: {
            field: 'id',
            message: 'The requested record does not exist'
          }
        }

      case PrismaErrorCode.INVALID_DATA:
        return {
          error: 'Invalid data',
          details: {
            field: error.meta?.field || 'unknown',
            message: 'The provided data is invalid'
          }
        }

      case PrismaErrorCode.CONNECTION_ERROR:
        return {
          error: 'Database connection failed',
          details: {
            field: 'connection',
            message: 'Unable to connect to the database'
          }
        }

      default:
        return {
          error: error.message || 'Database operation failed'
        }
    }
  }

  // Handle non-DatabaseError instances
  return {
    error: error?.message || 'An unexpected error occurred'
  }
}

// Utility functions to extract information from error messages
function extractUniqueConstraintTarget(message: string): string {
  // Extract field name from unique constraint violation message
  // Example: 'duplicate key value violates unique constraint "students_username_key"'
  const match = message.match(/constraint "(\w+)_(\w+)_key"/)
  if (match && match[2]) {
    return match[2] // Return the field name
  }
  
  // Try alternative pattern
  const altMatch = message.match(/Key \((\w+)\)=/)
  if (altMatch && altMatch[1]) {
    return altMatch[1]
  }
  
  return 'unknown'
}

function extractConstraintName(message: string): string {
  // Extract constraint name from error message
  const match = message.match(/constraint "([^"]+)"/)
  return match ? match[1] : 'unknown'
}

function extractFieldName(message: string): string {
  // Extract field name from various error messages
  const patterns = [
    /column "([^"]+)"/,
    /Key \(([^)]+)\)/,
    /field "([^"]+)"/
  ]
  
  for (const pattern of patterns) {
    const match = message.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }
  
  return 'unknown'
}

// Wrapper function to handle database operations with error mapping
export async function handleDatabaseOperation<T>(
  operation: () => Promise<T>
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    throw mapSupabaseError(error)
  }
}

// Specific error handling for common operations
export function handleCreateError(error: any, entityType: string): never {
  const mappedError = mapSupabaseError(error)
  
  if (isUniqueConstraintViolation(mappedError)) {
    const field = mappedError.meta?.target || 'field'
    throw new DatabaseError(
      `${entityType} with this ${field} already exists`,
      PrismaErrorCode.UNIQUE_CONSTRAINT_VIOLATION,
      mappedError.meta,
      error
    )
  }
  
  throw mappedError
}

export function handleUpdateError(error: any, entityType: string): never {
  const mappedError = mapSupabaseError(error)
  
  if (isRecordNotFoundError(mappedError)) {
    throw new DatabaseError(
      `${entityType} not found`,
      PrismaErrorCode.RECORD_NOT_FOUND,
      {},
      error
    )
  }
  
  if (isUniqueConstraintViolation(mappedError)) {
    const field = mappedError.meta?.target || 'field'
    throw new DatabaseError(
      `${entityType} with this ${field} already exists`,
      PrismaErrorCode.UNIQUE_CONSTRAINT_VIOLATION,
      mappedError.meta,
      error
    )
  }
  
  throw mappedError
}

export function handleFindError(error: any, entityType: string): never {
  const mappedError = mapSupabaseError(error)
  
  if (isRecordNotFoundError(mappedError)) {
    // For find operations, we typically return null instead of throwing
    // This function is for cases where we want to throw
    throw new DatabaseError(
      `${entityType} not found`,
      PrismaErrorCode.RECORD_NOT_FOUND,
      {},
      error
    )
  }
  
  throw mappedError
}

// API-specific error handling functions for maintaining exact compatibility
export function handleApiError(error: any): { 
  response: ErrorResponse, 
  status: number 
} {
  if (error instanceof DatabaseError) {
    switch (error.code) {
      case PrismaErrorCode.UNIQUE_CONSTRAINT_VIOLATION:
        const field = Array.isArray(error.meta?.target) ? error.meta.target[0] : error.meta?.target || 'field'
        return {
          response: {
            error: `A record with this ${field} already exists`,
            details: { field, message: 'Duplicate value' }
          },
          status: 409
        }

      case PrismaErrorCode.RECORD_NOT_FOUND:
        return {
          response: {
            error: 'Record not found',
            details: { field: 'id', message: 'The requested record does not exist' }
          },
          status: 404
        }

      case PrismaErrorCode.INVALID_DATA:
        return {
          response: {
            error: 'Invalid data',
            details: {
              field: error.meta?.field || 'unknown',
              message: 'The provided data is invalid'
            }
          },
          status: 400
        }

      case PrismaErrorCode.CONNECTION_ERROR:
        return {
          response: {
            error: 'Database connection failed'
          },
          status: 500
        }

      default:
        return {
          response: {
            error: 'An unexpected error occurred'
          },
          status: 500
        }
    }
  }

  // Handle non-DatabaseError instances
  return {
    response: {
      error: 'An unexpected error occurred'
    },
    status: 500
  }
}

// Specific helper for unique constraint violations in API routes
export function createUniqueConstraintError(entityType: string, field: string): {
  response: ErrorResponse,
  status: number
} {
  return {
    response: {
      error: `A ${entityType.toLowerCase()} with this ${field} already exists`,
      details: { field, message: 'Duplicate value' }
    },
    status: 409
  }
}

// Helper to check if an error should be treated as a validation error
export function isValidationError(error: any): boolean {
  if (error instanceof DatabaseError) {
    return error.code === PrismaErrorCode.INVALID_DATA ||
           error.code === PrismaErrorCode.UNIQUE_CONSTRAINT_VIOLATION
  }
  return false
}

// Helper to check if an error should be treated as a server error
export function isServerError(error: any): boolean {
  if (error instanceof DatabaseError) {
    return error.code === PrismaErrorCode.CONNECTION_ERROR ||
           error.code === PrismaErrorCode.TIMEOUT_ERROR ||
           error.code === 'UNKNOWN'
  }
  return true // Default to server error for unknown error types
}

// Helper function to extract field name from Supabase unique constraint errors
export function extractFieldFromUniqueError(error: any): string {
  if (error instanceof DatabaseError && error.meta?.target) {
    return error.meta.target
  }
  
  // Try to extract from original error message
  if (error?.message) {
    const patterns = [
      /Key \(([^)]+)\)=/,
      /constraint "(\w+)_(\w+)_key"/,
      /duplicate key.*"([^"]+)"/
    ]
    
    for (const pattern of patterns) {
      const match = error.message.match(pattern)
      if (match) {
        // For constraint patterns, return the field name (second capture group)
        return match[2] || match[1]
      }
    }
  }
  
  return 'field'
}

// Wrapper to ensure consistent error handling across all database operations
export async function safeDbOperation<T>(
  operation: () => Promise<T>,
  context?: { entityType?: string, operation?: string }
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    const mappedError = mapSupabaseError(error)
    
    // Add context to error if provided
    if (context?.entityType && context?.operation) {
      mappedError.message = `${context.operation} ${context.entityType}: ${mappedError.message}`
    }
    
    throw mappedError
  }
}