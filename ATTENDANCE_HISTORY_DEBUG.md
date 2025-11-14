# Attendance History 500 Error - Debugging Guide

## Error Details
- **Error**: 500 Internal Server Error
- **Endpoint**: `/api/attendance/history?classId=788a970f-a79b-49cd-ab97-8cabf6f3f752&dateRange=30`
- **Message**: Failed to fetch attendance history

## What I've Done

### 1. Added Comprehensive Logging
I've updated the API route with detailed logging at every step:
- Request parameters logging
- Table structure detection logging
- Query execution logging
- Error details logging with full error objects

### 2. Improved Error Handling
- Added detailed error messages for database queries
- Added stack traces to error responses
- Added logging for student query errors

## Next Steps to Debug

### Step 1: Check Server Console
Look at your development server console (where you ran `npm run dev`). You should now see detailed logs like:

```
[Attendance History API] Request params: { classId: '...', startDate: null, endDate: null, dateRange: '30' }
[Attendance History API] Using table structure: OLD
[Attendance History API] Querying attendance_records with: { ... }
```

The logs will tell you exactly where the error occurs.

### Step 2: Check Database Table Structure

Run this diagnostic script in your Supabase SQL Editor:

```bash
# File location: scripts/check_attendance_tables.sql
```

This will show you:
- Which tables exist
- What columns they have
- Sample data

### Step 3: Common Issues and Solutions

#### Issue 1: Table doesn't exist
**Solution**: Run the schema creation script:
```sql
-- File: scripts/fix_attendance_table_schema.sql
```

#### Issue 2: Wrong column name (attendance_date vs date)
**Symptom**: Error mentions column "date" doesn't exist
**Solution**: The fix script handles this automatically

#### Issue 3: No data in table
**Symptom**: API returns empty results but no error
**Solution**: This is normal if no attendance has been marked yet

#### Issue 4: Permission issues
**Symptom**: Error mentions "permission denied"
**Solution**: Check RLS (Row Level Security) policies in Supabase

## What to Look For in Logs

1. **Table Detection**:
   ```
   [Attendance History API] Using table structure: NEW
   ```
   or
   ```
   [Attendance History API] Using table structure: OLD
   ```

2. **Query Errors**:
   ```
   [Attendance History API] Error fetching from attendance_records: { ... }
   ```

3. **Student Query Errors**:
   ```
   [Attendance History API] Error fetching students: { ... }
   ```

## Quick Test

After checking the logs, try these:

1. **Test if table exists**:
   ```sql
   SELECT * FROM attendance_records LIMIT 1;
   ```

2. **Test if you can query by class_id**:
   ```sql
   SELECT * FROM attendance_records 
   WHERE class_id = '788a970f-a79b-49cd-ab97-8cabf6f3f752' 
   LIMIT 5;
   ```

3. **Check students table**:
   ```sql
   SELECT id, student_id, first_name, last_name 
   FROM students 
   LIMIT 5;
   ```

## Report Back

Please share:
1. The console logs from your dev server
2. Results from the diagnostic SQL script
3. Any error messages you see in the browser console

This will help me identify the exact issue!
