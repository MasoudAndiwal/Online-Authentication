# Database Migrations

This folder contains SQL migration files for setting up the enhanced student dashboard backend database schema.

## Quick Start

### Option 1: Run All Migrations at Once (Recommended)

1. Open your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Open the file `00_RUN_ALL_MIGRATIONS.sql`
4. Copy the entire contents
5. Paste into the SQL Editor
6. Click **Run** to execute

This will create all tables, indexes, functions, and triggers in the correct order.

### Option 2: Run Individual Migrations

If you prefer to run migrations one at a time, execute them in this order:

1. `01_create_classes_table.sql`
2. `02_create_schedule_entries_table.sql`
3. `03_create_attendance_records_table.sql`
4. `04_create_medical_certificates_table.sql`
5. `05_create_audit_logs_table.sql`
6. `06_create_class_statistics_view.sql`
7. `07_create_notifications_tables.sql`

## What Gets Created

### Tables

1. **classes** - Stores class/section information
2. **schedule_entries** - Stores class schedule information
3. **attendance_records** - Tracks daily student attendance
4. **medical_certificates** - Stores medical certificates and sick leave requests
5. **audit_logs** - Tracks critical system actions (partitioned by month)
6. **notifications** - Stores student notifications
7. **notification_preferences** - Manages student notification settings

### Materialized Views

1. **class_statistics** - Pre-computed class statistics for fast dashboard queries

### Functions

- `update_*_updated_at()` - Auto-update timestamp triggers
- `refresh_class_statistics()` - Refresh materialized view
- `get_class_statistics_age()` - Check view freshness
- `is_class_statistics_stale()` - Check if refresh needed
- `mark_notification_read()` - Mark notification as read
- `get_unread_notification_count()` - Get unread count for student
- `create_audit_log_partition()` - Create new monthly partition
- `archive_old_audit_logs()` - Archive old logs
- `get_notifications_for_retry()` - Get failed notifications for retry

### Triggers

- Auto-update `updated_at` timestamps on all tables
- Auto-create default notification preferences for new students
- Auto-set `reviewed_at` when medical certificate status changes

## Schema Compatibility

These migrations are designed to work with your existing schema:

- Uses **TEXT** for IDs (not UUID) to match existing `students`, `teachers`, and `office_staff` tables
- References `students.classSection` instead of a separate `class_id` foreign key
- Uses uppercase status values (`PRESENT`, `ABSENT`, etc.) to match existing conventions
- Compatible with existing `students`, `teachers`, and `office_staff` tables

## Key Features

### Partitioning

The `audit_logs` table uses monthly partitioning for better performance:
- Automatically creates partitions for 2025
- Use `create_audit_log_partition()` function to create future partitions
- Improves query performance and makes archival easier

### Materialized Views

The `class_statistics` view pre-computes expensive aggregations:
- Refreshed every 10 minutes by background job
- Supports concurrent refresh (queries work during refresh)
- Dramatically improves dashboard load times

### Notification System

Complete notification infrastructure:
- Delivery tracking with retry logic
- Per-student preferences
- Automatic default preferences for new students
- Support for multiple notification types

## Verification

After running migrations, verify tables were created:

```sql
SELECT 
    table_name, 
    table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'classes',
    'schedule_entries', 
    'attendance_records',
    'medical_certificates',
    'audit_logs',
    'notifications',
    'notification_preferences',
    'class_statistics'
)
ORDER BY table_name;
```

## Troubleshooting

### Error: relation "students" does not exist

Make sure your existing `students`, `teachers`, and `office_staff` tables are created first. These migrations depend on them.

### Error: partition already exists

This is safe to ignore. The migrations use `IF NOT EXISTS` checks, so running them multiple times is safe.

### Error: function already exists

This is safe to ignore. The migrations use `CREATE OR REPLACE FUNCTION`, so they can be run multiple times.

### Materialized view refresh fails

If the initial refresh fails, you can manually refresh later:

```sql
SELECT refresh_class_statistics();
```

## Maintenance

### Refresh Materialized Views

```sql
-- Manual refresh
SELECT refresh_class_statistics();

-- Check if refresh is needed
SELECT is_class_statistics_stale();

-- Check view age
SELECT get_class_statistics_age();
```

### Create New Audit Log Partition

```sql
-- Create partition for a specific month
SELECT create_audit_log_partition('2026-01-01'::DATE);
```

### Clean Up Old Notifications

```sql
-- Delete read notifications older than 90 days
SELECT cleanup_old_notifications();
```

### Archive Old Audit Logs

```sql
-- Check if archival is needed
SELECT * FROM check_audit_log_threshold();

-- Archive old logs
SELECT * FROM archive_old_audit_logs();
```

## Background Jobs

These migrations support the following background jobs (configured in `lib/services/background-jobs.ts`):

1. **Materialized View Refresh** - Every 10 minutes
2. **Audit Log Archival** - Daily at 2 AM
3. **Notification Threshold Monitor** - Every hour
4. **Notification Retry Queue** - Every 5 minutes

## Support

If you encounter issues:

1. Check the Supabase logs for detailed error messages
2. Verify your existing schema matches the expected structure
3. Ensure you have proper permissions to create tables and functions
4. Try running migrations individually to isolate the problem

## Migration History

- **v1.0** - Initial migration with all core tables
- **v1.1** - Added notification system
- **v1.2** - Fixed schema compatibility with TEXT IDs
