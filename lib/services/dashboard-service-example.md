# DashboardService Usage Examples

## Overview

The `DashboardService` provides a cache-first strategy for fetching student dashboard metrics, class statistics, and rankings. It implements intelligent cache invalidation and background refresh for stale data.

## Basic Usage

### 1. Get Student Metrics

```typescript
import { getDashboardService } from '@/lib/services/dashboard-service';

const dashboardService = getDashboardService();

// Get student metrics (cache-first)
const metrics = await dashboardService.getStudentMetrics('student-id-123');

console.log(metrics);
// {
//   totalClasses: 100,
//   attendanceRate: 85.5,
//   presentDays: 85,
//   absentDays: 10,
//   sickDays: 3,
//   leaveDays: 2,
//   classAverage: 82.0,
//   ranking: 5,
//   trend: 'improving',
//   lastUpdated: Date
// }
```

### 2. Get Class Statistics

```typescript
// Get class statistics (uses materialized views)
const classStats = await dashboardService.getClassStatistics('CS-101');

console.log(classStats);
// {
//   classId: 'CS-101',
//   className: 'Computer Science 101',
//   totalStudents: 30,
//   averageAttendance: 82.5,
//   medianAttendance: 85.0,
//   highestAttendance: 98.5,
//   lowestAttendance: 65.0,
//   studentsAtRisk: 3,
//   lastCalculated: Date
// }
```

### 3. Get Student Ranking

```typescript
// Get student ranking within class
const ranking = await dashboardService.getStudentRanking('student-id-123', 'CS-101');

console.log(ranking);
// {
//   studentId: 'student-id-123',
//   rank: 5,
//   totalStudents: 30,
//   percentile: 83.33,
//   attendanceRate: 85.5
// }
```

## Cache Invalidation

### When Attendance is Updated

```typescript
// After updating a single student's attendance
await dashboardService.invalidateAttendanceUpdate('student-id-123', 'CS-101');

// This will invalidate:
// - Student metrics cache
// - Student attendance history
// - Weekly attendance data
// - Class average
// - Class statistics
// - All student rankings in the class
```

### Bulk Attendance Updates

```typescript
// After marking attendance for entire class
const studentIds = ['student-1', 'student-2', 'student-3'];
await dashboardService.invalidateBulkAttendanceUpdate(studentIds, 'CS-101');
```

### Manual Cache Invalidation

```typescript
// Invalidate only student cache
await dashboardService.invalidateStudentCache('student-id-123');

// Invalidate only class cache
await dashboardService.invalidateClassCache('CS-101');
```

## Background Refresh

The service automatically triggers background refresh when cached data is stale (TTL < 60 seconds):

```typescript
// First request with stale cache (TTL = 30s)
const metrics1 = await dashboardService.getStudentMetrics('student-id-123');
// Returns stale data immediately
// Triggers background refresh asynchronously

// Second request (after background refresh completes)
const metrics2 = await dashboardService.getStudentMetrics('student-id-123');
// Returns fresh data from cache
```

## Force Refresh

```typescript
// Force refresh student metrics (bypass cache)
const freshMetrics = await dashboardService.forceRefreshStudentMetrics('student-id-123');

// Force refresh class statistics (bypass cache)
const freshStats = await dashboardService.forceRefreshClassStatistics('CS-101');
```

## Check Cache Staleness

```typescript
// Check if cache is stale
const cacheKey = 'metrics:student:student-id-123';
const status = await dashboardService.isCacheStale(cacheKey);

console.log(status);
// {
//   isStale: true,
//   ttl: 30,
//   exists: true
// }
```

## Cache Warming

```typescript
// Warm cache for frequently accessed students
const activeStudentIds = ['student-1', 'student-2', 'student-3'];
await dashboardService.warmCache(activeStudentIds);

// This will:
// - Check TTL for each student's cache
// - Refresh cache if TTL < 60 seconds
// - Process in batches of 10 to avoid overwhelming database
```

## API Endpoint Integration

### Example: Dashboard API Route

```typescript
// app/api/students/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDashboardService } from '@/lib/services/dashboard-service';

export async function GET(request: NextRequest) {
  try {
    const studentId = request.nextUrl.searchParams.get('studentId');
    
    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    const dashboardService = getDashboardService();
    const metrics = await dashboardService.getStudentMetrics(studentId);

    return NextResponse.json({
      success: true,
      data: metrics,
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

### Example: Attendance Update with Cache Invalidation

```typescript
// app/api/attendance/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDashboardService } from '@/lib/services/dashboard-service';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, classId, date, status } = body;

    // Update attendance in database
    const { error } = await supabase
      .from('attendance_records')
      .insert({
        student_id: studentId,
        class_id: classId,
        date,
        status,
        marked_at: new Date().toISOString(),
      });

    if (error) {
      throw error;
    }

    // Invalidate related caches
    const dashboardService = getDashboardService();
    await dashboardService.invalidateAttendanceUpdate(studentId, classId);

    return NextResponse.json({
      success: true,
      message: 'Attendance updated and cache invalidated',
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

## Performance Considerations

### Cache TTL Values

The service uses the following TTL values (from `CACHE_TTL` config):

- Student Metrics: 120 seconds (2 minutes)
- Class Statistics: 300 seconds (5 minutes)
- Student Ranking: 300 seconds (5 minutes)

### Background Refresh Threshold

- Stale threshold: 60 seconds
- When TTL < 60s, stale data is served immediately and fresh data is fetched in background

### Batch Processing

- Cache warming processes students in batches of 10
- Prevents overwhelming the database with concurrent queries

## Error Handling

The service handles errors gracefully:

```typescript
try {
  const metrics = await dashboardService.getStudentMetrics('student-id-123');
} catch (error) {
  // Handle error
  console.error('Failed to fetch metrics:', error);
  
  // Fallback to default values or show error to user
}
```

## Testing

See `lib/services/__tests__/dashboard-service.test.ts` for comprehensive unit tests covering:

- Cache hit/miss scenarios
- Background refresh behavior
- Cache invalidation
- Staleness detection
- Error handling

## Next Steps

1. Integrate with API routes (Task 14)
2. Add rate limiting middleware (Task 4)
3. Implement SSE for real-time updates (Task 6)
4. Set up background jobs for cache warming (Task 13)
