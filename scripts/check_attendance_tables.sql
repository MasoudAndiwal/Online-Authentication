-- ================================================
-- Diagnostic Script: Check Attendance Table Structure
-- Run this in your Supabase SQL Editor to diagnose issues
-- ================================================

-- Check if attendance_records table exists
SELECT 
    'attendance_records' as table_name,
    EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'attendance_records'
    ) as exists;

-- Check if attendance_records_new table exists
SELECT 
    'attendance_records_new' as table_name,
    EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'attendance_records_new'
    ) as exists;

-- Show columns in attendance_records if it exists
SELECT 
    'attendance_records columns' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'attendance_records'
ORDER BY ordinal_position;

-- Show columns in attendance_records_new if it exists
SELECT 
    'attendance_records_new columns' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'attendance_records_new'
ORDER BY ordinal_position;

-- Count records in attendance_records
SELECT 
    'attendance_records' as table_name,
    COUNT(*) as record_count
FROM attendance_records;

-- Count records in attendance_records_new (if exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'attendance_records_new'
    ) THEN
        RAISE NOTICE 'attendance_records_new exists, checking count...';
        PERFORM COUNT(*) FROM attendance_records_new;
    ELSE
        RAISE NOTICE 'attendance_records_new does not exist';
    END IF;
END $$;

-- Show sample data from attendance_records (first 5 rows)
SELECT 
    'Sample from attendance_records' as info,
    *
FROM attendance_records
LIMIT 5;
