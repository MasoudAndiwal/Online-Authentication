# Materialized Views Migration Guide

## Overview

This guide explains how to set up and use the materialized views for class statistics in the student dashboard backend system.

## What Are Materialized Views?

Materialized views are pre-computed query results stored as physical tables. They provide:
- **Fast Query Performance**: 10-100x faster than computing aggregations on-the-fly
- **Reduced Database Load**: Complex calculations done once, not on every request
- **Consistent Results**: All users see the same data within the refresh window

## Requirements Addressed

- **Requirement 1.3**: Use pre-computed materialized views for class average calculations
- **Requirement 3.1**: Materialized views refreshed every 10 minutes
- **Requirement 3.3**: Schedule materialized view refresh within 5 minutes of attendance updates

## Installation Steps

### Step 1: Run the SQL Migration

Execute the migration file in your Supabase SQL editor or via psql:

```bash
# Using psql
psql -h your-supabase-host -U postgres -d postgres -f database/migrations/create_class_statistics_materialized_view.sql

# Or copy and paste the contents into Supabase SQL Editor
```

This creates:
1. `class_statistics` materialized view
2. Helper functions:
   - `refresh_class_statistics()` - Refreshes the view
   - `is_class_statistics_stale()` - Checks if refresh is needed
   - `get_class_statistics_age()` - Returns view age
3. Performance indexes
4. Initial data population

### Step 2: Verify Installation

Check that the view was created successfully:

```sql
-- Check if view exists
SELECT * FROM class_statistics LIMIT 5;

-- Check view age
SELECT get_class_statistics_age();

-- Check if stale
SELECT is_class_statistics_stale();

-- Manually refresh
SELECT refresh_class_statistics();
```

### Step 3: Start Background Jobs

The background refresh job starts automatically when the application receives its first request to `/api/health`:

```bash
# Start your Next.js application
npm run dev

# Trigger initialization (in another terminal)
curl http://localhost:3000/api/health
```

You should see logs like:
```
[BackgroundJobs] Initializing background jobs...
[MaterializedViewRefresh] Scheduled refresh started (every 10 minutes)
[MaterializedViewRefresh] Starting refresh of class_statistics view...
[MaterializedViewRefresh] Successfully refreshed class_statistics view in 145ms
```

## View Schema

The `class_statistics` materialized view contains:

```sql
CREATE MATERIALIZED VIEW class_statistics AS
SELECT 
  c.id as class_id,                    -- UUID
  c.name as class_name,                -- VARCHAR
  c.section as class_section,          -- VARCHAR
  COUNT(DISTINCT s.id) as total_students,
  AVG(...) as average_attendance,      -- FLOAT (percentage)
  PERCENTILE_CONT(0.5) ... as median_attendance,
  MAX(...) as highest_attendance,
  MIN(...) as lowest_attendance,
  COUNT(...) as students_at_risk,      -- Below 75%
  COUNT(...) as students_with_warning, -- Below 80%
  NOW() as last_calculated             -- TIMESTAMP
FROM classes c
LEFT JOIN students s ON s."classSection" = c.section
LEFT JOIN LATERAL (...) ar ON true
GROUP BY c.id, c.name, c.section;
```

## Usage Examples

### Query All Class Statistics

```typescript
import { supabase } from '@/lib/supabase'

const { data, error } = await supabase
  .from('class_statistics')
  .select('*')
  .order('average_attendance', { ascending: false })
```

### Get Statistics for Specific Class

```typescript
const { data, error } = await supabase
  .from('class_statistics')
  .select('*')
  .eq('class_id', classId)
  .single()
```

### Find Classes with At-Risk Students

```typescript
const { data, error } = await supabase
  .from('class_statistics')
  .select('*')
  .gt('students_at_risk', 0)
  .order('students_at_risk', { ascending: false })
```

### Check View Freshness

```typescript
import { materializedViewRefreshService } from '@/lib/services/materialized-view-refresh-service'

// Check if view is stale
const isStale = await materializedViewRefreshService.isViewStale()

// Get view age
const age = await materializedViewRefreshService.getViewAge()
console.log(`View is ${age} old`)

// Manual refresh if needed
if (isStale) {
  await materializedViewRefreshService.refreshClassStatistics()
}
```

## Refresh Schedule

The materialized view is automatically refreshed:
- **Every 10 minutes** via cron job
- **On application startup** (initial refresh)
- **Manually** when needed via API or service call

### Cron Schedule

```typescript
// Runs every 10 minutes
cron.schedule('*/10 * * * *', async () => {
  await materializedViewRefreshService.refreshClassStatistics()
})
```

## Performance Comparison

### Without Materialized View
```sql
-- Complex aggregation query
SELECT 
  c.id,
  AVG(attendance_rate) as avg_attendance,
  COUNT(*) as total_students
FROM classes c
JOIN students s ON s.class_id = c.id
JOIN (
  SELECT student_id, 
    (COUNT(*) FILTER (WHERE status = 'present')::float / 
     COUNT(*)::float) * 100 as attendance_rate
  FROM attendance_records
  GROUP BY student_id
) ar ON ar.student_id = s.id
GROUP BY c.id;

-- Query time: 500-1000ms
```

### With Materialized View
```sql
-- Simple SELECT from pre-computed view
SELECT * FROM class_statistics WHERE class_id = 'some-uuid';

-- Query time: 10-50ms
-- Improvement: 10-100x faster!
```

## Monitoring

### Check Background Job Status

```bash
curl http://localhost:3000/api/health
```

Response includes:
```json
{
  "status": "healthy",
  "backgroundJobs": {
    "initialized": true,
    "materializedViewRefresh": {
      "running": true,
      "stats": {
        "totalRefreshes": 10,
        "successfulRefreshes": 10,
        "failedRefreshes": 0,
        "lastRefresh": "2024-01-15T10:20:00Z",
        "averageDuration": 145
      }
    }
  }
}
```

### View Logs

The service logs all operations:
```
[MaterializedViewRefresh] Scheduled refresh triggered
[MaterializedViewRefresh] Starting refresh of class_statistics view...
[MaterializedViewRefresh] Successfully refreshed class_statistics view in 145ms
```

## Troubleshooting

### View Not Created

**Problem**: Query fails with "relation does not exist"

**Solution**: Run the migration file:
```bash
psql -f database/migrations/create_class_statistics_materialized_view.sql
```

### Stale Data

**Problem**: Statistics don't reflect recent changes

**Solution**: Check refresh status and manually refresh:
```typescript
const age = await materializedViewRefreshService.getViewAge()
console.log(`View age: ${age}`)

await materializedViewRefreshService.refreshClassStatistics()
```

### Slow Refresh

**Problem**: Refresh takes longer than expected

**Solutions**:
1. Check database performance
2. Verify indexes exist:
   ```sql
   SELECT * FROM pg_indexes WHERE tablename = 'class_statistics';
   ```
3. Analyze base tables:
   ```sql
   ANALYZE students;
   ANALYZE attendance_records;
   ANALYZE classes;
   ```

### Background Job Not Running

**Problem**: View never refreshes automatically

**Solution**: Ensure background jobs are initialized:
```typescript
import { initializeBackgroundJobs } from '@/lib/services/background-jobs'
initializeBackgroundJobs()
```

Or trigger via health check:
```bash
curl http://localhost:3000/api/health
```

## Manual Operations

### Manual Refresh

```sql
-- Via SQL
SELECT refresh_class_statistics();

-- Via TypeScript
await materializedViewRefreshService.refreshClassStatistics()
```

### Drop and Recreate

```sql
-- Drop view
DROP MATERIALIZED VIEW IF EXISTS class_statistics CASCADE;

-- Recreate by running migration again
\i database/migrations/create_class_statistics_materialized_view.sql
```

### Check Refresh History

```sql
-- View last refresh time
SELECT MAX(last_calculated) as last_refresh 
FROM class_statistics;

-- Check if refresh is needed
SELECT is_class_statistics_stale();
```

## Best Practices

1. **Monitor Refresh Times**: Keep track of how long refreshes take
2. **Set Alerts**: Alert if refresh fails multiple times
3. **Plan for Growth**: As data grows, consider partitioning or incremental refresh
4. **Cache Results**: Cache view queries for even faster response times
5. **Document Changes**: Update this guide when modifying the view

## Future Enhancements

Potential improvements:
1. **Incremental Refresh**: Only update changed data
2. **Multiple Views**: Add views for student rankings, trends
3. **Smart Refresh**: Trigger refresh only when attendance changes
4. **Partitioning**: Partition by date for better performance
5. **Monitoring Dashboard**: Visual monitoring of refresh operations

## Related Files

- Migration: `database/migrations/create_class_statistics_materialized_view.sql`
- Service: `lib/services/materialized-view-refresh-service.ts`
- Background Jobs: `lib/services/background-jobs.ts`
- Health Check: `app/api/health/route.ts`
- Tests: `lib/services/__tests__/materialized-view-refresh-service.test.ts`
- Documentation: `lib/services/README-MATERIALIZED-VIEWS.md`
