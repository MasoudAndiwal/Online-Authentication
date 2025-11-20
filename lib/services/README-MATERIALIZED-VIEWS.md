# Materialized View Refresh Service

This service manages the automatic refresh of database materialized views to ensure dashboard statistics remain up-to-date.

## Overview

The `MaterializedViewRefreshService` provides:
- Scheduled refresh of the `class_statistics` materialized view every 10 minutes
- Manual refresh capability
- Refresh statistics and monitoring
- Error handling and logging

## Requirements

- **1.3**: Use pre-computed materialized views for class average calculations
- **3.1**: Materialized views refreshed every 10 minutes
- **3.3**: Schedule materialized view refresh within 5 minutes of attendance updates

## Database Setup

Before using this service, you must run the SQL migration:

```bash
# Run the migration in your Supabase SQL editor or via CLI
psql -h your-db-host -U your-user -d your-db -f database/migrations/create_class_statistics_materialized_view.sql
```

This creates:
- `class_statistics` materialized view
- `refresh_class_statistics()` function
- `is_class_statistics_stale()` function
- `get_class_statistics_age()` function
- Necessary indexes for performance

## Usage

### Automatic Initialization

The service is automatically initialized when the application starts via the `/api/health` endpoint:

```typescript
// The first request to /api/health will initialize background jobs
fetch('/api/health')
```

### Manual Control

```typescript
import { materializedViewRefreshService } from '@/lib/services/materialized-view-refresh-service'

// Start scheduled refresh (every 10 minutes)
materializedViewRefreshService.startScheduledRefresh()

// Stop scheduled refresh
materializedViewRefreshService.stopScheduledRefresh()

// Manual refresh
const result = await materializedViewRefreshService.refreshClassStatistics()
console.log(result) // { success: true, timestamp: Date, duration: 123 }

// Check if view is stale
const isStale = await materializedViewRefreshService.isViewStale()

// Get view age
const age = await materializedViewRefreshService.getViewAge()

// Get refresh statistics
const stats = materializedViewRefreshService.getStats()
console.log(stats)
// {
//   totalRefreshes: 10,
//   successfulRefreshes: 10,
//   failedRefreshes: 0,
//   lastRefresh: Date,
//   lastError: null,
//   averageDuration: 145
// }
```

## Querying the Materialized View

Once the view is created and refreshed, you can query it directly:

```typescript
import { supabase } from '@/lib/supabase'

// Get statistics for all classes
const { data, error } = await supabase
  .from('class_statistics')
  .select('*')

// Get statistics for a specific class
const { data, error } = await supabase
  .from('class_statistics')
  .select('*')
  .eq('class_id', 'some-uuid')
  .single()

// Get classes with high risk students
const { data, error } = await supabase
  .from('class_statistics')
  .select('*')
  .gt('students_at_risk', 0)
  .order('students_at_risk', { ascending: false })
```

## Materialized View Schema

The `class_statistics` view contains:

| Column | Type | Description |
|--------|------|-------------|
| `class_id` | UUID | Unique identifier for the class |
| `class_name` | VARCHAR | Name of the class |
| `class_section` | VARCHAR | Section identifier |
| `total_students` | INTEGER | Total number of students in the class |
| `average_attendance` | FLOAT | Average attendance rate (percentage) |
| `median_attendance` | FLOAT | Median attendance rate (percentage) |
| `highest_attendance` | FLOAT | Highest attendance rate in the class |
| `lowest_attendance` | FLOAT | Lowest attendance rate in the class |
| `students_at_risk` | INTEGER | Students below 75% attendance (mahroom) |
| `students_with_warning` | INTEGER | Students below 80% attendance |
| `last_calculated` | TIMESTAMP | When the view was last refreshed |

## Performance Benefits

Using materialized views provides significant performance improvements:

- **Without materialized view**: Complex aggregation query takes 500-1000ms
- **With materialized view**: Simple SELECT query takes 10-50ms
- **Improvement**: 10-100x faster query times

## Monitoring

### Check Refresh Status

```typescript
// Check if scheduled refresh is running
const isRunning = materializedViewRefreshService.isRunning()

// Get detailed statistics
const stats = materializedViewRefreshService.getStats()
```

### Logs

The service logs all refresh operations:

```
[MaterializedViewRefresh] Starting refresh of class_statistics view...
[MaterializedViewRefresh] Successfully refreshed class_statistics view in 145ms
[MaterializedViewRefresh] Scheduled refresh triggered
```

### Health Check Endpoint

The `/api/health` endpoint includes background job status:

```bash
curl http://localhost:3000/api/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "backgroundJobs": {
    "initialized": true,
    "materializedViewRefresh": {
      "running": true,
      "stats": {
        "totalRefreshes": 10,
        "successfulRefreshes": 10,
        "failedRefreshes": 0,
        "lastRefresh": "2024-01-15T10:20:00Z",
        "lastError": null,
        "averageDuration": 145
      }
    }
  }
}
```

## Error Handling

The service handles errors gracefully:

1. **Database Connection Errors**: Logged and tracked in statistics
2. **Refresh Failures**: Recorded with error message
3. **Stale View Detection**: Assumes stale if check fails

Failed refreshes don't stop the scheduled job - it will retry on the next cycle.

## Testing

```typescript
import { MaterializedViewRefreshService } from '@/lib/services/materialized-view-refresh-service'

describe('MaterializedViewRefreshService', () => {
  let service: MaterializedViewRefreshService
  
  beforeEach(() => {
    service = MaterializedViewRefreshService.getInstance()
    service.resetStats()
  })
  
  it('should refresh the materialized view', async () => {
    const result = await service.refreshClassStatistics()
    expect(result.success).toBe(true)
    expect(result.duration).toBeGreaterThan(0)
  })
  
  it('should track refresh statistics', async () => {
    await service.refreshClassStatistics()
    const stats = service.getStats()
    expect(stats.totalRefreshes).toBe(1)
    expect(stats.successfulRefreshes).toBe(1)
  })
})
```

## Troubleshooting

### View Not Refreshing

1. Check if background jobs are initialized:
   ```typescript
   const status = getBackgroundJobsStatus()
   console.log(status)
   ```

2. Check database logs for errors

3. Manually trigger refresh:
   ```typescript
   await materializedViewRefreshService.refreshClassStatistics()
   ```

### Slow Refresh Times

If refresh takes longer than expected:

1. Check database performance
2. Review indexes on base tables
3. Consider reducing data volume or optimizing queries

### Stale Data

If data appears stale:

1. Check last refresh time:
   ```typescript
   const age = await materializedViewRefreshService.getViewAge()
   ```

2. Manually refresh if needed:
   ```typescript
   await materializedViewRefreshService.refreshClassStatistics()
   ```

## Future Enhancements

Potential improvements:

1. Add more materialized views (student rankings, attendance trends)
2. Implement smart refresh (only when data changes)
3. Add metrics export for monitoring systems
4. Implement refresh prioritization based on usage patterns
