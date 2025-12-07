/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Contextual error logging utility with full context tracking
 * 
 * Logs errors with stack traces, request context, user info,
 * and integrates with error tracking services like Sentry.
 */

import { BaseError, getErrorCode, getErrorStatusCode } from './custom-errors';

/**
 * Error log levels
 */
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

/**
 * Request context information
 */
export interface ErrorContext {
  requestId: string;
  userId?: string;
  sessionId?: string;
  endpoint?: string;
  method?: string;
  userAgent?: string;
  ipAddress?: string;
  referer?: string;
  timestamp: Date;
  duration?: number;
  statusCode?: number;
  requestBody?: any;
  queryParams?: Record<string, any>;
  headers?: Record<string, string>;
}

/**
 * Error log entry structure
 */
export interface ErrorLogEntry {
  level: LogLevel;
  message: string;
  error: {
    name: string;
    message: string;
    code: string;
    statusCode: number;
    stack?: string;
    cause?: Error;
  };
  context: ErrorContext;
  metadata?: Record<string, any>;
  tags?: string[];
  fingerprint?: string;
  environment: string;
  service: string;
  version?: string;
}

/**
 * Error tracking service interface
 */
export interface ErrorTrackingService {
  captureError(entry: ErrorLogEntry): Promise<void>;
  captureMessage(message: string, level: LogLevel, context?: Partial<ErrorContext>): Promise<void>;
  setUser(userId: string, userData?: Record<string, any>): void;
  setTag(key: string, value: string): void;
  setContext(key: string, context: Record<string, any>): void;
}

/**
 * Console error tracking service (development)
 */
class ConsoleErrorTrackingService implements ErrorTrackingService {
  async captureError(entry: ErrorLogEntry): Promise<void> {
    const logMethod = entry.level === LogLevel.ERROR ? console.error : 
                     entry.level === LogLevel.WARN ? console.warn : console.log;
    
    logMethod(`[${entry.level.toUpperCase()}] ${entry.message}`, {
      error: entry.error,
      context: entry.context,
      metadata: entry.metadata,
      tags: entry.tags
    });
  }

  async captureMessage(message: string, level: LogLevel, context?: Partial<ErrorContext>): Promise<void> {
    const logMethod = level === LogLevel.ERROR ? console.error : 
                     level === LogLevel.WARN ? console.warn : console.log;
    
    logMethod(`[${level.toUpperCase()}] ${message}`, context);
  }

  setUser(userId: string, userData?: Record<string, any>): void {
    console.log(`User context set: ${userId}`, userData);
  }

  setTag(key: string, value: string): void {
    console.log(`Tag set: ${key} = ${value}`);
  }

  setContext(key: string, context: Record<string, any>): void {
    console.log(`Context set: ${key}`, context);
  }
}

/**
 * Sentry error tracking service (production)
 */
class SentryErrorTrackingService implements ErrorTrackingService {
  private sentry: any;

  constructor() {
    // Initialize Sentry if available
    try {
      this.sentry = require('@sentry/node');
    } catch (error) {
      console.warn('Sentry not available, falling back to console logging');
      this.sentry = null;
    }
  }

  async captureError(entry: ErrorLogEntry): Promise<void> {
    if (!this.sentry) {
      return new ConsoleErrorTrackingService().captureError(entry);
    }

    this.sentry.withScope((scope: any) => {
      // Set context
      scope.setUser({
        id: entry.context.userId,
        ip_address: entry.context.ipAddress
      });

      scope.setContext('request', {
        url: entry.context.endpoint,
        method: entry.context.method,
        headers: entry.context.headers,
        query_string: entry.context.queryParams
      });

      scope.setContext('response', {
        status_code: entry.context.statusCode,
        duration: entry.context.duration
      });

      // Set tags
      scope.setTag('error.code', entry.error.code);
      scope.setTag('error.statusCode', entry.error.statusCode.toString());
      scope.setTag('service', entry.service);
      scope.setTag('environment', entry.environment);

      if (entry.tags) {
        entry.tags.forEach(tag => scope.setTag('custom', tag));
      }

      // Set level
      scope.setLevel(entry.level as any);

      // Set fingerprint for grouping
      if (entry.fingerprint) {
        scope.setFingerprint([entry.fingerprint]);
      }

      // Capture the error
      const error = new Error(entry.error.message);
      error.name = entry.error.name;
      error.stack = entry.error.stack;

      this.sentry.captureException(error);
    });
  }

  async captureMessage(message: string, level: LogLevel, context?: Partial<ErrorContext>): Promise<void> {
    if (!this.sentry) {
      return new ConsoleErrorTrackingService().captureMessage(message, level, context);
    }

    this.sentry.withScope((scope: any) => {
      if (context) {
        scope.setContext('custom', context);
      }
      scope.setLevel(level as any);
      this.sentry.captureMessage(message);
    });
  }

  setUser(userId: string, userData?: Record<string, any>): void {
    if (this.sentry) {
      this.sentry.setUser({ id: userId, ...userData });
    }
  }

  setTag(key: string, value: string): void {
    if (this.sentry) {
      this.sentry.setTag(key, value);
    }
  }

  setContext(key: string, context: Record<string, any>): void {
    if (this.sentry) {
      this.sentry.setContext(key, context);
    }
  }
}

/**
 * Error logger class
 */
export class ErrorLogger {
  private trackingService: ErrorTrackingService;
  private readonly service: string;
  private readonly environment: string;
  private readonly version?: string;

  constructor(
    service: string = 'student-dashboard-backend',
    environment: string = process.env.NODE_ENV || 'development',
    version?: string
  ) {
    this.service = service;
    this.environment = environment;
    this.version = version || process.env.npm_package_version;

    // Choose tracking service based on environment
    this.trackingService = environment === 'production' 
      ? new SentryErrorTrackingService()
      : new ConsoleErrorTrackingService();
  }

  /**
   * Log an error with full context
   */
  async logError(
    error: Error,
    context: ErrorContext,
    metadata?: Record<string, any>,
    tags?: string[]
  ): Promise<void> {
    const entry: ErrorLogEntry = {
      level: LogLevel.ERROR,
      message: error.message,
      error: {
        name: error.name,
        message: error.message,
        code: getErrorCode(error),
        statusCode: getErrorStatusCode(error),
        stack: error.stack,
        cause: error.cause as Error
      },
      context,
      metadata,
      tags,
      fingerprint: this.generateFingerprint(error, context),
      environment: this.environment,
      service: this.service,
      version: this.version
    };

    await this.trackingService.captureError(entry);
  }

  /**
   * Log a warning with context
   */
  async logWarning(
    message: string,
    context: Partial<ErrorContext>,
    metadata?: Record<string, any>
  ): Promise<void> {
    const fullContext: ErrorContext = {
      requestId: context.requestId || `warn_${Date.now()}`,
      timestamp: new Date(),
      ...context
    };

    const entry: ErrorLogEntry = {
      level: LogLevel.WARN,
      message,
      error: {
        name: 'Warning',
        message,
        code: 'WARNING',
        statusCode: 200
      },
      context: fullContext,
      metadata,
      environment: this.environment,
      service: this.service,
      version: this.version
    };

    await this.trackingService.captureError(entry);
  }

  /**
   * Log an info message
   */
  async logInfo(
    message: string,
    context?: Partial<ErrorContext>,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.trackingService.captureMessage(message, LogLevel.INFO, context);
  }

  /**
   * Set user context for subsequent logs
   */
  setUser(userId: string, userData?: Record<string, any>): void {
    this.trackingService.setUser(userId, userData);
  }

  /**
   * Set global tag
   */
  setTag(key: string, value: string): void {
    this.trackingService.setTag(key, value);
  }

  /**
   * Set global context
   */
  setContext(key: string, context: Record<string, any>): void {
    this.trackingService.setContext(key, context);
  }

  /**
   * Generate fingerprint for error grouping
   */
  private generateFingerprint(error: Error, context: ErrorContext): string {
    const errorType = error.constructor.name;
    const endpoint = context.endpoint || 'unknown';
    const errorCode = getErrorCode(error);
    
    return `${errorType}-${errorCode}-${endpoint}`;
  }
}

/**
 * Global error logger instance
 */
export const errorLogger = new ErrorLogger();

/**
 * Convenience function to log errors
 */
export async function logError(
  error: Error,
  context: ErrorContext,
  metadata?: Record<string, any>,
  tags?: string[]
): Promise<void> {
  return errorLogger.logError(error, context, metadata, tags);
}

/**
 * Create error context from Next.js request
 */
export function createErrorContextFromRequest(
  req: any,
  startTime?: number,
  statusCode?: number
): ErrorContext {
  const now = new Date();
  
  return {
    requestId: req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId: req.user?.id || req.session?.userId,
    sessionId: req.session?.id,
    endpoint: req.url,
    method: req.method,
    userAgent: req.headers['user-agent'],
    ipAddress: req.headers['x-forwarded-for'] || req.connection?.remoteAddress || req.socket?.remoteAddress,
    referer: req.headers.referer,
    timestamp: now,
    duration: startTime ? now.getTime() - startTime : undefined,
    statusCode,
    requestBody: req.method !== 'GET' ? req.body : undefined,
    queryParams: req.query,
    headers: sanitizeHeaders(req.headers)
  };
}

/**
 * Sanitize headers to remove sensitive information
 */
function sanitizeHeaders(headers: Record<string, any>): Record<string, string> {
  const sanitized: Record<string, string> = {};
  const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key', 'x-auth-token'];
  
  for (const [key, value] of Object.entries(headers)) {
    if (sensitiveHeaders.includes(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = String(value);
    }
  }
  
  return sanitized;
}

/**
 * Error logging middleware for Next.js API routes
 */
export function withErrorLogging<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    const [req, res] = args as [any, any];
    const startTime = Date.now();
    
    try {
      const result = await handler(...args);
      
      // Log successful requests in debug mode
      if (process.env.LOG_LEVEL === 'debug') {
        const context = createErrorContextFromRequest(req, startTime, res.statusCode);
        await errorLogger.logInfo(`Request completed successfully`, context);
      }
      
      return result;
    } catch (error) {
      const context = createErrorContextFromRequest(req, startTime, res.statusCode || 500);
      
      await logError(
        error as Error,
        context,
        {
          handler: handler.name,
          args: args.length
        },
        ['api-error']
      );
      
      throw error;
    }
  };
}

/**
 * Performance monitoring decorator
 */
export function withPerformanceLogging<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  operationName: string,
  warnThreshold: number = 1000
) {
  return async (...args: T): Promise<R> => {
    const startTime = Date.now();
    
    try {
      const result = await fn(...args);
      const duration = Date.now() - startTime;
      
      if (duration > warnThreshold) {
        await errorLogger.logWarning(
          `Slow operation detected: ${operationName}`,
          {
            requestId: `perf_${Date.now()}`,
            timestamp: new Date(),
            duration
          },
          {
            operationName,
            threshold: warnThreshold,
            actualDuration: duration
          }
        );
      }
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      await logError(
        error as Error,
        {
          requestId: `perf_error_${Date.now()}`,
          timestamp: new Date(),
          duration
        },
        {
          operationName,
          duration
        },
        ['performance-error']
      );
      
      throw error;
    }
  };
}

/**
 * Database operation logging wrapper
 */
export async function logDatabaseOperation<T>(
  operation: () => Promise<T>,
  operationName: string,
  table?: string,
  query?: string
): Promise<T> {
  const startTime = Date.now();
  
  try {
    const result = await operation();
    const duration = Date.now() - startTime;
    
    // Log slow queries
    if (duration > 500) {
      await errorLogger.logWarning(
        `Slow database query: ${operationName}`,
        {
          requestId: `db_${Date.now()}`,
          timestamp: new Date(),
          duration
        },
        {
          operationName,
          table,
          query: query?.substring(0, 200), // Truncate long queries
          duration
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
        duration: Date.now() - startTime
      },
      {
        operationName,
        table,
        query
      },
      ['database-error']
    );
    
    throw error;
  }
}