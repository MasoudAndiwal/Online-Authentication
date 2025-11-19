-- ============================================
-- Insert Test Student Account
-- ============================================
-- This script creates a test student account for development/testing
-- Username: AliKhan
-- Student ID: 0704
-- Password: student123
-- ============================================

-- Insert student record with your table structure
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
  '2024070401',  -- 10-digit student ID: 2024 (year) + 0704 (sequence) + 01 (section)
  '2005-01-15'::timestamp with time zone,
  '0700123456',  -- 10-digit phone number (no symbols)
  '0700123457',  -- 10-digit father phone number (no symbols)
  'Kabul, Afghanistan',
  'Computer Science',
  'Semester 1',
  '2024',
  'CS-101-A',
  'MORNING',
  'AliKhan',
  '2024070401',  -- Same as student_id
  'student123',  -- Note: In production, this should be hashed
  'ACTIVE'
)
ON CONFLICT (username) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  student_id = EXCLUDED.student_id,
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
