-- ================================================
-- Schedule Entries Table - Database Schema
-- ================================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- Table: schedule_entries
-- Stores schedule entries for classes
-- ================================================
CREATE TABLE IF NOT EXISTS schedule_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    teacher_name VARCHAR(200) NOT NULL,
    subject VARCHAR(200),
    hours INTEGER NOT NULL DEFAULT 1,
    day_of_week VARCHAR(20) NOT NULL CHECK (day_of_week IN ('saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday')),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- Indexes for better query performance
-- ================================================
CREATE INDEX idx_schedule_class_id ON schedule_entries(class_id);
CREATE INDEX idx_schedule_day_of_week ON schedule_entries(day_of_week);
CREATE INDEX idx_schedule_class_day ON schedule_entries(class_id, day_of_week);
CREATE INDEX idx_schedule_start_time ON schedule_entries(start_time);

-- ================================================
-- Trigger: Update updated_at timestamp
-- ================================================
CREATE OR REPLACE FUNCTION update_schedule_entries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_schedule_entries_updated_at
    BEFORE UPDATE ON schedule_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_schedule_entries_updated_at();

-- ================================================
-- Comments for documentation
-- ================================================
COMMENT ON TABLE schedule_entries IS 'Stores schedule entries for classes. Each entry can represent multiple periods (hours field).';
COMMENT ON COLUMN schedule_entries.hours IS 'Number of consecutive periods this entry covers. The Schedule API will expand this into individual period entries.';
COMMENT ON COLUMN schedule_entries.start_time IS 'Start time of the first period covered by this entry.';
COMMENT ON COLUMN schedule_entries.end_time IS 'End time of the last period covered by this entry.';

-- ================================================
-- Example Data
-- ================================================

-- Example 1: Teacher "dd" teaches all 6 periods on Wednesday for class ARCH-101-A
-- INSERT INTO schedule_entries (class_id, teacher_name, subject, hours, day_of_week, start_time, end_time)
-- VALUES (
--     (SELECT id FROM classes WHERE name = 'ARCH-101-A' LIMIT 1),
--     'dd',
--     'Architecture Fundamentals',
--     6,
--     'wednesday',
--     '08:30:00',
--     '12:45:00'
-- );

-- Example 2: Two teachers, 3 periods each
-- INSERT INTO schedule_entries (class_id, teacher_name, subject, hours, day_of_week, start_time, end_time)
-- VALUES 
--     (
--         (SELECT id FROM classes WHERE name = 'ARCH-101-A' LIMIT 1),
--         'Ahmad Fahim',
--         'Mathematics',
--         3,
--         'monday',
--         '08:30:00',
--         '10:30:00'
--     ),
--     (
--         (SELECT id FROM classes WHERE name = 'ARCH-101-A' LIMIT 1),
--         'Sara Ahmadi',
--         'Physics',
--         3,
--         'monday',
--         '10:45:00',
--         '12:45:00'
--     );

-- Example 3: Three teachers, 2 periods each
-- INSERT INTO schedule_entries (class_id, teacher_name, subject, hours, day_of_week, start_time, end_time)
-- VALUES 
--     (
--         (SELECT id FROM classes WHERE name = 'CS-201-A' LIMIT 1),
--         'Teacher A',
--         'Programming',
--         2,
--         'tuesday',
--         '08:30:00',
--         '09:50:00'
--     ),
--     (
--         (SELECT id FROM classes WHERE name = 'CS-201-A' LIMIT 1),
--         'Teacher B',
--         'Data Structures',
--         2,
--         'tuesday',
--         '09:50:00',
--         '11:25:00'
--     ),
--     (
--         (SELECT id FROM classes WHERE name = 'CS-201-A' LIMIT 1),
--         'Teacher C',
--         'Algorithms',
--         2,
--         'tuesday',
--         '11:25:00',
--         '12:45:00'
--     );
