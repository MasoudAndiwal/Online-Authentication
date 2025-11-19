# 🔧 Troubleshooting "Access Denied" Error

## Problem: "Access Denied - You do not have permission to view this information"

This error appears on the student dashboard when the system cannot find or access the student's data.

**Your System**: Custom authentication with `students` table (NOT Supabase Auth)

---

## Root Causes & Solutions

### ✅ Cause 1: Student Record Doesn't Exist

**Problem**: No student record exists in the `students` table.

**Solution**:
```sql
-- Check if student record exists
SELECT * FROM students WHERE username = 'AliKhan' OR student_id = '0704';

-- If no record found, create one:
INSERT INTO public.students (
  first_name,
  last_name,
  father_name,
  grandfather_name,
  student_id,
  date_of_birth,
  phone,
  father_phone,
  address,
  programs,
  semester,
  enrollment_year,
  class_section,
  time_slot,
  username,
  student_id_ref,
  password,
  status
) VALUES (
  'Ali',
  'Khan',
  'Ahmad Khan',
  'Mohammad Khan',
  '0704',
  '2005-01-15'::timestamp with time zone,
  '+93 700 123 456',
  '+93 700 123 457',
  'Kabul, Afghanistan',
  'Computer Science',
  'Semester 1',
  '2024',
  'CS-101-A',
  'MORNING',
  'AliKhan',
  '0704',
  'student123',
  'ACTIVE'
);
```

---

### ✅ Cause 2: ID Mismatch

**Problem**: The `students.id` doesn't match `auth.users.id`

**How to Check**:
```sql
-- Find your auth user ID
SELECT id, email FROM auth.users WHERE email = 'alikhan@student.edu';

-- Check if student record has the same ID
SELECT id, student_id, full_name FROM students WHERE email = 'alikhan@student.edu';

-- If IDs don't match, you'll see different UUIDs
```

**Solution**:
```sql
-- Delete the incorrect student record
DELETE FROM students WHERE email = 'alikhan@student.edu';

-- Create a new one with the correct ID
INSERT INTO students (id, student_id, full_name, email, status)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'alikhan@student.edu'),
  '0704',
  'Ali Khan',
  'alikhan@student.edu',
  'active'
);
```

---

### ✅ Cause 3: User Not Logged In

**Problem**: The session is not valid or expired

**Solution**:
1. Log out completely
2. Clear browser cookies/cache
3. Log in again with correct credentials
4. Check browser console for authentication errors

---

### ✅ Cause 4: Wrong Role

**Problem**: User has wrong role (e.g., 'TEACHER' instead of 'STUDENT')

**How to Check**:
```sql
-- Check user metadata
SELECT 
  id, 
  email, 
  raw_user_meta_data->>'role' as role,
  raw_app_meta_data
FROM auth.users 
WHERE email = 'alikhan@student.edu';
```

**Solution**:
```sql
-- Update user metadata to have student role
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"student"'
)
WHERE email = 'alikhan@student.edu';
```

---

## Quick Fix: Complete Student Setup

Run this complete script to set up a student properly:

```sql
-- Step 1: Get or create auth user
DO $$
DECLARE
  user_id uuid;
  user_email text := 'alikhan@student.edu';
BEGIN
  -- Check if user exists
  SELECT id INTO user_id FROM auth.users WHERE email = user_email;
  
  IF user_id IS NULL THEN
    -- Create new user
    user_id := gen_random_uuid();
    
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_user_meta_data,
      raw_app_meta_data,
      created_at,
      updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      user_id,
      'authenticated',
      'authenticated',
      user_email,
      crypt('student123', gen_salt('bf')),
      NOW(),
      '{"full_name":"Ali Khan","student_id":"0704","role":"student"}'::jsonb,
      '{"provider":"email","providers":["email"]}'::jsonb,
      NOW(),
      NOW()
    );
    
    RAISE NOTICE 'Created new user with ID: %', user_id;
  ELSE
    RAISE NOTICE 'User already exists with ID: %', user_id;
  END IF;
  
  -- Step 2: Delete any existing student record with wrong ID
  DELETE FROM students WHERE email = user_email AND id != user_id;
  
  -- Step 3: Create or update student record with correct ID
  INSERT INTO students (
    id,
    student_id,
    full_name,
    email,
    phone,
    date_of_birth,
    gender,
    address,
    emergency_contact_name,
    emergency_contact_phone,
    enrollment_date,
    status,
    created_at,
    updated_at
  ) VALUES (
    user_id,  -- MUST match auth.users.id
    '0704',
    'Ali Khan',
    user_email,
    '+93 700 123 456',
    '2005-01-15',
    'male',
    'Kabul, Afghanistan',
    'Khan Family',
    '+93 700 123 457',
    CURRENT_DATE,
    'active',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    student_id = EXCLUDED.student_id,
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    updated_at = NOW();
    
  RAISE NOTICE 'Student record created/updated successfully';
END $$;
```

---

## Verification Steps

After running the fix, verify everything is correct:

```sql
-- 1. Check auth user exists
SELECT id, email, email_confirmed_at, raw_user_meta_data->>'role' as role
FROM auth.users 
WHERE email = 'alikhan@student.edu';

-- 2. Check student record exists with matching ID
SELECT s.id, s.student_id, s.full_name, s.email, s.status
FROM students s
WHERE s.email = 'alikhan@student.edu';

-- 3. Verify IDs match
SELECT 
  u.id as auth_id,
  s.id as student_id,
  CASE WHEN u.id = s.id THEN '✅ IDs MATCH' ELSE '❌ IDs DO NOT MATCH' END as status
FROM auth.users u
LEFT JOIN students s ON u.email = s.email
WHERE u.email = 'alikhan@student.edu';
```

**Expected Result**: You should see "✅ IDs MATCH"

---

## Test Login

After fixing:

1. **Logout** from the application
2. **Clear browser cache/cookies**
3. **Login** with:
   - Email: `alikhan@student.edu`
   - Password: `student123`
4. **Navigate** to the dashboard
5. **Verify** you can see your attendance data

---

## Still Having Issues?

### Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for errors related to:
   - Authentication
   - API calls to `/api/students/dashboard`
   - 403 Forbidden errors

### Check API Response

```javascript
// In browser console, run:
fetch('/api/students/dashboard?studentId=YOUR_USER_ID', {
  credentials: 'include'
})
.then(r => r.json())
.then(console.log)
```

### Check Session

```javascript
// In browser console, check if you're logged in:
fetch('/api/auth/session', { credentials: 'include' })
.then(r => r.json())
.then(console.log)
```

---

## Summary Checklist

- [ ] Auth user exists in `auth.users`
- [ ] Student record exists in `students` table
- [ ] IDs match between `auth.users.id` and `students.id`
- [ ] User role is set to "student"
- [ ] User is logged in with valid session
- [ ] Email is confirmed
- [ ] Browser cache cleared
- [ ] No console errors

If all checkboxes are checked and you still see "Access Denied", please check the server logs for more details.
