-- Insert a sample office staff user for testing
-- Username: admin.test
-- Password: Admin123456 (plain text - will be hashed below)

-- Note: This uses crypt() function from pgcrypto extension
-- The password 'Admin123456' is hashed using bcrypt

INSERT INTO office_staff (
    id,
    first_name,
    last_name,
    email,
    phone,
    username,
    password,
    role,
    supabase_user_id,
    is_active,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid()::text,
    'Admin',
    'User',
    'admin.test@university.edu',
    '+1234567891',
    'Masoudandiwal321',
    crypt('Admin123456', gen_salt('bf')),  -- Bcrypt hash of 'Admin123456'
    'ADMIN',
    gen_random_uuid()::text,
    true,
    NOW(),
    NOW()
);

-- Verify the insert
SELECT 
    id,
    first_name,
    last_name,
    username,
    email,
    role,
    is_active
FROM office_staff 
WHERE username = 'admin.test';

-- ==========================
-- LOGIN CREDENTIALS FOR TESTING:
-- ==========================
-- Username: Masoudandiwal321
-- Password: Admin123456
-- ==========================
