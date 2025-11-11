import { NextRequest, NextResponse } from 'next/server';
import { periodAssignmentService } from '@/lib/services/period-assignment-service';

/**
 * GET /api/teachers/schedule/cache
 * 
 * Get cache statistics and status
 */
export async function GET() {
  try {
    const stats = periodAssignmentService.getCacheStats();
    
    return NextResponse.json({
      success: true,
      data: {
        cache: stats,
        status: 'active',
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('[Cache API] Error getting cache stats:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: 'Failed to retrieve cache statistics'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/teachers/schedule/cache
 * 
 * Cache management operations
 * 
 * Request Body:
 * {
 *   action: 'clear' | 'cleanup' | 'invalidate' | 'warmup' | 'preload' | 'reset-stats',
 *   classId?: string,     // For invalidate action
 *   teacherId?: string,   // For invalidate action
 *   dayOfWeek?: string,   // For invalidate action
 *   teacherIds?: string[], // For preload action
 *   classIds?: string[],   // For preload action
 *   days?: string[]        // For preload action
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, classId, teacherId, dayOfWeek, teacherIds, classIds, days } = body;

    console.log('[Cache API] Cache management request:', { action, classId, teacherId, dayOfWeek });

    if (!action) {
      return NextResponse.json(
        { 
          error: 'Missing required parameter: action',
          details: 'Action must be one of: clear, cleanup, invalidate, warmup, preload, reset-stats'
        },
        { status: 400 }
      );
    }

    let result: Record<string, unknown> = {};

    switch (action) {
      case 'clear':
        periodAssignmentService.clearCache();
        result = { message: 'Cache cleared successfully', clearedAll: true };
        break;

      case 'cleanup':
        const cleanedCount = periodAssignmentService.cleanupExpiredEntries();
        result = { message: 'Expired entries cleaned up', cleanedCount };
        break;

      case 'invalidate':
        const invalidatedCount = periodAssignmentService.invalidateScheduleCache(
          classId,
          teacherId,
          dayOfWeek
        );
        result = { 
          message: 'Cache invalidated', 
          invalidatedCount,
          filters: { classId, teacherId, dayOfWeek }
        };
        break;

      case 'warmup':
        const warmupResult = await periodAssignmentService.warmupCache();
        result = { 
          message: 'Cache warmup completed', 
          ...warmupResult 
        };
        break;

      case 'preload':
        if (!teacherIds || !classIds || !days) {
          return NextResponse.json(
            { 
              error: 'Missing required parameters for preload',
              details: 'teacherIds, classIds, and days arrays are required for preload action'
            },
            { status: 400 }
          );
        }
        
        const preloadedCount = await periodAssignmentService.preloadCache(
          teacherIds,
          classIds,
          days
        );
        result = { 
          message: 'Cache preloaded', 
          preloadedCount,
          parameters: { teacherIds: teacherIds.length, classIds: classIds.length, days: days.length }
        };
        break;

      case 'reset-stats':
        periodAssignmentService.resetCacheStats();
        result = { message: 'Cache statistics reset' };
        break;

      default:
        return NextResponse.json(
          { 
            error: 'Invalid action',
            details: 'Action must be one of: clear, cleanup, invalidate, warmup, preload, reset-stats'
          },
          { status: 400 }
        );
    }

    // Get updated stats
    const updatedStats = periodAssignmentService.getCacheStats();

    return NextResponse.json({
      success: true,
      data: {
        action,
        result,
        updatedStats,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('[Cache API] Cache management error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: 'Cache management operation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/teachers/schedule/cache
 * 
 * Clear all cache entries
 */
export async function DELETE() {
  try {
    const statsBefore = periodAssignmentService.getCacheStats();
    periodAssignmentService.clearCache();
    
    return NextResponse.json({
      success: true,
      data: {
        message: 'All cache entries cleared',
        clearedCount: statsBefore.size,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('[Cache API] Error clearing cache:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: 'Failed to clear cache'
      },
      { status: 500 }
    );
  }
}