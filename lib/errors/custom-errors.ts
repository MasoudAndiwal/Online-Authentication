/**
 * Custom error classes for the enhanced student dashboard backend system
 * 
 * These error classes provide structured error handling with consistent
 * HTTP status codes, error codes, and user-friendly messages.
 */

/**
 * Base class for all custom application errors
 */
export abstract class BaseError extends Error {
  public abstract readonly statusCode: number;
  public abstract readonly code: string;
  public readonly timestamp: Date;
  public readonly requestId?: string;

  constructor(message: string, requestId?: string) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = new Date();
    this.requestId = requestId;
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Convert error to JSON format for API responses
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      timestamp: this.timestamp.toISOString(),
      requestId: this.requestId,
      stack: process.env.NODE_ENV === 'development' ? this.stack : undefined
    };
  }
}

// ============================================================================
// CLIENT ERRORS (4xx)
// ============================================================================

/**
 * Validation error for invalid input data (400)
 */
export class ValidationError extends BaseError {
  public readonly statusCode = 400;
  public readonly code = 'VALIDATION_ERROR';
  public readonly field?: string;
  public readonly details?: Record<string, string>;

  constructor(
    message: string = 'Invalid input data',
    field?: string,
    details?: Record<string, string>,
    requestId?: string
  ) {
    super(message, requestId);
    this.field = field;
    this.details = details;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      field: this.field,
      details: this.details
    };
  }
}

/**
 * Authentication error for missing or invalid credentials (401)
 */
export class AuthenticationError extends BaseError {
  public readonly statusCode = 401;
  public readonly code = 'AUTHENTICATION_ERROR';

  constructor(message: string = 'Authentication required', requestId?: string) {
    super(message, requestId);
  }
}

/**
 * Permission error for insufficient permissions (403)
 */
export class PermissionError extends BaseError {
  public readonly statusCode = 403;
  public readonly code = 'PERMISSION_DENIED';
  public readonly requiredPermission?: string;

  constructor(
    message: string = 'Insufficient permissions',
    requiredPermission?: string,
    requestId?: string
  ) {
    super(message, requestId);
    this.requiredPermission = requiredPermission;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      requiredPermission: this.requiredPermission
    };
  }
}

/**
 * Not found error for missing resources (404)
 */
export class NotFoundError extends BaseError {
  public readonly statusCode = 404;
  public readonly code = 'RESOURCE_NOT_FOUND';
  public readonly resource?: string;
  public readonly resourceId?: string;

  constructor(
    message: string = 'Resource not found',
    resource?: string,
    resourceId?: string,
    requestId?: string
  ) {
    super(message, requestId);
    this.resource = resource;
    this.resourceId = resourceId;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      resource: this.resource,
      resourceId: this.resourceId
    };
  }
}

/**
 * Rate limit error for too many requests (429)
 */
export class RateLimitError extends BaseError {
  public readonly statusCode = 429;
  public readonly code = 'RATE_LIMIT_EXCEEDED';
  public readonly retryAfter?: number;
  public readonly limit?: number;
  public readonly remaining?: number;

  constructor(
    message: string = 'Too many requests. Please try again later.',
    retryAfter?: number,
    limit?: number,
    remaining?: number,
    requestId?: string
  ) {
    super(message, requestId);
    this.retryAfter = retryAfter;
    this.limit = limit;
    this.remaining = remaining;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      retryAfter: this.retryAfter,
      limit: this.limit,
      remaining: this.remaining
    };
  }
}

// ============================================================================
// SERVER ERRORS (5xx)
// ============================================================================

/**
 * Database error for connection or query failures (500)
 */
export class DatabaseError extends BaseError {
  public readonly statusCode = 500;
  public readonly code = 'DATABASE_ERROR';
  public readonly operation?: string;
  public readonly table?: string;

  constructor(
    message: string = 'Database operation failed',
    operation?: string,
    table?: string,
    requestId?: string
  ) {
    super(message, requestId);
    this.operation = operation;
    this.table = table;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      operation: this.operation,
      table: this.table
    };
  }
}

/**
 * Cache error for Redis connection or operation failures (500)
 */
export class CacheError extends BaseError {
  public readonly statusCode = 500;
  public readonly code = 'CACHE_ERROR';
  public readonly operation?: string;
  public readonly key?: string;

  constructor(
    message: string = 'Cache operation failed',
    operation?: string,
    key?: string,
    requestId?: string
  ) {
    super(message, requestId);
    this.operation = operation;
    this.key = key;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      operation: this.operation,
      key: this.key
    };
  }
}

/**
 * Storage error for file storage operation failures (500)
 */
export class StorageError extends BaseError {
  public readonly statusCode = 500;
  public readonly code = 'STORAGE_ERROR';
  public readonly operation?: string;
  public readonly fileName?: string;
  public readonly bucket?: string;

  constructor(
    message: string = 'Storage operation failed',
    operation?: string,
    fileName?: string,
    bucket?: string,
    requestId?: string
  ) {
    super(message, requestId);
    this.operation = operation;
    this.fileName = fileName;
    this.bucket = bucket;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      operation: this.operation,
      fileName: this.fileName,
      bucket: this.bucket
    };
  }
}

/**
 * External service error for third-party service failures (502)
 */
export class ExternalServiceError extends BaseError {
  public readonly statusCode = 502;
  public readonly code = 'EXTERNAL_SERVICE_ERROR';
  public readonly service?: string;
  public readonly endpoint?: string;

  constructor(
    message: string = 'External service unavailable',
    service?: string,
    endpoint?: string,
    requestId?: string
  ) {
    super(message, requestId);
    this.service = service;
    this.endpoint = endpoint;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      service: this.service,
      endpoint: this.endpoint
    };
  }
}

/**
 * Internal error for unexpected application errors (500)
 */
export class InternalError extends BaseError {
  public readonly statusCode = 500;
  public readonly code = 'INTERNAL_ERROR';
  public readonly component?: string;

  constructor(
    message: string = 'An unexpected error occurred',
    component?: string,
    requestId?: string
  ) {
    super(message, requestId);
    this.component = component;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      component: this.component
    };
  }
}

// ============================================================================
// ERROR TYPE GUARDS
// ============================================================================

/**
 * Check if error is a client error (4xx)
 */
export function isClientError(error: Error): error is ValidationError | AuthenticationError | PermissionError | NotFoundError | RateLimitError {
  return error instanceof ValidationError ||
         error instanceof AuthenticationError ||
         error instanceof PermissionError ||
         error instanceof NotFoundError ||
         error instanceof RateLimitError;
}

/**
 * Check if error is a server error (5xx)
 */
export function isServerError(error: Error): error is DatabaseError | CacheError | StorageError | ExternalServiceError | InternalError {
  return error instanceof DatabaseError ||
         error instanceof CacheError ||
         error instanceof StorageError ||
         error instanceof ExternalServiceError ||
         error instanceof InternalError;
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: Error): boolean {
  return error instanceof DatabaseError ||
         error instanceof CacheError ||
         error instanceof ExternalServiceError ||
         (error instanceof InternalError && error.message.includes('timeout'));
}

/**
 * Get HTTP status code from error
 */
export function getErrorStatusCode(error: Error): number {
  if (error instanceof BaseError) {
    return error.statusCode;
  }
  
  // Default to 500 for unknown errors
  return 500;
}

/**
 * Get error code from error
 */
export function getErrorCode(error: Error): string {
  if (error instanceof BaseError) {
    return error.code;
  }
  
  // Default error code for unknown errors
  return 'UNKNOWN_ERROR';
}