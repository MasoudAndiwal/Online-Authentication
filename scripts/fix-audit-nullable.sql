-- Alternative fix: Make user_id nullable for failed attempts
-- This allows logging failed attempts with NULL user_id

-- Step 1: Drop the foreign key constraint
ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey;

-- Step 2: Allow NULL values in user_id column
ALTER TABLE audit_logs ALTER COLUMN user_id DROP NOT NULL;

-- Step 3: Add a new constraint that allows NULL or valid student IDs
-- (This is optional - you can skip this if you want full flexibility)
ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_user_id_fkey_nullable
    FOREIGN KEY (user_id) REFERENCES students(id) 
    ON DELETE SET NULL
    DEFERRABLE INITIALLY DEFERRED;

-- Test
SELECT 'user_id is now nullable - failed logins can be logged' as status;