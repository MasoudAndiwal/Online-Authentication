-- ============================================
-- SUPABASE DATABASE BACKUP - USER TABLES
-- Date: January 25, 2026
-- Project: sgcoinewybdlnjibuatf
-- ============================================

-- ============================================
-- OFFICE STAFF BACKUP (3 records)
-- ============================================

-- Note: Passwords are already hashed with bcrypt
-- To restore, run this SQL in Supabase SQL Editor

INSERT INTO office_staff (id, first_name, last_name, email, phone, role, supabase_user_id, is_active, created_at, updated_at, username, password)
VALUES
('1974a93d-6a97-4ef9-bbc7-a4db89245905', 'admin', 'admin', 'masoudandiwal89@gmail.com', '0704362806', 'ADMIN', '1', true, '2025-10-08 14:07:56.203649+00', '2025-12-07 05:55:25.184481+00', 'masoudandiwal', '$2b$10$mrYpyjdHHXm4fXb9vwA.BOsLEO1VOj85MgGFkTSZBuCAFVtbsH1iu'),
('6fd31c9e-b16a-47b4-a32e-22a7b14217ed', 'Admin', 'User', 'masoudandiwal434@gmail.com', '0704362804', 'ADMIN', 'a5a6bd1a-1f96-4c21-a3f5-fc2b24b01e85', true, '2025-10-09 10:33:13.149482+00', '2025-12-07 05:55:25.184481+00', 'Masoudandiwal321', '$2b$10$mrYpyjdHHXm4fXb9vwA.BOsLEO1VOj85MgGFkTSZBuCAFVtbsH1iu'),
('18973192-8364-4b0c-a242-6a8f537b89ee', 'Jamil', 'shirzad', 'mjamilshirzad8@gmail.com', '0794753483', 'ADMIN', '3', true, '2025-10-21 14:21:05.039831+00', '2025-12-07 17:18:58.505113+00', 'JamilShirzad', '$2b$10$AyYJzrjmdxV9cb/znh1o4.CRdlWd8PbNl0.u2VHFXY9/AyTZpaeLy')
ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role,
  updated_at = EXCLUDED.updated_at;

-- ============================================
-- TEACHERS BACKUP (7 records)
-- ============================================

INSERT INTO teachers (id, first_name, last_name, father_name, grandfather_name, teacher_id, phone, secondary_phone, address, departments, qualification, experience, specialization, subjects, classes, username, password, status, created_at, updated_at)
VALUES
('247aef34-b490-42d2-9fdd-96c05c604707', 'مسعود', 'اندیوال', 'سورگل', 'رحم الدین', '9237', '0704362806', '0796302602', 'میدان هوای ناحیه 6 ، فراه', ARRAY['Electrical Engineering'], 'Master''s in Computer Science', '5', 'Software Engineering with 3 year Experience', ARRAY['Chemistry'], ARRAY['Section C', 'CS-301-A - MORNING', 'ME-101-A - MORNING', 'IS-401-A - AFTERNOON', 'MATH-101-A - MORNING'], 'مسعوداندیوال', '$2b$10$mrYpyjdHHXm4fXb9vwA.BOsLEO1VOj85MgGFkTSZBuCAFVtbsH1iu', 'ACTIVE', '2025-10-08 09:51:51.849+00', '2025-12-07 05:54:58.391398+00'),
('8d926a56-01ad-4828-91b1-b6434c4f728b', 'masoud', 'andiwal', 'SoorGull', 'Rahmuddin', '832498', '0704362865', NULL, '', ARRAY['Electrical Engineering', 'Building Engineering', '11th class'], 'Master''s in Computer Science', '5', 'Software Engineering with 3 year Experience', ARRAY['Physics', 'Data Structures', 'Biology'], ARRAY['Section C', 'Section D', 'Section B', 'Morning Batch'], 'masoudandiwal', '$2b$10$mrYpyjdHHXm4fXb9vwA.BOsLEO1VOj85MgGFkTSZBuCAFVtbsH1iu', 'ACTIVE', '2025-10-08 10:24:21.421+00', '2025-12-07 05:54:58.391398+00'),
('17b9312e-6ac6-41d7-b8e0-9197a479d331', 'd', 'd', 'd', 'd', '2457', '0704362898', '0704362506', 'Herat', ARRAY['Electrical Engineering', '10th class', '11th class', '12th class'], 'Master''s in Computer Science', '5', 'Software Engineering with 3 year Experience', ARRAY['Chemistry', 'Mathematics'], ARRAY['Section B', 'Section C', 'Morning Batch', 'Afternoon Batch'], 'dd', '$2b$10$mrYpyjdHHXm4fXb9vwA.BOsLEO1VOj85MgGFkTSZBuCAFVtbsH1iu', 'ACTIVE', '2025-10-08 11:46:09.767+00', '2025-12-07 05:54:58.391398+00'),
('41e19044-0915-4934-a57a-4bffa2de99c1', 'Jamil', 'Mire', 'Mohammad Hassani', 'Ali Hassani', '675498', '1234567899', '0987654328', 'Direct-4 Herat d', ARRAY['Electrical Engineering', '10th class', '12th class'], 'Master''s in Math', '10', 'PHD from US in math', ARRAY['Chemistry', 'Biology', 'Mathematics'], ARRAY['Section C', 'Morning Batch', 'Section D'], 'jamelmire', '$2b$10$mrYpyjdHHXm4fXb9vwA.BOsLEO1VOj85MgGFkTSZBuCAFVtbsH1iu', 'ACTIVE', '2025-10-09 11:02:41.309+00', '2025-12-07 05:54:58.391398+00'),
('0fc8d550-dcfe-4b57-81ab-880572d8e805', 'masoud', 'andiwal', 'Mohammad Hassan', 'Mohammad Hassan', '31232', '0704363206', '0704363346', 'Direct-4', ARRAY['Building Engineering'], 'Master''s in Computer Science', '5', 'Software Engineering with 3 year Experience', ARRAY['Chemistry'], ARRAY['Section C', 'ACC-101-A - MORNING', 'AI-401-A - AFTERNOON', 'ARCH-201-A - AFTERNOON', 'ARCH-101-A - MORNING', 'ARCH-301-A - MORNING'], 'alikhan', '$2b$10$mrYpyjdHHXm4fXb9vwA.BOsLEO1VOj85MgGFkTSZBuCAFVtbsH1iu', 'ACTIVE', '2025-10-10 11:51:57.917+00', '2025-12-07 05:54:58.391398+00'),
('41496e56-bb9c-4047-87cd-7d2659cfa09c', 'مسعود', 'اندیوال', 'سورگل', 'رحم الدین', '87294', '0704363123', '0705423412', 'Herat', ARRAY['Computer Science'], 'Master''s in Computer Science', '4', 'I have a Bachelor s degree in Computer Science.', ARRAY['Computer Programming'], ARRAY['AI-401-A - AFTERNOON', 'ARCH-101-A - MORNING', 'ARCH-201-A - AFTERNOON', 'ARCH-301-A - MORNING', 'BM-101-A - MORNING'], 'MasoudA', '$2b$10$kJEN8B/Dc8ZVDVKSXhyzd.kb2JhSVNJ7xKN76pXEzsUQa4bEvUA4K', 'ACTIVE', '2025-11-08 11:37:28.136+00', '2025-12-07 11:57:55.372447+00'),
('e5859f1a-b3a5-4d04-8f95-222348d9eb75', 'ناصر', 'ناصر', 'ناصر', 'ناصر', '0983', '0704362396', NULL, '', ARRAY['Electrical Engineering'], 'Master''s in Computer Sciencedd', '5', 'Software Engineering with 3 year Experiencedd4', ARRAY['Mathematics'], ARRAY['ARCH-301-A - MORNING', 'BM-101-A - MORNING', 'BM-201-A - AFTERNOON', 'ARCH-201-A - AFTERNOON', 'ARCH-101-A - MORNING', 'DS-301-A - MORNING'], 'Naser', '$2b$10$7QAM9J2ctCHa90FDeu0ExOObtMR32rc8KmuIJWX4AUwRxg/08195O', 'ACTIVE', '2025-12-07 15:33:47.636+00', '2025-12-07 15:33:47.637+00')
ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  updated_at = EXCLUDED.updated_at;

-- ============================================
-- NOTES
-- ============================================
-- 1. Student data (96 records) should be backed up separately due to size
-- 2. All passwords are bcrypt hashed and secure
-- 3. Use ON CONFLICT to safely restore without duplicates
-- 4. Verify data after restoration with SELECT COUNT(*) queries
