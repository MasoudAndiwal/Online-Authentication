-- ================================================
-- COMPREHENSIVE COLLEGE CLASSES DATABASE
-- ================================================
-- Complete set of realistic college classes across all major programs
-- Includes proper course codes, varied semesters, and realistic enrollment
-- ================================================

-- ================================================
-- COMPUTER SCIENCE & IT PROGRAMS
-- ================================================

-- Computer Science Core Classes
INSERT INTO classes (name, session, major, semester, student_count) VALUES
    -- Semester 1
    ('Introduction to Programming', 'MORNING', 'Computer Science', 1, 48),
    ('Computer Fundamentals', 'AFTERNOON', 'Computer Science', 1, 45),
    ('Discrete Mathematics', 'MORNING', 'Computer Science', 1, 42),
    
    -- Semester 2
    ('Data Structures', 'MORNING', 'Computer Science', 2, 40),
    ('Object-Oriented Programming', 'AFTERNOON', 'Computer Science', 2, 38),
    ('Digital Logic Design', 'MORNING', 'Computer Science', 2, 36),
    
    -- Semester 3
    ('Algorithms & Analysis', 'MORNING', 'Computer Science', 3, 35),
    ('Database Systems', 'AFTERNOON', 'Computer Science', 3, 38),
    ('Computer Architecture', 'MORNING', 'Computer Science', 3, 32),
    ('Operating Systems', 'AFTERNOON', 'Computer Science', 3, 34),
    
    -- Semester 4
    ('Software Engineering', 'MORNING', 'Computer Science', 4, 30),
    ('Web Technologies', 'AFTERNOON', 'Computer Science', 4, 33),
    ('Compiler Design', 'MORNING', 'Computer Science', 4, 25),
    ('Theory of Computation', 'AFTERNOON', 'Computer Science', 4, 28),

-- Database Administration & Management
    ('Database Fundamentals', 'MORNING', 'Database Management', 1, 40),
    ('SQL Programming', 'AFTERNOON', 'Database Management', 2, 38),
    ('Advanced Database Systems', 'MORNING', 'Database Management', 3, 32),
    ('NoSQL Databases', 'AFTERNOON', 'Database Management', 3, 30),
    ('Data Warehousing', 'MORNING', 'Database Management', 4, 28),
    ('Database Security', 'AFTERNOON', 'Database Management', 4, 26),

-- Network Engineering & Administration
    ('Network Basics', 'MORNING', 'Network Engineering', 1, 42),
    ('Network Protocols', 'AFTERNOON', 'Network Engineering', 2, 38),
    ('Routing & Switching', 'MORNING', 'Network Engineering', 2, 36),
    ('Network Design', 'AFTERNOON', 'Network Engineering', 3, 32),
    ('Wireless Networks', 'MORNING', 'Network Engineering', 3, 30),
    ('Network Security', 'AFTERNOON', 'Network Engineering', 4, 28),
    ('Cloud Networking', 'MORNING', 'Network Engineering', 4, 25),

-- Cybersecurity
    ('Introduction to Cybersecurity', 'MORNING', 'Cybersecurity', 2, 35),
    ('Ethical Hacking', 'AFTERNOON', 'Cybersecurity', 3, 32),
    ('Cryptography', 'MORNING', 'Cybersecurity', 3, 30),
    ('Security Operations', 'AFTERNOON', 'Cybersecurity', 4, 28),
    ('Penetration Testing', 'MORNING', 'Cybersecurity', 4, 26),

-- Software Engineering
    ('Introduction to Software Engineering', 'MORNING', 'Software Engineering', 2, 42),
    ('Software Requirements', 'AFTERNOON', 'Software Engineering', 2, 40),
    ('Software Design Patterns', 'MORNING', 'Software Engineering', 3, 38),
    ('Agile Development', 'AFTERNOON', 'Software Engineering', 3, 36),
    ('Software Testing & QA', 'MORNING', 'Software Engineering', 4, 34),
    ('DevOps Practices', 'AFTERNOON', 'Software Engineering', 4, 32),

-- Data Science & Analytics
    ('Introduction to Data Science', 'MORNING', 'Data Science', 2, 36),
    ('Statistics for Data Science', 'AFTERNOON', 'Data Science', 2, 34),
    ('Machine Learning', 'MORNING', 'Data Science', 3, 32),
    ('Deep Learning', 'AFTERNOON', 'Data Science', 3, 30),
    ('Big Data Analytics', 'MORNING', 'Data Science', 4, 28),
    ('Data Visualization', 'AFTERNOON', 'Data Science', 4, 26),

-- Artificial Intelligence
    ('AI Fundamentals', 'MORNING', 'Artificial Intelligence', 2, 34),
    ('Neural Networks', 'AFTERNOON', 'Artificial Intelligence', 3, 30),
    ('Natural Language Processing', 'MORNING', 'Artificial Intelligence', 3, 28),
    ('Computer Vision', 'AFTERNOON', 'Artificial Intelligence', 4, 26),
    ('Robotics', 'MORNING', 'Artificial Intelligence', 4, 24),

-- Web Development
    ('HTML & CSS Basics', 'MORNING', 'Web Development', 1, 44),
    ('JavaScript Programming', 'AFTERNOON', 'Web Development', 2, 40),
    ('Frontend Frameworks', 'MORNING', 'Web Development', 2, 38),
    ('Backend Development', 'AFTERNOON', 'Web Development', 3, 36),
    ('Full-Stack Development', 'MORNING', 'Web Development', 3, 34),
    ('Web Security', 'AFTERNOON', 'Web Development', 4, 30),

-- Mobile Development
    ('Mobile App Basics', 'MORNING', 'Mobile Development', 2, 36),
    ('Android Development', 'AFTERNOON', 'Mobile Development', 3, 32),
    ('iOS Development', 'MORNING', 'Mobile Development', 3, 30),
    ('Cross-Platform Development', 'AFTERNOON', 'Mobile Development', 4, 28),
    ('Mobile UI/UX Design', 'MORNING', 'Mobile Development', 4, 26),

-- ================================================
-- ENGINEERING PROGRAMS
-- ================================================

-- Electrical Engineering
    ('Circuit Analysis I', 'MORNING', 'Electrical Engineering', 1, 50),
    ('Electrical Fundamentals', 'AFTERNOON', 'Electrical Engineering', 1, 48),
    ('Circuit Analysis II', 'MORNING', 'Electrical Engineering', 2, 45),
    ('Electromagnetics', 'AFTERNOON', 'Electrical Engineering', 2, 42),
    ('Power Systems', 'MORNING', 'Electrical Engineering', 3, 40),
    ('Control Systems', 'AFTERNOON', 'Electrical Engineering', 3, 38),
    ('Power Electronics', 'MORNING', 'Electrical Engineering', 4, 35),
    ('Renewable Energy Systems', 'AFTERNOON', 'Electrical Engineering', 4, 32),

-- Electronics Engineering
    ('Basic Electronics', 'MORNING', 'Electronics Engineering', 1, 46),
    ('Analog Electronics', 'AFTERNOON', 'Electronics Engineering', 2, 42),
    ('Digital Electronics', 'MORNING', 'Electronics Engineering', 2, 40),
    ('Microprocessors', 'AFTERNOON', 'Electronics Engineering', 3, 38),
    ('Embedded Systems', 'MORNING', 'Electronics Engineering', 3, 36),
    ('VLSI Design', 'AFTERNOON', 'Electronics Engineering', 4, 32),
    ('Communication Systems', 'MORNING', 'Electronics Engineering', 4, 30),

-- Civil Engineering
    ('Engineering Drawing', 'MORNING', 'Civil Engineering', 1, 52),
    ('Surveying', 'AFTERNOON', 'Civil Engineering', 1, 50),
    ('Strength of Materials', 'MORNING', 'Civil Engineering', 2, 48),
    ('Fluid Mechanics', 'AFTERNOON', 'Civil Engineering', 2, 46),
    ('Structural Analysis', 'MORNING', 'Civil Engineering', 3, 44),
    ('Concrete Technology', 'AFTERNOON', 'Civil Engineering', 3, 42),
    ('Foundation Engineering', 'MORNING', 'Civil Engineering', 4, 38),
    ('Transportation Engineering', 'AFTERNOON', 'Civil Engineering', 4, 36),

-- Mechanical Engineering
    ('Engineering Mechanics', 'MORNING', 'Mechanical Engineering', 1, 48),
    ('Workshop Practice', 'AFTERNOON', 'Mechanical Engineering', 1, 46),
    ('Thermodynamics', 'MORNING', 'Mechanical Engineering', 2, 44),
    ('Mechanics of Machines', 'AFTERNOON', 'Mechanical Engineering', 2, 42),
    ('Machine Design', 'MORNING', 'Mechanical Engineering', 3, 40),
    ('Heat Transfer', 'AFTERNOON', 'Mechanical Engineering', 3, 38),
    ('Manufacturing Processes', 'MORNING', 'Mechanical Engineering', 4, 36),
    ('Automobile Engineering', 'AFTERNOON', 'Mechanical Engineering', 4, 34),

-- ================================================
-- BUSINESS & MANAGEMENT PROGRAMS
-- ================================================

-- Business Management
    ('Principles of Management', 'MORNING', 'Business Management', 1, 55),
    ('Business Communication', 'AFTERNOON', 'Business Management', 1, 52),
    ('Marketing Management', 'MORNING', 'Business Management', 2, 50),
    ('Human Resource Management', 'AFTERNOON', 'Business Management', 2, 48),
    ('Strategic Management', 'MORNING', 'Business Management', 3, 45),
    ('Operations Management', 'AFTERNOON', 'Business Management', 3, 42),
    ('Entrepreneurship', 'MORNING', 'Business Management', 4, 40),
    ('Business Analytics', 'AFTERNOON', 'Business Management', 4, 38),

-- Accounting & Finance
    ('Financial Accounting', 'MORNING', 'Accounting', 1, 48),
    ('Cost Accounting', 'AFTERNOON', 'Accounting', 2, 45),
    ('Managerial Accounting', 'MORNING', 'Accounting', 3, 42),
    ('Auditing', 'AFTERNOON', 'Accounting', 4, 38),
    ('Corporate Finance', 'MORNING', 'Finance', 2, 44),
    ('Investment Analysis', 'AFTERNOON', 'Finance', 3, 40),
    ('Financial Markets', 'MORNING', 'Finance', 4, 36),

-- ================================================
-- GENERAL FOUNDATION COURSES
-- ================================================

-- Mathematics
    ('Calculus I', 'MORNING', 'Mathematics', 1, 60),
    ('Calculus I - Section B', 'AFTERNOON', 'Mathematics', 1, 58),
    ('Linear Algebra', 'MORNING', 'Mathematics', 1, 55),
    ('Calculus II', 'AFTERNOON', 'Mathematics', 2, 52),
    ('Differential Equations', 'MORNING', 'Mathematics', 2, 50),
    ('Probability & Statistics', 'AFTERNOON', 'Mathematics', 2, 48),

-- Physics
    ('Physics I (Mechanics)', 'MORNING', 'Physics', 1, 54),
    ('Physics I - Section B', 'AFTERNOON', 'Physics', 1, 52),
    ('Physics II (E&M)', 'MORNING', 'Physics', 2, 48),
    ('Modern Physics', 'AFTERNOON', 'Physics', 2, 45),

-- Chemistry
    ('General Chemistry', 'MORNING', 'Chemistry', 1, 50),
    ('Organic Chemistry', 'AFTERNOON', 'Chemistry', 2, 45),
    ('Physical Chemistry', 'MORNING', 'Chemistry', 2, 42),

-- English & Communication
    ('Technical English', 'MORNING', 'English', 1, 65),
    ('Technical English - Section B', 'AFTERNOON', 'English', 1, 62),
    ('Professional Communication', 'MORNING', 'English', 2, 58),
    ('Report Writing', 'AFTERNOON', 'English', 2, 55),

-- General Studies
    ('Islamic Studies', 'MORNING', 'General Studies', 1, 70),
    ('Dari Language', 'AFTERNOON', 'General Studies', 1, 68),
    ('Pashto Language', 'MORNING', 'General Studies', 1, 66),
    ('Afghanistan History', 'AFTERNOON', 'General Studies', 2, 60)

ON CONFLICT (name, session) DO UPDATE SET
    major = EXCLUDED.major,
    semester = EXCLUDED.semester,
    student_count = EXCLUDED.student_count,
    updated_at = NOW();

-- ================================================
-- VERIFICATION & STATISTICS QUERIES
-- ================================================

-- View classes by major
SELECT 
    major,
    COUNT(*) as total_classes,
    SUM(student_count) as total_students,
    ROUND(AVG(student_count), 1) as avg_students,
    COUNT(CASE WHEN session = 'MORNING' THEN 1 END) as morning,
    COUNT(CASE WHEN session = 'AFTERNOON' THEN 1 END) as afternoon
FROM classes
GROUP BY major
ORDER BY total_students DESC;

-- Overall summary
SELECT 
    COUNT(*) as total_classes,
    SUM(student_count) as total_students,
    ROUND(AVG(student_count), 1) as avg_students_per_class,
    COUNT(DISTINCT major) as total_majors,
    MAX(semester) as max_semester,
    COUNT(CASE WHEN session = 'MORNING' THEN 1 END) as morning_classes,
    COUNT(CASE WHEN session = 'AFTERNOON' THEN 1 END) as afternoon_classes
FROM classes;

-- Classes by semester
SELECT 
    semester,
    COUNT(*) as class_count,
    SUM(student_count) as student_count,
    COUNT(CASE WHEN session = 'MORNING' THEN 1 END) as morning,
    COUNT(CASE WHEN session = 'AFTERNOON' THEN 1 END) as afternoon
FROM classes
GROUP BY semester
ORDER BY semester;
