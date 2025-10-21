-- ================================================
-- SAMPLE COLLEGE CLASSES DATA
-- ================================================
-- Insert realistic classes for different programs/majors
-- Includes Computer Science, Networking, Database, Engineering, etc.
-- ================================================

-- Computer Science Classes
INSERT INTO classes (name, session, major, semester, student_count) VALUES
    ('CS-101-A', 'MORNING', 'Computer Science', 1, 45),
    ('CS-101-B', 'AFTERNOON', 'Computer Science', 1, 42),
    ('CS-201-A', 'MORNING', 'Computer Science', 2, 38),
    ('CS-301-A', 'MORNING', 'Computer Science', 3, 35),
    ('CS-301-B', 'AFTERNOON', 'Computer Science', 3, 33),
    ('CS-401-A', 'AFTERNOON', 'Computer Science', 4, 30),
    
-- Database & Information Systems
    ('DB-201-A', 'MORNING', 'Database Management', 2, 40),
    ('DB-201-B', 'AFTERNOON', 'Database Management', 2, 38),
    ('DB-301-A', 'MORNING', 'Database Administration', 3, 32),
    ('IS-401-A', 'AFTERNOON', 'Information Systems', 4, 28),
    
-- Network & Cybersecurity
    ('NET-201-A', 'MORNING', 'Network Engineering', 2, 36),
    ('NET-201-B', 'AFTERNOON', 'Network Engineering', 2, 34),
    ('NET-301-A', 'MORNING', 'Network Security', 3, 30),
    ('CYB-401-A', 'AFTERNOON', 'Cybersecurity', 4, 25),
    
-- Software Engineering
    ('SE-201-A', 'MORNING', 'Software Engineering', 2, 44),
    ('SE-301-A', 'AFTERNOON', 'Software Engineering', 3, 40),
    ('SE-401-A', 'MORNING', 'Software Engineering', 4, 35),
    
-- Electronics & Electrical Engineering
    ('EE-101-A', 'MORNING', 'Electrical Engineering', 1, 48),
    ('EE-101-B', 'AFTERNOON', 'Electrical Engineering', 1, 46),
    ('EE-201-A', 'MORNING', 'Electronics Engineering', 2, 42),
    ('EE-301-A', 'AFTERNOON', 'Electronics Engineering', 3, 38),
    
-- Civil Engineering
    ('CE-101-A', 'MORNING', 'Civil Engineering', 1, 50),
    ('CE-201-A', 'AFTERNOON', 'Civil Engineering', 2, 45),
    ('CE-301-A', 'MORNING', 'Civil Engineering', 3, 40),
    ('CE-401-A', 'AFTERNOON', 'Civil Engineering', 4, 35),
    
-- Mechanical Engineering
    ('ME-101-A', 'MORNING', 'Mechanical Engineering', 1, 47),
    ('ME-201-A', 'AFTERNOON', 'Mechanical Engineering', 2, 43),
    ('ME-301-A', 'MORNING', 'Mechanical Engineering', 3, 39),
    ('ME-401-A', 'AFTERNOON', 'Mechanical Engineering', 4, 34),
    
-- Data Science & AI
    ('DS-301-A', 'MORNING', 'Data Science', 3, 32),
    ('DS-401-A', 'AFTERNOON', 'Data Science', 4, 28),
    ('AI-301-A', 'MORNING', 'Artificial Intelligence', 3, 30),
    ('AI-401-A', 'AFTERNOON', 'Artificial Intelligence', 4, 26),
    
-- Web Development
    ('WEB-201-A', 'MORNING', 'Web Development', 2, 38),
    ('WEB-301-A', 'AFTERNOON', 'Web Development', 3, 34),
    
-- Mobile Development
    ('MOB-301-A', 'MORNING', 'Mobile Development', 3, 31),
    ('MOB-401-A', 'AFTERNOON', 'Mobile Development', 4, 27),
    
-- Business & Management
    ('BM-101-A', 'MORNING', 'Business Management', 1, 52),
    ('BM-201-A', 'AFTERNOON', 'Business Management', 2, 48),
    ('ACC-101-A', 'MORNING', 'Accounting', 1, 45),
    ('FIN-201-A', 'AFTERNOON', 'Finance', 2, 40),
    
-- Architecture
    ('ARCH-101-A', 'MORNING', 'Architecture', 1, 35),
    ('ARCH-201-A', 'AFTERNOON', 'Architecture', 2, 32),
    ('ARCH-301-A', 'MORNING', 'Architecture', 3, 28),
    
-- General Education / Foundation
    ('GEN-101-A', 'MORNING', 'General Studies', 1, 60),
    ('GEN-101-B', 'AFTERNOON', 'General Studies', 1, 58),
    ('MATH-101-A', 'MORNING', 'Mathematics', 1, 55),
    ('MATH-101-B', 'AFTERNOON', 'Mathematics', 1, 53),
    ('PHY-101-A', 'MORNING', 'Physics', 1, 50),
    ('CHEM-101-A', 'AFTERNOON', 'Chemistry', 1, 48)

ON CONFLICT (name, session) DO UPDATE SET
    major = EXCLUDED.major,
    semester = EXCLUDED.semester,
    student_count = EXCLUDED.student_count,
    updated_at = NOW();

-- Verify insertion
SELECT 
    major,
    COUNT(*) as class_count,
    SUM(student_count) as total_students,
    STRING_AGG(name, ', ' ORDER BY name) as classes
FROM classes
GROUP BY major
ORDER BY class_count DESC;

-- Summary statistics
SELECT 
    COUNT(*) as total_classes,
    SUM(student_count) as total_students,
    AVG(student_count)::INTEGER as avg_students_per_class,
    COUNT(CASE WHEN session = 'MORNING' THEN 1 END) as morning_classes,
    COUNT(CASE WHEN session = 'AFTERNOON' THEN 1 END) as afternoon_classes
FROM classes;
