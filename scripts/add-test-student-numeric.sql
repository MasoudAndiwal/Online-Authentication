-- Add test student with numeric-only ID
-- Run this in Supabase SQL Editor

-- Clean up existing test students
DELETE FROM students WHERE username = 'student';
DELETE FROM students WHERE student_id IN ('99999', '999999');

-- Add new test student with numeric ID
INSERT INTO students (
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
  'Test',
  'Student',
  'Test Father',
  'Test Grandfather',
  '888999',  -- Simple numeric ID
  '2003-01-01',
  '0701234567',
  '0701234568',
  'Kabul, Afghanistan',
  'Computer Science',
  '4',
  '2021',
  'AI-401-A - AFTERNOON',
  'AFTERNOON',
  'student',
  '888999',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'ACTIVE'
);

-- Verify the student was created
SELECT 
  id,
  first_name,
  last_name,
  student_id,
  username,
  status,
  created_at
FROM students 
WHERE username = 'student';

-- Display login credentials
SELECT 
  '=== LOGIN CREDENTIALS ===' as info
UNION ALL
SELECT 'Username: student' as info
UNION ALL
SELECT 'Password: password123' as info
UNION ALL
SELECT 'Student ID: 888999' as info
UNION ALL
SELECT '========================' as info;