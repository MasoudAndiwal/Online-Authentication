# Attendance API Error - Complete Fix Guide

## 🔴 Error You're Seeing

```
GET http://localhost:3000/api/attendance?classId=demo-class-1&date=2025-11-10 
500 (Internal Server Error)
```

## 🎯 Root Cause

The `attendance_records` table in your Supabase database either:
1. **Doesn't exist** - Table was never created
2. **Wrong column names** - Using `attendance_date` instead of `date`
3. **Wrong schema** - Missing required columns or constraints

## ✅ Quick Fix (3 Steps)

### Step 1: Test Your Database Connection

Visit this URL in your browser:
```
http://localhost:3000/api/attendance/test
```

This will tell you exactly what's wrong with your database.

### Step 2: Run the Fix Script

1. Open your **Supabase Dashboard**
2. Go to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy the contents of `scripts/fix_attendance_table_schema.sql`
5. Paste and click **Run**

### Step 3: Verify the Fix

Refresh your attendance page. The error should be gone!

## 📁 Files Created to Help You

1. **scripts/diagnose_attendance_table.sql**
   - Diagnostic script to see your current table structure
   - Run this first to understand the problem

2. **scripts/fix_attendance_table_schema.sql**
   - Complete fix script that handles all scenarios
   - Safe to run multiple times
   - Will not delete existing data

3. **scripts/README_FIX_ATTENDANCE.md**
   - Detailed instructions with screenshots
   - Troubleshooting guide

4. **app/api/attendance/test/route.ts**
   - Test endpoint to verify your database
   - Visit: http://localhost:3000/api/attendance/test

## 🔍 What Changed in the API

The API now provides **detailed error messages** instead of generic 500 errors:

**Before:**
```json
{
  "error": "Failed to fetch attendance records"
}
```

**After:**
```json
{
  "error": "Database table 'attendance_records' not found or has incorrect schema",
  "details": "relation 'attendance_records' does not exist",
  "hint": "Check server logs for more information"
}
```

## 📊 Expected Table Schema

After running the fix script, your table will have:

```sql
CREATE TABLE attendance_records (
    id UUID PRIMARY KEY,
    student_id VARCHAR(255) NOT NULL,
    class_id VARCHAR(255) NOT NULL,
    date DATE NOT NULL,              -- ← Key column!
    period_number INTEGER,
    status VARCHAR(20) NOT NULL,
    teacher_name VARCHAR(200),
    subject VARCHAR(200),
    notes TEXT,
    marked_by VARCHAR(255),
    marked_at TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## 🚀 Next Steps

1. **Run the fix script** in Supabase SQL Editor
2. **Test the endpoint**: http://localhost:3000/api/attendance/test
3. **Refresh your app** - The attendance page should work now!

## ❓ Still Having Issues?

Check these:

1. **Supabase credentials** in `.env`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

2. **Browser console** - Now shows detailed error messages

3. **Server logs** - Check terminal where `npm run dev` is running

4. **Supabase logs** - Check your Supabase project logs

## 💡 Why This Happened

Your project has multiple SQL schema files with different column names:
- `scripts/create_attendance_tables.sql` uses `attendance_date`
- `scripts/safe_update_attendance_records.sql` uses `date`

The API expects `date`, so we need to ensure the table uses that column name.

## ✨ What's Fixed

- ✅ API now provides detailed error messages
- ✅ Created diagnostic script to identify issues
- ✅ Created comprehensive fix script
- ✅ Added test endpoint for verification
- ✅ Safe to run - won't delete existing data
- ✅ Handles all edge cases automatically
