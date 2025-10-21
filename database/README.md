# Database Setup Guide

## Overview
This folder contains SQL migration scripts for setting up the Supabase database for the Online Attendance System.

## Files

### 1. `all-classes-complete-setup.sql` ⭐ **RECOMMENDED**
**Complete standalone setup for All Classes feature**
- Creates `classes`, `teachers`, and `schedule_entries` tables
- Includes all columns needed by the All Classes page:
  - `id`, `name`, `session` (required)
  - `major`, `semester`, `student_count` (optional, for enhanced display)
- Sets up indexes, triggers, RLS policies, and views
- **Use this if starting fresh or migrating**

### 2. `classes-table-enhanced.sql`
**Migration to add missing columns to existing classes table**
- Adds `major`, `semester`, `student_count` columns
- Run this if you already have the `classes` table from `schedule-management-updated.sql`
- Safe to run multiple times (uses `IF NOT EXISTS`)

### 3. `schedule-management-updated.sql`
**Original comprehensive schema**
- Base schema with teachers, classes, schedule_entries
- Does NOT include `major`, `semester`, `student_count` columns
- If you've already run this, use `classes-table-enhanced.sql` to upgrade

### 4. Other files
- `migration-add-teachers.sql` - Legacy teacher table setup
- `fix-teacher-id-type.sql` - Fix teacher ID type issues

---

## How to Use

### Option A: Fresh Setup (Recommended)
If you haven't created any tables yet:

1. Open **Supabase Dashboard** → **SQL Editor**
2. Copy and paste the contents of `all-classes-complete-setup.sql`
3. Click **Run**
4. ✅ Your database is ready!

### Option B: Upgrade Existing Tables
If you already ran `schedule-management-updated.sql`:

1. Open **Supabase Dashboard** → **SQL Editor**
2. Copy and paste the contents of `classes-table-enhanced.sql`
3. Click **Run**
4. ✅ Your classes table now has all required columns!

---

## Table Structure

### `classes` table
| Column | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | Yes | auto | Primary key |
| `name` | VARCHAR(100) | Yes | - | Class name (e.g., "Class A") |
| `session` | VARCHAR(20) | Yes | - | "MORNING" or "AFTERNOON" |
| `major` | VARCHAR(100) | No | null | Program/major (e.g., "Computer Science") |
| `semester` | INTEGER | No | 1 | Semester (1-8) |
| `student_count` | INTEGER | No | 0 | Number of enrolled students |
| `created_at` | TIMESTAMPTZ | Yes | NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Yes | NOW() | Last update timestamp |

### `schedule_entries` table
| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `id` | UUID | Yes | Primary key |
| `class_id` | UUID | Yes | Foreign key to classes |
| `teacher_id` | TEXT | No | Foreign key to teachers |
| `teacher_name` | VARCHAR(200) | Yes | Teacher full name |
| `subject` | VARCHAR(200) | Yes | Subject name |
| `hours` | INTEGER | Yes | Duration in hours (1-8) |
| `day_of_week` | VARCHAR(20) | Yes | Day (saturday-friday) |
| `start_time` | TIME | Yes | Start time |
| `end_time` | TIME | Yes | End time |

### `teachers` table
| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `id` | TEXT | Yes | Primary key |
| `teacher_id` | VARCHAR(20) | Yes | Unique teacher identifier |
| `first_name` | VARCHAR(50) | Yes | First name |
| `last_name` | VARCHAR(50) | Yes | Last name |
| `username` | VARCHAR(30) | Yes | Login username |
| `departments` | TEXT[] | Yes | Array of departments |
| `subjects` | TEXT[] | Yes | Array of subjects |
| ... | ... | ... | (many more fields) |

---

## Views

### `v_classes_complete`
Complete class information with statistics:
```sql
SELECT * FROM v_classes_complete;
```
Returns: id, name, session, major, semester, student_count, schedule_count, unique_teachers, unique_subjects

### `v_class_schedules`
All schedule entries with class information:
```sql
SELECT * FROM v_class_schedules WHERE class_name = 'Class A';
```

---

## Verification

After running the SQL, verify your setup:

```sql
-- Check table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'classes' 
ORDER BY ordinal_position;

-- View all classes
SELECT * FROM v_classes_complete;

-- Count records
SELECT 'classes' as table_name, COUNT(*) as count FROM classes
UNION ALL SELECT 'schedule_entries', COUNT(*) FROM schedule_entries
UNION ALL SELECT 'teachers', COUNT(*) FROM teachers;
```

---

## Sample Data / Demo Classes

Choose one of these files to populate your database with test data:

### 1. `insert-simple-classes.sql` ⭐ **Quick Start (20 classes)**
- **Best for**: Quick testing and demo
- **Contains**: 20 essential classes across 10 majors
- **Time to run**: < 1 second
- Perfect for initial setup

### 2. `insert-sample-classes.sql` 📚 **Medium (50+ classes)**
- **Best for**: Realistic testing
- **Contains**: 50+ classes across all major programs
- **Includes**: CS, Database, Network, Engineering, Business
- Good balance of variety and simplicity

### 3. `insert-comprehensive-classes.sql` 🎓 **Full College (150+ classes)**
- **Best for**: Production-ready data
- **Contains**: 150+ realistic college classes
- **Includes**: All semesters (1-4), all sessions, complete programs
- **Programs covered**:
  - Computer Science, Database, Network, Cybersecurity
  - Software Engineering, Data Science, AI, Web/Mobile Dev
  - Electrical, Electronics, Civil, Mechanical Engineering
  - Business, Accounting, Finance
  - General studies (Math, Physics, Chemistry, English)
- Most realistic for actual college use

---

## API Endpoints

Once the database is set up, the following API endpoints work automatically:

- `GET /api/classes` - List all classes
- `POST /api/classes` - Create a new class
- `GET /api/classes/[id]` - Get class by ID
- `PUT /api/classes/[id]` - Update class
- `DELETE /api/classes/[id]` - Delete class

---

## Troubleshooting

### Error: relation "classes" already exists
- The table already exists. Use `classes-table-enhanced.sql` to add missing columns.

### Error: column "major" does not exist
- Run `classes-table-enhanced.sql` to add the missing columns.

### RLS Policy Error
- Make sure your Supabase user has the `OFFICE` role set in `raw_user_meta_data`.
- Or temporarily disable RLS for testing:
  ```sql
  ALTER TABLE classes DISABLE ROW LEVEL SECURITY;
  ```

### No data showing in the app
- Check if tables have data: `SELECT * FROM classes;`
- Check browser console for API errors
- Verify RLS policies allow your user to read data

---

## Next Steps

After setting up the database:
1. ✅ Tables created
2. ✅ Backend API routes created (`app/api/classes/`)
3. ✅ Frontend connected to API (`all-classes/page.tsx`)
4. 🚀 Ready to use!

Open your app at `/dashboard/all-classes` and start creating classes!
