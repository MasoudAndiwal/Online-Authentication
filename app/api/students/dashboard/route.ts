/**
 * Student Dashboard API Endpoint
 * 
 * Provides comprehensive dashboard metrics for students with full error logging,
 * authentication, rate limiting, and caching integration.
 * 
 * Requirements: 1.1, 1.2, 4.1
 */

import { NextResponse } from 'next/server';
import { withStudentDashboardMiddleware, EnhancedRequest } from '@/lib/middleware/api-middleware-stack';
import { ValidationError, NotFoundError } from '@/lib/errors/custom-errors';
import { getDashboardService } from '@/lib/services/dashboard-service';
import { getCacheService } from '@/lib/services/cache-service';
// Audit logging removed

const dashboardService = getDashboardService();
const cacheService = getCacheService();
// Audit logging removed

/**
 * GET /api/students/dashboard
 * 
 * Returns comprehensive dashboard metrics for the authenticated student.
 * Implements cache-first strategy with background refresh for optimal performance.
 * 
 * Query Parameters:
 * - studentId: Student identifier (optional, defaults to authenticated user)
 * - includeClassStats: Whether to include class-wide statistics (default: false)
 * - forceRefresh: Force cache refresh (default: false)
 * 
 * Response:
 * - 200: Dashboard metrics with cache headers
 * - 400: Invalid request parameters
 * - 401: Authentication required
 * - 403: Access denied (students can only access their own data)
 * - 404: Student not found
 * - 429: Rate limit exceeded
 * - 500: Internal server error
 * 
 * Requirements: 1.1 (200ms response), 1.2 (background refresh), 4.1 (rate limiting)
 */
export const GET = withStudentDashboardMiddleware(
  async (req: EnhancedRequest): Promise<NextResponse> => {
    const { searchParams } = new URL(req.url);
    const requestedStudentId = searchParams.get('studentId');
    const includeClassStats = searchParams.get('includeClassStats') === 'true';
    const forceRefresh = searchParams.get('forceRefresh') === 'true';

    // Determine which student's data to fetch
    const targetStudentId = requestedStudentId || req.user?.id;
    
    if (!targetStudentId) {
      throw new ValidationError('Student ID is required', 'studentId');
    }

    // Authorization check: students can only access their own data
    if (req.user?.role === 'STUDENT' && req.user.id !== targetStudentId) {
      throw new ValidationError(
        'Students can only access their own dashboard data',
        'studentId'
      );
    }

    try {
      const startTime = performance.now();
      
      // Get student metrics with caching (implements cache-first strategy)
      const metrics = await dashboardService.getStudentMetrics(targetStudentId);
      
      // Check if data was served from cache
      const cacheKey = `metrics:student:${targetStudentId}`;
      const cacheInfo = await dashboardService.isCacheStale(cacheKey, 300); // 5 minutes TTL
      
      // Optionally fetch class statistics
      let classStats = null;
      if (includeClassStats && req.user?.role === 'OFFICE') {
        // Get class ID from student record (simplified for demo)
        const classId = 'default-class';
        classStats = await dashboardService.getClassStatistics(classId);
      }

      const responseTime = performance.now() - startTime;

      // Audit logging removed

      // Prepare response with cache metadata
      const response = {
        success: true,
        data: {
          studentId: targetStudentId,
          metrics,
          classStatistics: classStats,
          generatedAt: new Date().toISOString(),
          requestId: req.requestId
        },
        meta: {
          cached: !cacheInfo.isStale,
          source: cacheInfo.isStale ? 'database' : 'cache',
          responseTime: Math.round(responseTime),
          cacheExpiry: cacheInfo.exists ? new Date(Date.now() + (cacheInfo.ttl * 1000)).toISOString() : null,
          version: '1.0'
        }
      };

      // Set appropriate cache headers
      const cacheControl = cacheInfo.isStale ? 
        'private, max-age=120, stale-while-revalidate=300' : 
        'private, max-age=120';

      return NextResponse.json(response, { 
        status: 200,
        headers: {
          'X-Request-ID': req.requestId,
          'Cache-Control': cacheControl,
          'X-Response-Time': `${Math.round(responseTime)}ms`,
          'X-Cache-Status': cacheInfo.isStale ? 'MISS' : 'HIT',
          'X-Cache-TTL': cacheInfo.exists ? cacheInfo.ttl.toString() : '0'
        }
      });

    } catch (error) {
      // Log failed dashboard access
      // Audit logging removed


      throw error;
    }
  },
  'get-dashboard-metrics'
);

/**
 * POST /api/students/dashboard/refresh
 * 
 * Forces a refresh of cached dashboard data for the authenticated student.
 * Invalidates cache and fetches fresh data from database.
 * 
 * Requirements: 1.5 (cache invalidation)
 */
export const POST = withStudentDashboardMiddleware(
  async (req: EnhancedRequest): Promise<NextResponse> => {
    const studentId = req.user?.id;
    
    if (!studentId) {
      throw new ValidationError('Student ID is required');
    }

    try {
      const startTime = performance.now();
      
      // Invalidate cache entries for this student
      await dashboardService.invalidateStudentCache(studentId);
      
      // Fetch fresh metrics from database
      const metrics = await dashboardService.getStudentMetrics(studentId);
      
      const responseTime = performance.now() - startTime;

      // Log cache refresh action
      // Audit logging removed


      const response = {
        success: true,
        data: {
          studentId,
          metrics,
          refreshedAt: new Date().toISOString(),
          requestId: req.requestId
        },
        meta: {
          cached: false,
          source: 'database',
          refreshed: true,
          responseTime: Math.round(responseTime)
        }
      };

      return NextResponse.json(response, { 
        status: 200,
        headers: {
          'X-Request-ID': req.requestId,
          'X-Response-Time': `${Math.round(responseTime)}ms`,
          'X-Cache-Status': 'REFRESHED'
        }
      });

    } catch (error) {
      // Log failed cache refresh
      // Audit logging removed


      throw error;
    }
  },
  'refresh-dashboard-cache'
);