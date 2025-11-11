-- ================================================
-- UPDATE ATTENDANCE TABLE SCHEMA
-- ================================================
-- This script updates the attendance_records table to store
-- 6 periods in a single record instead of 6 separate records
-- ================================================

-- Current table structure confirmed:
-- id (uuid), class_id (uuid), date (date), period_number (integer), 
-- marked_at (timestamp), created_at (timestamp), updated_at (timestamp),
-- student_id (varchar), subject (varchar), notes (text), 
-- marked_by (varchar), status (varchar), teacher_name (varchar)

-- Create new table structure with 6 period columns
CREATE TABLE IF NOT EXISTS attendance_records_new (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id VARCHAR NOT NULL,  -- Matching existing structure
    class_id UUID NOT NULL,
    date DATE NOT NULL,
    
    -- 6 Period statuses
    period_1_status VARCHAR(20) DEFAULT 'NOT_MARKED',
    period_2_status VARCHAR(20) DEFAULT 'NOT_MARKED',
    period_3_status VARCHAR(20) DEFAULT 'NOT_MARKED',
    period_4_status VARCHAR(20) DEFAULT 'NOT_MARKED',
    period_5_status VARCHAR(20) DEFAULT 'NOT_MARKED',
    period_6_status VARCHAR(20) DEFAULT 'NOT_MARKED',
    
    -- 6 Period teacher names (optional)
    period_1_teacher VARCHAR(255),
    period_2_teacher VARCHAR(255),
    period_3_teacher VARCHAR(255),
    period_4_teacher VARCHAR(255),
    period_5_teacher VARCHAR(255),
    period_6_teacher VARCHAR(255),
    
    -- 6 Period subjects (optional)
    period_1_subject VARCHAR(255),
    period_2_subject VARCHAR(255),
    period_3_subject VARCHAR(255),
    period_4_subject VARCHAR(255),
    period_5_subject VARCHAR(255),
    period_6_subject VARCHAR(255),
    
    -- Metadata (matching existing structure)
    marked_by VARCHAR,
    marked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    
    -- Constraints
    UNIQUE(student_id, class_id, date),
    
    -- Check constraints for valid statuses
    CONSTRAINT valid_period_1_status CHECK (period_1_status IN ('PRESENT', 'ABSENT', 'SICK', 'LEAVE', 'NOT_MARKED')),
    CONSTRAINT valid_period_2_status CHECK (period_2_status IN ('PRESENT', 'ABSENT', 'SICK', 'LEAVE', 'NOT_MARKED')),
    CONSTRAINT valid_period_3_status CHECK (period_3_status IN ('PRESENT', 'ABSENT', 'SICK', 'LEAVE', 'NOT_MARKED')),
    CONSTRAINT valid_period_4_status CHECK (period_4_status IN ('PRESENT', 'ABSENT', 'SICK', 'LEAVE', 'NOT_MARKED')),
    CONSTRAINT valid_period_5_status CHECK (period_5_status IN ('PRESENT', 'ABSENT', 'SICK', 'LEAVE', 'NOT_MARKED')),
    CONSTRAINT valid_period_6_status CHECK (period_6_status IN ('PRESENT', 'ABSENT', 'SICK', 'LEAVE', 'NOT_MARKED'))
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_attendance_records_new_student_date ON attendance_records_new(student_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_records_new_class_date ON attendance_records_new(class_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_records_new_date ON attendance_records_new(date);

-- Migrate existing data from old structure to new structure
-- This will group the 6 period records into 1 record per student per day
INSERT INTO attendance_records_new (
    student_id, 
    class_id, 
    date,
    period_1_status, period_2_status, period_3_status, 
    period_4_status, period_5_status, period_6_status,
    period_1_teacher, period_2_teacher, period_3_teacher,
    period_4_teacher, period_5_teacher, period_6_teacher,
    period_1_subject, period_2_subject, period_3_subject,
    period_4_subject, period_5_subject, period_6_subject,
    marked_by,
    marked_at
)
SELECT 
    student_id,
    class_id,
    date,
    -- Aggregate period statuses
    MAX(CASE WHEN period_number = 1 THEN status ELSE 'NOT_MARKED' END) as period_1_status,
    MAX(CASE WHEN period_number = 2 THEN status ELSE 'NOT_MARKED' END) as period_2_status,
    MAX(CASE WHEN period_number = 3 THEN status ELSE 'NOT_MARKED' END) as period_3_status,
    MAX(CASE WHEN period_number = 4 THEN status ELSE 'NOT_MARKED' END) as period_4_status,
    MAX(CASE WHEN period_number = 5 THEN status ELSE 'NOT_MARKED' END) as period_5_status,
    MAX(CASE WHEN period_number = 6 THEN status ELSE 'NOT_MARKED' END) as period_6_status,
    -- Aggregate teacher names
    MAX(CASE WHEN period_number = 1 THEN teacher_name END) as period_1_teacher,
    MAX(CASE WHEN period_number = 2 THEN teacher_name END) as period_2_teacher,
    MAX(CASE WHEN period_number = 3 THEN teacher_name END) as period_3_teacher,
    MAX(CASE WHEN period_number = 4 THEN teacher_name END) as period_4_teacher,
    MAX(CASE WHEN period_number = 5 THEN teacher_name END) as period_5_teacher,
    MAX(CASE WHEN period_number = 6 THEN teacher_name END) as period_6_teacher,
    -- Aggregate subjects
    MAX(CASE WHEN period_number = 1 THEN subject END) as period_1_subject,
    MAX(CASE WHEN period_number = 2 THEN subject END) as period_2_subject,
    MAX(CASE WHEN period_number = 3 THEN subject END) as period_3_subject,
    MAX(CASE WHEN period_number = 4 THEN subject END) as period_4_subject,
    MAX(CASE WHEN period_number = 5 THEN subject END) as period_5_subject,
    MAX(CASE WHEN period_number = 6 THEN subject END) as period_6_subject,
    -- Metadata
    MAX(marked_by) as marked_by,
    MAX(marked_at) as marked_at
FROM attendance_records
WHERE period_number BETWEEN 1 AND 6
GROUP BY student_id, class_id, date
ON CONFLICT (student_id, class_id, date) DO NOTHING;

-- Backup old table and replace with new one
-- (Uncomment these lines when ready to deploy)
-- ALTER TABLE attendance_records RENAME TO attendance_records_backup;
-- ALTER TABLE attendance_records_new RENAME TO attendance_records;

-- Verify the migration
SELECT 
    'Old structure' as table_type,
    COUNT(*) as total_records,
    COUNT(DISTINCT student_id || '-' || class_id || '-' || date) as unique_student_days
FROM attendance_records
UNION ALL
SELECT 
    'New structure' as table_type,
    COUNT(*) as total_records,
    COUNT(DISTINCT student_id || '-' || class_id || '-' || date) as unique_student_days
FROM attendance_records_new;

-- Show sample of new structure
SELECT 
    student_id,
    class_id,
    date,
    period_1_status, period_2_status, period_3_status,
    period_4_status, period_5_status, period_6_status
FROM attendance_records_new
LIMIT 5;