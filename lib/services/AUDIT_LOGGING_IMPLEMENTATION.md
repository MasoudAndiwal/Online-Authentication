# Audit Logging System Implementation

## Overview

The audit logging system tracks critical system actions for compliance, security, and debugging purposes. It implements comprehensive logging of data exports, file uploads, and authentication attempts with automatic archival of old logs.

## Architecture

### Components

1. **AuditLoggerService** (`audit-logger-service.ts`)
   - Core service for logging audit entries
   - Query and filter audit logs
   - Manage log archival

2. **AuditLogArchivalService** (`audit-log-archival-service.ts`)
   - Automatic archival of logs older than 90 days
   - Threshold-based archival (1 million records)
   - Scheduled daily execution at 2 AM

3. **Audit Logging Middleware** (`audit-logging-middleware.ts`)
   - Helper functions for extracting IP addresses and user agents
   - Convenience functions for logging common actions

4. **Database Migration** (`database/migrations/create_audit_logs_table.sql`)
   - Partitioned table by month for performance
   - Indexes for common query patterns
   - Helper functions for partition management

## Database Schema

```sql
CREATE TABLE audit_logs (
    id UUID DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES students(id),
    action VARCHAR(50) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    resource_id VARCHAR(255),
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    success BOOLEAN NOT NULL DEFAULT true,
    error_message TEXT,
    PRIMARY KEY (id, timestamp)
) PARTITION BY RANGE (timestamp);
```

### Partitioning Strategy

- Monthly partitions for better performance
- Easier archival and maintenance
- Automatic partition creation function available

### Indexes

- `idx_audit_logs_user_id`: User-specific queries
- `idx_audit_logs_action`: Action-based filtering
- `idx_audit_logs_timestamp`: Time-based queries
- `idx_audit_logs_resource`: Resource lookups
- `idx_audit_logs_success`: Success/failure filtering

## Usage

### Basic Logging

```typescript
import { getAuditLoggerService } from '@/lib/services/audit-logger-service';

const auditLogger = getAuditLoggerService();

// Log a generic action
await auditLogger.log({
  userId: 'user-123',
  action: 'data_export',
  resource: 'attendance_data',
  metadata: { format: 'csv' },
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
  success: true,
});
```

### Logging Data Exports

```typescript
await auditLogger.logDataExport(
  userId,
  'csv',
  { start: new Date('2024-01-01'), end: new Date('2024-12-31') },
  ipAddress,
  userAgent
);
```

### Logging File Uploads

```typescript
await auditLogger.logFileUpload(
  userId,
  'certificate.pdf',
  1024000, // 1MB
  'application/pdf',
  ipAddress,
  userAgent,
  true // success
);
```

### Logging Authentication

```typescript
// Success
await auditLogger.logAuthenticationSuccess(
  userId,
  ipAddress,
  userAgent
);

// Failure
await auditLogger.logAuthenticationFailure(
  username,
  'Invalid credentials',
  ipAddress,
  userAgent
);
```

### Querying Audit Logs

```typescript
// Get logs for a specific user
const userLogs = await auditLogger.getUserLogs('user-123', 50);

// Query with filters
const logs = await auditLogger.query({
  userId: 'user-123',
  action: 'data_export',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-12-31'),
  success: true,
  limit: 100,
  offset: 0,
});
```

### Statistics

```typescript
const stats = await auditLogger.getStatistics();
console.log(stats);
// {
//   totalLogs: 15000,
//   successRate: 0.98,
//   topActions: [
//     { action: 'login_success', count: 5000 },
//     { action: 'data_export', count: 2000 },
//     ...
//   ]
// }
```

## Integration Examples

### API Routes

```typescript
import { getClientIp, getUserAgent } from '@/lib/middleware/audit-logging-middleware';
import { getAuditLoggerService } from '@/lib/services/audit-logger-service';

export async function GET(request: NextRequest) {
  const auditLogger = getAuditLoggerService();
  const userId = 'user-123'; // Extract from session
  
  try {
    // Perform export
    const data = await exportData();
    
    // Log successful export
    await auditLogger.logDataExport(
      userId,
      'json',
      { start: new Date(), end: new Date() },
      getClientIp(request),
      getUserAgent(request)
    );
    
    return NextResponse.json(data);
  } catch (error) {
    // Log failed export
    await auditLogger.log({
      userId,
      action: 'data_export',
      resource: 'data',
      success: false,
      errorMessage: error.message,
      ipAddress: getClientIp(request),
      userAgent: getUserAgent(request),
    });
    
    throw error;
  }
}
```

### Authentication Integration

The authentication functions in `lib/auth/authentication.ts` have been updated to automatically log all authentication attempts:

```typescript
// Authentication automatically logs success/failure
const result = await authenticateStudent(
  username,
  studentId,
  password,
  {
    ipAddress: getClientIp(request),
    userAgent: getUserAgent(request),
  }
);
```

### File Upload Integration

The file upload service in `lib/services/file-upload-service.ts` automatically logs all upload attempts:

```typescript
// File uploads automatically log success/failure
const result = await uploadMedicalCertificate(
  studentId,
  file,
  ipAddress,
  userAgent
);
```

## Automatic Archival

### Configuration

- **Age Threshold**: 90 days
- **Count Threshold**: 1 million records
- **Schedule**: Daily at 2 AM

### Manual Archival

```typescript
import { auditLogArchivalService } from '@/lib/services/audit-log-archival-service';

// Trigger manual archival
const result = await auditLogArchivalService.triggerArchival();
console.log(`Archived ${result.archivedCount} records`);

// Check if archival is needed
const status = await auditLogArchivalService.checkArchivalNeeded();
if (status.needed) {
  console.log(`Archival needed: ${status.totalRecords} records`);
}

// Get archival statistics
const stats = auditLogArchivalService.getStats();
console.log(stats);
// {
//   isRunning: true,
//   lastArchivalDate: Date,
//   totalArchived: 50000,
//   archivalCount: 5
// }
```

## Background Jobs

The audit log archival is integrated into the background jobs system:

```typescript
import { initializeBackgroundJobs, getBackgroundJobsStatus } from '@/lib/services/background-jobs';

// Initialize all background jobs (including audit archival)
initializeBackgroundJobs();

// Check status
const status = getBackgroundJobsStatus();
console.log(status.auditLogArchival);
// {
//   running: true,
//   stats: { ... }
// }
```

## Action Types

The following action types are supported:

- `data_export`: Data export operations
- `file_upload`: File upload operations
- `file_download`: File download operations
- `login_success`: Successful authentication
- `login_failure`: Failed authentication
- `password_change`: Password change operations
- `profile_update`: Profile update operations
- `notification_sent`: Notification delivery

## Best Practices

### 1. Always Log Critical Operations

```typescript
// ✅ Good - Log both success and failure
try {
  await performCriticalOperation();
  await auditLogger.log({ ...successDetails });
} catch (error) {
  await auditLogger.log({ ...failureDetails });
  throw error;
}

// ❌ Bad - Only log success
await performCriticalOperation();
await auditLogger.log({ ...successDetails });
```

### 2. Include Context Information

```typescript
// ✅ Good - Include IP and user agent
await auditLogger.log({
  userId,
  action: 'data_export',
  resource: 'attendance',
  ipAddress: getClientIp(request),
  userAgent: getUserAgent(request),
  metadata: { format: 'csv', recordCount: 100 },
  success: true,
});

// ❌ Bad - Missing context
await auditLogger.log({
  userId,
  action: 'data_export',
  resource: 'attendance',
  success: true,
});
```

### 3. Use Specific Action Types

```typescript
// ✅ Good - Use specific helper methods
await auditLogger.logDataExport(userId, format, dateRange, ip, ua);

// ❌ Bad - Generic logging for specific actions
await auditLogger.log({
  userId,
  action: 'data_export',
  resource: 'data',
  success: true,
});
```

### 4. Handle Logging Errors Gracefully

```typescript
// ✅ Good - Audit logging failures don't break app flow
try {
  await auditLogger.log({ ... });
} catch (error) {
  console.error('Audit logging failed:', error);
  // Continue with application logic
}

// The AuditLoggerService already handles this internally
```

## Performance Considerations

### Partitioning Benefits

- Faster queries on recent data
- Easier archival of old partitions
- Better index performance

### Query Optimization

```typescript
// ✅ Good - Use indexes effectively
await auditLogger.query({
  userId: 'user-123',        // Uses idx_audit_logs_user_id
  startDate: new Date(),     // Uses partition pruning
  limit: 50,                 // Limits result set
});

// ❌ Bad - Full table scan
await auditLogger.query({
  metadata: { someField: 'value' }, // No index on JSONB fields
  limit: 10000,                     // Large result set
});
```

### Archival Strategy

- Automatic archival prevents table bloat
- Partitioned tables make archival efficient
- Old partitions can be dropped or moved to cold storage

## Monitoring

### Key Metrics to Monitor

1. **Total Log Count**: Should stay below 1 million
2. **Success Rate**: Should be > 95%
3. **Archival Frequency**: Should run daily
4. **Failed Login Attempts**: Monitor for security threats

### Example Monitoring Query

```typescript
// Get recent failed login attempts
const failedLogins = await auditLogger.query({
  action: 'login_failure',
  startDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
  success: false,
});

// Alert if too many failures
if (failedLogins.length > 100) {
  console.warn('High number of failed login attempts detected');
}
```

## Compliance

The audit logging system helps meet compliance requirements:

- **GDPR**: Track data access and exports
- **HIPAA**: Log access to sensitive medical information
- **SOC 2**: Comprehensive audit trail
- **ISO 27001**: Security event logging

## Troubleshooting

### Logs Not Appearing

1. Check if background jobs are initialized
2. Verify database connection
3. Check partition exists for current month
4. Review application logs for errors

### Archival Not Running

1. Check if background jobs are running
2. Verify cron schedule is correct
3. Check database permissions
4. Review archival service logs

### Performance Issues

1. Ensure indexes are created
2. Check partition strategy
3. Consider archiving more frequently
4. Monitor database query performance

## Future Enhancements

- [ ] Export archived logs to S3/cold storage
- [ ] Real-time alerting for suspicious activity
- [ ] Dashboard for audit log visualization
- [ ] Advanced analytics and reporting
- [ ] Integration with SIEM systems
- [ ] Automated compliance reports

## Requirements Validation

This implementation satisfies the following requirements:

- **5.1**: Log data exports with timestamp, user ID, and data scope ✅
- **5.2**: Log file uploads with metadata and processing status ✅
- **5.3**: Log authentication failures with IP addresses ✅
- **5.4**: Store logs in separate audit_logs table ✅
- **5.5**: Archive logs older than 90 days automatically ✅
