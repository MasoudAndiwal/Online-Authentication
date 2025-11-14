# Verify Supabase Connection

## Quick Verification Steps

### 1. Check Environment Variables
Make sure you have these in your `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Test the Connection
Visit this endpoint in your browser:
```
http://localhost:3000/api/attendance/test-structure
```

### 3. Check Table Permissions
In Supabase Dashboard:
1. Go to Authentication > Policies
2. Check `attendance_records_new` table
3. Ensure SELECT policy exists for your role

### 4. Verify Data Exists
Run this in Supabase SQL Editor:
```sql
-- Check if you have any attendance records
SELECT COUNT(*) FROM attendance_records_new;

-- Check a specific class
SELECT * FROM attendance_records_new 
WHERE class_id = '788a970f-a79b-49cd-ab97-8cabf6f3f752'
LIMIT 5;

-- Check students table
SELECT id, student_id, first_name, last_name 
FROM students 
LIMIT 5;
```

## Common Issues

### Issue: "relation does not exist"
**Solution**: Table hasn't been created. Run the schema script.

### Issue: "permission denied"
**Solution**: Add RLS policy or disable RLS for testing:
```sql
ALTER TABLE attendance_records_new DISABLE ROW LEVEL SECURITY;
```

### Issue: "No records found"
**Solution**: This is normal if no attendance has been marked yet.
