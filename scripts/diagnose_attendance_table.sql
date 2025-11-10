-- ================================================
-- Diagnostic Script for Attendance Records Table
-- Run this to see the actual table structure
-- ================================================

-- Check if table exists
SELECT 
    EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'attendance_records'
    ) as table_exists;

-- Show all columns in the table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'attendance_records'
ORDER BY ordinal_position;

-- Show all indexes
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'attendance_records';

-- Show constraints
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'attendance_records'::regclass;

-- Count existing records
SELECT COUNT(*) as total_records FROM attendance_records;

-- Show sample data (if any)
SELECT * FROM attendance_records LIMIT 5;
