# Migration Fixes Summary

## Issues Found and Fixed

### 1. **ID Type Mismatch**

**Problem:** Original migrations used `UUID` type for IDs, but your existing schema uses `TEXT` type.

**Fix:** Changed all ID columns from `UUID` to `TEXT` and updated foreign key references:
```sql
-- Before
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
student_id UUID NOT NULL REFERENCES students(id)

-- After  
id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text
student_id TEXT NOT NULL REFERENCES students(id)
```

### 2. **Missing Class Reference**

**Problem:** Migrations referenced a `classes.id` column that didn't exist, and tried to use `class_id` foreign key.

**Fix:** 
- Created `classes` table with `section` column matching `students.classSection`
- Changed `attendance_records` to use `class_section VARCHAR(20)` instead of `class_id UUID`
- Removed foreign key constraint to `classes` table (uses section string instead)

### 3. **Status Value Case Mismatch**

**Problem:** Original migrations used lowercase status values (`'present'`, `'absent'`), but your schema likely uses uppercase.

**Fix:** Changed all status enums to uppercase:
```sql
-- Before
CHECK (status IN ('present', 'absent', 'sick', 'leave', 'excused'))

-- After
CHECK (status IN ('PRESENT', 'ABSENT', 'SICK', 'LEAVE', 'EXCUSED', 'NOT_MARKED'))
```

### 4. **Missing Schedule Entries Table**

**Problem:** `attendance_records` referenced `schedule_entries` table that didn't exist.

**Fix:** Created `02_create_schedule_entries_table.sql` migration.

### 5. **Materialized View Query Issues**

**Problem:** Original view tried to join on non-existent `class_id` column.

**Fix:** Rewrote view to use `students.classSection` directly:
```sql
-- Before
FROM classes c
LEFT JOIN students s ON s.class_id = c.id

-- After
FROM students s
GROUP BY s."classSection"
```

### 6. **Trigger Conflicts**

**Problem:** Running migrations multiple times could cause "trigger already exists" errors.

**Fix:** Added `DROP TRIGGER IF EXISTS` before each `CREATE TRIGGER`:
```sql
DROP TRIGGER IF EXISTS attendance_updated_at_trigger ON attendance_records;
CREATE TRIGGER attendance_updated_at_trigger ...
```

### 7. **Function Conflicts**

**Problem:** Running migrations multiple times could cause "function already exists" errors.

**Fix:** Used `CREATE OR REPLACE FUNCTION` instead of `CREATE FUNCTION`.

## New Files Created

### Core Migration Files (Numbered for Order)

1. **01_create_classes_table.sql** - Creates classes table
2. **02_create_schedule_entries_table.sql** - Creates schedule entries table
3. **03_create_attendance_records_table.sql** - Creates attendance records table (FIXED)
4. **04_create_medical_certificates_table.sql** - Creates medical certificates table (FIXED)
5. **05_create_audit_logs_table.sql** - Creates audit logs with partitioning (FIXED)
6. **06_create_class_statistics_view.sql** - Creates materialized view (FIXED)
7. **07_create_notifications_tables.sql** - Creates notification tables (NEW)

### Helper Files

- **00_RUN_ALL_MIGRATIONS.sql** - Master file that runs all migrations in one go
- **README.md** - Complete documentation for using migrations
- **MIGRATION_FIXES.md** - This file, explaining what was fixed

## Old Files (Can Be Deleted)

These files have issues and should not be used:

- ❌ `create_attendance_records_table.sql` - Uses UUID, wrong status values
- ❌ `create_medical_certificates_table.sql` - Uses UUID
- ❌ `create_audit_logs_table.sql` - Uses UUID
- ❌ `create_class_statistics_materialized_view.sql` - Wrong join logic
- ❌ `add_file_scanning_columns.sql` - Columns now included in main migration
- ❌ `create_notifications_tables.sql` - Uses UUID (old version)

## How to Use

### Recommended Approach

1. **Backup your database first!**
2. Open Supabase SQL Editor
3. Copy contents of `00_RUN_ALL_MIGRATIONS.sql`
4. Paste and run in SQL Editor
5. Verify tables were created (query at end of file)

### What You'll Get

After running migrations, you'll have:

✅ 7 new tables properly configured
✅ 1 materialized view for fast queries
✅ 15+ helper functions
✅ 10+ automatic triggers
✅ Proper indexes for performance
✅ Monthly partitioning for audit logs
✅ Complete notification system

## Testing the Migrations

After running, test with these queries:

```sql
-- Check all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'classes', 'schedule_entries', 'attendance_records',
    'medical_certificates', 'audit_logs', 'notifications',
    'notification_preferences'
);

-- Check materialized view exists
SELECT * FROM class_statistics LIMIT 1;

-- Check functions exist
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%notification%';

-- Test notification preferences were created for existing students
SELECT COUNT(*) FROM notification_preferences;
```

## Compatibility Notes

These migrations are designed to work with your existing schema:

- ✅ Compatible with TEXT-based IDs
- ✅ Works with existing students, teachers, office_staff tables
- ✅ Uses classSection instead of class_id foreign key
- ✅ Matches your uppercase status value conventions
- ✅ Safe to run multiple times (idempotent)

## Next Steps

1. Run the migrations using `00_RUN_ALL_MIGRATIONS.sql`
2. Verify tables were created successfully
3. Update your TypeScript services to use TEXT instead of UUID types
4. Test the notification system
5. Set up background jobs to refresh materialized views

## Support

If you encounter any issues:

1. Check Supabase logs for detailed error messages
2. Verify your students/teachers/office_staff tables exist
3. Ensure you have CREATE TABLE permissions
4. Try running migrations individually to isolate problems
5. Check the README.md for troubleshooting tips
