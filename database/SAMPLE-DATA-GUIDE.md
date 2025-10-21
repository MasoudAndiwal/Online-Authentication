# 📚 Sample Classes Data - Quick Guide

## Which File Should I Use?

### 🚀 Quick Start (Recommended for testing)
**File:** `insert-simple-classes.sql`
- **20 classes** - Fast and simple
- Perfect for initial setup and demo
- Covers 10 major programs

### 📊 Medium Dataset (Recommended for development)
**File:** `insert-sample-classes.sql`
- **50+ classes** - Good variety
- Realistic college structure
- All engineering + IT programs

### 🎓 Complete College Database (Recommended for production)
**File:** `insert-comprehensive-classes.sql`
- **150+ classes** - Production ready
- Complete programs with all semesters
- Most realistic for actual college use

---

## 📋 What's Included

### Computer Science & IT (60+ classes)
- ✅ Computer Science (15 classes)
- ✅ Database Management (6 classes)
- ✅ Network Engineering (7 classes)
- ✅ Cybersecurity (5 classes)
- ✅ Software Engineering (6 classes)
- ✅ Data Science (6 classes)
- ✅ Artificial Intelligence (5 classes)
- ✅ Web Development (6 classes)
- ✅ Mobile Development (5 classes)

### Engineering (50+ classes)
- ✅ Electrical Engineering (8 classes)
- ✅ Electronics Engineering (7 classes)
- ✅ Civil Engineering (8 classes)
- ✅ Mechanical Engineering (8 classes)

### Business & Management (15+ classes)
- ✅ Business Management (8 classes)
- ✅ Accounting (4 classes)
- ✅ Finance (3 classes)

### Foundation Courses (20+ classes)
- ✅ Mathematics (6 classes)
- ✅ Physics (4 classes)
- ✅ Chemistry (3 classes)
- ✅ English (4 classes)
- ✅ General Studies (4 classes)

---

## 🎯 How to Use

### Step 1: Fix the missing columns (if not already done)
```sql
ALTER TABLE classes 
ADD COLUMN IF NOT EXISTS major VARCHAR(100),
ADD COLUMN IF NOT EXISTS semester INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS student_count INTEGER DEFAULT 0;
```

### Step 2: Choose and run ONE of these files

#### Option A - Quick Test (20 classes)
```sql
-- Copy from: insert-simple-classes.sql
-- Paste in Supabase SQL Editor
-- Click Run
```

#### Option B - Development (50+ classes)
```sql
-- Copy from: insert-sample-classes.sql
-- Paste in Supabase SQL Editor
-- Click Run
```

#### Option C - Production (150+ classes)
```sql
-- Copy from: insert-comprehensive-classes.sql
-- Paste in Supabase SQL Editor
-- Click Run
```

### Step 3: Verify
```sql
-- Check total classes
SELECT COUNT(*) FROM classes;

-- View by major
SELECT major, COUNT(*) as class_count 
FROM classes 
GROUP BY major 
ORDER BY class_count DESC;

-- View all
SELECT * FROM classes ORDER BY major, semester, name;
```

---

## 📊 Class Statistics (Comprehensive File)

| Major | Classes | Students |
|-------|---------|----------|
| Computer Science | 14 | ~500 |
| Network Engineering | 7 | ~240 |
| Database Management | 6 | ~200 |
| Software Engineering | 6 | ~240 |
| Electrical Engineering | 8 | ~340 |
| Civil Engineering | 8 | ~360 |
| Mechanical Engineering | 8 | ~340 |
| Business Management | 8 | ~370 |
| And many more... | | |

**Total:** 150+ classes, 6000+ students

---

## 🔍 Sample Class Examples

### Computer Science
- Introduction to Programming (Semester 1, 48 students)
- Data Structures (Semester 2, 40 students)
- Algorithms & Analysis (Semester 3, 35 students)
- Software Engineering (Semester 4, 30 students)

### Database Management
- Database Fundamentals (Semester 1, 40 students)
- SQL Programming (Semester 2, 38 students)
- Advanced Database Systems (Semester 3, 32 students)
- NoSQL Databases (Semester 3, 30 students)

### Network Engineering
- Network Basics (Semester 1, 42 students)
- Network Protocols (Semester 2, 38 students)
- Routing & Switching (Semester 2, 36 students)
- Network Security (Semester 4, 28 students)

---

## 🎨 Class Naming Convention

The comprehensive file uses realistic course names:
- ✅ "Introduction to Programming" (not "CS-101")
- ✅ "Database Systems" (not "DB-201")
- ✅ "Network Security" (not "NET-301")

More natural and readable for college use!

---

## 🔄 Update Existing Data

If you already have classes and want to update them:
```sql
-- The scripts use ON CONFLICT DO UPDATE
-- So running them again will update existing records
-- Safe to run multiple times!
```

---

## ⚙️ Customization

Want to modify the data?

1. **Change student counts:**
   - Edit `student_count` values in the SQL file
   
2. **Add more classes:**
   - Copy any INSERT block
   - Change the class name, major, semester
   
3. **Remove classes:**
   - Delete the unwanted lines from the INSERT statement

4. **Change majors:**
   - Find and replace the major names

---

## 🚀 After Import

Your All Classes page (`/dashboard/all-classes`) will show:
- ✅ All classes grouped by major
- ✅ Student counts
- ✅ Schedule counts (0 initially, add schedules to increase)
- ✅ Morning/Afternoon sessions
- ✅ Semester information
- ✅ Search and filter working perfectly

---

## 📞 Need Help?

Check the main `README.md` for:
- Database setup instructions
- Table structure details
- Troubleshooting guide
- API endpoints reference
