-- ================================================
-- Attendance Management System - Database Schema
-- ================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- Table: attendance_records
-- Stores individual attendance records for each student per period
-- ================================================
CREATE TABLE IF NOT EXISTS attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Student Information
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    student_name VARCHAR(200) NOT NULL,
    father_name VARCHAR(200) NOT NULL,
    student_id_number VARCHAR(50) NOT NULL,
    
    -- Class Information
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    class_name VARCHAR(100) NOT NULL,
    class_session VARCHAR(20) NOT NULL CHECK (class_session IN ('MORNING', 'AFTERNOON')),
    
    -- Date and Period Information
    attendance_date DATE NOT NULL,
    period_number INTEGER NOT NULL CHECK (period_number >= 1 AND period_number <= 8),
    period_start_time TIME NOT NULL,
    period_end_time TIME NOT NULL,
    
    -- Teacher Information
    teacher_name VARCHAR(200),
    subject VARCHAR(200),
    
    -- Attendance Status
    status VARCHAR(20) NOT NULL CHECK (status IN ('PRESENT', 'ABSENT', 'SICK', 'LEAVE')),
    
    -- Metadata
    marked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    marked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    marked_by_name VARCHAR(200),
    marked_by_role VARCHAR(20),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_student_period_date UNIQUE (student_id, class_id, attendance_date, period_number)
);

-- ================================================
-- Table: attendance_summary
-- Stores daily attendance summary for quick reporting
-- ================================================
CREATE TABLE IF NOT EXISTS attendance_summary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Student Information
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    student_name VARCHAR(200) NOT NULL,
    father_name VARCHAR(200) NOT NULL,
    student_id_number VARCHAR(50) NOT NULL,
    
    -- Class Information
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    class_name VARCHAR(100) NOT NULL,
    class_session VARCHAR(20) NOT NULL CHECK (class_session IN ('MORNING', 'AFTERNOON')),
    
    -- Date Information
    attendance_date DATE NOT NULL,
    day_of_week VARCHAR(20) NOT NULL,
    
    -- Summary Counts
    total_periods INTEGER NOT NULL DEFAULT 0,
    present_count INTEGER NOT NULL DEFAULT 0,
    absent_count INTEGER NOT NULL DEFAULT 0,
    sick_count INTEGER NOT NULL DEFAULT 0,
    leave_count INTEGER NOT NULL DEFAULT 0,
    not_marked_count INTEGER NOT NULL DEFAULT 0,
    
    -- Percentage
    attendance_percentage DECIMAL(5,2),
    
    -- Overall Day Status (if marked sick/leave for entire day)
    day_status VARCHAR(20) CHECK (day_status IN ('NORMAL', 'SICK', 'LEAVE')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_student_class_date UNIQUE (student_id, class_id, attendance_date)
);

-- ================================================
-- Indexes for better query performance
-- ================================================

-- Attendance Records Indexes
CREATE INDEX idx_attendance_records_student ON attendance_records(student_id);
CREATE INDEX idx_attendance_records_class ON attendance_records(class_id);
CREATE INDEX idx_attendance_records_date ON attendance_records(attendance_date DESC);
CREATE INDEX idx_attendance_records_status ON attendance_records(status);
CREATE INDEX idx_attendance_records_student_date ON attendance_records(student_id, attendance_date);
CREATE INDEX idx_attendance_records_class_date ON attendance_records(class_id, attendance_date);
CREATE INDEX idx_attendance_records_marked_by ON attendance_records(marked_by);

-- Attendance Summary Indexes
CREATE INDEX idx_attendance_summary_student ON attendance_summary(student_id);
CREATE INDEX idx_attendance_summary_class ON attendance_summary(class_id);
CREATE INDEX idx_attendance_summary_date ON attendance_summary(attendance_date DESC);
CREATE INDEX idx_attendance_summary_student_date ON attendance_summary(student_id, attendance_date);
CREATE INDEX idx_attendance_summary_class_date ON attendance_summary(class_id, attendance_date);

-- ================================================
-- Trigger: Update updated_at timestamp
-- ================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_attendance_records_updated_at
    BEFORE UPDATE ON attendance_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attendance_summary_updated_at
    BEFORE UPDATE ON attendance_summary
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- Function: Calculate and update attendance summary
-- ================================================
CREATE OR REPLACE FUNCTION update_attendance_summary(
    p_student_id UUID,
    p_class_id UUID,
    p_attendance_date DATE
)
RETURNS VOID AS $$
DECLARE
    v_student_name VARCHAR(200);
    v_father_name VARCHAR(200);
    v_student_id_number VARCHAR(50);
    v_class_name VARCHAR(100);
    v_class_session VARCHAR(20);
    v_day_of_week VARCHAR(20);
    v_total_periods INTEGER;
    v_present_count INTEGER;
    v_absent_count INTEGER;
    v_sick_count INTEGER;
    v_leave_count INTEGER;
    v_not_marked_count INTEGER;
    v_attendance_percentage DECIMAL(5,2);
    v_day_status VARCHAR(20);
BEGIN
    -- Get student information
    SELECT 
        CONCAT(first_name, ' ', last_name),
        father_name,
        student_id
    INTO v_student_name, v_father_name, v_student_id_number
    FROM auth.users
    WHERE id = p_student_id;
    
    -- Get class information
    SELECT name, session
    INTO v_class_name, v_class_session
    FROM classes
    WHERE id = p_class_id;
    
    -- Get day of week
    v_day_of_week := TO_CHAR(p_attendance_date, 'Day');
    
    -- Count attendance records
    SELECT 
        COUNT(*) FILTER (WHERE status = 'PRESENT'),
        COUNT(*) FILTER (WHERE status = 'ABSENT'),
        COUNT(*) FILTER (WHERE status = 'SICK'),
        COUNT(*) FILTER (WHERE status = 'LEAVE'),
        COUNT(*)
    INTO v_present_count, v_absent_count, v_sick_count, v_leave_count, v_total_periods
    FROM attendance_records
    WHERE student_id = p_student_id
        AND class_id = p_class_id
        AND attendance_date = p_attendance_date;
    
    -- Calculate not marked count (assuming 6 periods per day)
    v_not_marked_count := 6 - v_total_periods;
    
    -- Calculate attendance percentage
    IF v_total_periods > 0 THEN
        v_attendance_percentage := (v_present_count::DECIMAL / v_total_periods::DECIMAL) * 100;
    ELSE
        v_attendance_percentage := 0;
    END IF;
    
    -- Determine day status
    IF v_sick_count = v_total_periods THEN
        v_day_status := 'SICK';
    ELSIF v_leave_count = v_total_periods THEN
        v_day_status := 'LEAVE';
    ELSE
        v_day_status := 'NORMAL';
    END IF;
    
    -- Insert or update summary
    INSERT INTO attendance_summary (
        student_id, student_name, father_name, student_id_number,
        class_id, class_name, class_session,
        attendance_date, day_of_week,
        total_periods, present_count, absent_count, sick_count, leave_count, not_marked_count,
        attendance_percentage, day_status
    ) VALUES (
        p_student_id, v_student_name, v_father_name, v_student_id_number,
        p_class_id, v_class_name, v_class_session,
        p_attendance_date, v_day_of_week,
        v_total_periods, v_present_count, v_absent_count, v_sick_count, v_leave_count, v_not_marked_count,
        v_attendance_percentage, v_day_status
    )
    ON CONFLICT (student_id, class_id, attendance_date)
    DO UPDATE SET
        total_periods = EXCLUDED.total_periods,
        present_count = EXCLUDED.present_count,
        absent_count = EXCLUDED.absent_count,
        sick_count = EXCLUDED.sick_count,
        leave_count = EXCLUDED.leave_count,
        not_marked_count = EXCLUDED.not_marked_count,
        attendance_percentage = EXCLUDED.attendance_percentage,
        day_status = EXCLUDED.day_status,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- Trigger: Auto-update summary when attendance record changes
-- ================================================
CREATE OR REPLACE FUNCTION trigger_update_attendance_summary()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM update_attendance_summary(OLD.student_id, OLD.class_id, OLD.attendance_date);
        RETURN OLD;
    ELSE
        PERFORM update_attendance_summary(NEW.student_id, NEW.class_id, NEW.attendance_date);
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_update_attendance_summary
    AFTER INSERT OR UPDATE OR DELETE ON attendance_records
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_attendance_summary();

-- ================================================
-- Views for easier querying
-- ================================================

-- View: Daily attendance with student details
CREATE OR REPLACE VIEW v_daily_attendance AS
SELECT 
    ar.id,
    ar.student_id,
    ar.student_name,
    ar.father_name,
    ar.student_id_number,
    ar.class_id,
    ar.class_name,
    ar.class_session,
    ar.attendance_date,
    ar.period_number,
    ar.period_start_time,
    ar.period_end_time,
    ar.teacher_name,
    ar.subject,
    ar.status,
    ar.marked_at,
    ar.marked_by_name,
    ar.marked_by_role
FROM attendance_records ar
ORDER BY ar.attendance_date DESC, ar.class_name, ar.student_name, ar.period_number;

-- View: Attendance summary with statistics
CREATE OR REPLACE VIEW v_attendance_statistics AS
SELECT 
    as_table.student_id,
    as_table.student_name,
    as_table.father_name,
    as_table.student_id_number,
    as_table.class_id,
    as_table.class_name,
    as_table.class_session,
    COUNT(*) as total_days,
    SUM(as_table.present_count) as total_present,
    SUM(as_table.absent_count) as total_absent,
    SUM(as_table.sick_count) as total_sick,
    SUM(as_table.leave_count) as total_leave,
    ROUND(AVG(as_table.attendance_percentage), 2) as avg_attendance_percentage
FROM attendance_summary as_table
GROUP BY 
    as_table.student_id, as_table.student_name, as_table.father_name, as_table.student_id_number,
    as_table.class_id, as_table.class_name, as_table.class_session
ORDER BY as_table.class_name, as_table.student_name;

-- ================================================
-- Sample Queries
-- ================================================

-- Get attendance for a specific class and date
-- SELECT * FROM attendance_records 
-- WHERE class_id = 'your-class-id' 
-- AND attendance_date = '2025-01-15'
-- ORDER BY student_name, period_number;

-- Get attendance summary for a student
-- SELECT * FROM attendance_summary
-- WHERE student_id = 'your-student-id'
-- ORDER BY attendance_date DESC;

-- Get overall attendance statistics for a class
-- SELECT * FROM v_attendance_statistics
-- WHERE class_id = 'your-class-id';

