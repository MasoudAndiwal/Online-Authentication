/**
 * Error handling exports for the enhanced student dashboard backend
 */

// Export all custom error classes
export {
  BaseError,
  ValidationError,
  AuthenticationError,
  PermissionError,
  NotFoundError,
  RateLimitError,
  DatabaseError,
  CacheError,
  StorageError,
  ExternalServiceError,
  InternalError,
  isClientError,
  isServerError,
  isRetryableError,
  getErrorStatusCode,
  getErrorCode
} from './custom-errors';

// Re-export existing rate limit error for backward compatibility
export { default as RateLimitErrorLegacy } from './rate-limit-error';

// Export error response formatter
export { 
  formatErrorResponse, 
  createErrorResponse,
  handleApiError,
  createValidationError,
  createRateLimitError,
  type ErrorResponse,
  type ErrorContext as FormatterErrorContext
} from './error-formatter';

// Export retry utilities
export { 
  withRetry, 
  withDatabaseRetry,
  withCacheRetry,
  withExternalServiceRetry,
  makeRetryable,
  batchRetry,
  exponentialBackoff,
  DEFAULT_RETRY_CONFIGS,
  type RetryConfig,
  type RetryResult 
} from './retry-utils';

// Export circuit breaker
export {
  CircuitBreaker,
  CircuitBreakerRegistry,
  circuitBreakerRegistry,
  withCircuitBreaker,
  makeCircuitBreakerProtected,
  CircuitBreakerState,
  DEFAULT_CIRCUIT_BREAKER_CONFIGS,
  type CircuitBreakerConfig,
  type CircuitBreakerStats
} from './circuit-breaker';

// Export graceful degradation
export {
  GracefulDegradationManager,
  degradationManager,
  DegradationStrategies,
  FeatureFlags,
  ResourceMonitor,
  withCacheFallback,
  withStorageFallback,
  ServiceHealth,
  type DegradationConfig,
  type ServiceHealthInfo
} from './graceful-degradation';

// Export error logger
export {
  ErrorLogger,
  errorLogger,
  logError,
  createErrorContextFromRequest,
  withErrorLogging,
  withPerformanceLogging,
  logDatabaseOperation,
  LogLevel,
  type ErrorLogEntry,
  type ErrorContext,
  type ErrorTrackingService
} from './error-logger';

// Export error logging middleware
export {
  withErrorLogging as withErrorLoggingMiddleware,
  withDatabaseErrorLogging,
  withCacheErrorLogging,
  withExternalServiceErrorLogging,
  createFeatureErrorLogger,
  setupGlobalErrorHandling
} from '../middleware/error-logging-middleware';

// Export API middleware stack
export {
  withApiMiddleware,
  withStudentDashboardMiddleware,
  withFileUploadMiddleware,
  withExportMiddleware,
  withNotificationMiddleware,
  withAdminMiddleware,
  withHealthCheckMiddleware,
  type EnhancedRequest,
  type ApiHandler,
  type ApiMiddlewareConfig
} from '../middleware/api-middleware-stack';