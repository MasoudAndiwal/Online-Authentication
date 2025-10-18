-- ================================================
-- Schedule Management System - Database Schema
-- ================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- Table: classes
-- Stores class information (Class A, B, C, etc.)
-- ================================================
CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    session VARCHAR(20) NOT NULL CHECK (session IN ('MORNING', 'AFTERNOON')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Constraints
    CONSTRAINT unique_class_session UNIQUE (name, session)
);

-- ================================================
-- Table: schedule_entries
-- Stores individual schedule entries for each class
-- ================================================
CREATE TABLE IF NOT EXISTS schedule_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    teacher_name VARCHAR(200) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    hours INTEGER NOT NULL CHECK (hours >= 1 AND hours <= 8),
    day_of_week VARCHAR(20) NOT NULL CHECK (day_of_week IN ('saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday')),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- ================================================
-- Indexes for better query performance
-- ================================================
CREATE INDEX idx_classes_session ON classes(session);
CREATE INDEX idx_classes_created_at ON classes(created_at DESC);
CREATE INDEX idx_schedule_entries_class_id ON schedule_entries(class_id);
CREATE INDEX idx_schedule_entries_day ON schedule_entries(day_of_week);
CREATE INDEX idx_schedule_entries_time ON schedule_entries(start_time, end_time);


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

CREATE TRIGGER update_classes_updated_at
    BEFORE UPDATE ON classes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedule_entries_updated_at
    BEFORE UPDATE ON schedule_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- Sample Data (Optional - for testing)
-- ================================================
-- Uncomment if you want to insert sample data

/*
-- Insert sample classes
INSERT INTO classes (name, session) VALUES
    ('Class A', 'MORNING'),
    ('Class A', 'AFTERNOON'),
    ('Class B', 'MORNING'),
    ('Class B', 'AFTERNOON'),
    ('Class C', 'MORNING'),
    ('Class C', 'AFTERNOON');

-- Insert sample schedule entries for Class A Morning
INSERT INTO schedule_entries (class_id, teacher_name, subject, hours, day_of_week, start_time, end_time)
SELECT 
    id,
    'Prof. Ahmad',
    'Mathematics',
    2,
    'saturday',
    '08:00:00',
    '10:00:00'
FROM classes WHERE name = 'Class A' AND session = 'MORNING';
*/

-- ================================================
-- Views for easier querying
-- ================================================

-- View: Complete class schedule with all entries
CREATE OR REPLACE VIEW v_class_schedules AS
SELECT 
    c.id as class_id,
    c.name as class_name,
    c.session,
    c.created_at as class_created_at,
    se.id as entry_id,
    se.teacher_name,
    se.subject,
    se.hours,
    se.day_of_week,
    se.start_time,
    se.end_time,
    se.created_at as entry_created_at
FROM classes c
LEFT JOIN schedule_entries se ON c.id = se.class_id
ORDER BY c.name, c.session, se.day_of_week, se.start_time;

-- View: Classes with entry count
CREATE OR REPLACE VIEW v_classes_summary AS
SELECT 
    c.id,
    c.name,
    c.session,
    c.created_at,
    COUNT(se.id) as total_entries,
    COUNT(DISTINCT se.teacher_name) as unique_teachers,
    COUNT(DISTINCT se.subject) as unique_subjects
FROM classes c
LEFT JOIN schedule_entries se ON c.id = se.class_id
GROUP BY c.id, c.name, c.session, c.created_at
ORDER BY c.name, c.session;
