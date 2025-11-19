-- ============================================
-- Insert Test Student Account
-- ============================================
-- This script creates a test student account for development/testing
-- Username: AliKhan
-- Student ID: 0704
-- Password: student123 (hashed)
-- ============================================

-- Note: This assumes you're using Supabase Auth
-- The password will be hashed by Supabase when creating the user

-- Step 1: Create the auth user (Run this in Supabase Dashboard > Authentication > Users > Add User)
-- OR use the Supabase API/Dashboard to create user with:
-- Email: alikhan@student.edu (or any email format your system uses)
-- Password: student123
-- Then get the user ID and use it below

-- Step 2: Insert student record
-- Replace 'USER_ID_HERE' with the actual UUID from auth.users after creating the user

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
  'USER_ID_HERE'::uuid,  -- Replace with actual user ID from auth.users
  '0704',
  'Ali Khan',
  'alikhan@student.edu',
  '+93 700 123 456',
  '2005-01-15',
  'male',
  'Kabul, Afghanistan',
  'Khan Family',
  '+93 700 123 457',
  '2024-01-15',
  'active',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  student_id = EXCLUDED.student_id,
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  updated_at = NOW();

-- ============================================
-- Alternative: Complete SQL with user creation
-- ============================================
-- If you have direct database access, you can use this approach:

/*
-- Create auth user (requires admin privileges)
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
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'alikhan@student.edu',
  crypt('student123', gen_salt('bf')),  -- Password: student123
  NOW(),
  '{"provider":"email","providers":["email"],"role":"student"}',
  '{"full_name":"Ali Khan","student_id":"0704"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
) RETURNING id;

-- Then use the returned ID in the students table insert above
*/

-- ============================================
-- Enroll student in a class (optional)
-- ============================================
-- Uncomment and modify to enroll the student in a class

/*
INSERT INTO public.class_enrollments (
  student_id,
  class_id,
  enrollment_date,
  status,
  created_at,
  updated_at
) VALUES (
  'USER_ID_HERE'::uuid,  -- Replace with actual user ID
  (SELECT id FROM classes WHERE name = 'Computer Science 101' LIMIT 1),  -- Or any class
  NOW(),
  'active',
  NOW(),
  NOW()
)
ON CONFLICT (student_id, class_id) DO NOTHING;
*/

-- ============================================
-- Verification Queries
-- ============================================

-- Check if student was created
-- SELECT * FROM students WHERE student_id = '0704';

-- Check student's classes
-- SELECT s.full_name, s.student_id, c.name as class_name, ce.status
-- FROM students s
-- JOIN class_enrollments ce ON s.id = ce.student_id
-- JOIN classes c ON ce.class_id = c.id
-- WHERE s.student_id = '0704';

-- ============================================
-- Quick Test Login Credentials
-- ============================================
-- Username/Email: alikhan@student.edu (or AliKhan if using username)
-- Password: student123
-- Student ID: 0704
-- Role: student
-- ============================================
