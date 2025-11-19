# Cache Service Integration Examples

## Integration with Existing Dashboard API

Here are examples of how to integrate the cache service with existing dashboard endpoints.

### Example 1: Student Dashboard Metrics API

```typescript
// app/api/students/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCacheService, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';
import { getStudentMetrics } from '@/lib/database/dashboard-operations';

export async function GET(request: NextRequest) {
  try {
    const studentId = request.nextUrl.searchParams.get('studentId');
    
    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    const cache = getCacheService();
    const cacheKey = CACHE_KEYS.STUDENT_METRICS(studentId);

    // Try to get from cache first
    let metrics = await cache.get(cacheKey);

    if (metrics) {
      // Cache hit - return cached data
      return NextResponse.json({
        data: metrics,
        cached: true,
        source: 'cache'
      });
    }

    // Cache miss - fetch from database
    metrics = await getStudentMetrics(studentId);

    // Store in cache for future requests
    await cache.set(cacheKey, metrics, CACHE_TTL.STUDENT_METRICS);

    return NextResponse.json({
      data: metrics,
      cached: false,
      source: 'database'
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Example 2: Attendance Update with Cache Invalidation

```typescript
// app/api/attendance/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCacheService, CACHE_INVALIDATION_GROUPS } from '@/lib/cache';
import { updateAttendance } from '@/lib/database/operations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, classId, date, status } = body;

    // Update attendance in database
    await updateAttendance({ studentId, classId, date, status });

    // Invalidate related cache entries
    const cache = getCacheService();
    const keysToInvalidate = CACHE_INVALIDATION_GROUPS.ATTENDANCE_UPDATE(
      studentId,
      classId
    );

    // Delete all related cache keys
    await Promise.all(
      keysToInvalidate.map(key => cache.delete(key))
    );

    return NextResponse.json({
      success: true,
      message: 'Attendance updated and cache invalidated'
    });
  } catch (error) {
    console.error('Attendance update error:', error);
    return NextResponse.json(
      { error: 'Failed to update attendance' },
      { status: 500 }
    );
  }
}
```

### Example 3: Class Statistics with Materialized Views

```typescript
// lib/services/dashboard-service.ts
import { getCacheService, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';
import { supabase } from '@/lib/supabase';

export class DashboardService {
  private cache = getCacheService();

  async getClassStatistics(classId: string) {
    const cacheKey = CACHE_KEYS.CLASS_STATISTICS(classId);

    // Check cache first
    let stats = await this.cache.get(cacheKey);

    if (stats) {
      return stats;
    }

    // Query materialized view (will be created in task 2)
    const { data, error } = await supabase
      .from('class_statistics')
      .select('*')
      .eq('class_id', classId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch class statistics: ${error.message}`);
    }

    // Cache the results
    await this.cache.set(cacheKey, data, CACHE_TTL.CLASS_STATISTICS);

    return data;
  }

  async invalidateStudentCache(studentId: string) {
    // Delete student-specific cache
    await this.cache.delete(CACHE_KEYS.STUDENT_METRICS(studentId));
    await this.cache.delete(CACHE_KEYS.ATTENDANCE_HISTORY(studentId));
    
    // Delete weekly attendance cache for all weeks
    const weekKeys = await this.cache.keys(
      `attendance:student:${studentId}:week:*`
    );
    
    await Promise.all(
      weekKeys.map(key => this.cache.delete(key))
    );
  }

  async invalidateClassCache(classId: string) {
    // Delete class-specific cache
    await this.cache.delete(CACHE_KEYS.CLASS_AVERAGE(classId));
    await this.cache.delete(CACHE_KEYS.CLASS_STATISTICS(classId));
    
    // Delete all student rankings in this class
    await this.cache.deletePattern(`metrics:class:${classId}:rank:*`);
  }
}
```

### Example 4: Rate Limiting Middleware

```typescript
// lib/middleware/rate-limit.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCacheService, CACHE_KEYS } from '@/lib/cache';

const RATE_LIMITS = {
  dashboard: { requests: 100, window: 60 }, // 100 requests per minute
  export: { requests: 5, window: 3600 },    // 5 requests per hour
};

export async function rateLimitMiddleware(
  request: NextRequest,
  endpoint: keyof typeof RATE_LIMITS
) {
  const userId = request.headers.get('x-user-id');
  
  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const cache = getCacheService();
  const limit = RATE_LIMITS[endpoint];
  const cacheKey = CACHE_KEYS.RATE_LIMIT(userId, endpoint);

  // Get current count
  const currentCount = await cache.get<number>(cacheKey) || 0;

  if (currentCount >= limit.requests) {
    // Rate limit exceeded
    const ttl = await cache.ttl(cacheKey);
    
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        retryAfter: ttl > 0 ? ttl : limit.window
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(ttl > 0 ? ttl : limit.window),
          'X-RateLimit-Limit': String(limit.requests),
          'X-RateLimit-Remaining': '0',
        }
      }
    );
  }

  // Increment counter
  const newCount = await cache.increment(cacheKey);
  
  // Set TTL on first request
  if (newCount === 1) {
    await cache.refreshTTL(cacheKey, limit.window);
  }

  // Add rate limit headers to response
  return {
    headers: {
      'X-RateLimit-Limit': String(limit.requests),
      'X-RateLimit-Remaining': String(limit.requests - newCount),
    }
  };
}
```

### Example 5: Background Cache Warming

```typescript
// lib/jobs/cache-warming.ts
import { getCacheService, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';
import { getStudentMetrics } from '@/lib/database/dashboard-operations';

/**
 * Warm cache for frequently accessed students
 * Run this as a background job every 5 minutes
 */
export async function warmFrequentlyAccessedCache() {
  const cache = getCacheService();
  
  // Get list of active students (implement based on your logic)
  const activeStudentIds = await getActiveStudentIds();
  
  console.log(`Warming cache for ${activeStudentIds.length} students`);
  
  // Warm cache in batches to avoid overwhelming the database
  const batchSize = 10;
  
  for (let i = 0; i < activeStudentIds.length; i += batchSize) {
    const batch = activeStudentIds.slice(i, i + batchSize);
    
    await Promise.all(
      batch.map(async (studentId) => {
        try {
          const cacheKey = CACHE_KEYS.STUDENT_METRICS(studentId);
          
          // Check if cache exists and is fresh
          const ttl = await cache.ttl(cacheKey);
          
          if (ttl < 60) {
            // Cache is stale or missing, refresh it
            const metrics = await getStudentMetrics(studentId);
            await cache.set(cacheKey, metrics, CACHE_TTL.STUDENT_METRICS);
            console.log(`Warmed cache for student ${studentId}`);
          }
        } catch (error) {
          console.error(`Failed to warm cache for student ${studentId}:`, error);
        }
      })
    );
  }
  
  console.log('Cache warming completed');
}

async function getActiveStudentIds(): Promise<string[]> {
  // Implement logic to get active students
  // For example, students who logged in within last 24 hours
  return [];
}
```

### Example 6: Cache Health Check Endpoint

```typescript
// app/api/health/cache/route.ts
import { NextResponse } from 'next/server';
import { getCacheService } from '@/lib/cache';

export async function GET() {
  const cache = getCacheService();
  
  try {
    // Check if Redis is responding
    const isConnected = await cache.ping();
    
    if (!isConnected) {
      return NextResponse.json(
        {
          status: 'unhealthy',
          message: 'Redis is not responding'
        },
        { status: 503 }
      );
    }
    
    // Get cache statistics
    const stats = await cache.getStats();
    
    return NextResponse.json({
      status: 'healthy',
      redis: {
        connected: true,
        usedMemory: stats.usedMemory,
        totalKeys: stats.totalKeys,
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    );
  }
}
```

## Testing Cache Integration

```typescript
// __tests__/integration/cache-integration.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getCacheService, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';

describe('Cache Integration', () => {
  let cache: ReturnType<typeof getCacheService>;

  beforeEach(() => {
    cache = getCacheService();
  });

  afterEach(async () => {
    // Clean up test data
    await cache.clear();
  });

  it('should cache and retrieve student metrics', async () => {
    const studentId = 'test-student-123';
    const metrics = {
      attendanceRate: 85,
      totalClasses: 100,
      presentDays: 85,
    };

    // Set cache
    await cache.set(
      CACHE_KEYS.STUDENT_METRICS(studentId),
      metrics,
      CACHE_TTL.STUDENT_METRICS
    );

    // Retrieve from cache
    const cached = await cache.get(CACHE_KEYS.STUDENT_METRICS(studentId));

    expect(cached).toEqual(metrics);
  });

  it('should invalidate related caches on attendance update', async () => {
    const studentId = 'test-student-123';
    const classId = 'test-class-456';

    // Pre-populate caches
    await cache.set(CACHE_KEYS.STUDENT_METRICS(studentId), {}, 300);
    await cache.set(CACHE_KEYS.CLASS_AVERAGE(classId), {}, 300);

    // Simulate attendance update invalidation
    await cache.delete(CACHE_KEYS.STUDENT_METRICS(studentId));
    await cache.delete(CACHE_KEYS.CLASS_AVERAGE(classId));

    // Verify caches are cleared
    const studentCache = await cache.get(CACHE_KEYS.STUDENT_METRICS(studentId));
    const classCache = await cache.get(CACHE_KEYS.CLASS_AVERAGE(classId));

    expect(studentCache).toBeNull();
    expect(classCache).toBeNull();
  });
});
```

## Next Steps

1. **Implement DashboardService** (Task 3): Create the service that uses this cache
2. **Add Rate Limiting** (Task 4): Implement rate limiting using the cache
3. **Create API Endpoints** (Task 14): Build endpoints that use the cache
4. **Monitor Cache Performance**: Track cache hit rates and adjust TTL values

## Notes

- Always handle cache failures gracefully - the application should work even if Redis is down
- Monitor cache hit rates to optimize TTL values
- Use cache invalidation groups to ensure consistency
- Consider implementing cache warming for frequently accessed data
