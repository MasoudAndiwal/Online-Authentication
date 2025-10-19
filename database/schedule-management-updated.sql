-- ================================================
-- Schedule Management System - Database Schema (UPDATED)
-- ================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- Table: teachers
-- Stores teacher information and their subjects
-- ================================================
-- Teacher status enum
CREATE TYPE teacher_status AS ENUM ('ACTIVE', 'INACTIVE', 'ON_LEAVE');

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
-- Table: schedule_entries (UPDATED with teacher_id)
-- Stores individual schedule entries for each class
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
-- Indexes for better query performance
-- ================================================
-- Teachers indexes
CREATE INDEX IF NOT EXISTS idx_teachers_name ON teachers (first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_teachers_teacher_id ON teachers (teacher_id);
CREATE INDEX IF NOT EXISTS idx_teachers_departments_gin ON teachers USING GIN (departments);
CREATE INDEX IF NOT EXISTS idx_teachers_subjects_gin ON teachers USING GIN (subjects);
CREATE INDEX IF NOT EXISTS idx_teachers_classes_gin ON teachers USING GIN (classes);
CREATE INDEX IF NOT EXISTS idx_teachers_status ON teachers (status);
CREATE INDEX IF NOT EXISTS idx_teachers_created_at ON teachers (created_at);
CREATE INDEX IF NOT EXISTS idx_teachers_username ON teachers (username);

-- Classes indexes
CREATE INDEX idx_classes_session ON classes(session);
CREATE INDEX idx_classes_created_at ON classes(created_at DESC);

-- Schedule entries indexes
CREATE INDEX idx_schedule_entries_class_id ON schedule_entries(class_id);
CREATE INDEX idx_schedule_entries_teacher_id ON schedule_entries(teacher_id);
CREATE INDEX idx_schedule_entries_day ON schedule_entries(day_of_week);
CREATE INDEX idx_schedule_entries_time ON schedule_entries(start_time, end_time);

-- ================================================
-- Trigger: Update updated_at timestamp
-- ================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_teachers_set_updated_at
    BEFORE UPDATE ON teachers
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_classes_set_updated_at
    BEFORE UPDATE ON classes
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_schedule_entries_set_updated_at
    BEFORE UPDATE ON schedule_entries
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- ================================================
-- Sample Teachers Data
-- ================================================
INSERT INTO teachers (
    first_name, 
    last_name, 
    father_name, 
    grandfather_name, 
    teacher_id, 
    phone, 
    address, 
    departments, 
    qualification, 
    experience, 
    specialization, 
    subjects, 
    classes, 
    username, 
    password, 
    status
) VALUES
    ('Ahmad', 'Karimi', 'Mohammad', 'Hassan', 'TCH001', '+93701234567', 'Kabul, Afghanistan', 
     ARRAY['Science'], 'PhD in Mathematics', '10 years', 'Mathematics', 
     ARRAY['Mathematics', 'Algebra', 'Calculus'], ARRAY[]::text[], 'ahmad.karimi', '$2a$10$hashedpassword1', 'ACTIVE'),
    
    ('Karimi', 'Ahmadi', 'Ali', 'Omar', 'TCH002', '+93701234568', 'Kabul, Afghanistan',
     ARRAY['Science'], 'PhD in Physics', '8 years', 'Physics',
     ARRAY['Physics', 'Mechanics'], ARRAY[]::text[], 'karimi.ahmadi', '$2a$10$hashedpassword2', 'ACTIVE'),
    
    ('Rahimi', 'Mohammadi', 'Hussain', 'Abdullah', 'TCH003', '+93701234569', 'Herat, Afghanistan',
     ARRAY['Science'], 'MSc in Chemistry', '6 years', 'Chemistry',
     ARRAY['Chemistry', 'Organic Chemistry'], ARRAY[]::text[], 'rahimi.mohammadi', '$2a$10$hashedpassword3', 'ACTIVE'),
    
    ('Hassan', 'Nazari', 'Mahmood', 'Rahmat', 'TCH004', '+93701234570', 'Mazar-i-Sharif, Afghanistan',
     ARRAY['Science'], 'MSc in Biology', '5 years', 'Biology',
     ARRAY['Biology', 'Zoology'], ARRAY[]::text[], 'hassan.nazari', '$2a$10$hashedpassword4', 'ACTIVE'),
    
    ('Naseri', 'Hakimi', 'Jawad', 'Karim', 'TCH005', '+93701234571', 'Kabul, Afghanistan',
     ARRAY['Languages'], 'MA in English Literature', '7 years', 'English Language',
     ARRAY['English', 'Literature'], ARRAY[]::text[], 'naseri.hakimi', '$2a$10$hashedpassword5', 'ACTIVE'),
    
    ('Mohammadi', 'Safi', 'Aziz', 'Noor', 'TCH006', '+93701234572', 'Kabul, Afghanistan',
     ARRAY['Technology'], 'MSc in Computer Science', '9 years', 'Computer Science',
     ARRAY['Computer Science', 'Programming'], ARRAY[]::text[], 'mohammadi.safi', '$2a$10$hashedpassword6', 'ACTIVE'),
    
    ('Akbari', 'Popal', 'Farooq', 'Wahid', 'TCH007', '+93701234573', 'Kandahar, Afghanistan',
     ARRAY['Social Sciences'], 'MA in History', '12 years', 'History',
     ARRAY['History', 'Geography'], ARRAY[]::text[], 'akbari.popal', '$2a$10$hashedpassword7', 'ACTIVE'),
    
    ('Faizi', 'Ahmadzai', 'Rahim', 'Ismail', 'TCH008', '+93701234574', 'Kabul, Afghanistan',
     ARRAY['Languages'], 'MA in Persian Literature', '11 years', 'Local Languages',
     ARRAY['Dari', 'Pashto'], ARRAY[]::text[], 'faizi.ahmadzai', '$2a$10$hashedpassword8', 'ACTIVE')
ON CONFLICT (teacher_id) DO NOTHING;

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

-- View: Teacher schedule conflicts
CREATE OR REPLACE VIEW v_teacher_conflicts AS
SELECT 
    se1.teacher_id,
    se1.teacher_name,
    se1.day_of_week,
    se1.start_time,
    se1.end_time,
    se1.subject as subject1,
    c1.name as class1,
    se2.subject as subject2,
    c2.name as class2
FROM schedule_entries se1
JOIN schedule_entries se2 ON 
    se1.teacher_id = se2.teacher_id 
    AND se1.day_of_week = se2.day_of_week
    AND se1.id < se2.id
    AND (
        (se1.start_time < se2.end_time AND se1.end_time > se2.start_time)
    )
JOIN classes c1 ON se1.class_id = c1.id
JOIN classes c2 ON se2.class_id = c2.id
ORDER BY se1.teacher_name, se1.day_of_week, se1.start_time;

-- ================================================
-- Row Level Security (RLS) Policies
-- ================================================

-- Enable RLS on all tables
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_entries ENABLE ROW LEVEL SECURITY;

-- Teachers table policies
CREATE POLICY "Allow authenticated users to view teachers"
    ON teachers FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow OFFICE role to manage teachers"
    ON teachers FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' = 'OFFICE'
        )
    );

-- Classes table policies
CREATE POLICY "Allow authenticated users to view classes"
    ON classes FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow OFFICE role to manage classes"
    ON classes FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' = 'OFFICE'
        )
    );

-- Schedule entries policies
CREATE POLICY "Allow authenticated users to view schedule entries"
    ON schedule_entries FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow OFFICE role to manage schedule entries"
    ON schedule_entries FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' = 'OFFICE'
        )
    );
