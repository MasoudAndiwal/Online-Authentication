-- ================================================
-- Classes Table Enhancement for All Classes Page
-- ================================================
-- This migration adds major, semester, and student_count columns
-- to support the All Classes management interface
-- 
-- Run this AFTER schedule-management-updated.sql
-- ================================================

-- Add new columns to classes table if they don't exist
ALTER TABLE classes 
ADD COLUMN IF NOT EXISTS major VARCHAR(100),
ADD COLUMN IF NOT EXISTS semester INTEGER DEFAULT 1 CHECK (semester >= 1 AND semester <= 8),
ADD COLUMN IF NOT EXISTS student_count INTEGER DEFAULT 0 CHECK (student_count >= 0);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_classes_major ON classes(major);
CREATE INDEX IF NOT EXISTS idx_classes_semester ON classes(semester);

-- Add comments for documentation
COMMENT ON COLUMN classes.major IS 'The program/major of the class (e.g., Computer Science, Electronics)';
COMMENT ON COLUMN classes.semester IS 'The semester number (1-8) for this class';
COMMENT ON COLUMN classes.student_count IS 'Total number of students enrolled in this class';

-- ================================================
-- Optional: Sample data for testing
-- ================================================
-- Uncomment below to insert sample classes

/*
INSERT INTO classes (name, session, major, semester, student_count) VALUES
    ('Class A', 'MORNING', 'Computer Science', 3, 45),
    ('Class B', 'AFTERNOON', 'Electronics', 2, 38),
    ('Class C', 'MORNING', 'Computer Science', 4, 42),
    ('Class D', 'AFTERNOON', 'Civil Engineering', 1, 35),
    ('Class E', 'MORNING', 'Mechanical Engineering', 2, 40),
    ('Class F', 'AFTERNOON', 'Electrical Engineering', 3, 37)
ON CONFLICT (name, session) DO UPDATE SET
    major = EXCLUDED.major,
    semester = EXCLUDED.semester,
    student_count = EXCLUDED.student_count;
*/

-- ================================================
-- Enhanced View: Classes with complete information
-- ================================================
CREATE OR REPLACE VIEW v_classes_complete AS
SELECT 
    c.id,
    c.name,
    c.session,
    c.major,
    c.semester,
    c.student_count,
    c.created_at,
    c.updated_at,
    COUNT(se.id) as schedule_count,
    COUNT(DISTINCT se.teacher_id) as unique_teachers,
    COUNT(DISTINCT se.subject) as unique_subjects
FROM classes c
LEFT JOIN schedule_entries se ON c.id = se.class_id
GROUP BY c.id, c.name, c.session, c.major, c.semester, c.student_count, c.created_at, c.updated_at
ORDER BY c.name, c.session;

COMMENT ON VIEW v_classes_complete IS 'Complete class information including schedule statistics for the All Classes page';

-- ================================================
-- Function: Update student count
-- ================================================
-- This function can be called to sync student_count when students are added/removed
CREATE OR REPLACE FUNCTION update_class_student_count(p_class_id UUID)
RETURNS void AS $$
BEGIN
    -- This is a placeholder for when you have a students table
    -- UPDATE classes 
    -- SET student_count = (
    --     SELECT COUNT(*) FROM students WHERE class_id = p_class_id
    -- )
    -- WHERE id = p_class_id;
    
    RAISE NOTICE 'Update student count for class %', p_class_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_class_student_count IS 'Updates the student count for a specific class (placeholder for future integration)';
