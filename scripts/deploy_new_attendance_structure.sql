-- ================================================
-- DEPLOY NEW ATTENDANCE STRUCTURE
-- ================================================
-- Step-by-step deployment of the new attendance structure
-- Run each section separately to ensure safety
-- ================================================

-- STEP 1: Create the new table structure
CREATE TABLE IF NOT EXISTS attendance_records_new (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id VARCHAR NOT NULL,
    class_id UUID NOT NULL,
    date DATE NOT NULL,
    
    -- 6 Period statuses
    period_1_status VARCHAR(20) DEFAULT 'NOT_MARKED',
    period_2_status VARCHAR(20) DEFAULT 'NOT_MARKED',
    period_3_status VARCHAR(20) DEFAULT 'NOT_MARKED',
    period_4_status VARCHAR(20) DEFAULT 'NOT_MARKED',
    period_5_status VARCHAR(20) DEFAULT 'NOT_MARKED',
    period_6_status VARCHAR(20) DEFAULT 'NOT_MARKED',
    
    -- 6 Period teacher names
    period_1_teacher VARCHAR(255),
    period_2_teacher VARCHAR(255),
    period_3_teacher VARCHAR(255),
    period_4_teacher VARCHAR(255),
    period_5_teacher VARCHAR(255),
    period_6_teacher VARCHAR(255),
    
    -- 6 Period subjects
    period_1_subject VARCHAR(255),
    period_2_subject VARCHAR(255),
    period_3_subject VARCHAR(255),
    period_4_subject VARCHAR(255),
    period_5_subject VARCHAR(255),
    period_6_subject VARCHAR(255),
    
    -- Metadata
    marked_by VARCHAR,
    marked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    
    -- Constraints
    UNIQUE(student_id, class_id, date)
);

-- STEP 2: Create indexes
CREATE INDEX IF NOT EXISTS idx_attendance_new_student_date ON attendance_records_new(student_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_new_class_date ON attendance_records_new(class_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_new_date ON attendance_records_new(date);

-- STEP 3: Migrate existing data
INSERT INTO attendance_records_new (
    student_id, class_id, date,
    period_1_status, period_2_status, period_3_status, 
    period_4_status, period_5_status, period_6_status,
    period_1_teacher, period_2_teacher, period_3_teacher,
    period_4_teacher, period_5_teacher, period_6_teacher,
    period_1_subject, period_2_subject, period_3_subject,
    period_4_subject, period_5_subject, period_6_subject,
    marked_by, marked_at, notes
)
SELECT 
    student_id, class_id, date,
    -- Aggregate statuses by period
    COALESCE(MAX(CASE WHEN period_number = 1 THEN status END), 'NOT_MARKED'),
    COALESCE(MAX(CASE WHEN period_number = 2 THEN status END), 'NOT_MARKED'),
    COALESCE(MAX(CASE WHEN period_number = 3 THEN status END), 'NOT_MARKED'),
    COALESCE(MAX(CASE WHEN period_number = 4 THEN status END), 'NOT_MARKED'),
    COALESCE(MAX(CASE WHEN period_number = 5 THEN status END), 'NOT_MARKED'),
    COALESCE(MAX(CASE WHEN period_number = 6 THEN status END), 'NOT_MARKED'),
    -- Aggregate teachers by period
    MAX(CASE WHEN period_number = 1 THEN teacher_name END),
    MAX(CASE WHEN period_number = 2 THEN teacher_name END),
    MAX(CASE WHEN period_number = 3 THEN teacher_name END),
    MAX(CASE WHEN period_number = 4 THEN teacher_name END),
    MAX(CASE WHEN period_number = 5 THEN teacher_name END),
    MAX(CASE WHEN period_number = 6 THEN teacher_name END),
    -- Aggregate subjects by period
    MAX(CASE WHEN period_number = 1 THEN subject END),
    MAX(CASE WHEN period_number = 2 THEN subject END),
    MAX(CASE WHEN period_number = 3 THEN subject END),
    MAX(CASE WHEN period_number = 4 THEN subject END),
    MAX(CASE WHEN period_number = 5 THEN subject END),
    MAX(CASE WHEN period_number = 6 THEN subject END),
    -- Metadata
    MAX(marked_by),
    MAX(marked_at),
    MAX(notes)
FROM attendance_records
GROUP BY student_id, class_id, date
ON CONFLICT (student_id, class_id, date) DO NOTHING;

-- STEP 4: Verify migration (run this to check results)
SELECT 
    'Original table' as source,
    COUNT(*) as total_records,
    COUNT(DISTINCT student_id || '-' || class_id || '-' || date) as unique_combinations
FROM attendance_records
UNION ALL
SELECT 
    'New table' as source,
    COUNT(*) as total_records,
    COUNT(DISTINCT student_id || '-' || class_id || '-' || date) as unique_combinations
FROM attendance_records_new;

-- STEP 5: Show sample data from new table
SELECT 
    student_id,
    class_id,
    date,
    period_1_status, period_2_status, period_3_status,
    period_4_status, period_5_status, period_6_status,
    period_1_teacher, period_2_teacher
FROM attendance_records_new
LIMIT 3;

-- STEP 6: When ready to deploy (UNCOMMENT THESE LINES):
-- BEGIN;
-- ALTER TABLE attendance_records RENAME TO attendance_records_backup;
-- ALTER TABLE attendance_records_new RENAME TO attendance_records;
-- COMMIT;

-- STEP 7: After successful deployment, you can drop the backup:
-- DROP TABLE attendance_records_backup;