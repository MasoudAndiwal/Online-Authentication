-- ================================================
-- Migration: Add Teachers Table
-- Run this if you already have the schedule system
-- ================================================

-- Create teacher status enum
DO $$ BEGIN
    CREATE TYPE teacher_status AS ENUM ('ACTIVE', 'INACTIVE', 'ON_LEAVE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create teachers table
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

-- Add teacher_id column to schedule_entries (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'schedule_entries' 
        AND column_name = 'teacher_id'
    ) THEN
        ALTER TABLE schedule_entries 
        ADD COLUMN teacher_id TEXT REFERENCES teachers(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_teachers_name ON teachers (first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_teachers_teacher_id ON teachers (teacher_id);
CREATE INDEX IF NOT EXISTS idx_teachers_departments_gin ON teachers USING GIN (departments);
CREATE INDEX IF NOT EXISTS idx_teachers_subjects_gin ON teachers USING GIN (subjects);
CREATE INDEX IF NOT EXISTS idx_teachers_classes_gin ON teachers USING GIN (classes);
CREATE INDEX IF NOT EXISTS idx_teachers_status ON teachers (status);
CREATE INDEX IF NOT EXISTS idx_teachers_created_at ON teachers (created_at);
CREATE INDEX IF NOT EXISTS idx_teachers_username ON teachers (username);
CREATE INDEX IF NOT EXISTS idx_schedule_entries_teacher_id ON schedule_entries(teacher_id);

-- Create function for updated_at if not exists
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS trg_teachers_set_updated_at ON teachers;
CREATE TRIGGER trg_teachers_set_updated_at
    BEFORE UPDATE ON teachers
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- Enable RLS
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;

-- Add policies
DROP POLICY IF EXISTS "Allow authenticated users to view teachers" ON teachers;
CREATE POLICY "Allow authenticated users to view teachers"
    ON teachers FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow OFFICE role to manage teachers" ON teachers;
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

-- Insert sample teachers
INSERT INTO teachers (
    first_name, last_name, father_name, grandfather_name, teacher_id, phone, address,
    departments, qualification, experience, specialization, subjects, classes, username, password, status
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
