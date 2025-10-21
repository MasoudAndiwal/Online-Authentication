-- ================================================
-- COMPLETE DATABASE SETUP FOR ALL CLASSES PAGE
-- ================================================
-- This is a standalone script that creates all necessary tables
-- Run this directly in Supabase SQL Editor
-- ================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- ENUMS
-- ================================================
DO $$ BEGIN
    CREATE TYPE teacher_status AS ENUM ('ACTIVE', 'INACTIVE', 'ON_LEAVE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ================================================
-- TABLE: classes
-- Stores class information (Class A, B, C, etc.)
-- Required fields for All Classes page:
-- - id, name, session (required)
-- - major, semester, student_count (optional, for enhanced display)
-- ================================================
CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    session VARCHAR(20) NOT NULL CHECK (session IN ('MORNING', 'AFTERNOON')),
    major VARCHAR(100),
    semester INTEGER DEFAULT 1 CHECK (semester >= 1 AND semester <= 8),
    student_count INTEGER DEFAULT 0 CHECK (student_count >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    
    -- Constraints
    CONSTRAINT unique_class_session UNIQUE (name, session)
);

-- ================================================
-- TABLE: teachers (for schedule_entries foreign key)
-- ================================================
CREATE TABLE IF NOT EXISTS teachers (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    father_name VARCHAR(70) NOT NULL,
    grandfather_name VARCHAR(70) NOT NULL,
    teacher_id VARCHAR(20) NOT NULL UNIQUE,
    date_of_birth TIMESTAMPTZ,
    phone VARCHAR(20) NOT NULL UNIQUE,
    secondary_phone VARCHAR(20),
    address TEXT NOT NULL,
    departments TEXT[] NOT NULL DEFAULT ARRAY[]::text[],
    qualification VARCHAR(100) NOT NULL,
    experience VARCHAR(50) NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    subjects TEXT[] NOT NULL DEFAULT ARRAY[]::text[],
    classes TEXT[] NOT NULL DEFAULT ARRAY[]::text[],
    username VARCHAR(30) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    status teacher_status NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================================
-- TABLE: schedule_entries
-- Stores schedule entries for each class
-- Used to compute scheduleCount in All Classes page
-- ================================================
CREATE TABLE IF NOT EXISTS schedule_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    teacher_id TEXT REFERENCES teachers(id) ON DELETE SET NULL,
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
-- INDEXES for performance
-- ================================================
-- Classes indexes
CREATE INDEX IF NOT EXISTS idx_classes_name ON classes(name);
CREATE INDEX IF NOT EXISTS idx_classes_session ON classes(session);
CREATE INDEX IF NOT EXISTS idx_classes_major ON classes(major);
CREATE INDEX IF NOT EXISTS idx_classes_semester ON classes(semester);
CREATE INDEX IF NOT EXISTS idx_classes_created_at ON classes(created_at DESC);

-- Schedule entries indexes
CREATE INDEX IF NOT EXISTS idx_schedule_entries_class_id ON schedule_entries(class_id);
CREATE INDEX IF NOT EXISTS idx_schedule_entries_teacher_id ON schedule_entries(teacher_id);
CREATE INDEX IF NOT EXISTS idx_schedule_entries_day ON schedule_entries(day_of_week);
CREATE INDEX IF NOT EXISTS idx_schedule_entries_time ON schedule_entries(start_time, end_time);

-- Teachers indexes
CREATE INDEX IF NOT EXISTS idx_teachers_name ON teachers (first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_teachers_teacher_id ON teachers (teacher_id);
CREATE INDEX IF NOT EXISTS idx_teachers_status ON teachers (status);

-- ================================================
-- TRIGGERS: Auto-update updated_at timestamp
-- ================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers to avoid conflicts
DROP TRIGGER IF EXISTS trg_classes_set_updated_at ON classes;
DROP TRIGGER IF EXISTS trg_schedule_entries_set_updated_at ON schedule_entries;
DROP TRIGGER IF EXISTS trg_teachers_set_updated_at ON teachers;

CREATE TRIGGER trg_classes_set_updated_at
    BEFORE UPDATE ON classes
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_schedule_entries_set_updated_at
    BEFORE UPDATE ON schedule_entries
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_teachers_set_updated_at
    BEFORE UPDATE ON teachers
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- ================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================
-- Enable RLS
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated users to view classes" ON classes;
DROP POLICY IF EXISTS "Allow OFFICE role to manage classes" ON classes;
DROP POLICY IF EXISTS "Allow authenticated users to view schedule entries" ON schedule_entries;
DROP POLICY IF EXISTS "Allow OFFICE role to manage schedule entries" ON schedule_entries;
DROP POLICY IF EXISTS "Allow authenticated users to view teachers" ON teachers;
DROP POLICY IF EXISTS "Allow OFFICE role to manage teachers" ON teachers;


-- ================================================
-- VIEWS for easy querying
-- ================================================
-- Drop existing views to avoid conflicts
DROP VIEW IF EXISTS v_classes_complete;
DROP VIEW IF EXISTS v_class_schedules;

-- View: Complete class information
CREATE VIEW v_classes_complete AS
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

-- View: Class schedules with entries
CREATE VIEW v_class_schedules AS
SELECT 
    c.id as class_id,
    c.name as class_name,
    c.session,
    c.major,
    c.semester,
    se.id as entry_id,
    se.teacher_id,
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

-- ================================================
-- SAMPLE DATA (Optional - Uncomment to use)
-- ================================================
/*
-- Sample Classes
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

-- Sample Teachers (with hashed password: "password123")
INSERT INTO teachers (
    first_name, last_name, father_name, grandfather_name, teacher_id, 
    phone, address, departments, qualification, experience, specialization, 
    subjects, username, password, status
) VALUES
    ('Ahmad', 'Karimi', 'Mohammad', 'Hassan', 'TCH001', '+93701234567', 
     'Kabul, Afghanistan', ARRAY['Science'], 'PhD in Mathematics', '10 years', 
     'Mathematics', ARRAY['Mathematics', 'Algebra'], 'ahmad.karimi', 
     '$2a$10$rKCvXvbxQdGhqKx7dBvqV.Y7v3bZKZ5xW4LcWt5QZqGgU5xZ5QhKC', 'ACTIVE'),
    ('Karimi', 'Ahmadi', 'Ali', 'Omar', 'TCH002', '+93701234568', 
     'Kabul, Afghanistan', ARRAY['Science'], 'PhD in Physics', '8 years', 
     'Physics', ARRAY['Physics', 'Mechanics'], 'karimi.ahmadi', 
     '$2a$10$rKCvXvbxQdGhqKx7dBvqV.Y7v3bZKZ5xW4LcWt5QZqGgU5xZ5QhKC', 'ACTIVE')
ON CONFLICT (teacher_id) DO NOTHING;
*/

-- ================================================
-- VERIFICATION QUERIES
-- ================================================
-- Run these to verify your setup:

-- Check classes table structure
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'classes' 
-- ORDER BY ordinal_position;

-- Check all classes
-- SELECT * FROM v_classes_complete;

-- Count records
-- SELECT 
--     'classes' as table_name, COUNT(*) as count FROM classes
-- UNION ALL
-- SELECT 'schedule_entries', COUNT(*) FROM schedule_entries
-- UNION ALL
-- SELECT 'teachers', COUNT(*) FROM teachers;
