-- ================================================
-- Fix: Change teacher_id from UUID to TEXT
-- Run this if you already have the teachers table
-- ================================================

-- Step 1: Drop the existing foreign key constraint (if exists)
DO $$ 
BEGIN
    -- Drop foreign key constraint
    ALTER TABLE schedule_entries 
    DROP CONSTRAINT IF EXISTS schedule_entries_teacher_id_fkey;
EXCEPTION
    WHEN undefined_table THEN NULL;
    WHEN undefined_column THEN NULL;
END $$;

-- Step 2: Change teacher_id column type from UUID to TEXT
DO $$ 
BEGIN
    -- Check if column exists and is UUID type
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'schedule_entries' 
        AND column_name = 'teacher_id'
        AND data_type = 'uuid'
    ) THEN
        -- Change the column type
        ALTER TABLE schedule_entries 
        ALTER COLUMN teacher_id TYPE TEXT USING teacher_id::TEXT;
        
        RAISE NOTICE 'Changed teacher_id column from UUID to TEXT';
    END IF;
    
    -- If column doesn't exist, create it as TEXT
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'schedule_entries' 
        AND column_name = 'teacher_id'
    ) THEN
        ALTER TABLE schedule_entries 
        ADD COLUMN teacher_id TEXT;
        
        RAISE NOTICE 'Created teacher_id column as TEXT';
    END IF;
END $$;

-- Step 3: Re-add the foreign key constraint
DO $$ 
BEGIN
    -- Check if teachers table exists
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'teachers'
    ) THEN
        ALTER TABLE schedule_entries 
        ADD CONSTRAINT schedule_entries_teacher_id_fkey 
        FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL;
        
        RAISE NOTICE 'Added foreign key constraint';
    END IF;
EXCEPTION
    WHEN duplicate_object THEN 
        RAISE NOTICE 'Foreign key constraint already exists';
END $$;

-- Step 4: Verify the change
DO $$ 
DECLARE
    col_type TEXT;
BEGIN
    SELECT data_type INTO col_type
    FROM information_schema.columns 
    WHERE table_name = 'schedule_entries' 
    AND column_name = 'teacher_id';
    
    IF col_type = 'text' THEN
        RAISE NOTICE '✓ teacher_id column is now TEXT type';
    ELSE
        RAISE WARNING '✗ teacher_id column is still % type', col_type;
    END IF;
END $$;
