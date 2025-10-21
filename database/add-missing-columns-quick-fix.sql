-- ================================================
-- QUICK FIX: Add missing columns to existing classes table
-- ================================================
-- Run this in Supabase SQL Editor to fix the "column does not exist" error

-- Add missing columns
ALTER TABLE classes 
ADD COLUMN IF NOT EXISTS major VARCHAR(100),
ADD COLUMN IF NOT EXISTS semester INTEGER DEFAULT 1 CHECK (semester >= 1 AND semester <= 8),
ADD COLUMN IF NOT EXISTS student_count INTEGER DEFAULT 0 CHECK (student_count >= 0);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_classes_major ON classes(major);
CREATE INDEX IF NOT EXISTS idx_classes_semester ON classes(semester);

-- Verify the columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'classes' 
ORDER BY ordinal_position;
