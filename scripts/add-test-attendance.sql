-- Add test attendance records for the student
-- Student ID: 074b0ea2-c8dc-4d68-a3f6-7135be022d24

-- First, let's check if we have schedule entries for this student
-- We'll need to create some basic schedule entries if they don't exist

-- Insert some basic schedule entries (if they don't exist)
INSERT INTO schedule_entries (id, student_id, subject, start_time, end_time, day_of_week, created_at, updated_at)
VALUES 
  ('sched-1', '074b0ea2-c8dc-4d68-a3f6-7135be022d24', 'Computer Science 101', '08:00', '09:30', 'MONDAY', NOW(), NOW()),
  ('sched-2', '074b0ea2-c8dc-4d68-a3f6-7135be022d24', 'Mathematics 201', '10:00', '11:30', 'MONDAY', NOW(), NOW()),
  ('sched-3', '074b0ea2-c8dc-4d68-a3f6-7135be022d24', 'Computer Science 101', '08:00', '09:30', 'TUESDAY', NOW(), NOW()),
  ('sched-4', '074b0ea2-c8dc-4d68-a3f6-7135be022d24', 'Mathematics 201', '10:00', '11:30', 'TUESDAY', NOW(), NOW()),
  ('sched-5', '074b0ea2-c8dc-4d68-a3f6-7135be022d24', 'Computer Science 101', '08:00', '09:30', 'WEDNESDAY', NOW(), NOW()),
  ('sched-6', '074b0ea2-c8dc-4d68-a3f6-7135be022d24', 'Mathematics 201', '10:00', '11:30', 'WEDNESDAY', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert test attendance records for the past 2 weeks
INSERT INTO attendance_records (id, student_id, date, period, status, marked_by, marked_at, schedule_entry_id)
VALUES 
  -- Week 1 (Nov 11-16, 2024)
  ('att-1', '074b0ea2-c8dc-4d68-a3f6-7135be022d24', '2024-11-11', 1, 'present', 'Dr. Ahmed Hassan', '2024-11-11 08:15:00', 'sched-1'),
  ('att-2', '074b0ea2-c8dc-4d68-a3f6-7135be022d24', '2024-11-11', 2, 'present', 'Prof. Sarah Johnson', '2024-11-11 10:15:00', 'sched-2'),
  ('att-3', '074b0ea2-c8dc-4d68-a3f6-7135be022d24', '2024-11-12', 1, 'present', 'Dr. Ahmed Hassan', '2024-11-12 08:15:00', 'sched-3'),
  ('att-4', '074b0ea2-c8dc-4d68-a3f6-7135be022d24', '2024-11-12', 2, 'absent', 'Prof. Sarah Johnson', '2024-11-12 10:15:00', 'sched-4'),
  ('att-5', '074b0ea2-c8dc-4d68-a3f6-7135be022d24', '2024-11-13', 1, 'present', 'Dr. Ahmed Hassan', '2024-11-13 08:15:00', 'sched-5'),
  ('att-6', '074b0ea2-c8dc-4d68-a3f6-7135be022d24', '2024-11-13', 2, 'present', 'Prof. Sarah Johnson', '2024-11-13 10:15:00', 'sched-6'),
  
  -- Week 2 (Nov 18-23, 2024) - More recent
  ('att-7', '074b0ea2-c8dc-4d68-a3f6-7135be022d24', '2024-11-18', 1, 'present', 'Dr. Ahmed Hassan', '2024-11-18 08:15:00', 'sched-1'),
  ('att-8', '074b0ea2-c8dc-4d68-a3f6-7135be022d24', '2024-11-18', 2, 'present', 'Prof. Sarah Johnson', '2024-11-18 10:15:00', 'sched-2'),
  ('att-9', '074b0ea2-c8dc-4d68-a3f6-7135be022d24', '2024-11-19', 1, 'sick', 'Dr. Ahmed Hassan', '2024-11-19 08:15:00', 'sched-3'),
  ('att-10', '074b0ea2-c8dc-4d68-a3f6-7135be022d24', '2024-11-19', 2, 'sick', 'Prof. Sarah Johnson', '2024-11-19 10:15:00', 'sched-4'),
  ('att-11', '074b0ea2-c8dc-4d68-a3f6-7135be022d24', '2024-11-20', 1, 'present', 'Dr. Ahmed Hassan', '2024-11-20 08:15:00', 'sched-5'),
  ('att-12', '074b0ea2-c8dc-4d68-a3f6-7135be022d24', '2024-11-20', 2, 'present', 'Prof. Sarah Johnson', '2024-11-20 10:15:00', 'sched-6')
ON CONFLICT (id) DO NOTHING;

-- Verify the data was inserted
SELECT 
  ar.date,
  ar.period,
  ar.status,
  ar.marked_by,
  se.subject
FROM attendance_records ar
LEFT JOIN schedule_entries se ON ar.schedule_entry_id = se.id
WHERE ar.student_id = '074b0ea2-c8dc-4d68-a3f6-7135be022d24'
ORDER BY ar.date, ar.period;