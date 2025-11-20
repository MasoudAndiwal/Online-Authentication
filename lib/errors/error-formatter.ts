/**
 * Error response formatter for consistent API error responses
 * 
 * Formats errors into structured ErrorResponse objects with
 * error codes, user-friendly messages, and request IDs.
 */

import { 
  BaseError, 
  ValidationError, 
  RateLimitError, 
  getErrorStatusCode, 
  getErrorCode 
} from './custom-errors';

/**
 * Structured error response format for API endpoints
 */
export interface ErrorResponse {
  error: {
    code: string;              // Machine-readable error code
    message: string;           // User-friendly error message
    details?: string;          // Technical details (dev mode only)
    field?: string;            // Field name for validation errors
    retryAfter?: number;       // Seconds until retry allowed (rate limits)
    timestamp: string;         // ISO 8601 timestamp
    requestId: string;         // Unique request identifier for tracking
    statusCode: number;        // HTTP status code
  };
}

/**
 * Additional context for error formatting
 */
export interface ErrorContext {
  requestId: string;
  userId?: string;
  endpoint?: string;
  method?: string;
  userAgent?: string;
  ipAddress?: string;
}

/**
 * Format any error into a structured ErrorResponse
 * 
 * @param error - The error to format
 * @param requestId - Unique request identifier
 * @param context - Additional context information
 * @returns Formatted error response
 */
export function formatErrorResponse(
  error: Error, 
  requestId: string,
  context?: Partial<ErrorContext>
): ErrorResponse {
  const statusCode = getErrorStatusCode(error);
  const errorCode = getErrorCode(error);
  const timestamp = new Date().toISOString();

  // Base error response
  const errorResponse: ErrorResponse = {
    error: {
      code: errorCode,
      message: getUserFriendlyMessage(error),
      timestamp,
      requestId,
      statusCode
    }
  };

  // Add technical details in development mode
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.details = error.message;
  }

  // Add field-specific information for validation errors
  if (error instanceof ValidationError) {
    if (error.field) {
      errorResponse.error.field = error.field;
    }
    if (error.details) {
      errorResponse.error.details = JSON.stringify(error.details);
    }
  }

  // Add retry information for rate limit errors
  if (error instanceof RateLimitError) {
    if (error.retryAfter) {
      errorResponse.error.retryAfter = error.retryAfter;
    }
  }

  return errorResponse;
}

/**
 * Get user-friendly error message based on error type
 * 
 * @param error - The error to get message for
 * @returns User-friendly error message
 */
function getUserFriendlyMessage(error: Error): string {
  // Use custom message if it's a BaseError
  if (error instanceof BaseError) {
    return error.message;
  }

  // Map common error types to user-friendly messages
  const errorMessage = error.message.toLowerCase();

  if (errorMessage.includes('network') || errorMessage.includes('connection')) {
    return 'Network connection error. Please check your internet connection and try again.';
  }

  if (errorMessage.includes('timeout')) {
    return 'Request timed out. Please try again.';
  }

  if (errorMessage.includes('unauthorized') || errorMessage.includes('authentication')) {
    return 'Authentication required. Please log in and try again.';
  }

  if (errorMessage.includes('forbidden') || errorMessage.includes('permission')) {
    return 'You do not have permission to perform this action.';
  }

  if (errorMessage.includes('not found')) {
    return 'The requested resource was not found.';
  }

  if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
    return 'Invalid input data. Please check your request and try again.';
  }

  if (errorMessage.includes('rate limit') || errorMessage.includes('too many')) {
    return 'Too many requests. Please wait a moment and try again.';
  }

  // Default fallback message
  return 'An unexpected error occurred. Please try again later.';
}

/**
 * Format error for logging purposes with full context
 * 
 * @param error - The error to format
 * @param context - Request context information
 * @returns Formatted error log entry
 */
export function formatErrorForLogging(error: Error, context: ErrorContext) {
  return {
    error: {
      name: error.name,
      message: error.message,
      code: getErrorCode(error),
      statusCode: getErrorStatusCode(error),
      stack: error.stack
    },
    context: {
      requestId: context.requestId,
      userId: context.userId,
      endpoint: context.endpoint,
      method: context.method,
      userAgent: context.userAgent,
      ipAddress: context.ipAddress
    },
    timestamp: new Date().toISOString()
  };
}

/**
 * Create a standardized error response for Next.js API routes
 * 
 * @param error - The error to respond with
 * @param requestId - Unique request identifier
 * @param context - Additional context information
 * @returns Response object with status and JSON body
 */
export function createErrorResponse(
  error: Error,
  requestId: string,
  context?: Partial<ErrorContext>
) {
  const errorResponse = formatErrorResponse(error, requestId, context);
  const statusCode = getErrorStatusCode(error);

  return {
    status: statusCode,
    json: errorResponse
  };
}

/**
 * Middleware helper to handle errors in Next.js API routes
 * 
 * @param error - The error that occurred
 * @param req - Next.js request object
 * @param res - Next.js response object
 */
export function handleApiError(error: Error, req: any, res: any) {
  const requestId = req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const context: Partial<ErrorContext> = {
    requestId,
    userId: req.user?.id,
    endpoint: req.url,
    method: req.method,
    userAgent: req.headers['user-agent'],
    ipAddress: req.headers['x-forwarded-for'] || req.connection.remoteAddress
  };

  const errorResponse = formatErrorResponse(error, requestId, context);
  const statusCode = getErrorStatusCode(error);

  // Log error for monitoring
  console.error('API Error:', formatErrorForLogging(error, context as ErrorContext));

  // Send error response
  res.status(statusCode).json(errorResponse);
}

/**
 * Validation helper to create field-specific validation errors
 * 
 * @param field - The field that failed validation
 * @param message - The validation error message
 * @param value - The invalid value (optional)
 * @param requestId - Request identifier
 * @returns Formatted validation error response
 */
export function createValidationError(
  field: string,
  message: string,
  value?: any,
  requestId?: string
): ErrorResponse {
  const error = new ValidationError(
    `Validation failed for field '${field}': ${message}`,
    field,
    value ? { [field]: `Invalid value: ${value}` } : undefined,
    requestId
  );

  return formatErrorResponse(error, requestId || `req_${Date.now()}`);
}

/**
 * Helper to create rate limit error responses
 * 
 * @param retryAfter - Seconds until next request allowed
 * @param limit - Request limit
 * @param remaining - Remaining requests
 * @param requestId - Request identifier
 * @returns Formatted rate limit error response
 */
export function createRateLimitError(
  retryAfter: number,
  limit?: number,
  remaining?: number,
  requestId?: string
): ErrorResponse {
  const error = new RateLimitError(
    'Rate limit exceeded. Please try again later.',
    retryAfter,
    limit,
    remaining,
    requestId
  );

  return formatErrorResponse(error, requestId || `req_${Date.now()}`);
}