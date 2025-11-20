# Database Schema Overview

## Tables Created by Migrations

### 1. classes
Stores class/section information.

```
┌─────────────────────────────────────┐
│           classes                   │
├─────────────────────────────────────┤
│ id (TEXT, PK)                       │
│ name (VARCHAR)                      │
│ section (VARCHAR, UNIQUE)           │ ← Links to students.classSection
│ department (VARCHAR)                │
│ semester (VARCHAR)                  │
│ academic_year (VARCHAR)             │
│ created_at (TIMESTAMPTZ)            │
│ updated_at (TIMESTAMPTZ)            │
└─────────────────────────────────────┘
```

### 2. schedule_entries
Stores class schedule information.

```
┌─────────────────────────────────────┐
│       schedule_entries              │
├─────────────────────────────────────┤
│ id (TEXT, PK)                       │
│ class_section (VARCHAR)             │
│ teacher_id (TEXT, FK→teachers)      │
│ subject (VARCHAR)                   │
│ day_of_week (INTEGER)               │ ← 0=Sun, 1=Mon, ..., 6=Sat
│ start_time (TIME)                   │
│ end_time (TIME)                     │
│ room (VARCHAR)                      │
│ created_at (TIMESTAMPTZ)            │
│ updated_at (TIMESTAMPTZ)            │
└─────────────────────────────────────┘
```

### 3. attendance_records
Tracks daily student attendance.

```
┌─────────────────────────────────────┐
│       attendance_records            │
├─────────────────────────────────────┤
│ id (TEXT, PK)                       │
│ student_id (TEXT, FK→students)      │
│ class_section (VARCHAR)             │
│ schedule_entry_id (TEXT, FK)        │
│ date (DATE)                         │
│ status (VARCHAR)                    │ ← PRESENT, ABSENT, SICK, LEAVE, EXCUSED
│ marked_by (TEXT, FK→teachers)       │
│ notes (TEXT)                        │
│ created_at (TIMESTAMPTZ)            │
│ updated_at (TIMESTAMPTZ)            │
│                                     │
│ UNIQUE(student_id, class_section, date)
└─────────────────────────────────────┘
```

### 4. medical_certificates
Stores medical certificates and sick leave requests.

```
┌─────────────────────────────────────┐
│      medical_certificates           │
├─────────────────────────────────────┤
│ id (TEXT, PK)                       │
│ student_id (TEXT, FK→students)      │
│ submission_date (DATE)              │
│ start_date (DATE)                   │
│ end_date (DATE)                     │
│ total_days (INTEGER, COMPUTED)      │ ← Auto-calculated
│ reason (TEXT)                       │
│ certificate_url (TEXT)              │
│ file_path (TEXT)                    │ ← Supabase Storage path
│ file_name (VARCHAR)                 │
│ file_size (INTEGER)                 │
│ doctor_name (VARCHAR)               │
│ hospital_clinic (VARCHAR)           │
│ status (VARCHAR)                    │ ← pending, approved, rejected
│ reviewed_by (TEXT, FK→office_staff) │
│ reviewed_at (TIMESTAMPTZ)           │
│ review_notes (TEXT)                 │
│ scan_status (VARCHAR)               │ ← pending, scanning, clean, infected
│ scan_result (JSONB)                 │
│ quarantined (BOOLEAN)               │
│ created_at (TIMESTAMPTZ)            │
│ updated_at (TIMESTAMPTZ)            │
└─────────────────────────────────────┘
```

### 5. audit_logs (Partitioned)
Tracks critical system actions with monthly partitioning.

```
┌─────────────────────────────────────┐
│          audit_logs                 │
│      (Partitioned by month)         │
├─────────────────────────────────────┤
│ id (TEXT, PK)                       │
│ user_id (TEXT, FK→students)         │
│ action (VARCHAR)                    │ ← data_export, file_upload, etc.
│ resource (VARCHAR)                  │
│ resource_id (VARCHAR)               │
│ metadata (JSONB)                    │
│ ip_address (INET)                   │
│ user_agent (TEXT)                   │
│ timestamp (TIMESTAMPTZ, PK)         │ ← Used for partitioning
│ success (BOOLEAN)                   │
│ error_message (TEXT)                │
└─────────────────────────────────────┘
     │
     ├─→ audit_logs_y2025m01 (Jan 2025)
     ├─→ audit_logs_y2025m02 (Feb 2025)
     ├─→ audit_logs_y2025m03 (Mar 2025)
     └─→ ... (one partition per month)
```

### 6. notifications
Stores student notifications.

```
┌─────────────────────────────────────┐
│         notifications               │
├─────────────────────────────────────┤
│ id (TEXT, PK)                       │
│ student_id (TEXT, FK→students)      │
│ type (VARCHAR)                      │ ← attendance_warning, mahroom_alert, etc.
│ title (VARCHAR)                     │
│ message (TEXT)                      │
│ severity (VARCHAR)                  │ ← info, warning, error, success
│ created_at (TIMESTAMPTZ)            │
│ read (BOOLEAN)                      │
│ read_at (TIMESTAMPTZ)               │
│ action_url (TEXT)                   │
│ metadata (JSONB)                    │
│ delivery_status (VARCHAR)           │ ← pending, sent, failed, retrying
│ delivery_attempts (INTEGER)         │
│ last_delivery_attempt (TIMESTAMPTZ) │
│ delivery_error (TEXT)               │
└─────────────────────────────────────┘
```

### 7. notification_preferences
Manages student notification settings.

```
┌─────────────────────────────────────┐
│    notification_preferences         │
├─────────────────────────────────────┤
│ student_id (TEXT, PK, FK→students)  │
│ email_enabled (BOOLEAN)             │
│ in_app_enabled (BOOLEAN)            │
│ attendance_alerts (BOOLEAN)         │
│ file_updates (BOOLEAN)              │
│ system_announcements (BOOLEAN)      │
│ updated_at (TIMESTAMPTZ)            │
└─────────────────────────────────────┘
```

## Materialized View

### class_statistics
Pre-computed class statistics for fast dashboard queries.

```
┌─────────────────────────────────────┐
│      class_statistics (VIEW)        │
├─────────────────────────────────────┤
│ class_section (VARCHAR, UNIQUE)     │
│ total_students (BIGINT)             │
│ average_attendance (FLOAT)          │
│ median_attendance (FLOAT)           │
│ highest_attendance (FLOAT)          │
│ lowest_attendance (FLOAT)           │
│ students_at_risk (BIGINT)           │ ← Below 75%
│ students_with_warning (BIGINT)      │ ← Below 80%
│ last_calculated (TIMESTAMPTZ)       │
└─────────────────────────────────────┘
```

## Relationships Diagram

```
┌──────────┐
│ students │◄─────────┐
└────┬─────┘          │
     │                │
     │ 1:N            │ 1:N
     │                │
     ▼                │
┌────────────────┐    │
│ attendance_    │    │
│ records        │    │
└────────────────┘    │
                      │
┌──────────┐          │
│ teachers │◄─────────┤
└────┬─────┘          │
     │                │
     │ 1:N            │
     │                │
     ▼                │
┌────────────────┐    │
│ schedule_      │    │
│ entries        │    │
└────────────────┘    │
                      │
┌──────────────┐      │
│ office_staff │◄─────┤
└──────────────┘      │
                      │
┌──────────────┐      │
│ medical_     │      │
│ certificates │──────┘
└──────────────┘

┌──────────┐
│ students │◄─────────┐
└──────────┘          │
                      │ 1:N
                      │
┌──────────────┐      │
│ notifications│──────┘
└──────────────┘

┌──────────┐
│ students │◄─────────┐
└──────────┘          │ 1:1
                      │
┌──────────────┐      │
│ notification_│      │
│ preferences  │──────┘
└──────────────┘

┌──────────┐
│ students │◄─────────┐
└──────────┘          │ 1:N
                      │
┌──────────────┐      │
│ audit_logs   │──────┘
└──────────────┘
```

## Key Features

### Automatic Triggers

All tables have automatic `updated_at` timestamp updates:
```sql
-- Automatically updates when row is modified
updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
```

### Computed Columns

Medical certificates automatically calculate total days:
```sql
total_days INTEGER GENERATED ALWAYS AS (end_date - start_date + 1) STORED
```

### Constraints

- **Unique constraints** prevent duplicate attendance records
- **Check constraints** ensure valid status values
- **Foreign keys** maintain referential integrity
- **Date constraints** ensure end_date >= start_date

### Indexes

Optimized indexes for common queries:
- Student lookups
- Date range queries
- Status filtering
- Unread notifications
- Class section lookups

### Partitioning

Audit logs use monthly partitioning for:
- Better query performance
- Easier archival
- Reduced table bloat

## Storage Estimates

Approximate storage per 1000 students:

| Table | Rows | Size |
|-------|------|------|
| attendance_records | ~180,000/year | ~50 MB |
| notifications | ~5,000/month | ~2 MB |
| medical_certificates | ~500/year | ~1 MB |
| audit_logs | ~50,000/month | ~10 MB |
| class_statistics | ~50 | <1 MB |

Total: ~63 MB per 1000 students per year

## Performance Optimizations

1. **Materialized View** - Pre-computed statistics (10min refresh)
2. **Partitioning** - Monthly audit log partitions
3. **Indexes** - Strategic indexes on foreign keys and filters
4. **Concurrent Refresh** - View updates don't block queries
5. **Partial Indexes** - Indexes on filtered data (unread notifications)

## Maintenance Functions

```sql
-- Refresh statistics
SELECT refresh_class_statistics();

-- Check if refresh needed
SELECT is_class_statistics_stale();

-- Clean old notifications
SELECT cleanup_old_notifications();

-- Archive old audit logs
SELECT archive_old_audit_logs();

-- Create new partition
SELECT create_audit_log_partition('2026-01-01'::DATE);
```
