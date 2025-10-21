-- ================================================
-- SIMPLE SAMPLE CLASSES - Quick Start
-- ================================================
-- Just 20 essential classes for quick testing
-- Perfect for initial setup and demo
-- ================================================

INSERT INTO classes (name, session, major, semester, student_count) VALUES
    -- Computer Science
    ('CS-101', 'MORNING', 'Computer Science', 1, 45),
    ('CS-102', 'AFTERNOON', 'Computer Science', 2, 40),
    ('CS-201', 'MORNING', 'Computer Science', 3, 35),
    ('CS-202', 'AFTERNOON', 'Computer Science', 4, 30),
    
    -- Database
    ('Database-101', 'MORNING', 'Database Management', 2, 38),
    ('Database-201', 'AFTERNOON', 'Database Management', 3, 32),
    
    -- Network
    ('Network-101', 'MORNING', 'Network Engineering', 2, 36),
    ('Network-201', 'AFTERNOON', 'Network Engineering', 3, 30),
    
    -- Software Engineering
    ('SE-101', 'MORNING', 'Software Engineering', 2, 42),
    ('SE-201', 'AFTERNOON', 'Software Engineering', 3, 38),
    
    -- Web Development
    ('Web-101', 'MORNING', 'Web Development', 2, 40),
    ('Web-201', 'AFTERNOON', 'Web Development', 3, 35),
    
    -- Electrical Engineering
    ('EE-101', 'MORNING', 'Electrical Engineering', 1, 48),
    ('EE-201', 'AFTERNOON', 'Electrical Engineering', 2, 44),
    
    -- Civil Engineering
    ('CE-101', 'MORNING', 'Civil Engineering', 1, 50),
    ('CE-201', 'AFTERNOON', 'Civil Engineering', 2, 46),
    
    -- Mechanical Engineering
    ('ME-101', 'MORNING', 'Mechanical Engineering', 1, 47),
    ('ME-201', 'AFTERNOON', 'Mechanical Engineering', 2, 43),
    
    -- General
    ('Math-101', 'MORNING', 'Mathematics', 1, 55),
    ('Physics-101', 'AFTERNOON', 'Physics', 1, 52)

ON CONFLICT (name, session) DO UPDATE SET
    major = EXCLUDED.major,
    semester = EXCLUDED.semester,
    student_count = EXCLUDED.student_count;

-- Quick check
SELECT * FROM classes ORDER BY major, semester;
