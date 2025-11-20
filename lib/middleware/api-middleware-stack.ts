/**
 * Complete API Middleware Stack
 * 
 * Combines authentication, rate limiting, and error logging middleware
 * into a single, easy-to-use wrapper for API routes.
 */

import { NextRequest, NextResponse } from 'next/server';
import { withErrorLogging, ErrorLoggingConfig } from './error-logging-middleware';
import { applyRateLimit, RateLimitEndpoint } from '../api/rate-limit-middleware';
import { authenticateRequest, AuthenticatedUser } from '../api/auth-middleware';

/**
 * Configuration for the complete middleware stack
 */
interface ApiMiddlewareConfig {
  // Authentication configuration
  requireAuth?: boolean;
  allowedRoles?: Array<'OFFICE' | 'TEACHER' | 'STUDENT'>;
  
  // Rate limiting configuration
  rateLimitEndpoint?: RateLimitEndpoint;
  
  // Error logging configuration
  errorLogging?: ErrorLoggingConfig;
}

/**
 * Enhanced request object with middleware context
 */
interface EnhancedRequest extends NextRequest {
  user?: AuthenticatedUser;
  requestId: string;
  startTime: number;
}

/**
 * API handler function type with enhanced request
 */
type ApiHandler = (req: EnhancedRequest) => Promise<NextResponse>;

/**
 * Complete middleware stack wrapper
 * 
 * Applies authentication, rate limiting, and error logging in the correct order:
 * 1. Error logging (outermost - catches all errors)
 * 2. Authentication (if required)
 * 3. Rate limiting (uses authenticated user ID)
 * 4. Handler execution
 * 
 * @param handler - The API route handler
 * @param config - Middleware configuration
 * @returns Wrapped handler with full middleware stack
 */
export function withApiMiddleware(
  handler: ApiHandler,
  config: ApiMiddlewareConfig = {}
) {
  const {
    requireAuth = false,
    allowedRoles,
    rateLimitEndpoint,
    errorLogging = {}
  } = config;

  // Wrap with error logging (outermost layer)
  return withErrorLogging(
    async (req: NextRequest): Promise<NextResponse> => {
      // Add request metadata
      const enhancedReq = req as EnhancedRequest;
      enhancedReq.requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      enhancedReq.startTime = Date.now();

      // 1. Authentication (if required)
      if (requireAuth) {
        const { user, error } = await authenticateRequest(req);
        
        if (error) {
          return error;
        }
        
        if (!user) {
          return NextResponse.json(
            { 
              error: 'Unauthorized', 
              message: 'Authentication required',
              requestId: enhancedReq.requestId
            },
            { status: 401 }
          );
        }

        // Check role authorization
        if (allowedRoles && !allowedRoles.includes(user.role)) {
          return NextResponse.json(
            { 
              error: 'Forbidden', 
              message: `Access restricted to ${allowedRoles.join(', ')} only`,
              requestId: enhancedReq.requestId
            },
            { status: 403 }
          );
        }

        enhancedReq.user = user;
      }

      // 2. Rate limiting (if configured)
      if (rateLimitEndpoint) {
        const userId = enhancedReq.user?.id;
        const rateLimitResponse = await applyRateLimit(req, rateLimitEndpoint, userId);
        
        if (rateLimitResponse) {
          return rateLimitResponse;
        }
      }

      // 3. Execute handler
      return handler(enhancedReq);
    },
    errorLogging
  );
}

/**
 * Convenience wrapper for student dashboard endpoints
 */
export function withStudentDashboardMiddleware(
  handler: ApiHandler,
  operation: string,
  config: Partial<ApiMiddlewareConfig> = {}
) {
  return withApiMiddleware(handler, {
    requireAuth: true,
    allowedRoles: ['STUDENT', 'OFFICE'],
    rateLimitEndpoint: 'DASHBOARD',
    errorLogging: {
      feature: 'student-dashboard',
      operation,
      logSuccessfulRequests: process.env.NODE_ENV === 'development'
    },
    ...config
  });
}

/**
 * Convenience wrapper for file upload endpoints
 */
export function withFileUploadMiddleware(
  handler: ApiHandler,
  operation: string,
  config: Partial<ApiMiddlewareConfig> = {}
) {
  return withApiMiddleware(handler, {
    requireAuth: true,
    allowedRoles: ['STUDENT'],
    rateLimitEndpoint: 'UPLOAD',
    errorLogging: {
      feature: 'file-storage',
      operation,
      includeRequestBody: false, // Files are too large
      slowRequestThreshold: 5000 // File uploads can be slower
    },
    ...config
  });
}

/**
 * Convenience wrapper for export endpoints
 */
export function withExportMiddleware(
  handler: ApiHandler,
  operation: string,
  config: Partial<ApiMiddlewareConfig> = {}
) {
  return withApiMiddleware(handler, {
    requireAuth: true,
    allowedRoles: ['STUDENT', 'OFFICE'],
    rateLimitEndpoint: 'EXPORT',
    errorLogging: {
      feature: 'data-export',
      operation,
      slowRequestThreshold: 3000 // Exports can be slower
    },
    ...config
  });
}

/**
 * Convenience wrapper for notification endpoints
 */
export function withNotificationMiddleware(
  handler: ApiHandler,
  operation: string,
  config: Partial<ApiMiddlewareConfig> = {}
) {
  return withApiMiddleware(handler, {
    requireAuth: true,
    allowedRoles: ['STUDENT'],
    rateLimitEndpoint: 'DASHBOARD', // Use dashboard limits for notifications
    errorLogging: {
      feature: 'notifications',
      operation
    },
    ...config
  });
}

/**
 * Convenience wrapper for admin endpoints
 */
export function withAdminMiddleware(
  handler: ApiHandler,
  operation: string,
  config: Partial<ApiMiddlewareConfig> = {}
) {
  return withApiMiddleware(handler, {
    requireAuth: true,
    allowedRoles: ['OFFICE'],
    rateLimitEndpoint: 'DASHBOARD',
    errorLogging: {
      feature: 'admin',
      operation
    },
    ...config
  });
}

/**
 * Health check middleware (no auth, minimal logging)
 */
export function withHealthCheckMiddleware(
  handler: ApiHandler,
  operation: string = 'health-check'
) {
  return withApiMiddleware(handler, {
    requireAuth: false,
    errorLogging: {
      feature: 'health',
      operation,
      logSuccessfulRequests: false
    }
  });
}

export type { EnhancedRequest, ApiHandler, ApiMiddlewareConfig };