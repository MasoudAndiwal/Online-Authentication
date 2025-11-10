-- ================================================
-- Fix Attendance Records Table Schema
-- This script ensures the table matches the API expectations
-- ================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- Step 1: Check if table exists and rename column if needed
-- ================================================
DO $$ 
BEGIN
    -- Check if table exists with old column name 'attendance_date'
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'attendance_records' 
        AND column_name = 'attendance_date'
    ) THEN
        -- Rename attendance_date to date
        ALTER TABLE attendance_records RENAME COLUMN attendance_date TO date;
        RAISE NOTICE 'Renamed column attendance_date to date';
    END IF;

    -- Check if table exists but doesn't have 'date' column at all
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'attendance_records'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'attendance_records' 
        AND column_name = 'date'
    ) THEN
        RAISE EXCEPTION 'Table exists but has neither date nor attendance_date column. Manual intervention required.';
    END IF;
END $$;

-- ================================================
-- Step 2: Create table if it doesn't exist
-- ================================================
CREATE TABLE IF NOT EXISTS attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id VARCHAR(255) NOT NULL,
    class_id VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    period_number INTEGER,
    status VARCHAR(20) NOT NULL CHECK (status IN ('PRESENT', 'ABSENT', 'SICK', 'LEAVE', 'NOT_MARKED')),
    teacher_name VARCHAR(200),
    subject VARCHAR(200),
    notes TEXT,
    marked_by VARCHAR(255),
    marked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- Step 3: Ensure unique constraint exists
-- ================================================
DO $$ 
BEGIN
    -- Drop old constraint if exists
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_student_period_date'
    ) THEN
        ALTER TABLE attendance_records DROP CONSTRAINT unique_student_period_date;
    END IF;

    -- Add new constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_attendance_record'
    ) THEN
        ALTER TABLE attendance_records 
        ADD CONSTRAINT unique_attendance_record 
        UNIQUE (student_id, class_id, date, period_number);
    END IF;
END $$;

-- ================================================
-- Step 4: Create indexes
-- ================================================
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_attendance_student_id') THEN
        CREATE INDEX idx_attendance_student_id ON attendance_records(student_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_attendance_class_id') THEN
        CREATE INDEX idx_attendance_class_id ON attendance_records(class_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_attendance_date') THEN
        CREATE INDEX idx_attendance_date ON attendance_records(date);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_attendance_class_date') THEN
        CREATE INDEX idx_attendance_class_date ON attendance_records(class_id, date);
    END IF;
END $$;

-- ================================================
-- Step 5: Create or replace trigger function
-- ================================================
CREATE OR REPLACE FUNCTION update_attendance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- Step 6: Create trigger
-- ================================================
DROP TRIGGER IF EXISTS update_attendance_records_updated_at ON attendance_records;

CREATE TRIGGER update_attendance_records_updated_at
    BEFORE UPDATE ON attendance_records
    FOR EACH ROW
    EXECUTE FUNCTION update_attendance_updated_at();

-- ================================================
-- Step 7: Create views
-- ================================================
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

-- ================================================
-- Success message
-- ================================================
DO $$ 
BEGIN
    RAISE NOTICE '✓ Attendance records table schema fixed successfully!';
    RAISE NOTICE '✓ Column name: date';
    RAISE NOTICE '✓ Indexes created';
    RAISE NOTICE '✓ Triggers created';
    RAISE NOTICE '✓ Views created';
END $$;
