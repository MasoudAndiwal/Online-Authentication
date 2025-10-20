# 🗄️ Class & Students Database Integration

**Date:** October 19, 2025
**Status:** ✅ DOCUMENTED

---

## 📊 SQL Table Structure

### **Students Table**

```sql
CREATE TABLE IF NOT EXISTS students (
  id               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  first_name       VARCHAR(50)  NOT NULL,
  last_name        VARCHAR(50)  NOT NULL,
  father_name      VARCHAR(70)  NOT NULL,
  grandfather_name VARCHAR(70)  NOT NULL,
  student_id       VARCHAR(20)  NOT NULL UNIQUE,
  date_of_birth    TIMESTAMPTZ,
  phone            VARCHAR(20)  NOT NULL UNIQUE,
  father_phone     VARCHAR(20),
  address          TEXT         NOT NULL,
  programs         VARCHAR(40)  NOT NULL,
  semester         VARCHAR(20)  NOT NULL,
  enrollment_year  VARCHAR(4)   NOT NULL,
  class_section    VARCHAR(20)  NOT NULL,  ← CLASS NAME
  time_slot        VARCHAR(50)  NOT NULL,
  username         VARCHAR(30)  NOT NULL UNIQUE,
  student_id_ref   VARCHAR(20),
  password         VARCHAR(255) NOT NULL,
  status           student_status NOT NULL DEFAULT 'ACTIVE',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 🔗 Field Mapping

### **Class Name → class_section**

The class name (e.g., "Class A", "Class B") is stored in the **`class_section`** field in the students table.

**Example Data:**
```
class_section: "Class A"
class_section: "Class B"
class_section: "Class 1"
```

---

## 📈 How to Count Students by Class

### **SQL Query to Get Student Count:**

```sql
-- Count students by class
SELECT 
  class_section AS class_name,
  COUNT(*) AS student_count
FROM students
WHERE status = 'ACTIVE'
GROUP BY class_section
ORDER BY class_section;
```

**Example Result:**
```
class_name | student_count
-----------+--------------
Class A    |     45
Class B    |     38
Class C    |     42
Class D    |     35
```

---

## 🔄 Integration Steps

### **Step 1: Fetch Classes with Student Counts**

**API Endpoint:** `/api/classes` (GET)

**Query:**
```sql
SELECT 
  c.id,
  c.name AS class_name,
  c.session,
  c.major,
  c.semester,
  COUNT(s.id) AS student_count
FROM classes c
LEFT JOIN students s ON s.class_section = c.name AND s.status = 'ACTIVE'
GROUP BY c.id, c.name, c.session, c.major, c.semester
ORDER BY c.name;
```

**Response:**
```json
[
  {
    "id": "1",
    "name": "Class A",
    "session": "MORNING",
    "major": "Computer Science",
    "semester": 3,
    "studentCount": 45
  },
  {
    "id": "2",
    "name": "Class B",
    "session": "AFTERNOON",
    "major": "Electronics",
    "semester": 2,
    "studentCount": 38
  }
]
```

---

### **Step 2: Update All Classes Page**

**File:** `app/(office)/dashboard/(class&schedule)/all-classes/page.tsx`

**Replace Sample Data with API Call:**

```tsx
// Before (sample data)
const [classes, setClasses] = React.useState(sampleClasses);

// After (API integration)
const [classes, setClasses] = React.useState<Class[]>([]);
const [loading, setLoading] = React.useState(true);

React.useEffect(() => {
  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/classes');
      const data = await response.json();
      setClasses(data);
    } catch (error) {
      console.error('Error loading classes:', error);
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };
  
  fetchClasses();
}, []);
```

---

## 🎯 View Dialog Update

### **✅ Schedules Box Removed**

The View Class Dialog now shows **only Students count**, as the schedules box has been removed.

**Updated Dialog Structure:**
```
┌──────────────────────────────────────┐
│ ╔══════════════════════════════════╗ │
│ ║  🎓  Class A                     ║ │ ← Gradient Header
│ ║      MORNING                     ║ │
│ ╚══════════════════════════════════╝ │
│                                      │
│ Program / Major:                     │
│ ┌──────────────────────────────────┐ │
│ │ Computer Science                 │ │
│ └──────────────────────────────────┘ │
│                                      │
│ Semester:                            │
│ ┌──────────────────────────────────┐ │
│ │ 📖 Semester 3                    │ │
│ └──────────────────────────────────┘ │
│                                      │
│ Students Enrolled:                   │
│ ┌──────────────────────────────────┐ │
│ │ 👥 Total Students                │ │ ← Only this (schedules removed)
│ │     45                           │ │
│ │ Students enrolled in this class  │ │
│ └──────────────────────────────────┘ │
│                                      │
│ Session Details:                     │
│ ┌──────────────────────────────────┐ │
│ │ ☀️ Morning Session               │ │
│ │ Classes from 8:00 AM to 12:00 PM│ │
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
```

---

## 📋 API Endpoints Needed

### **1. GET /api/classes**
**Purpose:** Fetch all classes with student counts

**Query:**
```sql
SELECT 
  c.id,
  c.name,
  c.session,
  c.major,
  c.semester,
  COUNT(CASE WHEN s.status = 'ACTIVE' THEN 1 END) AS student_count
FROM classes c
LEFT JOIN students s ON s.class_section = c.name
GROUP BY c.id, c.name, c.session, c.major, c.semester;
```

---

### **2. POST /api/classes**
**Purpose:** Create a new class

**Body:**
```json
{
  "name": "Class A",
  "session": "MORNING",
  "major": "Computer Science",
  "semester": 3
}
```

**SQL:**
```sql
INSERT INTO classes (name, session, major, semester)
VALUES ($1, $2, $3, $4)
RETURNING *;
```

---

### **3. PUT /api/classes/[id]**
**Purpose:** Update class details

**Body:**
```json
{
  "name": "Class A Updated",
  "session": "AFTERNOON",
  "major": "Electronics",
  "semester": 4
}
```

**SQL:**
```sql
UPDATE classes
SET name = $1, session = $2, major = $3, semester = $4, updated_at = NOW()
WHERE id = $5
RETURNING *;
```

**⚠️ Important:** When updating class name, also update `class_section` in students table:
```sql
-- Update students' class_section when class name changes
UPDATE students
SET class_section = $1  -- new class name
WHERE class_section = $2;  -- old class name
```

---

### **4. DELETE /api/classes/[id]**
**Purpose:** Delete a class

**⚠️ Important:** Check if students are enrolled before deleting:

**SQL:**
```sql
-- Check student count
SELECT COUNT(*) FROM students WHERE class_section = (
  SELECT name FROM classes WHERE id = $1
);

-- If count > 0, prevent deletion or reassign students first

-- Delete class if no students
DELETE FROM classes WHERE id = $1;
```

---

## 🔄 Student Count Calculation

### **Real-time Student Count**

The student count should be calculated from the database, not stored as a field.

**Query:**
```sql
-- Get student count for a specific class
SELECT COUNT(*) 
FROM students 
WHERE class_section = 'Class A' 
  AND status = 'ACTIVE';
```

**Result:** `45`

---

## 📊 Class Statistics

### **Dashboard Statistics Query**

```sql
-- Total classes
SELECT COUNT(*) FROM classes;

-- Morning classes
SELECT COUNT(*) FROM classes WHERE session = 'MORNING';

-- Afternoon classes
SELECT COUNT(*) FROM classes WHERE session = 'AFTERNOON';

-- Total students across all classes
SELECT COUNT(*) FROM students WHERE status = 'ACTIVE';

-- Students by class
SELECT 
  class_section,
  COUNT(*) as count
FROM students
WHERE status = 'ACTIVE'
GROUP BY class_section;
```

---

## 🎯 Key Points

### **1. Class Name Storage**
- ✅ Classes table: `name` field (e.g., "Class A")
- ✅ Students table: `class_section` field (e.g., "Class A")
- ✅ These must match exactly for JOIN queries

### **2. Student Count**
- ✅ Calculate from students table using COUNT()
- ✅ Filter by `status = 'ACTIVE'`
- ✅ Group by `class_section`

### **3. Class Updates**
- ⚠️ When changing class name, update students' `class_section`
- ⚠️ Use transaction to ensure data consistency

### **4. Class Deletion**
- ⚠️ Check for enrolled students first
- ⚠️ Either prevent deletion or reassign students
- ⚠️ Cascade delete may cause data loss

---

## 🔧 Implementation Checklist

### **Backend (API):**
- [ ] Create GET /api/classes endpoint
- [ ] Create POST /api/classes endpoint
- [ ] Create PUT /api/classes/[id] endpoint
- [ ] Create DELETE /api/classes/[id] endpoint
- [ ] Add student count calculation in queries
- [ ] Add class name update cascade to students table
- [ ] Add student count validation on delete

### **Frontend:**
- [x] Update view dialog (schedules removed) ✅
- [x] Create edit dialog with all fields ✅
- [x] Add toast notifications ✅
- [ ] Replace sample data with API calls
- [ ] Add loading states
- [ ] Add error handling
- [ ] Add real-time student count refresh

---

## 📝 Example Implementation

### **Fetch Classes with Student Counts:**

```tsx
// app/(office)/dashboard/(class&schedule)/all-classes/page.tsx

const fetchClasses = async () => {
  try {
    setLoading(true);
    const response = await fetch('/api/classes');
    
    if (!response.ok) {
      throw new Error('Failed to fetch classes');
    }
    
    const data = await response.json();
    
    // Data structure:
    // [
    //   {
    //     id: "1",
    //     name: "Class A",
    //     session: "MORNING",
    //     major: "Computer Science",
    //     semester: 3,
    //     studentCount: 45  ← From students table COUNT
    //   }
    // ]
    
    setClasses(data);
  } catch (error) {
    console.error('Error:', error);
    toast.error('Failed to load classes');
  } finally {
    setLoading(false);
  }
};
```

---

## ✅ Summary

### **Database Structure:**
- ✅ Class name stored in `classes.name`
- ✅ Student's class stored in `students.class_section`
- ✅ Join on: `students.class_section = classes.name`

### **Student Count:**
- ✅ Calculate using COUNT() with JOIN
- ✅ Filter by status = 'ACTIVE'
- ✅ Update in real-time from database

### **View Dialog:**
- ✅ Schedules box removed
- ✅ Only Students count shown
- ✅ Larger, more prominent display

### **Integration Required:**
- [ ] Create API endpoints
- [ ] Replace sample data with API calls
- [ ] Add loading and error states
- [ ] Test with real database

---

**🎉 Ready for backend integration with proper student counting from the database!**
