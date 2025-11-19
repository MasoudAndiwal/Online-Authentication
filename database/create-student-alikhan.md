# Create Test Student: Ali Khan

## ⚠️ IMPORTANT: Why "Access Denied" Happens

The "Access Denied" error occurs when:
1. **No student record exists** in the `students` table
2. **The student record ID doesn't match the auth user ID**
3. **The user is not logged in**

**Solution**: The student record's `id` field MUST match the auth user's `id` field!

---

## Quick Setup Guide

### Step 1: Create User in Supabase Dashboard

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Click **"Add User"** or **"Invite User"**
3. Fill in the details:
   - **Email**: `alikhan@student.edu` (or `0704@student.edu`)
   - **Password**: `student123`
   - **Auto Confirm User**: ✅ Yes (check this box)
   - **User Metadata** (optional):
     ```json
     {
       "full_name": "Ali Khan",
       "student_id": "0704",
       "role": "student"
     }
     ```
4. Click **"Create User"**
5. **⚠️ COPY THE USER ID (UUID)** - This is CRITICAL!

### Step 2: Insert Student Record (CRITICAL STEP!)

Go to **Supabase Dashboard** → **SQL Editor** and run:

```sql
-- ⚠️ IMPORTANT: Replace 'PASTE_USER_ID_HERE' with the EXACT UUID from Step 1
-- The IDs MUST match or you'll get "Access Denied"!

INSERT INTO public.students (
  id,                    -- ⚠️ This MUST be the same as auth.users.id
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
  'PASTE_USER_ID_HERE'::uuid,  -- ⚠️ PASTE THE UUID HERE!
  '0704',
  'Ali Khan',
  'alikhan@student.edu',
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
);
```

### Step 3: Enroll in a Class (Optional)

```sql
-- Enroll Ali Khan in Computer Science 101
INSERT INTO public.class_enrollments (
  student_id,
  class_id,
  enrollment_date,
  status,
  created_at,
  updated_at
) VALUES (
  'PASTE_USER_ID_HERE'::uuid,
  (SELECT id FROM classes WHERE name LIKE '%Computer Science%' LIMIT 1),
  CURRENT_DATE,
  'active',
  NOW(),
  NOW()
);
```

### Step 4: Test Login

**Login Credentials:**
- **Username/Email**: `alikhan@student.edu` or `0704@student.edu`
- **Password**: `student123`
- **Student ID**: `0704`
- **Role**: `student`

---

## Alternative: One-Step SQL (Advanced)

If you have direct database access and pgcrypto extension enabled:

```sql
-- Create user and student in one go
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Generate new user ID
  new_user_id := gen_random_uuid();
  
  -- Insert into auth.users (requires superuser or appropriate permissions)
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_user_id,
    'authenticated',
    'authenticated',
    'alikhan@student.edu',
    crypt('student123', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"],"role":"student"}'::jsonb,
    '{"full_name":"Ali Khan","student_id":"0704"}'::jsonb,
    NOW(),
    NOW()
  );
  
  -- Insert into students table
  INSERT INTO public.students (
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
    new_user_id,
    '0704',
    'Ali Khan',
    'alikhan@student.edu',
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
  );
  
  RAISE NOTICE 'Student created with ID: %', new_user_id;
END $$;
```

---

## Verification

Check if the student was created successfully:

```sql
-- Check student record
SELECT * FROM students WHERE student_id = '0704';

-- Check auth user
SELECT id, email, created_at FROM auth.users WHERE email = 'alikhan@student.edu';

-- Check enrollments
SELECT 
  s.full_name,
  s.student_id,
  c.name as class_name,
  ce.status
FROM students s
LEFT JOIN class_enrollments ce ON s.id = ce.student_id
LEFT JOIN classes c ON ce.class_id = c.id
WHERE s.student_id = '0704';
```

---

## Troubleshooting

### Can't create user in auth.users?
- Use Supabase Dashboard → Authentication → Users → Add User
- This is the recommended approach

### Student ID already exists?
- Check if student already exists: `SELECT * FROM students WHERE student_id = '0704';`
- Delete if needed: `DELETE FROM students WHERE student_id = '0704';`

### Login not working?
- Verify email is confirmed in Supabase Dashboard
- Check password is correct: `student123`
- Verify user role in metadata

---

## Summary

**Test Account Created:**
- ✅ Username: AliKhan
- ✅ Email: alikhan@student.edu
- ✅ Student ID: 0704
- ✅ Password: student123
- ✅ Role: student
- ✅ Status: active

**Ready to test the student dashboard!** 🎉
