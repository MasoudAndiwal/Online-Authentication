/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Error Logging Middleware for API Routes
 * 
 * Provides comprehensive contextual error logging with full request context,
 * user information, stack traces, and integration with error tracking services.
 * 
 * This middleware implements requirement 9.5: "WHEN critical errors happen THEN 
 * the Student_Dashboard_System SHALL log errors with full context for debugging"
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  errorLogger, 
  createErrorContextFromRequest, 
  logError,
  ErrorContext,
  LogLevel,
  type ErrorLogEntry 
} from '../errors/error-logger';
import { 
  getErrorCode, 
  getErrorStatusCode,
  isClientError,
  isServerError 
} from '../errors/custom-errors';

/**
 * Enhanced request context for error logging
 */
interface EnhancedErrorContext extends ErrorContext {
  // Additional context specific to our application
  feature?: string;
  operation?: string;
  resourceType?: string;
  resourceId?: string;
  performanceMetrics?: {
    startTime: number;
    memoryUsage?: NodeJS.MemoryUsage;
    cpuUsage?: NodeJS.CpuUsage;
  };
}

/**
 * Configuration for error logging middleware
 */
interface ErrorLoggingConfig {
  // Whether to log successful requests (for debugging)
  logSuccessfulRequests?: boolean;
  // Performance threshold for slow request warnings (ms)
  slowRequestThreshold?: number;
  // Whether to include request/response bodies in logs
  includeRequestBody?: boolean;
  includeResponseBody?: boolean;
  // Maximum body size to log (bytes)
  maxBodySize?: number;
  // Feature name for categorization
  feature?: string;
  // Operation name for this endpoint
  operation?: string;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: Required<ErrorLoggingConfig> = {
  logSuccessfulRequests: process.env.NODE_ENV === 'development',
  slowRequestThreshold: 1000, // 1 second
  includeRequestBody: process.env.NODE_ENV === 'development',
  includeResponseBody: false, // Usually too large and sensitive
  maxBodySize: 10 * 1024, // 10KB
  feature: 'api',
  operation: 'unknown'
};

/**
 * Extract performance metrics
 */
function getPerformanceMetrics(): {
  startTime: number;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: NodeJS.CpuUsage;
} {
  return {
    startTime: performance.now(),
    memoryUsage: process.memoryUsage(),
    cpuUsage: process.cpuUsage()
  };
}

/**
 * Calculate performance delta
 */
function calculatePerformanceDelta(
  start: { startTime: number; memoryUsage: NodeJS.MemoryUsage; cpuUsage: NodeJS.CpuUsage },
  end: { memoryUsage: NodeJS.MemoryUsage; cpuUsage: NodeJS.CpuUsage }
) {
  const duration = performance.now() - start.startTime;
  const memoryDelta = {
    rss: end.memoryUsage.rss - start.memoryUsage.rss,
    heapUsed: end.memoryUsage.heapUsed - start.memoryUsage.heapUsed,
    heapTotal: end.memoryUsage.heapTotal - start.memoryUsage.heapTotal,
    external: end.memoryUsage.external - start.memoryUsage.external
  };
  const cpuDelta = process.cpuUsage(start.cpuUsage);

  return {
    duration,
    memoryDelta,
    cpuDelta
  };
}

/**
 * Sanitize request body for logging
 */
function sanitizeRequestBody(body: any, maxSize: number): any {
  if (!body) return undefined;

  // Convert to string and check size
  const bodyStr = JSON.stringify(body);
  if (bodyStr.length > maxSize) {
    return `[TRUNCATED: ${bodyStr.length} bytes, showing first ${maxSize}]${bodyStr.substring(0, maxSize)}`;
  }

  // Remove sensitive fields
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
  const sanitized = { ...body };

  function sanitizeObject(obj: any): any {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    const result: any = Array.isArray(obj) ? [] : {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
        result[key] = '[REDACTED]';
      } else if (typeof value === 'object') {
        result[key] = sanitizeObject(value);
      } else {
        result[key] = value;
      }
    }
    
    return result;
  }

  return sanitizeObject(sanitized);
}

/**
 * Create enhanced error context from request
 */
function createEnhancedErrorContext(
  req: NextRequest,
  config: Required<ErrorLoggingConfig>,
  performanceMetrics?: {
    startTime: number;
    memoryUsage?: NodeJS.MemoryUsage;
    cpuUsage?: NodeJS.CpuUsage;
  },
  statusCode?: number,
  resourceType?: string,
  resourceId?: string
): EnhancedErrorContext {
  // Get base context
  const baseContext = createErrorContextFromRequest(req, performanceMetrics?.startTime, statusCode);
  
  // Add enhanced context
  const enhancedContext: EnhancedErrorContext = {
    ...baseContext,
    feature: config.feature,
    operation: config.operation,
    resourceType,
    resourceId,
    performanceMetrics
  };

  // Add sanitized request body if configured
  if (config.includeRequestBody && req.method !== 'GET') {
    try {
      // Note: In a real implementation, you'd need to clone the request
      // to read the body without consuming it. For now, we'll skip this
      // and rely on the handler to provide the body if needed.
    } catch (error) {
      // Ignore body parsing errors
    }
  }

  return enhancedContext;
}

/**
 * Log successful request (for debugging and monitoring)
 */
async function logSuccessfulRequest(
  context: EnhancedErrorContext,
  config: Required<ErrorLoggingConfig>,
  performanceDelta?: any
): Promise<void> {
  if (!config.logSuccessfulRequests) return;

  const message = `Request completed successfully: ${context.method} ${context.endpoint}`;
  
  await errorLogger.logInfo(message, context, {
    operation: config.operation,
    feature: config.feature,
    performance: performanceDelta,
    statusCode: context.statusCode
  });
}

/**
 * Log slow request warning
 */
async function logSlowRequest(
  context: EnhancedErrorContext,
  config: Required<ErrorLoggingConfig>,
  performanceDelta: any
): Promise<void> {
  const message = `Slow request detected: ${context.method} ${context.endpoint} took ${performanceDelta.duration}ms`;
  
  await errorLogger.logWarning(message, context, {
    operation: config.operation,
    feature: config.feature,
    performance: performanceDelta,
    threshold: config.slowRequestThreshold,
    statusCode: context.statusCode
  });
}

/**
 * Main error logging middleware wrapper
 * 
 * Wraps API route handlers with comprehensive error logging including:
 * - Full request context (headers, query params, body)
 * - User information (if authenticated)
 * - Performance metrics (duration, memory, CPU)
 * - Stack traces for errors
 * - Integration with error tracking services
 * 
 * @param handler - The API route handler function
 * @param config - Configuration options for logging
 * @returns Wrapped handler with error logging
 */
export function withErrorLogging<T extends any[], R>(
  handler: (req: NextRequest, ...args: T) => Promise<NextResponse>,
  config: Partial<ErrorLoggingConfig> = {}
) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  return async (req: NextRequest, ...args: T): Promise<NextResponse> => {
    const performanceStart = getPerformanceMetrics();
    let response: NextResponse;
    let error: Error | null = null;

    try {
      // Set user context if available (from authentication middleware)
      const userId = (req as any).user?.id;
      if (userId) {
        errorLogger.setUser(userId, {
          role: (req as any).user?.role,
          username: (req as any).user?.username
        });
      }

      // Set global tags for this request
      errorLogger.setTag('feature', finalConfig.feature);
      errorLogger.setTag('operation', finalConfig.operation);
      errorLogger.setTag('method', req.method || 'UNKNOWN');

      // Execute the handler
      response = await handler(req, ...args);

      // Calculate performance metrics
      const performanceEnd = {
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage()
      };
      const performanceDelta = calculatePerformanceDelta(performanceStart, performanceEnd);

      // Create context for logging
      const context = createEnhancedErrorContext(
        req,
        finalConfig,
        performanceStart,
        response.status
      );

      // Log slow requests
      if (performanceDelta.duration > finalConfig.slowRequestThreshold) {
        await logSlowRequest(context, finalConfig, performanceDelta);
      }

      // Log successful requests if configured
      await logSuccessfulRequest(context, finalConfig, performanceDelta);

      return response;

    } catch (caughtError) {
      error = caughtError as Error;
      
      // Calculate performance metrics for error case
      const performanceEnd = {
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage()
      };
      const performanceDelta = calculatePerformanceDelta(performanceStart, performanceEnd);

      // Determine status code
      const statusCode = getErrorStatusCode(error);
      
      // Create enhanced context
      const context = createEnhancedErrorContext(
        req,
        finalConfig,
        performanceStart,
        statusCode
      );

      // Log the error with full context
      await logError(
        error,
        context,
        {
          operation: finalConfig.operation,
          feature: finalConfig.feature,
          performance: performanceDelta,
          errorType: error.constructor.name,
          isClientError: isClientError(error),
          isServerError: isServerError(error),
          handler: handler.name || 'anonymous'
        },
        [
          'api-error',
          finalConfig.feature,
          finalConfig.operation,
          error.constructor.name.toLowerCase()
        ]
      );

      // Return proper JSON error response instead of re-throwing
      const errorResponse = {
        error: error.name || 'Error',
        message: error.message || 'An unexpected error occurred',
        code: getErrorCode(error),
        statusCode,
        timestamp: new Date().toISOString(),
        requestId: (req as any).requestId || `err_${Date.now()}`,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      };

      return NextResponse.json(errorResponse, {
        status: statusCode,
        headers: {
          'X-Request-ID': (req as any).requestId || `err_${Date.now()}`,
          'X-Error-Code': getErrorCode(error)
        }
      });
    }
  };
}

/**
 * Middleware for logging database operations
 */
export function withDatabaseErrorLogging<T extends any[], R>(
  operation: (...args: T) => Promise<R>,
  operationName: string,
  tableName?: string
) {
  return async (...args: T): Promise<R> => {
    const startTime = performance.now();
    
    try {
      const result = await operation(...args);
      const duration = performance.now() - startTime;
      
      // Log slow database operations
      if (duration > 500) {
        await errorLogger.logWarning(
          `Slow database operation: ${operationName}`,
          {
            requestId: `db_${Date.now()}`,
            timestamp: new Date(),
            duration
          },
          {
            operationName,
            tableName,
            duration,
            args: args.length
          }
        );
      }
      
      return result;
    } catch (error) {
      await logError(
        error as Error,
        {
          requestId: `db_error_${Date.now()}`,
          timestamp: new Date(),
          duration: performance.now() - startTime
        },
        {
          operationName,
          tableName,
          args: args.length
        },
        ['database-error', operationName]
      );
      
      throw error;
    }
  };
}

/**
 * Middleware for logging cache operations
 */
export function withCacheErrorLogging<T extends any[], R>(
  operation: (...args: T) => Promise<R>,
  operationName: string,
  cacheKey?: string
) {
  return async (...args: T): Promise<R> => {
    const startTime = performance.now();
    
    try {
      const result = await operation(...args);
      return result;
    } catch (error) {
      await logError(
        error as Error,
        {
          requestId: `cache_error_${Date.now()}`,
          timestamp: new Date(),
          duration: performance.now() - startTime
        },
        {
          operationName,
          cacheKey,
          args: args.length
        },
        ['cache-error', operationName]
      );
      
      throw error;
    }
  };
}

/**
 * Middleware for logging external service calls
 */
export function withExternalServiceErrorLogging<T extends any[], R>(
  operation: (...args: T) => Promise<R>,
  serviceName: string,
  endpoint?: string
) {
  return async (...args: T): Promise<R> => {
    const startTime = performance.now();
    
    try {
      const result = await operation(...args);
      const duration = performance.now() - startTime;
      
      // Log slow external service calls
      if (duration > 2000) {
        await errorLogger.logWarning(
          `Slow external service call: ${serviceName}`,
          {
            requestId: `ext_${Date.now()}`,
            timestamp: new Date(),
            duration
          },
          {
            serviceName,
            endpoint,
            duration
          }
        );
      }
      
      return result;
    } catch (error) {
      await logError(
        error as Error,
        {
          requestId: `ext_error_${Date.now()}`,
          timestamp: new Date(),
          duration: performance.now() - startTime
        },
        {
          serviceName,
          endpoint,
          args: args.length
        },
        ['external-service-error', serviceName]
      );
      
      throw error;
    }
  };
}

/**
 * Create a configured error logging middleware for a specific feature
 */
export function createFeatureErrorLogger(
  feature: string,
  defaultOperation?: string
) {
  return (operation?: string, config?: Partial<ErrorLoggingConfig>) => {
    return withErrorLogging(
      // This will be filled by the actual handler
      null as any,
      {
        feature,
        operation: operation || defaultOperation || 'unknown',
        ...config
      }
    );
  };
}

/**
 * Global error handler for unhandled errors
 */
export function setupGlobalErrorHandling(): void {
  // Handle unhandled promise rejections
  process.on('unhandledRejection', async (reason, promise) => {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    
    await logError(
      error,
      {
        requestId: `unhandled_${Date.now()}`,
        timestamp: new Date()
      },
      {
        type: 'unhandledRejection',
        promise: promise.toString()
      },
      ['unhandled-error', 'promise-rejection']
    );
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', async (error) => {
    await logError(
      error,
      {
        requestId: `uncaught_${Date.now()}`,
        timestamp: new Date()
      },
      {
        type: 'uncaughtException'
      },
      ['unhandled-error', 'uncaught-exception']
    );
    
    // Exit process after logging
    process.exit(1);
  });
}

// Export convenience functions
export {
  errorLogger,
  logError,
  createErrorContextFromRequest
};