# Background Jobs Usage Guide

This document explains how to use the background jobs system for monitoring student attendance thresholds and sending automated notifications.

## Overview

The background jobs system consists of several components:

1. **NotificationThresholdMonitor** - Monitors student attendance rates and sends notifications
2. **BackgroundJobsService** - Manages all background jobs and their lifecycle
3. **API Endpoints** - Provides management interface for jobs

## Features

### Notification Threshold Monitoring

- **Hourly monitoring** of all active students
- **Three threshold types**:
  - Warning (80%): General attendance warning
  - Mahroom (75%): Urgent alert for risk of being barred from exams
  - Tasdiq (85%): Medical certification requirement for sick/leave hours
- **Retry logic** with exponential backoff (3 attempts max)
- **Batch processing** for performance optimization

### Background Jobs

- **Cache refresh** (every 5 minutes)
- **Materialized view refresh** (every 10 minutes)
- **Audit log archival** (daily at 2 AM UTC)
- **Health monitoring** and error recovery

## Usage

### Starting the Background Jobs System

The system auto-initializes when imported in a server environment:

```typescript
import { getBackgroundJobsService } from '@/lib/services/background-jobs';

// The service will auto-initialize
const service = getBackgroundJobsService();
```

### Manual Control

```typescript
import { getBackgroundJobsService } from '@/lib/services/background-jobs';
import { getNotificationThresholdMonitor } from '@/lib/services/notification-threshold-monitor';

const backgroundJobs = getBackgroundJobsService();
const thresholdMonitor = getNotificationThresholdMonitor();

// Initialize the service
await backgroundJobs.initialize();

// Get status
const status = backgroundJobs.getStatus();
console.log(`Running ${status.runningJobs} jobs`);

// Manual threshold check
const result = await thresholdMonitor.runManualCheck();
console.log(`Checked ${result.totalStudentsChecked} students`);

// Control individual jobs
backgroundJobs.stopJob('notification-threshold-monitor');
backgroundJobs.startJob('notification-threshold-monitor');

// Trigger manual execution
await backgroundJobs.triggerJob('cache-refresh');
```

### API Management

Use the admin API endpoints to manage jobs:

```bash
# Get status of all background jobs
GET /api/admin/background-jobs

# Trigger manual threshold check
POST /api/admin/background-jobs
{
  "action": "runThresholdCheck"
}

# Stop a specific job
POST /api/admin/background-jobs
{
  "action": "stop",
  "jobName": "notification-threshold-monitor"
}

# Start all jobs
POST /api/admin/background-jobs
{
  "action": "startAll"
}

# Clear retry queue
POST /api/admin/background-jobs
{
  "action": "clearRetryQueue"
}
```

## Configuration

### Notification Thresholds

Defined in `student-notification-service.ts`:

```typescript
export const NOTIFICATION_THRESHOLDS = {
  WARNING: 80,      // Send warning below 80%
  MAHROOM: 75,      // Urgent alert at 75%
  TASDIQ: 85,       // Certification required at 85% (for sick+leave hours)
}
```

### Cron Schedules

- **Threshold monitoring**: `0 * * * *` (hourly)
- **Cache refresh**: `*/5 * * * *` (every 5 minutes)
- **Materialized view refresh**: `*/10 * * * *` (every 10 minutes)
- **Audit log archival**: `0 2 * * *` (daily at 2 AM UTC)
- **Retry processing**: `*/15 * * * *` (every 15 minutes)

### Retry Logic

Failed notifications are retried with exponential backoff:

- **Attempt 1**: Immediate
- **Attempt 2**: 15 minutes later
- **Attempt 3**: 30 minutes later
- **Attempt 4**: 60 minutes later (final attempt)

## Monitoring

### Job Status

```typescript
const status = backgroundJobs.getStatus();

console.log({
  totalJobs: status.totalJobs,
  runningJobs: status.runningJobs,
  errorJobs: status.errorJobs,
  systemHealth: status.systemHealth // 'healthy' | 'degraded' | 'critical'
});
```

### Retry Queue Status

```typescript
const retryStatus = thresholdMonitor.getRetryQueueStatus();

console.log({
  totalPending: retryStatus.totalPending,
  byType: retryStatus.byType, // { warning: 2, mahroom: 1 }
  byAttempts: retryStatus.byAttempts // { 1: 2, 2: 1 }
});
```

### Individual Job Status

```typescript
const jobStatus = backgroundJobs.getJobStatus('notification-threshold-monitor');

console.log({
  name: jobStatus.name,
  schedule: jobStatus.schedule,
  enabled: jobStatus.enabled,
  status: jobStatus.status, // 'running' | 'stopped' | 'error'
  lastRun: jobStatus.lastRun,
  errorMessage: jobStatus.errorMessage
});
```

## Error Handling

The system includes comprehensive error handling:

### Job-Level Errors

- Jobs continue running even if individual executions fail
- Errors are logged and tracked in job status
- Failed jobs can be restarted manually

### Notification Retry Logic

- Failed notifications are automatically retried
- Exponential backoff prevents overwhelming the system
- Maximum 3 retry attempts before giving up

### System Health Monitoring

- **Healthy**: All jobs running normally
- **Degraded**: Some jobs have errors but system is functional
- **Critical**: Majority of jobs are failing

## Performance Considerations

### Batch Processing

- Students are processed in batches of 10 to avoid overwhelming the database
- Small delays between batches prevent resource contention

### Caching Integration

- Uses dashboard service cache for attendance calculations
- Cache warming jobs keep frequently accessed data fresh
- Intelligent cache invalidation on attendance updates

### Database Optimization

- Uses materialized views for class statistics
- Efficient queries with proper indexing
- Connection pooling for concurrent operations

## Troubleshooting

### Common Issues

1. **Jobs not starting**: Check if service is initialized
2. **High retry queue**: Check notification service configuration
3. **Performance issues**: Monitor batch sizes and database connections
4. **Cache misses**: Verify Redis connection and cache warming

### Debug Commands

```typescript
// Check if service is initialized
console.log(backgroundJobs.isServiceInitialized());

// Get detailed job status
const jobStatus = backgroundJobs.getJobStatus('notification-threshold-monitor');
console.log(jobStatus);

// Check retry queue
const retryStatus = thresholdMonitor.getRetryQueueStatus();
console.log(retryStatus);

// Manual execution for testing
const result = await thresholdMonitor.runManualCheck();
console.log(result);
```

### Logs to Monitor

- Job execution logs (start/completion/errors)
- Notification delivery logs
- Retry queue operations
- Cache operations
- Database query performance

## Testing

Run the integration tests to verify functionality:

```bash
npm test -- --run lib/services/__tests__/background-jobs-integration.test.ts
```

The tests verify:
- Service instantiation
- Status reporting
- Basic operations
- Error handling
- Configuration validation

## Requirements Fulfilled

This implementation satisfies the following requirements:

- **8.1**: Warning notifications below 80% attendance within 24 hours
- **8.2**: Urgent mahroom notifications at 75% attendance immediately
- **8.3**: Tasdiq certification notifications at 85% sick/leave hours
- **8.4**: Retry logic for failed deliveries (3 attempts with exponential backoff)

The system provides a robust, scalable solution for automated attendance monitoring and notification delivery.