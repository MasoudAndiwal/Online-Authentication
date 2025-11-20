# Audit Logging Quick Start Guide

## 5-Minute Setup

### 1. Run the Database Migration

```sql
-- Execute the migration file
\i database/migrations/create_audit_logs_table.sql
```

### 2. Initialize Background Jobs

In your application startup (e.g., `app/api/health/route.ts`):

```typescript
import { initializeBackgroundJobs } from '@/lib/services/background-jobs';

// Initialize once on app startup
initializeBackgroundJobs();
```

### 3. Start Logging!

The system is already integrated with:
- ✅ Authentication (automatic)
- ✅ File uploads (automatic)
- ✅ Data exports (automatic)

## Common Use Cases

### Log a Custom Action

```typescript
import { getAuditLoggerService } from '@/lib/services/audit-logger-service';

const auditLogger = getAuditLoggerService();

await auditLogger.log({
  userId: 'user-123',
  action: 'profile_update',
  resource: 'student_profile',
  resourceId: 'profile-456',
  metadata: { fields: ['email', 'phone'] },
  success: true,
});
```

### Get User's Recent Activity

```typescript
const logs = await auditLogger.getUserLogs('user-123', 20);

logs.forEach(log => {
  console.log(`${log.timestamp}: ${log.action} - ${log.success ? 'Success' : 'Failed'}`);
});
```

### Check Failed Login Attempts

```typescript
const failedLogins = await auditLogger.getRecentFailedLogins('user-123', 24);

if (failedLogins.length > 5) {
  console.warn('Suspicious activity detected!');
}
```

### Trigger Manual Archival

```typescript
import { auditLogArchivalService } from '@/lib/services/audit-log-archival-service';

const result = await auditLogArchivalService.triggerArchival();
console.log(`Archived ${result.archivedCount} records`);
```

## API Route Integration

### Extract Context from Request

```typescript
import { getClientIp, getUserAgent } from '@/lib/middleware/audit-logging-middleware';

export async function POST(request: NextRequest) {
  const ipAddress = getClientIp(request);
  const userAgent = getUserAgent(request);
  
  // Use in logging
  await auditLogger.log({
    userId: 'user-123',
    action: 'data_export',
    resource: 'attendance',
    ipAddress,
    userAgent,
    success: true,
  });
}
```

## Action Types

Use these predefined action types:

- `data_export` - Data export operations
- `file_upload` - File upload operations
- `file_download` - File download operations
- `login_success` - Successful authentication
- `login_failure` - Failed authentication
- `password_change` - Password changes
- `profile_update` - Profile updates
- `notification_sent` - Notification delivery

## Monitoring Dashboard

```typescript
// Get overall statistics
const stats = await auditLogger.getStatistics();

console.log(`
Total Logs: ${stats.totalLogs}
Success Rate: ${(stats.successRate * 100).toFixed(2)}%
Top Actions:
${stats.topActions.map(a => `  - ${a.action}: ${a.count}`).join('\n')}
`);

// Get archival status
const archivalStats = auditLogArchivalService.getStats();

console.log(`
Archival Status:
  Running: ${archivalStats.isRunning}
  Last Run: ${archivalStats.lastArchivalDate}
  Total Archived: ${archivalStats.totalArchived}
`);
```

## Troubleshooting

### Logs Not Appearing?

1. Check database connection
2. Verify partition exists for current month:
   ```sql
   SELECT tablename FROM pg_tables WHERE tablename LIKE 'audit_logs_%';
   ```
3. Check application logs for errors

### Need to Create New Partition?

```sql
SELECT create_audit_log_partition('2025-06-01'::DATE);
```

### Check Archival Status

```typescript
const status = await auditLogArchivalService.checkArchivalNeeded();
console.log(`Archival needed: ${status.needed}`);
console.log(`Total records: ${status.totalRecords}`);
```

## Best Practices

1. **Always include context**: IP address and user agent when available
2. **Log both success and failure**: Don't just log successful operations
3. **Use specific action types**: Use predefined types or create new ones
4. **Include metadata**: Add relevant details in the metadata field
5. **Don't log sensitive data**: Never log passwords or tokens

## Need Help?

- Full documentation: `lib/services/AUDIT_LOGGING_IMPLEMENTATION.md`
- Implementation summary: `TASK_7_IMPLEMENTATION_SUMMARY.md`
- Database schema: `database/migrations/create_audit_logs_table.sql`
