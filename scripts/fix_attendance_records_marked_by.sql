-- ================================================
-- Fix attendance_records table - Remove auth.users FK
-- ================================================

-- Step 1: Drop the views that depend on marked_by column
DROP VIEW IF EXISTS v_attendance_details CASCADE;
DROP VIEW IF EXISTS v_attendance_summary CASCADE;

-- Step 2: Drop the foreign key constraint on marked_by
ALTER TABLE attendance_records 
DROP CONSTRAINT IF EXISTS attendance_records_marked_by_fkey;

-- Step 3: Change marked_by to VARCHAR to store office_staff.id
ALTER TABLE attendance_records 
ALTER COLUMN marked_by TYPE VARCHAR(255);

-- Step 4: Add comment to clarify the column
COMMENT ON COLUMN attendance_records.marked_by IS 'ID of the office staff member who marked the attendance (references office_staff.id)';

-- Step 5: Recreate the views

-- View: Attendance summary by class and date
CREATE OR REPLACE VIEW v_attendance_summary AS
SELECT 
    ar.class_id,
    ar.date,
    COUNT(DISTINCT ar.student_id) as total_students,
    COUNT(DISTINCT CASE WHEN ar.status = 'PRESENT' THEN ar.student_id END) as present_count,
    COUNT(DISTINCT CASE WHEN ar.status = 'ABSENT' THEN ar.student_id END) as absent_count,
    COUNT(DISTINCT CASE WHEN ar.status = 'SICK' THEN ar.student_id END) as sick_count,
    COUNT(DISTINCT CASE WHEN ar.status = 'LEAVE' THEN ar.student_id END) as leave_count
FROM attendance_records ar
GROUP BY ar.class_id, ar.date
ORDER BY ar.date DESC;

-- View: Detailed attendance records with class info
CREATE OR REPLACE VIEW v_attendance_details AS
SELECT 
    ar.id,
    ar.student_id,
    ar.class_id,
    c.name as class_name,
    c.session,
    ar.date,
    ar.period_number,
    ar.status,
    ar.teacher_name,
    ar.subject,
    ar.notes,
    ar.marked_by,
    ar.marked_at
FROM attendance_records ar
LEFT JOIN classes c ON ar.class_id = c.id
ORDER BY ar.date DESC, ar.class_id, ar.student_id, ar.period_number;

-- Optionally, you can add a foreign key to office_staff if that table exists
-- ALTER TABLE attendance_records 
-- ADD CONSTRAINT fk_marked_by_office_staff 
-- FOREIGN KEY (marked_by) REFERENCES office_staff(id) ON DELETE SET NULL;
