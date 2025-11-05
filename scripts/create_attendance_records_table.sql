-- ================================================
-- Attendance Records Table - Database Schema
-- ================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- Table: attendance_records
-- Stores attendance records for students
-- ================================================
CREATE TABLE IF NOT EXISTS attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id VARCHAR(255) NOT NULL,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    period_number INTEGER,
    status VARCHAR(20) NOT NULL CHECK (status IN ('PRESENT', 'ABSENT', 'SICK', 'LEAVE', 'NOT_MARKED')),
    teacher_name VARCHAR(200),
    subject VARCHAR(200),
    notes TEXT,
    marked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    marked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_attendance_record UNIQUE (student_id, class_id, date, period_number)
);

-- ================================================
-- Indexes for better query performance
-- ================================================
CREATE INDEX idx_attendance_student_id ON attendance_records(student_id);
CREATE INDEX idx_attendance_class_id ON attendance_records(class_id);
CREATE INDEX idx_attendance_date ON attendance_records(date);
CREATE INDEX idx_attendance_class_date ON attendance_records(class_id, date);

-- ================================================
-- Trigger: Update updated_at timestamp
-- ================================================
CREATE OR REPLACE FUNCTION update_attendance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_attendance_records_updated_at
    BEFORE UPDATE ON attendance_records
    FOR EACH ROW
    EXECUTE FUNCTION update_attendance_updated_at();

-- ================================================
-- Views for easier querying
-- ================================================

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
