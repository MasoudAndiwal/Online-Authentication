-- Add username and password fields to office_staff table for authentication
ALTER TABLE office_staff 
ADD COLUMN IF NOT EXISTS username VARCHAR(30) UNIQUE,
ADD COLUMN IF NOT EXISTS password VARCHAR(255);

-- Create index for username lookups
CREATE INDEX IF NOT EXISTS idx_office_username ON office_staff (username);

-- Update existing records to set a default username (optional - you may want to set these manually)
-- UPDATE office_staff SET username = LOWER(CONCAT(first_name, '.', last_name)) WHERE username IS NULL;

-- Note: You'll need to set passwords for existing office staff members manually
-- or run a script to set them using bcrypt hashing
