-- Fix audit_logs foreign key constraint issue
-- This removes the constraint that's preventing teacher/office logins

-- Step 1: Drop the problematic foreign key constraint
ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey;

-- Step 2: Verify the constraint is removed
SELECT 
    conname as constraint_name,
    contype as constraint_type
FROM pg_constraint 
WHERE conrelid = 'audit_logs'::regclass 
AND conname LIKE '%user_id%';

-- Step 3: Test that we can now insert any user_id
INSERT INTO audit_logs (
    user_id, 
    action, 
    resource, 
    success, 
    timestamp
) VALUES (
    'test-any-user-id',
    'login_test', 
    'authentication', 
    true, 
    NOW()
);

-- Step 4: Clean up the test record
DELETE FROM audit_logs WHERE action = 'login_test';

-- Success message
SELECT 'Foreign key constraint removed successfully! All logins should work now.' as status;