-- Disable RLS temporarily for development (Option 1 - Quick Fix)
ALTER TABLE students DISABLE ROW LEVEL SECURITY;
ALTER TABLE teachers DISABLE ROW LEVEL SECURITY;
ALTER TABLE office_staff DISABLE ROW LEVEL SECURITY;

-- OR enable policies that allow all operations (Option 2 - Better for development)
-- First enable RLS
-- ALTER TABLE students ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE office_staff ENABLE ROW LEVEL SECURITY;

-- Then create permissive policies for development
-- CREATE POLICY "Allow all operations on students" ON students
-- FOR ALL
-- TO anon, authenticated
-- USING (true)
-- WITH CHECK (true);

-- CREATE POLICY "Allow all operations on teachers" ON teachers
-- FOR ALL
-- TO anon, authenticated
-- USING (true)
-- WITH CHECK (true);

-- CREATE POLICY "Allow all operations on office_staff" ON office_staff
-- FOR ALL
-- TO anon, authenticated
-- USING (true)
-- WITH CHECK (true);
