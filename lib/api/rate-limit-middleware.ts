/**
 * Rate Limiting Middleware for API Routes
 * Implements distributed rate limiting using Redis
 * Protects endpoints from abuse with configurable limits
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRateLimiterService, RateLimitEndpoint, RATE_LIMITS } from '../services/rate-limiter-service';
import { RateLimitError } from '../errors/rate-limit-error';
import { logRateLimitViolation } from '../utils/audit-logger';

/**
 * Error response format for rate limit violations
 */
interface RateLimitErrorResponse {
  error: {
    code: string;
    message: string;
    retryAfter?: number;
    limit: number;
    remaining: number;
    resetAt: string;
    timestamp: string;
    requestId: string;
  };
}

/**
 * Generate unique request ID for tracking
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Extract IP address from request
 * Handles various proxy headers
 */
function extractIpAddress(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  return 'unknown';
}

/**
 * Extract user ID from request
 * Tries multiple sources: authenticated user, query params, headers
 */
function extractUserId(request: NextRequest, authenticatedUserId?: string): string {
  // Use authenticated user ID if available
  if (authenticatedUserId) {
    return authenticatedUserId;
  }

  // Fallback to query parameter
  const url = new URL(request.url);
  const studentId = url.searchParams.get('studentId');
  if (studentId) {
    return studentId;
  }

  // Fallback to IP address for unauthenticated requests
  const ip = extractIpAddress(request);
  return `ip:${ip}`;
}

/**
 * Apply rate limiting to a request
 * 
 * @param request - Next.js request object
 * @param endpoint - Rate limit endpoint identifier
 * @param userId - Optional user ID (will be extracted if not provided)
 * @returns NextResponse if rate limited, null if allowed
 */
export async function applyRateLimit(
  request: NextRequest,
  endpoint: RateLimitEndpoint,
  userId?: string
): Promise<NextResponse | null> {
  const requestId = generateRequestId();
  const effectiveUserId = extractUserId(request, userId);
  
  try {
    const rateLimiter = getRateLimiterService();
    const config = RATE_LIMITS[endpoint];

    // Check rate limit
    const result = await rateLimiter.checkLimit(effectiveUserId, endpoint);

    // If allowed, record the request
    if (result.allowed) {
      await rateLimiter.recordRequest(effectiveUserId, endpoint);
      return null; // Allow request to proceed
    }

    // Rate limit exceeded - log violation and return 429 response
    const ipAddress = extractIpAddress(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    // Log the rate limit violation for audit purposes
    await logRateLimitViolation(
      effectiveUserId,
      endpoint,
      ipAddress,
      userAgent,
      {
        limit: config.requests,
        window: config.window,
        retryAfter: result.retryAfter,
        requestId,
      }
    );

    const errorResponse: RateLimitErrorResponse = {
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: `Rate limit exceeded. Maximum ${config.requests} requests per ${config.window} seconds.`,
        retryAfter: result.retryAfter,
        limit: config.requests,
        remaining: result.remaining,
        resetAt: result.resetAt.toISOString(),
        timestamp: new Date().toISOString(),
        requestId,
      },
    };

    const response = NextResponse.json(errorResponse, { status: 429 });

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', config.requests.toString());
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    response.headers.set('X-RateLimit-Reset', result.resetAt.toISOString());
    
    if (result.retryAfter) {
      response.headers.set('Retry-After', result.retryAfter.toString());
    }

    return response;
  } catch (error) {
    console.error(`Rate limit middleware error for ${effectiveUserId}:${endpoint}:`, error);
    
    // Fail open - allow request if rate limiting fails
    // This prevents rate limiter issues from breaking the entire API
    return null;
  }
}

/**
 * Create rate limit middleware for specific endpoint
 * Returns a function that can be used in API route handlers
 * 
 * @param endpoint - Rate limit endpoint identifier
 * @returns Middleware function
 */
export function createRateLimitMiddleware(endpoint: RateLimitEndpoint) {
  return async (request: NextRequest, userId?: string): Promise<NextResponse | null> => {
    return applyRateLimit(request, endpoint, userId);
  };
}

/**
 * Add rate limit headers to successful responses
 * Provides clients with information about their rate limit status
 * 
 * @param response - Next.js response object
 * @param endpoint - Rate limit endpoint identifier
 * @param userId - User identifier
 */
export async function addRateLimitHeaders(
  response: NextResponse,
  endpoint: RateLimitEndpoint,
  userId: string
): Promise<NextResponse> {
  try {
    const rateLimiter = getRateLimiterService();
    const config = RATE_LIMITS[endpoint];
    const usage = await rateLimiter.getUsage(userId, endpoint);

    response.headers.set('X-RateLimit-Limit', config.requests.toString());
    response.headers.set('X-RateLimit-Remaining', (config.requests - usage.requests).toString());
    response.headers.set('X-RateLimit-Reset', usage.windowEnd.toISOString());

    return response;
  } catch (error) {
    console.error('Error adding rate limit headers:', error);
    return response;
  }
}

/**
 * Middleware wrapper for API routes with rate limiting
 * Combines authentication and rate limiting
 * 
 * Usage:
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   return withRateLimit(request, 'DASHBOARD', async (req, userId) => {
 *     // Your API logic here
 *     return NextResponse.json({ data: 'success' });
 *   });
 * }
 * ```
 */
export async function withRateLimit<T>(
  request: NextRequest,
  endpoint: RateLimitEndpoint,
  handler: (request: NextRequest, userId: string) => Promise<NextResponse>,
  userId?: string
): Promise<NextResponse> {
  const effectiveUserId = extractUserId(request, userId);
  
  // Apply rate limiting
  const rateLimitResponse = await applyRateLimit(request, endpoint, effectiveUserId);
  
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  // Execute handler
  try {
    const response = await handler(request, effectiveUserId);
    
    // Add rate limit headers to successful response
    return addRateLimitHeaders(response, endpoint, effectiveUserId);
  } catch (error) {
    // If handler throws RateLimitError, convert to proper response
    if (error instanceof RateLimitError) {
      const requestId = generateRequestId();
      const config = RATE_LIMITS[endpoint];
      
      const errorResponse: RateLimitErrorResponse = {
        error: {
          code: error.code,
          message: error.message,
          retryAfter: error.retryAfter,
          limit: config.requests,
          remaining: 0,
          resetAt: new Date(Date.now() + config.window * 1000).toISOString(),
          timestamp: new Date().toISOString(),
          requestId,
        },
      };

      const response = NextResponse.json(errorResponse, { status: 429 });
      
      if (error.retryAfter) {
        response.headers.set('Retry-After', error.retryAfter.toString());
      }
      
      return response;
    }

    // Re-throw other errors
    throw error;
  }
}

/**
 * Check if request should bypass rate limiting
 * Can be used for admin users or internal services
 */
export function shouldBypassRateLimit(request: NextRequest): boolean {
  // Check for bypass header (for internal services)
  const bypassHeader = request.headers.get('x-rate-limit-bypass');
  const bypassSecret = process.env.RATE_LIMIT_BYPASS_SECRET;
  
  if (bypassHeader && bypassSecret && bypassHeader === bypassSecret) {
    return true;
  }

  return false;
}

export default applyRateLimit;
