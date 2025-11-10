# Fix Attendance Records Table Error

## Problem
You're getting a 500 error when trying to fetch attendance records:
```
GET http://localhost:3000/api/attendance?classId=demo-class-1&date=2025-11-10 500 (Internal Server Error)
```

## Cause
The `attendance_records` table either:
1. Doesn't exist in your database
2. Has the wrong column names (using `attendance_date` instead of `date`)
3. Has incorrect schema/structure

## Solution

### Step 1: Diagnose the Issue
Run this SQL script in your Supabase SQL Editor to see the current table structure:

```sql
-- File: scripts/diagnose_attendance_table.sql
```

This will show you:
- If the table exists
- What columns it has
- What the column names are

### Step 2: Fix the Table
Run this SQL script in your Supabase SQL Editor to fix the table:

```sql
-- File: scripts/fix_attendance_table_schema.sql
```

This script will:
- ✓ Rename `attendance_date` to `date` if needed
- ✓ Create the table if it doesn't exist
- ✓ Ensure all required columns exist
- ✓ Create proper indexes for performance
- ✓ Set up triggers and constraints
- ✓ Create helpful views

### Step 3: Verify the Fix
After running the fix script, check your browser console. The API now provides detailed error messages that will tell you exactly what's wrong.

## How to Run SQL Scripts in Supabase

1. Go to your Supabase Dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy and paste the SQL script
5. Click "Run" or press Ctrl+Enter

## Expected Table Schema

After running the fix script, your `attendance_records` table should have:

```
Columns:
- id (UUID, Primary Key)
- student_id (VARCHAR(255))
- class_id (VARCHAR(255))
- date (DATE) ← This is the key column!
- period_number (INTEGER)
- status (VARCHAR(20))
- teacher_name (VARCHAR(200))
- subject (VARCHAR(200))
- notes (TEXT)
- marked_by (VARCHAR(255))
- marked_at (TIMESTAMP)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## Still Having Issues?

If you still see errors after running the fix script:

1. Check the browser console for the detailed error message
2. Check your Supabase project logs
3. Verify your `.env` file has correct Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

## Quick Test

After fixing, you can test the API directly:
```
http://localhost:3000/api/attendance?classId=demo-class-1&date=2025-11-10
```

You should see:
```json
{
  "success": true,
  "data": []
}
```
